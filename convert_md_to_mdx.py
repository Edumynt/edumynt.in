#!/usr/bin/env python3
import os
import re
from pathlib import Path

def get_course_from_path(file_path):
    """Extract course name from file path"""
    path_parts = Path(file_path).parts
    if 'Literature' in path_parts or 'literature' in path_parts:
        return 'literature'
    elif 'javascript' in str(file_path).lower():
        return 'javascript-fundamentals'
    else:
        # Default fallback
        for part in path_parts:
            if part.startswith('courses/'):
                continue
            if part in ['src', 'content', 'courses']:
                continue
            return part.lower().replace(' ', '-')
    return 'general'

def get_title_from_content_or_filename(content, filename):
    """Extract title from markdown content or use filename"""
    # Look for first h1 header in content
    h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if h1_match:
        # Clean up the title - remove markdown formatting
        title = h1_match.group(1)
        title = re.sub(r'\*([^*]+)\*', r'\1', title)  # Remove italic *text*
        title = re.sub(r'`([^`]+)`', r'\1', title)    # Remove code `text`
        return title.strip()
    
    # Fallback to filename
    return filename.replace('_', ' ').replace('-', ' ').title()

def convert_md_to_mdx(file_path):
    """Convert a single .md file to .mdx with frontmatter"""
    print(f"Converting: {file_path}")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has frontmatter
    if content.startswith('---'):
        print(f"  Skipping {file_path} - already has frontmatter")
        # Just rename to .mdx
        new_path = file_path.replace('.md', '.mdx')
        os.rename(file_path, new_path)
        return
    
    # Extract info for frontmatter
    filename = Path(file_path).stem
    course = get_course_from_path(file_path)
    title = get_title_from_content_or_filename(content, filename)
    
    # Determine tags based on path and content
    tags = []
    path_lower = str(file_path).lower()
    
    if 'indian' in path_lower and 'writers' in path_lower:
        tags.extend(['indian-literature', 'literature'])
    if 'poetry' in content.lower() or 'poem' in content.lower():
        tags.append('poetry')
    if 'biography' in path_lower:
        tags.append('biography')
    if 'analysis' in path_lower:
        tags.append('analysis')
    if 'javascript' in path_lower:
        tags.extend(['javascript', 'programming'])
    
    # Create frontmatter
    frontmatter = f"""---
title: "{title}"
course: "{course}"
description: "{title}"
tags: {tags}
author: "Course Content"
draft: false
---

"""
    
    # Add frontmatter to content
    new_content = frontmatter + content
    
    # Write to .mdx file
    new_path = file_path.replace('.md', '.mdx')
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    # Remove old .md file
    os.remove(file_path)
    print(f"  ✓ Converted to: {new_path}")

def main():
    """Convert all .md files in src/content to .mdx"""
    content_dir = Path('src/content')
    
    if not content_dir.exists():
        print("src/content directory not found!")
        return
    
    # Find all .md files
    md_files = list(content_dir.rglob('*.md'))
    
    print(f"Found {len(md_files)} .md files to convert")
    
    for md_file in md_files:
        try:
            convert_md_to_mdx(str(md_file))
        except Exception as e:
            print(f"Error converting {md_file}: {e}")
    
    print("Conversion complete!")

if __name__ == "__main__":
    main()