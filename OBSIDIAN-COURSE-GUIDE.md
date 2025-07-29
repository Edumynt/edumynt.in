# Obsidian Vault → Astro Course Platform

## Complete Implementation Guide & Structure Guidelines

### 📁 **Supported Folder Structures**

Your Obsidian vault now supports **unlimited folder depth**:

```
src/content/courses/
├── course-name/
│   ├── file1.md                    ← Root-level files
│   ├── file2.md                    ← Root-level files
│   ├── chapter1/
│   │   ├── lesson1.md              ← Chapter files
│   │   └── lesson2.md
│   ├── chapter2/
│   │   ├── basics/
│   │   │   ├── intro.md            ← Nested folders
│   │   │   └── concepts.md
│   │   └── advanced/
│   │       ├── patterns/
│   │       │   └── design.md       ← Deep nesting
│   │       └── optimization.md
│   └── resources/
│       ├── tools/
│       │   ├── editors/
│       │   │   └── vscode.md       ← Unlimited depth!
│       │   └── compilers.md
│       └── references.md
```

### 🔗 **Generated URL Structure**

- **Root files**: `/courses/course-name/file1`
- **Chapter files**: `/courses/course-name/chapter1/lesson1`
- **Nested files**: `/courses/course-name/chapter2/basics/intro`
- **Deep nesting**: `/courses/course-name/resources/tools/editors/vscode`

### 📝 **Required Frontmatter**

Every `.md` or `.mdx` file must include:

```yaml
---
title: "Your Lesson Title"
description: "Brief description (optional)"
course: "Course Name"           # Must match folder name exactly
order: 1                        # Optional: for lesson ordering
tags: ["tag1", "tag2"]          # Optional: Obsidian tags
date: 2024-01-15               # Optional: creation date
author: "Your Name"            # Optional
draft: false                   # Optional: hide from navigation
---

# Your content here...
```

### 🎯 **Key Features**

1. **Unlimited Nesting**: Any folder depth is supported
2. **Mixed Structure**: Combine root files + nested folders
3. **Auto Navigation**: Hierarchical sidebar navigation
4. **Breadcrumbs**: Full path breadcrumbs for deep files
5. **MDX Support**: Use `.md` or `.mdx` files
6. **Tag Preservation**: Obsidian tags are preserved
7. **Order Control**: Use `order` field to control lesson sequence

### 📋 **Setup Steps**

1. **Copy your Obsidian folders** into `src/content/courses/`
2. **Add frontmatter** to each `.md` file (required)
3. **Set course field** to match your folder name exactly
4. **Optional**: Add `order` numbers for lesson sequence
5. **Test**: Visit `http://localhost:4322/courses`

### 🔄 **Frontmatter Conversion**

**From Obsidian:**
```yaml
---
tags: [javascript, functions]
aliases: [JS Functions]
---
```

**To Astro:**
```yaml
---
title: "JavaScript Functions"
description: "Learn about functions in JavaScript"
course: "JavaScript Fundamentals"  # Add this (matches folder name)
tags: ["javascript", "functions"]   # Keep your existing tags
order: 1                           # Add for ordering (optional)
date: 2024-01-15                   # Add creation date (optional)
---
```

### 🗂️ **Example Obsidian Vault Conversion**

**Your Obsidian Structure:**
```
MyVault/
├── Python Basics/
│   ├── Introduction.md
│   ├── Variables/
│   │   ├── Declaration.md
│   │   └── Types.md
│   └── Advanced/
│       └── OOP/
│           └── Classes.md
└── Web Development/
    ├── HTML.md
    └── CSS/
        └── Selectors.md
```

**Becomes Astro Structure:**
```
src/content/courses/
├── python-basics/                 # Folder name becomes course slug
│   ├── introduction.md            # Root file
│   ├── variables/
│   │   ├── declaration.md         # Nested file
│   │   └── types.md
│   └── advanced/
│       └── oop/
│           └── classes.md         # Deep nested file
└── web-development/
    ├── html.md                    # Root file
    └── css/
        └── selectors.md           # Nested file
```

**Generated URLs:**
- `/courses/python-basics/introduction`
- `/courses/python-basics/variables/declaration`
- `/courses/python-basics/advanced/oop/classes`
- `/courses/web-development/html`
- `/courses/web-development/css/selectors`

### ⚡ **Quick Start Template**

For any new lesson file:

```yaml
---
title: "LESSON_TITLE_HERE"
description: "Brief description"
course: "COURSE_FOLDER_NAME"
order: 1
tags: ["tag1", "tag2"]
date: 2024-01-15
---

# Your Lesson Content

Write your content here using standard Markdown or MDX.

## Obsidian Features Supported
- ✅ Tags (in frontmatter)
- ✅ Frontmatter
- ✅ Unlimited folder nesting
- ✅ Mixed .md and .mdx files
- 🔄 [[Wikilinks]] (planned conversion)

## Next Steps
Link to other lessons or reference materials.
```

### 🚀 **Advanced Features**

- **MDX Components**: Use React components in `.mdx` files
- **Syntax Highlighting**: Code blocks are automatically highlighted
- **Responsive Design**: Works on desktop and mobile
- **Search Ready**: Structure supports future search implementation
- **SEO Optimized**: Proper meta tags and structured URLs

### 🔧 **Troubleshooting**

1. **404 Errors**: Check frontmatter `course` field matches folder name
2. **Missing Navigation**: Ensure all files have required frontmatter
3. **Order Issues**: Use `order` field to control lesson sequence
4. **Special Characters**: Folder/file names become URL slugs (auto-converted)

### 📚 **Remember for Future**

- **Course Name**: Must match folder name exactly in frontmatter
- **File Extensions**: Both `.md` and `.mdx` work
- **Folder Depth**: No limit on nesting levels
- **URL Structure**: Mirrors your folder structure exactly
- **Navigation**: Automatically generated from file structure

---

**Last Updated**: 2024-01-29  
**Version**: Unlimited Depth Support  
**Status**: ✅ Production Ready