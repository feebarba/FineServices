import {Button, Stack, Text} from '@sanity/ui'
import {insert, setIfMissing, type ArrayOfObjectsInputProps, useClient} from 'sanity'
import {useRef, useState, type ChangeEvent} from 'react'

type BulkMediaMode = 'design' | 'photography'

type AssetDimensions = {
  width?: number
  height?: number
}

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

const getDimensions = (asset: UploadedAsset, file: File) => {
  const width = asset.metadata?.dimensions?.width ?? 1
  const height = asset.metadata?.dimensions?.height ?? 1

  return {
    width,
    height,
    orientation: width >= height ? 'horizontal' : 'vertical',
  }
}

const createMediaItem = (asset: UploadedAsset, file: File, mode: BulkMediaMode) => {
  const kind = file.type.startsWith('video/') ? 'video' : 'image'
  const dimensions = getDimensions(asset, file)
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

    setError(null)
    setUploading(true)
    setProgress({completed: 0, total: files.length})

    try {
      const items = []

      for (const file of files) {
        const assetType = file.type.startsWith('video/') ? 'file' : 'image'
        const asset = (await client.assets.upload(assetType, file, {
          filename: file.name,
        })) as UploadedAsset

        items.push(createMediaItem(asset, file, mode))
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

  const accept = mode === 'design' ? 'image/*,video/*' : 'image/*'
  const buttonText = mode === 'design' ? 'Adicionar imagens ou vídeos' : 'Adicionar imagens'

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
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
          Selecione vários arquivos de uma vez. Depois, abra cada item para ajustar alt, orientação e demais dados.
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
