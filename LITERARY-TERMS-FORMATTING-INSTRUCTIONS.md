# Literary Terms Course - Content Formatting Instructions

## File Structure Convention
- Files should be placed in appropriate chapter directories under `src/content/courses/literary-terms-mh-abraham/`
- Use kebab-case for file names (e.g., `absurd-literature-of.mdx`)
- All files must have `.mdx` extension

## Frontmatter Requirements
Every lesson file must include:
```yaml
---
title: "Lesson Title"
description: "Brief description of the lesson content"
course: "Literary Terms By MH Abraham"
chapter: "chapter-name"  # matches directory name
order: 1                 # lesson order within chapter
tags: ["tag1", "tag2"]   # relevant tags
---
```

## Content Formatting Rules

### 1. Main Text
- Keep all English text exactly as provided (verbatim)
- **DO NOT** use blockquotes (>) for main content - text should appear normally without indentation
- Preserve all formatting, italics, bold text, and quotation marks
- Maintain original paragraph structure and line breaks
- Only use blockquotes for actual quoted material within the text

### 2. Hindi Translation Toggle
- Use simple `<details>` and `<summary>` tags without heavy styling
- Structure:
```html
<details class="hindi-translation">
<summary>🇮🇳 हिन्दी अनुवाद</summary>
[Hindi translation content goes here]
</details>
```

### 3. Translation Content Styling
- Keep Hindi translation content simple and readable
- Use standard markdown formatting within the details section
- For quoted content within translations, use standard blockquotes: `> quoted text`

## Chapter Directories
- `figures-of-speech/` - Rhetorical devices and literary techniques
- `literary-terms/` - Essential literary terminology
- `important-glossary/` - Key terms and definitions
- `literary-periods/` - Historical literary periods
- `literary-movements/` - Literary movements and schools

## File Naming Convention
- Use descriptive names based on the term/concept
- Replace spaces with hyphens
- Use lowercase letters
- Example: "absurd, literature of" → `absurd-literature-of.mdx`

## Content Guidelines
- Never modify the original English text
- Keep translations exactly as provided
- Preserve all author names, book titles, and dates
- Maintain all special characters and formatting