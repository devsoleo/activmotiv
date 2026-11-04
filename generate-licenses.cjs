#!/usr/bin/env node
/**
 * Génère un fichier licenses.json à partir de package.json + package-lock.json.
 *
 * Format de sortie (identique à ton licenses.json existant) :
 *   [{ name, version, license, text, repository }, ...]
 *
 * Usage :
 *   node scripts/generate-licenses.cjs
 *   node scripts/generate-licenses.cjs --out assets/licenses.json
 *   node scripts/generate-licenses.cjs --dev          # inclut devDependencies
 *   node scripts/generate-licenses.cjs --all          # inclut aussi les dépendances transitives
 *   node scripts/generate-licenses.cjs --extra licenses.extra.json
 *
 * Prérequis : avoir lancé `npm install` (les textes de licence sont lus dans node_modules).
 *
 * Entrées manuelles (ressources qui ne sont pas des paquets npm, ex. SAM-vectors) :
 * mets-les dans un fichier --extra (défaut : licenses.extra.json s'il existe),
 * au même format que la sortie. Elles sont ajoutées à la fin / écrasent un paquet du même nom.
 */

const fs = require('fs')
const path = require('path')

// ---------- Arguments ----------
const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const option = (name, fallback) => {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const ROOT = process.cwd()
const OUT = path.resolve(ROOT, option('--out', 'licenses.json'))
const EXTRA = path.resolve(ROOT, option('--extra', 'licenses.extra.json'))
const INCLUDE_DEV = flag('--dev')
const INCLUDE_ALL = flag('--all')

// ---------- Utilitaires ----------
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

const LICENSE_FILE_RE = /^(licen[cs]e|copying|unlicense)(\.(md|txt|markdown))?$/i

function findLicenseText(pkgDir) {
  if (!fs.existsSync(pkgDir)) return null
  const file = fs.readdirSync(pkgDir).find((f) => LICENSE_FILE_RE.test(f))
  if (!file) return null
  return fs.readFileSync(path.join(pkgDir, file), 'utf8').replace(/\r\n/g, '\n').trim()
}

function normalizeLicense(pkg, lockEntry) {
  const l = pkg.license ?? lockEntry?.license
  if (typeof l === 'string') return l
  if (l && typeof l === 'object' && l.type) return l.type
  if (Array.isArray(pkg.licenses)) return pkg.licenses.map((x) => x.type || x).join(' OR ')
  return 'UNKNOWN'
}

function normalizeRepository(repo) {
  if (!repo) return ''
  let url = typeof repo === 'string' ? repo : repo.url
  if (!url) return ''
  url = url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@/, 'https://')
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/\.git$/, '')
  // Raccourci "github:user/repo" ou "user/repo"
  if (/^github:/.test(url)) url = 'https://github.com/' + url.slice(7)
  else if (/^[\w.-]+\/[\w.-]+$/.test(url)) url = 'https://github.com/' + url
  return url
}

// ---------- Lecture des fichiers du projet ----------
const pkgJsonPath = path.join(ROOT, 'package.json')
const lockPath = path.join(ROOT, 'package-lock.json')

if (!fs.existsSync(pkgJsonPath)) {
  console.error('package.json introuvable dans', ROOT)
  process.exit(1)
}
if (!fs.existsSync(lockPath)) {
  console.error('package-lock.json introuvable dans', ROOT)
  process.exit(1)
}

const rootPkg = readJson(pkgJsonPath)
const lock = readJson(lockPath)
const lockPackages = lock.packages // lockfileVersion 2 ou 3

if (!lockPackages) {
  console.error('Lockfile v1 non supporté : régénère-le avec une version récente de npm.')
  process.exit(1)
}

// ---------- Sélection des paquets ----------
/** @type {Map<string, {name: string, lockKey: string}>} */
const selected = new Map()

if (INCLUDE_ALL) {
  for (const [key, entry] of Object.entries(lockPackages)) {
    if (!key.startsWith('node_modules/')) continue
    if (entry.link) continue
    if (!INCLUDE_DEV && entry.dev) continue
    if (entry.optional && entry.peer) continue
    // nom = tout ce qui suit le dernier "node_modules/"
    const name = key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length)
    selected.set(`${name}@${entry.version}`, { name, lockKey: key })
  }
} else {
  const direct = {
    ...rootPkg.dependencies,
    ...(INCLUDE_DEV ? rootPkg.devDependencies : {}),
  }
  for (const name of Object.keys(direct)) {
    const lockKey = `node_modules/${name}`
    const entry = lockPackages[lockKey]
    if (!entry) {
      console.warn(`⚠ ${name} absent du lockfile (npm install à refaire ?)`)
      continue
    }
    selected.set(`${name}@${entry.version}`, { name, lockKey })
  }
}

// ---------- Construction des entrées ----------
const results = []
const warnings = []

for (const { name, lockKey } of selected.values()) {
  const lockEntry = lockPackages[lockKey]
  const pkgDir = path.join(ROOT, lockKey) // ex. <root>/node_modules/expo-blur
  const pkgFile = path.join(pkgDir, 'package.json')

  let pkg = {}
  if (fs.existsSync(pkgFile)) {
    pkg = readJson(pkgFile)
  } else {
    warnings.push(`${name}: node_modules manquant (lance npm install)`)
  }

  const text = findLicenseText(pkgDir)
  if (!text) warnings.push(`${name}: aucun fichier LICENSE trouvé`)

  results.push({
    name,
    version: lockEntry.version,
    license: normalizeLicense(pkg, lockEntry),
    text: text ?? '',
    repository: normalizeRepository(pkg.repository),
  })
}

// ---------- Entrées manuelles ----------
let extras = []
if (fs.existsSync(EXTRA)) {
  extras = readJson(EXTRA)
  console.log(`+ ${extras.length} entrée(s) manuelle(s) depuis ${path.relative(ROOT, EXTRA)}`)
}

const extraNames = new Set(extras.map((e) => e.name))
const sortByName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

const final = [
  ...results.filter((r) => !extraNames.has(r.name)).sort(sortByName),
  ...extras,
]

// ---------- Écriture ----------
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(final, null, 2))

console.log(`✔ ${final.length} licences écrites dans ${path.relative(ROOT, OUT)}`)
if (warnings.length) {
  console.warn('\nAvertissements :')
  warnings.forEach((w) => console.warn('  -', w))
}

// Résumé par type de licence
const summary = final.reduce((acc, l) => ((acc[l.license] = (acc[l.license] || 0) + 1), acc), {})
console.log('\nRésumé :', summary)
