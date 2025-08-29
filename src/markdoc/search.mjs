import Markdoc from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import * as path from 'path'
import { createLoader } from 'simple-functional-loader'
import * as url from 'url'

// const __filename = url.fileURLToPath(import.meta.url)
// const slugify = slugifyWithCounter()

function toString(node) {
  let str =
    node.type === 'text' && typeof node.attributes?.content === 'string'
      ? node.attributes.content
      : ''
  if ('children' in node) {
    for (let child of node.children) {
      str += toString(child)
    }
  }
  return str
}

function extractSections(node, sections, isRoot = true) {
  if (isRoot) {
    slugify.reset()
  }
  if (node.type === 'heading' || node.type === 'paragraph') {
    let content = toString(node).trim()
    if (node.type === 'heading' && node.attributes.level <= 2) {
      let hash = node.attributes?.id ?? slugify(content)
      sections.push([content, hash, []])
    } else {
      sections.at(-1)[2].push(content)
    }
  } else if ('children' in node) {
    for (let child of node.children) {
      extractSections(child, sections, false)
    }
  }
}
import Markdoc from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import * as path from 'path'
import { createLoader } from 'simple-functional-loader'
import * as url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const slugify = slugifyWithCounter()
function toString(node) {
  let str =
    node.type === 'text' && typeof node.attributes?.content === 'string'
      ? node.attributes.content
      : ''
  if ('children' in node) {
    for (let child of node.children) {
      str += toString(child)
    }
  }
  return str
}
function extractSections(node, sections, isRoot = true) {
  if (isRoot) {
    slugify.reset()
  }
  if (node.type === 'heading' || node.type === 'paragraph') {
    let content = toString(node).trim()
    if (node.type === 'heading' && node.attributes.level <= 2) {
      let hash = node.attributes?.id ?? slugify(content)
      sections.push([content, hash, []])
    } else {
      sections.at(-1)[2].push(content)
    }
  } else if ('children' in node) {
    for (let child of node.children) {
      extractSections(child, sections, false)
    }
  }
}
function normalizeText(text) {
  return text
    .normalize('NFKD') // Normalize accented chars
    .replace(/\p{Diacritic}/gu, '') // Remove diacritics
    .toLowerCase() // Lowercase
    .replace(/[^\w\s\-\/.()`]/g, '') // Keep word chars, spaces, hyphen, slash, dot, parentheses, backticks
}

export default function withSearch(nextConfig = {}) {
  let cache = new Map()

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let pagesDir = path.resolve('./src/app')
            this.addContextDependency(pagesDir)

            let files = glob.sync('**/page.md', { cwd: pagesDir })
            let data = files.map((file) => {
              let url =
                file === 'page.md' ? '/' : `/${file.replace(/\/page\.md$/, '')}`
              let md = fs.readFileSync(path.join(pagesDir, file), 'utf8')

              let sections

              if (cache.get(file)?.[0] === md) {
                sections = cache.get(file)[1]
              } else {
                let ast = Markdoc.parse(md)
                let title =
                  ast.attributes?.frontmatter?.match(
                    /^title:\s*(.*?)\s*$/m,
                  )?.[1]
                sections = [[title, null, []]]
                extractSections(ast, sections)
                cache.set(file, [md, sections])
              }

              return { url, sections }
            })

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                tokenize: 'full',
                document: {
                  id: 'url',
                  index: 'content',
                  store: ['title', 'pageTitle'],
                },
                context: {
                  resolution: 9,
                  depth: 2,
                  bidirectional: true
                }
              })
              let data = ${JSON.stringify(data)}

              for (let { url, sections } of data) {
  for (let [title, hash, content] of sections) {
    sectionIndex.add({
      url: url + (hash ? ('#' + hash) : ''),
      title: normalizeText(title),
      content: normalizeText([title, ...content].join('\\\\n')),
      rawContent: [title, ...content].join('\\\\n'),
      pageTitle: hash ? sections[0][0] : undefined,
    })
  }
}

           export function search(query, options = {}) {
  let normalizedQuery = normalizeText(query)
  
  let resultNormalized = sectionIndex.search(normalizedQuery, { ...options, enrich: true, field: 'content' })
  let resultRaw = sectionIndex.search(query, { ...options, enrich: true, field: 'rawContent' })
  
  let combined = new Map()
  
  for (let res of (resultNormalized[0]?.result || [])) {
    combined.set(res.id, res)
  }
  
  for (let res of (resultRaw[0]?.result || [])) {
    combined.set(res.id, res)
  }
  
  if (combined.size === 0) {
    return []
  }
  
  return Array.from(combined.values()).map(item => ({
    url: item.id,
    title: item.doc.title,
    pageTitle: item.doc.pageTitle,
  }))
}

            `
          }),
        ],
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
