/**
 * Build script to generate a JSON index of all course content.
 * This runs at build time and creates a static file that the API can use.
 */

import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.join(process.cwd(), 'src', 'content', 'courses');

function walkContentFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkContentFiles(entryPath));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function splitFrontmatter(source) {
  if (!source.startsWith('---')) {
    return { frontmatter: '', body: source };
  }

  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { frontmatter: '', body: source };
  }

  return {
    frontmatter: match[1],
    body: source.slice(match[0].length),
  };
}

function frontmatterString(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return undefined;

  const value = match[1].trim();
  const quoted = value.match(/^["'](.*)["']$/);

  return quoted ? quoted[1] : value;
}

function fallbackTitle(id) {
  const slug = id.split('/').at(-1) || id;

  return slug
    .replace(/\.(md|mdx)$/, '')
    .replace(/^\d+[\s_-]+/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function contentType(relativePath) {
  const parts = relativePath.split(path.sep);
  const fileName = parts.at(-1);

  if (parts.length === 2 && fileName === 'index.mdx') return 'course';
  if (parts.length === 3 && fileName === 'index.mdx') return 'chapter';

  return 'lesson';
}

function contentId(relativePath) {
  const parsed = path.parse(relativePath);
  const withoutExtension = path.join(parsed.dir, parsed.name);
  return withoutExtension.endsWith(`${path.sep}index`)
    ? withoutExtension.slice(0, -`${path.sep}index`.length).replaceAll(path.sep, '/')
    : withoutExtension.replaceAll(path.sep, '/');
}

function indexFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(contentRoot, filePath);
  const { frontmatter, body } = splitFrontmatter(source);
  const id = contentId(relativePath);
  const type = contentType(relativePath);
  const parts = id.split('/');

  return {
    id,
    courseId: type === 'course' ? frontmatterString(frontmatter, 'title') || fallbackTitle(id) : parts[0] || '',
    title: frontmatterString(frontmatter, 'title') || fallbackTitle(id),
    content: body.replace(/[#*`]/g, '').substring(0, 3000),
    type,
  };
}

async function buildIndex() {
  console.log('Building course content index...');

  const chunks = walkContentFiles(contentRoot)
    .map(indexFile)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
  
  // Write to public directory so it's accessible at runtime
  const outputPath = path.join(process.cwd(), 'public', 'content-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
  
  console.log(`Indexed ${chunks.length} content chunks to ${outputPath}`);
}

buildIndex().catch(console.error);
