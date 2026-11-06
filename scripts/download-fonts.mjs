import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const destination = resolve(root, 'public/fonts')
const files = [
  'src/App.tsx',
  'src/data.ts',
  'src/components/CodeSphere.tsx',
  'src/components/ProjectArtwork.tsx',
  'index.html',
]
const content = (
  await Promise.all(files.map((file) => readFile(resolve(root, file), 'utf8')))
).join('')
const characters = [...new Set(content.match(/[^\x00-\x7f]/gu))].sort().join('')
const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
async function fetchAsset(url, options = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(25000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
      return response
    } catch (error) {
      if (attempt === 3) throw error
      console.warn(`Font request interrupted; retry ${attempt + 1}/3…`)
      await new Promise((done) => setTimeout(done, 800 * (attempt + 1)))
    }
  }
}

await mkdir(destination, { recursive: true })
for (const font of [
  {
    name: 'manrope',
    family: 'Manrope:wght@200..800',
    file: 'manrope-latin.woff2',
  },
  {
    name: 'notosanssc',
    family: 'Noto Sans SC:wght@100..900',
    file: 'noto-sans-sc-subset.woff2',
    text: characters,
  },
]) {
  const url = new URL('https://fonts.googleapis.com/css2')
  url.searchParams.set('family', font.family)
  url.searchParams.set('display', 'swap')
  if (font.text) url.searchParams.set('text', font.text)
  const response = await fetchAsset(url, {
    headers: { 'User-Agent': userAgent },
  })
  if (!response.ok) throw new Error(`Font stylesheet ${response.status}`)
  const css = await response.text()
  const matches = [
    ...css.matchAll(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/g),
  ]
  if (!matches.length)
    throw new Error(`No WOFF2 URL found for ${font.name}: ${css.slice(0, 200)}`)
  const asset = await fetchAsset(matches.at(-1)[1])
  if (!asset.ok) throw new Error(`Font download ${asset.status}`)
  const data = Buffer.from(await asset.arrayBuffer())
  await writeFile(resolve(destination, font.file), data)
  const license = await fetchAsset(
    `https://raw.githubusercontent.com/google/fonts/main/ofl/${font.name}/OFL.txt`,
  )
  if (!license.ok) throw new Error(`Font license ${license.status}`)
  await writeFile(
    resolve(destination, `${font.name}-OFL.txt`),
    (await license.text()).replace(/[ \t]+(?=\r?$)/gm, ''),
  )
  console.log(`${font.file}: ${(data.length / 1024).toFixed(1)} KB`)
}
console.log(
  `Self-hosted Chinese font subset: ${characters.length} unique characters.`,
)
