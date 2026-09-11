import {Button, Stack, Text} from '@sanity/ui'
import {insert, setIfMissing, type ArrayOfObjectsInputProps, useClient} from 'sanity'
import {useRef, useState, type ChangeEvent, type ReactNode} from 'react'
import {inspectVideo, type VideoDimensions} from './videoPoster'

type BulkMediaMode = 'design' | 'photography'

type AssetDimensions = VideoDimensions

type UploadedAsset = {
  _id: string
  metadata?: {
    dimensions?: AssetDimensions
  }
}

const makeKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const filenameToAlt = (filename: string) => filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')

const RenderItemsOnly = ({children}: {children?: ReactNode}) => <>{children}</>

const isImageFile = (file: File) => file.type.startsWith('image/')

const isMp4File = (file: File) =>
  file.type === 'video/mp4' || /\.mp4$/i.test(file.name)

const getDimensions = (asset: UploadedAsset, fileDimensions?: AssetDimensions) => {
  const width = fileDimensions?.width || asset.metadata?.dimensions?.width || 1
  const height = fileDimensions?.height || asset.metadata?.dimensions?.height || 1

  return {
    width,
    height,
    orientation: width >= height ? 'horizontal' : 'vertical',
  }
}

const createMediaItem = (
  asset: UploadedAsset,
  file: File,
  mode: BulkMediaMode,
  fileDimensions?: AssetDimensions,
  posterAsset?: UploadedAsset,
) => {
  const kind = isMp4File(file) ? 'video' : 'image'
  const dimensions = getDimensions(asset, fileDimensions)
  const base = {
    _key: makeKey(),
    alt: filenameToAlt(file.name),
    orientation: dimensions.orientation,
    width: dimensions.width,
    height: dimensions.height,
  }

  if (mode === 'design') {
    return kind === 'video'
      ? {
          ...base,
          _type: 'media',
          kind: 'video',
          video: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}},
          ...(posterAsset
            ? {poster: {_type: 'image', asset: {_type: 'reference', _ref: posterAsset._id}}}
            : {}),
        }
      : {
          ...base,
          _type: 'media',
          kind: 'image',
          palette: 'color',
          image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
        }
  }

  return {
    ...base,
    _type: 'photoMedia',
    palette: 'color',
    image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
  }
}

function BulkMediaArrayInput(
  props: ArrayOfObjectsInputProps,
  mode: BulkMediaMode,
) {
  const client = useClient({apiVersion: '2025-01-01'})
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({completed: 0, total: 0})
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    const unsupportedFiles = files.filter((file) =>
      mode === 'design' ? !isImageFile(file) && !isMp4File(file) : !isImageFile(file),
    )

    if (unsupportedFiles.length) {
      const filenames = unsupportedFiles.map((file) => file.name).join(', ')
      setError(
        mode === 'design'
          ? `Formato não aceito: ${filenames}. Para vídeos, use somente arquivos MP4.`
          : `Formato não aceito: ${filenames}. Esta galeria aceita apenas imagens.`,
      )
      return
    }

    setError(null)
    setUploading(true)
    setProgress({completed: 0, total: files.length})

    try {
      const items = []

      for (const file of files) {
        const isVideo = isMp4File(file)
        const assetType = isVideo ? 'file' : 'image'
        const inspectionPromise = isVideo ? inspectVideo(file) : Promise.resolve(undefined)
        const [uploadedAsset, inspection] = await Promise.all([
          client.assets.upload(assetType, file, {filename: file.name}),
          inspectionPromise,
        ])
        const asset = uploadedAsset as UploadedAsset
        const posterAsset = inspection?.poster
          ? (await client.assets.upload('image', inspection.poster, {
              filename: `${file.name.replace(/\.[^/.]+$/, '')}-poster.jpg`,
            })) as UploadedAsset
          : undefined

        items.push(createMediaItem(asset, file, mode, inspection?.dimensions, posterAsset))
        setProgress((current) => ({...current, completed: current.completed + 1}))
      }

      props.onChange([
        setIfMissing([]),
        ...items.map((item) => insert([item], 'after', [-1])),
      ])
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível concluir o upload.')
    } finally {
      setUploading(false)
    }
  }

  const accept = mode === 'design' ? 'image/*,video/mp4,.mp4' : 'image/*'
  const buttonText = mode === 'design' ? 'Adicionar imagens ou vídeos MP4' : 'Adicionar imagens'

  return (
    <Stack gap={3}>
      {props.renderDefault({...props, arrayFunctions: RenderItemsOnly})}
      <Stack gap={2}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFiles}
          style={{display: 'none'}}
        />
        <Button
          text={uploading ? `Enviando ${progress.completed}/${progress.total}…` : buttonText}
          mode="ghost"
          disabled={uploading || props.readOnly}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        />
        <Text size={1} muted>
          {mode === 'design'
            ? 'Selecione várias imagens ou vídeos MP4. Depois, abra cada item para ajustar alt, orientação e demais dados.'
            : 'Selecione várias imagens. Depois, abra cada item para ajustar alt, orientação e demais dados.'}
        </Text>
        {error ? <Text size={1} muted>{error}</Text> : null}
      </Stack>
    </Stack>
  )
}

export const BulkDesignMediaInput = (props: ArrayOfObjectsInputProps) =>
  BulkMediaArrayInput(props, 'design')

export const BulkPhotographyMediaInput = (props: ArrayOfObjectsInputProps) =>
  BulkMediaArrayInput(props, 'photography')
