import {Button, Stack, Text} from '@sanity/ui'
import {set, type ImageInputProps, useClient, useFormValue} from 'sanity'
import {useState} from 'react'
import {getVideoPoster} from './videoPoster'

type ParentMedia = {
  video?: {
    asset?: {
      _ref?: string
    }
  }
}

type VideoAsset = {
  url?: string
  originalFilename?: string
}

const posterFilename = (filename?: string) =>
  `${(filename || 'video').replace(/\.[^/.]+$/, '')}-poster.jpg`

export function VideoPosterInput(props: ImageInputProps) {
  const client = useClient({apiVersion: '2025-01-01'})
  const parent = useFormValue(props.path.slice(0, -1)) as ParentMedia | undefined
  const videoAssetId = parent?.video?.asset?._ref
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const regeneratePoster = async () => {
    if (!videoAssetId || generating) return

    setGenerating(true)
    setError(null)

    try {
      const videoAsset = await client.fetch<VideoAsset | null>(
        '*[_id == $assetId][0]{url, originalFilename}',
        {assetId: videoAssetId},
      )

      if (!videoAsset?.url) throw new Error('O arquivo do vídeo não foi encontrado.')

      const poster = await getVideoPoster(videoAsset.url)
      if (!poster) throw new Error('Não foi possível encontrar um quadro válido neste vídeo.')

      const uploadedPoster = await client.assets.upload('image', poster, {
        filename: posterFilename(videoAsset.originalFilename),
      })

      props.onChange(
        set({
          _type: 'image',
          asset: {_type: 'reference', _ref: uploadedPoster._id},
        }),
      )
    } catch (posterError) {
      setError(
        posterError instanceof Error ? posterError.message : 'Não foi possível regenerar o poster.',
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      <Button
        text={generating ? 'Gerando novo poster…' : 'Regenerar poster do vídeo'}
        mode="ghost"
        disabled={!videoAssetId || generating || props.readOnly}
        loading={generating}
        onClick={regeneratePoster}
      />
      <Text size={1} muted>
        Captura automaticamente um quadro útil do MP4 sem alterar o vídeo original.
      </Text>
      {error ? <Text size={1}>{error}</Text> : null}
    </Stack>
  )
}
