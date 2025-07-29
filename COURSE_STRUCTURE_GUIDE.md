# Obsidian Vault → Astro Course Platform

## Course Structure Guidelines

This document outlines how to organize your Obsidian vault content for the Astro course platform with **unlimited folder depth support**.

---

## 🏗️ **Supported Structure**

### **Unlimited Nesting Support**
```
src/content/courses/
├── course-name/
│   ├── intro.md                           ← Root level files
│   ├── overview.md                        ← Root level files
│   ├── basics/                            ← 1 level deep
│   │   ├── getting-started.md
│   │   └── first-steps.md
│   ├── intermediate/                      ← 1 level deep
│   │   ├── advanced-concepts/             ← 2 levels deep
│   │   │   ├── deep-dive.md
│   │   │   └── complex-topics/            ← 3 levels deep
│   │   │       ├── expert-level.md
│   │   │       └── mastery/               ← 4 levels deep
│   │   │           └── ultimate-guide.md  ← 5 levels deep!
│   │   └── practical-examples.md
│   └── advanced/
│       ├── performance/
│       │   ├── optimization.md
│       │   └── best-practices/
│       │       ├── memory-management.md
│       │       └── speed-optimization.md
│       └── deployment.md
```

---

## 📁 **How It Works**

### **1. Course Identification**
- **Top-level folder name** = Course name
- Example: `javascript-fundamentals` becomes "JavaScript Fundamentals"

### **2. Path-Based Routing**
- **Any depth of folders** is supported
- **File location** determines the URL structure

### **3. URL Generation**
```
File Path                                    → Generated URL
course/intro.md                             → /courses/course/intro
course/basics/getting-started.md            → /courses/course/basics/getting-started
course/advanced/oop/classes/inheritance.md  → /courses/course/advanced/oop/classes/inheritance
```

---

## 📝 **Required Frontmatter**

Every `.md` or `.mdx` file must have frontmatter:

```markdown
---
title: "Your Lesson Title"
description: "Brief description of the lesson"
course: "Course Name"          # Must match folder name exactly
order: 1                       # Optional: for ordering within folder
tags: ["tag1", "tag2"]         # Optional: your Obsidian tags
date: 2024-01-15              # Optional: creation date
author: "Your Name"           # Optional: author name
draft: false                  # Optional: hide from production
---

# Your content here...
```

### **Key Points:**
- `course` field must **exactly match** your folder name
- `chapter` field is **removed** - path is derived from file location
- `title` is **required** for navigation
- All other fields are **optional**

---

## 🎯 **Examples**

### **Example 1: Programming Course**
```
src/content/courses/
└── python-programming/
    ├── README.md                    # Course overview
    ├── setup.md                     # Getting started
    ├── basics/
    │   ├── variables.md
    │   ├── data-types.md
    │   └── control-flow/
    │       ├── if-statements.md
    │       ├── loops.md
    │       └── advanced-loops/
    │           ├── nested-loops.md
    │           └── loop-optimization.md
    ├── intermediate/
    │   ├── functions/
    │   │   ├── defining-functions.md
    │   │   └── advanced-functions/
    │   │       ├── decorators.md
    │   │       └── generators.md
    │   └── oop/
    │       ├── classes.md
    │       ├── inheritance.md
    │       └── design-patterns/
    │           ├── singleton.md
    │           ├── factory.md
    │           └── advanced-patterns/
    │               ├── observer.md
    │               └── strategy.md
    └── projects/
        ├── beginner-projects/
        │   ├── calculator.md
        │   └── todo-app.md
        └── advanced-projects/
            ├── web-scraper.md
            └── machine-learning/
                ├── data-analysis.md
                └── neural-networks/
                    ├── basic-nn.md
                    └── deep-learning/
                        └── advanced-architectures.md
```

### **Example 2: Mixed Structure Course**
```
src/content/courses/
└── web-development/
    ├── introduction.md              # Root level
    ├── course-outline.md           # Root level
    ├── html/
    │   ├── basics.md
    │   └── semantic-html.md
    ├── css/
    │   ├── selectors.md
    │   ├── flexbox/
    │   │   ├── basics.md
    │   │   └── advanced-layouts.md
    │   └── responsive-design/
    │       ├── media-queries.md
    │       └── mobile-first/
    │           ├── approach.md
    │           └── best-practices/
    │               └── performance.md
    └── javascript/
        ├── fundamentals/
        │   ├── variables.md
        │   └── functions/
        │       ├── arrow-functions.md
        │       └── async-functions/
        │           ├── promises.md
        │           └── async-await.md
        └── frameworks/
            ├── react/
            │   ├── components.md
            │   ├── hooks/
            │   │   ├── useState.md
            │   │   └── useEffect.md
            │   └── advanced/
            │       ├── context.md
            │       └── performance/
            │           ├── memo.md
            │           └── optimization-techniques.md
            └── vue/
                └── getting-started.md
```

---

## 🧭 **Navigation Features**

### **1. Automatic Breadcrumbs**
- Shows full path: `All Courses / Course Name / Folder / Subfolder / ...`
- Non-clickable intermediate folders (for now)

### **2. Sidebar Navigation**
- **Hierarchical folder structure**
- **Current lesson highlighted**
- **Collapsible sections** (planned)

### **3. Previous/Next Navigation**
- Alphabetical order within each folder level
- Seamlessly moves between folders

---

## 🔄 **Migration Guide**

### **From Existing Obsidian Vault:**

1. **Copy your folders** to `src/content/courses/your-course-name/`

2. **Add frontmatter** to each `.md` file:
   ```markdown
   ---
   title: "Lesson Title"
   course: "Your Course Name"
   ---
   ```

3. **Optional cleanup:**
   - Remove any `chapter:` fields from old frontmatter
   - Update internal links if needed
   - Add `order:` fields for custom sorting

### **From Previous Version:**
- Remove `chapter` field from frontmatter
- Files can now be at any depth
- URLs will automatically update

---

## 🎨 **Customization Options**

### **File Types Supported:**
- `.md` files (Markdown)
- `.mdx` files (MDX with React components)

### **Frontmatter Options:**
```yaml
title: "Required - shown in navigation"
description: "Optional - for SEO and course listings"
course: "Required - must match folder name"
order: 1              # Optional - for sorting within folder
tags: ["tag1", "tag2"] # Optional - displayed as badges
date: 2024-01-15      # Optional - shown on lesson page
updated: 2024-01-20   # Optional - for tracking changes
author: "Your Name"   # Optional - author attribution
draft: false          # Optional - hide from production
```

---

## 🔗 **URL Structure**

### **Generated URLs:**
- Root files: `/courses/course-name/file-name`
- Nested files: `/courses/course-name/folder/subfolder/.../file-name`
- Course overview: `/courses/course-name`
- All courses: `/courses`

### **SEO-Friendly:**
- Automatic slug generation from file names
- Proper meta tags from frontmatter
- Hierarchical structure for search engines

---

## 📋 **Checklist for New Courses**

- [ ] Create course folder in `src/content/courses/`
- [ ] Add frontmatter to all `.md` files
- [ ] Ensure `course` field matches folder name exactly
- [ ] Test navigation and URLs locally
- [ ] Verify all internal links work
- [ ] Check responsive design on mobile
- [ ] Review course listing appearance

---

## 🚀 **Advanced Features**

### **Coming Soon:**
- [ ] Wikilink conversion (`[[Link]]` → proper markdown links)
- [ ] Obsidian tag integration
- [ ] Search functionality
- [ ] Progress tracking
- [ ] Course completion certificates
- [ ] Interactive components in MDX files

### **Current Limitations:**
- Sidebar navigation shows only 2 levels (can be extended)
- No search within courses yet
- Wikilinks need manual conversion

---

## 🛠️ **Technical Details**

### **File Processing:**
- Content collections with Zod schema validation
- Automatic slug generation from file paths
- MDX support for enhanced content
- Syntax highlighting with Shiki

### **Routing:**
- Catch-all dynamic routes (`[...slug].astro`)
- Static site generation at build time
- SEO-optimized URLs and meta tags

### **Performance:**
- Static generation for fast loading
- Optimized images and assets
- Minimal JavaScript for interactivity

---

**Last Updated:** January 2025  
**Version:** 2.0 (Unlimited Depth Support)