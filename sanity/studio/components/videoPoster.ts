export type VideoDimensions = {
  width?: number
  height?: number
}

export type VideoInspection = {
  dimensions: VideoDimensions
  poster?: Blob
}

type PosterCandidate = {
  blob: Blob
  score: number
  isNearlyBlack: boolean
}

const metadataTimeout = 10000
const seekTimeout = 6000
const maxPosterWidth = 1280
const posterQuality = 0.78
const capturePositions = [0.1, 0.35, 0.6]

const waitForVideoEvent = (
  video: HTMLVideoElement,
  eventName: 'loadedmetadata' | 'loadeddata' | 'seeked',
  timeout: number,
) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      window.clearTimeout(timer)
      video.removeEventListener(eventName, handleEvent)
      video.removeEventListener('error', handleError)
    }
    const handleEvent = () => {
      cleanup()
      resolve()
    }
    const handleError = () => {
      cleanup()
      reject(new Error('Não foi possível ler o vídeo.'))
    }
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('O vídeo demorou demais para responder.'))
    }, timeout)

    video.addEventListener(eventName, handleEvent, {once: true})
    video.addEventListener('error', handleError, {once: true})
  })

const waitForDecodedFrame = (video: HTMLVideoElement) =>
  new Promise<void>((resolve) => {
    let frameRequest: number | undefined
    const finish = () => {
      window.clearTimeout(timeout)
      if (frameRequest !== undefined && typeof video.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(frameRequest)
      }
      resolve()
    }
    const timeout = window.setTimeout(finish, 500)

    if (typeof video.requestVideoFrameCallback === 'function') {
      frameRequest = video.requestVideoFrameCallback(finish)
      return
    }

    window.requestAnimationFrame(() => window.requestAnimationFrame(finish))
  })

const getCaptureTimes = (duration: number) => {
  const finalFrameOffset = Math.min(0.05, duration * 0.05)
  const latestTime = Math.max(0, duration - finalFrameOffset)
  const firstUsefulFrame = Math.min(0.5, latestTime)

  return Array.from(
    new Set(
      capturePositions.map((position) =>
        Number(Math.min(latestTime, Math.max(firstUsefulFrame, duration * position)).toFixed(3)),
      ),
    ),
  )
}

const seekTo = async (video: HTMLVideoElement, time: number) => {
  const seeked = waitForVideoEvent(video, 'seeked', seekTimeout)
  video.currentTime = time
  await seeked
  await waitForDecodedFrame(video)
}

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | undefined>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? undefined), 'image/jpeg', posterQuality)
  })

const analyzeFrame = (canvas: HTMLCanvasElement) => {
  const sample = document.createElement('canvas')
  sample.width = 32
  sample.height = 32
  const context = sample.getContext('2d', {willReadFrequently: true})

  if (!context) return {score: Number.POSITIVE_INFINITY, isNearlyBlack: false}

  context.drawImage(canvas, 0, 0, sample.width, sample.height)
  const pixels = context.getImageData(0, 0, sample.width, sample.height).data
  let luminanceTotal = 0
  let luminanceSquaredTotal = 0
  const pixelCount = pixels.length / 4

  for (let index = 0; index < pixels.length; index += 4) {
    const luminance = pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722
    luminanceTotal += luminance
    luminanceSquaredTotal += luminance * luminance
  }

  const average = luminanceTotal / pixelCount
  const variance = Math.max(0, luminanceSquaredTotal / pixelCount - average * average)
  const deviation = Math.sqrt(variance)

  return {
    score: average + deviation * 2,
    isNearlyBlack: average < 8 && deviation < 12,
  }
}

const captureCandidate = async (video: HTMLVideoElement): Promise<PosterCandidate | undefined> => {
  if (video.videoWidth <= 0 || video.videoHeight <= 0) return undefined

  const scale = Math.min(1, maxPosterWidth / video.videoWidth)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext('2d')

  if (!context) return undefined

  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const analysis = analyzeFrame(canvas)
  const blob = await canvasToBlob(canvas)

  return blob ? {...analysis, blob} : undefined
}

export const inspectVideo = async (source: Blob | string): Promise<VideoInspection> => {
  const video = document.createElement('video')
  const objectUrl = source instanceof Blob ? URL.createObjectURL(source) : undefined
  const sourceUrl = objectUrl ?? (typeof source === 'string' ? source : '')

  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  if (!objectUrl) video.crossOrigin = 'anonymous'

  try {
    const metadataReady = waitForVideoEvent(video, 'loadedmetadata', metadataTimeout)
    video.src = sourceUrl
    video.load()
    await metadataReady

    const dimensions = {width: video.videoWidth, height: video.videoHeight}
    const duration = video.duration

    if (!Number.isFinite(duration) || duration <= 0) {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await waitForVideoEvent(video, 'loadeddata', seekTimeout)
      }
      await waitForDecodedFrame(video)
      return {dimensions, poster: (await captureCandidate(video))?.blob}
    }

    let bestCandidate: PosterCandidate | undefined

    for (const time of getCaptureTimes(duration)) {
      await seekTo(video, time)
      const candidate = await captureCandidate(video)
      if (!candidate) continue
      if (!bestCandidate || candidate.score > bestCandidate.score) bestCandidate = candidate
      if (!candidate.isNearlyBlack) return {dimensions, poster: candidate.blob}
    }

    return {dimensions, poster: bestCandidate?.blob}
  } catch {
    return {dimensions: {}}
  } finally {
    video.pause()
    video.removeAttribute('src')
    video.load()
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}

export const getVideoPoster = async (source: Blob | string) => (await inspectVideo(source)).poster
