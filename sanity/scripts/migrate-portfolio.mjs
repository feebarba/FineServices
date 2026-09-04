import {execFileSync} from 'node:child_process'
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'

const studioRoot = resolve(new URL('../studio', import.meta.url).pathname)
const projectRoot = resolve(studioRoot, '../..')
const sanityBin = join(studioRoot, 'node_modules/.bin/sanity')

const runSanity = (args) => {
  const output = execFileSync(sanityBin, args, {
    cwd: studioRoot,
    encoding: 'utf8',
    env: {...process.env, FORCE_COLOR: '0'},
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return output.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '')
}

const parseJsonOutput = (output) => {
  const trimmed = output.trim()
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)

  const candidates = [trimmed.indexOf('{'), trimmed.indexOf('['), trimmed.indexOf('null')]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)

  if (!candidates.length) {
    throw new Error(`Não foi possível interpretar a resposta do Sanity:\n${output}`)
  }

  return JSON.parse(trimmed.slice(candidates[0]))
}

const mediaCatalog = {
  'polar-case-18.mp4': {
    kind: 'video',
    path: 'public/videos/projects/polar-case-18.mp4',
    alt: 'Vídeo do case Polar',
    orientation: 'vertical',
    width: 1280,
    height: 1600,
  },
  'polar-case-07.png': {
    kind: 'image',
    path: 'public/images/projects/polar-case/polar-case-07.png',
    alt: 'Copos empilhados com detalhes amarelos no estúdio da Polar',
    orientation: 'vertical',
    palette: 'color',
    width: 1280,
    height: 1601,
  },
  'polar-website-06.mp4': {
    kind: 'video',
    path: 'public/videos/projects/polar-website-06.mp4',
    alt: 'Vídeo do website da Polar',
    orientation: 'horizontal',
    width: 2560,
    height: 1440,
  },
  'polar-card-feed-05.mp4': {
    kind: 'video',
    path: 'public/videos/projects/polar-card-feed-05.mp4',
    alt: 'Vídeo do card de feed da Polar',
    orientation: 'vertical',
    width: 1280,
    height: 1600,
  },
  'polar-website-16.mp4': {
    kind: 'video',
    path: 'public/videos/projects/polar-website-16.mp4',
    alt: 'Vídeo do website da Polar',
    orientation: 'horizontal',
    width: 2560,
    height: 1440,
  },
  'home-feed-02.png': {
    kind: 'image',
    path: 'public/images/projects/polar-case/home-feed-02.png',
    alt: 'Página inicial do feed da Polar',
    orientation: 'vertical',
    palette: 'color',
    width: 1080,
    height: 1280,
  },
  'R0001868.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0001868.jpg',
    alt: 'Cachorro branco em uma feira cercado por pessoas',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 2000,
    height: 1333,
  },
  'R0002020-hor.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002020-hor.jpg',
    alt: 'Homem dentro de um café visto através de uma vitrine refletida',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 2500,
    height: 1608,
  },
  'R0002235.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002235.jpg',
    alt: 'Mulher caminhando diante de portas vermelhas',
    orientation: 'horizontal',
    palette: 'color',
    width: 2000,
    height: 1333,
  },
  'R0002402.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002402.jpg',
    alt: 'Skatista visto através de uma estrutura envidraçada',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 2000,
    height: 1333,
  },
  'R0002694.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002694.jpg',
    alt: 'Passageiros sentados no interior de um trem',
    orientation: 'horizontal',
    palette: 'color',
    width: 2268,
    height: 1512,
  },
  'R0002854.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002854.jpg',
    alt: 'Fachada urbana com letreiro amarelo e estrutura vermelha',
    orientation: 'horizontal',
    palette: 'color',
    width: 2000,
    height: 1333,
  },
  'R0002456.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002456.jpg',
    alt: 'Duas mulheres caminhando e comendo em uma rua movimentada',
    orientation: 'horizontal',
    palette: 'color',
    width: 2000,
    height: 1333,
  },
  'R0002344.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002344.jpg',
    alt: 'Pessoas jogando em um salão de sinuca iluminado',
    orientation: 'horizontal',
    palette: 'color',
    width: 2000,
    height: 1333,
  },
  'R0001853.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0001853.jpg',
    alt: 'Casal caminhando diante de uma fachada vermelha',
    orientation: 'horizontal',
    palette: 'color',
    width: 2829,
    height: 1886,
  },
  'R0001880.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0001880.jpg',
    alt: 'Mulher em primeiro plano em uma feira fotografada em preto e branco',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 2800,
    height: 1867,
  },
  'R0001984.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0001984.jpg',
    alt: 'Casal sentado em uma banca de flores',
    orientation: 'horizontal',
    palette: 'color',
    width: 2935,
    height: 1933,
  },
  'R0002082.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002082.jpg',
    alt: 'Reflexos e frutas em um interior fotografado em preto e branco',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 2000,
    height: 3000,
  },
  'R0002771.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002771.jpg',
    alt: 'Pessoas sentadas em bancos à beira-mar em preto e branco',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 2800,
    height: 1867,
  },
  'R0002394.jpg': {
    kind: 'image',
    path: 'public/images/projects/enchanted-feelings/R0002394.jpg',
    alt: 'Silhueta desfocada atrás de painéis de vidro colorido',
    orientation: 'vertical',
    palette: 'color',
    width: 2816,
    height: 4225,
  },
  'Scan15015.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15015.jpg',
    alt: 'Parede de elementos vazados fotografada em preto e branco',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 1600,
    height: 1060,
  },
  'Scan14998.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan14998.jpg',
    alt: 'Detalhe circular de um objeto metálico em preto e branco',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 1600,
    height: 1060,
  },
  'Scan15031.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15031.jpg',
    alt: 'Vista urbana através de uma janela com um ventilador',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15024.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15024.jpg',
    alt: 'Mesa com peças de cerâmica diante de uma janela aberta',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15025.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15025.jpg',
    alt: 'Interior de ateliê com prateleiras e uma janela aberta',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15021.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15021.jpg',
    alt: 'Mulher em um terraço diante de edifícios urbanos',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15018.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15018.jpg',
    alt: 'Biombo metálico com desenhos florais em um interior',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15036.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15036.jpg',
    alt: 'Janelas basculantes formando uma composição geométrica',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15022.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15022.jpg',
    alt: 'Fachada de ateliê com portas de vidro e persianas',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 1600,
    height: 1060,
  },
  'Scan15044.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15044.jpg',
    alt: 'Pessoa sentada entre janelas em um interior sombreado',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15026.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15026.jpg',
    alt: 'Prateleiras de cerâmica e uma mesa de trabalho',
    orientation: 'vertical',
    palette: 'black-and-white',
    width: 795,
    height: 1200,
  },
  'Scan15035.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15035.jpg',
    alt: 'Edifício industrial com uma sequência de janelas abertas',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 1600,
    height: 1060,
  },
  'Scan15034.jpg': {
    kind: 'image',
    path: 'public/images/projects/quiet-structures/Scan15034.jpg',
    alt: 'Silhueta diante de uma parede vazada com desenhos',
    orientation: 'horizontal',
    palette: 'black-and-white',
    width: 1600,
    height: 1060,
  },
}

const blackAndWhitePhotos = [
  'R0001868.jpg',
  'R0002020-hor.jpg',
  'R0002402.jpg',
  'R0001880.jpg',
  'R0002082.jpg',
  'R0002771.jpg',
]

const colorPhotos = [
  'R0002394.jpg',
  'R0002235.jpg',
  'R0002694.jpg',
  'R0002854.jpg',
  'R0002456.jpg',
  'R0002344.jpg',
  'R0001853.jpg',
  'R0001984.jpg',
]

const quietStructuresPhotos = [
  'Scan15034.jpg',
  'Scan15035.jpg',
  'Scan15026.jpg',
  'Scan15044.jpg',
  'Scan15022.jpg',
  'Scan15036.jpg',
  'Scan15018.jpg',
  'Scan15021.jpg',
  'Scan15025.jpg',
  'Scan15024.jpg',
  'Scan15031.jpg',
  'Scan14998.jpg',
  'Scan15015.jpg',
]

const polarDesignMedia = [
  'polar-case-18.mp4',
  'polar-case-07.png',
  'polar-website-06.mp4',
  'polar-card-feed-05.mp4',
  'polar-website-16.mp4',
  'home-feed-02.png',
]

const defaultInfo = "A creative digital identity positioned directly within the acidity of Brazilian Design. Three years after its first launch, we have developed a new website for the Polar portfolio. Accessible buttons, to the content classification through filters and different types of visualization, the interface design."
const defaultCredits = [
  {category: 'Design', name: 'Felipe Barbosa, Ralph Mayer'},
  {category: 'Development', name: 'Ariel Tonglet'},
  {category: 'Verbal Brand Identity', name: 'Pedro Kastelic'},
  {category: 'Typeface', name: 'Universal Sans (Family Type)'},
]

const projects = [
  {title: 'Enchanted feelings', designType: 'Visual identity', location: 'Catalunya, Spain', medium: 'Kodak 400Tx', year: '2016', photos: blackAndWhitePhotos, designMedia: polarDesignMedia, sections: ['design', 'photography']},
  {title: 'Nocturnal forms', designType: 'Editorial design', location: 'São Paulo, Brazil', medium: 'Ilford HP5 Plus', year: '2019', photos: colorPhotos, designMedia: colorPhotos, sections: ['design', 'photography']},
  {title: 'Quiet structures', designType: 'Digital experience', location: 'Lisbon, Portugal', medium: 'Mamiya 7', year: '2020', photos: quietStructuresPhotos, designMedia: quietStructuresPhotos, sections: ['design', 'photography']},
  {title: 'Enchanted feelings', designType: 'Visual identity', location: 'Catalunya, Spain', medium: 'Kodak 400Tx', year: '2016', photos: blackAndWhitePhotos.slice(-4), designMedia: blackAndWhitePhotos.slice(-4), sections: ['design', 'photography']},
  {title: 'Nocturnal forms', designType: 'Art direction', location: 'São Paulo, Brazil', medium: 'Ilford HP5 Plus', year: '2019', photos: colorPhotos.slice(-2), designMedia: colorPhotos.slice(-2), sections: ['design', 'photography']},
  {title: 'Quiet structures', designType: 'Publication', location: 'Lisbon, Portugal', medium: 'Mamiya 7', year: '2020', photos: quietStructuresPhotos.slice(-6), designMedia: quietStructuresPhotos.slice(-6), sections: ['design', 'photography']},
  {title: 'Nocturnal forms', designType: 'Editorial design', location: 'São Paulo, Brazil', medium: 'Ilford HP5 Plus', year: '2019', photos: colorPhotos, designMedia: colorPhotos, sections: ['design', 'photography']},
  {title: 'Quiet structures', designType: 'Digital experience', location: 'Lisbon, Portugal', medium: 'Mamiya 7', year: '2020', photos: quietStructuresPhotos, designMedia: quietStructuresPhotos, sections: ['design', 'photography']},
  {title: 'Enchanted feelings', designType: 'Visual identity', location: 'Catalunya, Spain', medium: 'Kodak 400Tx', year: '2016', photos: blackAndWhitePhotos.slice(-4), designMedia: blackAndWhitePhotos.slice(-4), sections: ['design', 'photography']},
  {title: 'Nocturnal forms', designType: 'Art direction', location: 'São Paulo, Brazil', medium: 'Ilford HP5 Plus', year: '2019', photos: colorPhotos.slice(-2), designMedia: colorPhotos.slice(-2), sections: ['design', 'photography']},
  {title: 'Quiet structures', designType: 'Publication', location: 'Lisbon, Portugal', medium: 'Mamiya 7', year: '2020', photos: quietStructuresPhotos.slice(-6), designMedia: quietStructuresPhotos.slice(-6), sections: ['photography']},
]

const intro = [
  "I'm Felipe, a graphic designer with artistic and technical influences dedicated to developing design solutions guided by a strategic digital approach. My contributions go beyond creating modern and creative visual solutions for clients. I also approach design with a systematic and strategic mindset to simplify processes and scaling these solutions. I see design as a tool that helps individuals and brands in their daily lives, enhancing our ability to face the challenges of today's world.",
  'I collaborated with teams from studios such as HardCuore in Rio de Janeiro, Hardy in Minas Gerais and Polar, Ltda in São Paulo, and worked on projects for clients such as Instituto Moreira Salles, Museu de Arte do Rio, Aliança Francesa, Revista Amarello, Vox Capital, Nubank, Daily Paper and much more.',
]

const practice = [
  {title: 'Latin American Design Awards 2024', detail: 'Silver, Category Digital'},
  {title: 'Awwwards 2022', detail: 'Honor Mention'},
  {title: 'Brasil Design Awards 2021', detail: 'Silver, Category Digital'},
]

const mentionsAwards = [
  {title: 'Latin American Design Awards 2026', detail: 'Gold, Category Digital'},
  {title: 'Latin American Design Awards 2026', detail: '2x Silver, Category Digital'},
  {title: '14th Brazilian Design Biennial', detail: 'Category Digital'},
  {title: 'Latin American Design Awards 2024', detail: 'Silver, Category Digital'},
  {title: 'Awwwards 2022', detail: 'Honor Mention'},
  {title: 'Brasil Design Awards 2021', detail: 'Silver, Category Digital'},
]

const getExistingAsset = (filename) => {
  const query = `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && originalFilename == ${JSON.stringify(filename)}][0]{_id}`
  try {
    const result = parseJsonOutput(runSanity(['documents', 'query', query]))
    return result?._id
  } catch (error) {
    if (String(error).includes('Query returned no results')) return undefined
    throw error
  }
}

const uploadAsset = (filename, media) => {
  const existingAssetId = getExistingAsset(filename)
  if (existingAssetId) {
    console.log(`↳ ${filename} já existe`)
    return existingAssetId
  }

  const assetType = media.kind === 'video' ? 'file' : 'image'
  const filePath = resolve(projectRoot, media.path)
  const output = runSanity(['assets', 'upload', '--file', filePath, '--type', assetType])
  const result = parseJsonOutput(output)
  const assetId = result?.asset?._id

  if (!assetId) throw new Error(`Upload sem referência para ${filename}`)
  console.log(`✓ ${filename} enviado`)
  return assetId
}

const assetIds = Object.fromEntries(
  Object.entries(mediaCatalog).map(([filename, media]) => [filename, uploadAsset(filename, media)]),
)

const toMedia = (filename, keyPrefix) => {
  const media = mediaCatalog[filename]
  const mediaValue = {
    _key: `${keyPrefix}-${filename.replace(/[^a-z0-9]/gi, '-')}`,
    _type: 'media',
    kind: media.kind,
    alt: media.alt,
    orientation: media.orientation,
    width: media.width,
    height: media.height,
  }

  if (media.kind === 'video') {
    mediaValue.video = {_type: 'file', asset: {_type: 'reference', _ref: assetIds[filename]}}
  } else {
    mediaValue.palette = media.palette
    mediaValue.image = {_type: 'image', asset: {_type: 'reference', _ref: assetIds[filename]}}
  }

  return mediaValue
}

const toPhotoMedia = (filename, keyPrefix) => {
  const media = mediaCatalog[filename]
  if (media.kind !== 'image') {
    throw new Error(`A galeria de Photography aceita apenas imagens: ${filename}`)
  }

  return {
    _key: `${keyPrefix}-${filename.replace(/[^a-z0-9]/gi, '-')}`,
    _type: 'photoMedia',
    alt: media.alt,
    orientation: media.orientation,
    palette: media.palette,
    width: media.width,
    height: media.height,
    image: {_type: 'image', asset: {_type: 'reference', _ref: assetIds[filename]}},
  }
}

const toSlug = (project, index) => {
  const number = String(index + 1).padStart(2, '0')
  return `${number}-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+$/g, '')
}

const toDesignProjectDocument = (project, index) => {
  const number = String(index + 1).padStart(2, '0')

  return {
    _id: `design-project-${number}`,
    _type: 'designProject',
    order: index + 1,
    title: project.title,
    slug: {_type: 'slug', current: toSlug(project, index)},
    designType: project.designType,
    info: defaultInfo,
    credits: defaultCredits.map((credit, creditIndex) => ({...credit, _key: `credit-${creditIndex}`})),
    year: project.year,
    gallery: project.designMedia.map((filename, mediaIndex) => toMedia(filename, `design-${mediaIndex}`)),
  }
}

const toPhotographyProjectDocument = (project, index) => {
  const number = String(index + 1).padStart(2, '0')

  return {
    _id: `photography-project-${number}`,
    _type: 'photographyProject',
    order: index + 1,
    title: project.title,
    slug: {_type: 'slug', current: toSlug(project, index)},
    location: project.location,
    medium: project.medium,
    year: project.year,
    photos: project.photos.map((filename, mediaIndex) => toPhotoMedia(filename, `photo-${mediaIndex}`)),
  }
}

const designProjects = projects.filter((project) => project.sections.includes('design'))
const photographyProjects = projects.filter((project) => project.sections.includes('photography'))

const documents = [
  {
    _id: 'siteConfig',
    _type: 'siteConfig',
    siteTitle: 'Felipe Barbosa',
    siteDescription: 'Portfólio de design e fotografia de Felipe Barbosa.',
    shareTitle: 'Felipe Barbosa',
    shareDescription: 'Portfólio de design e fotografia de Felipe Barbosa.',
  },
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    brand: 'FELIPE BARBOSA',
    brandAnimation: false,
    intro,
    lists: [
      {title: 'Pratice', items: practice},
      {title: 'Mentions & Awards', items: mentionsAwards},
    ].map((list, listIndex) => ({
      _key: `home-list-${listIndex}`,
      _type: 'homeListBlock',
      title: list.title,
      items: list.items.map((item, itemIndex) => ({
        ...item,
        _key: `home-list-${listIndex}-item-${itemIndex}`,
        _type: 'homeListItem',
      })),
    })),
  },
  ...designProjects.map(toDesignProjectDocument),
  ...photographyProjects.map(toPhotographyProjectDocument),
]

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'fine-sanity-migration-'))
const documentsFile = join(temporaryDirectory, 'documents.json')

try {
  writeFileSync(documentsFile, JSON.stringify(documents, null, 2))
  runSanity(['documents', 'create', documentsFile, '--replace'])
  const designCount = parseJsonOutput(runSanity(['documents', 'query', 'count(*[_type == "designProject"])']))
  const photographyCount = parseJsonOutput(runSanity(['documents', 'query', 'count(*[_type == "photographyProject"])']))
  const home = parseJsonOutput(runSanity(['documents', 'query', '*[_id == "siteSettings"][0]{_id, _type}']))

  console.log(`✓ ${designCount} projetos de Design migrados`)
  console.log(`✓ ${photographyCount} projetos de Photography migrados`)
  console.log(`✓ Home migrada: ${home?._id === 'siteSettings' ? 'sim' : 'não'}`)
} finally {
  rmSync(temporaryDirectory, {recursive: true, force: true})
}
