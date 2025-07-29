#!/usr/bin/env python3
import os
import re
from pathlib import Path

def generate_title_from_path(file_path):
    """Generate appropriate title from file path structure"""
    path_parts = Path(file_path).parts
    
    # Get relevant parts from the path
    filename = Path(file_path).stem
    parent_dir = Path(file_path).parent.name
    
    # Handle different file types based on path structure
    if '3_Major_Works_Analysis' in str(file_path):
        # For work analysis files
        author_dir = Path(file_path).parent.parent.name
        work_name = filename.replace('_', ' ')
        author_name = author_dir.replace('-', ' ').title()
        
        # Handle specific cases
        if author_dir == 'rabindra-nath-tagore':
            author_name = 'Rabindranath Tagore'
        elif author_dir == 'rk-narayan':
            author_name = 'R.K. Narayan'
        elif author_dir == 'mulk-raj-anand':
            author_name = 'Mulk Raj Anand'
        
        return f"{work_name} - Analysis"
    
    elif filename.endswith('_Biography') or filename == '1_Biography':
        # For biography files
        author_dir = Path(file_path).parent.name
        author_name = author_dir.replace('-', ' ').title()
        
        # Handle specific cases
        if author_dir == 'rabindra-nath-tagore':
            author_name = 'Rabindranath Tagore'
        elif author_dir == 'rk-narayan':
            author_name = 'R.K. Narayan'
        elif author_dir == 'mulk-raj-anand':
            author_name = 'Mulk Raj Anand'
        
        return f"{author_name} - Biography"
    
    elif filename == '2_Works_and_Awards':
        # For works and awards files
        author_dir = Path(file_path).parent.name
        author_name = author_dir.replace('-', ' ').title()
        
        # Handle specific cases
        if author_dir == 'rabindra-nath-tagore':
            author_name = 'Rabindranath Tagore'
        elif author_dir == 'rk-narayan':
            author_name = 'R.K. Narayan'
        elif author_dir == 'mulk-raj-anand':
            author_name = 'Mulk Raj Anand'
        
        return f"{author_name} - Works and Awards"
    
    elif filename == '4_Literary_Style_and_Themes':
        # For literary style files
        author_dir = Path(file_path).parent.name
        author_name = author_dir.replace('-', ' ').title()
        
        # Handle specific cases
        if author_dir == 'rabindra-nath-tagore':
            author_name = 'Rabindranath Tagore'
        elif author_dir == 'rk-narayan':
            author_name = 'R.K. Narayan'
        elif author_dir == 'mulk-raj-anand':
            author_name = 'Mulk Raj Anand'
        
        return f"{author_name} - Literary Style and Themes"
    
    elif filename == '5_Mindmap':
        # For mindmap files
        author_dir = Path(file_path).parent.name
        author_name = author_dir.replace('-', ' ').title()
        
        # Handle specific cases
        if author_dir == 'rabindra-nath-tagore':
            author_name = 'Rabindranath Tagore'
        elif author_dir == 'rk-narayan':
            author_name = 'R.K. Narayan'
        elif author_dir == 'mulk-raj-anand':
            author_name = 'Mulk Raj Anand'
        
        return f"{author_name} - Mindmap"
    
    elif filename == '6_Practice_MCQs':
        # For MCQ files
        author_dir = Path(file_path).parent.name
        author_name = author_dir.replace('-', ' ').title()
        
        # Handle specific cases
        if author_dir == 'rabindra-nath-tagore':
            author_name = 'Rabindranath Tagore'
        elif author_dir == 'rk-narayan':
            author_name = 'R.K. Narayan'
        elif author_dir == 'mulk-raj-anand':
            author_name = 'Mulk Raj Anand'
        
        return f"{author_name} - Practice MCQs"
    
    elif 'literary-movements' in str(file_path):
        # For literary movement files
        title = filename.replace('-', ' ').replace('_', ' ')
        # Capitalize appropriately
        words = title.split()
        capitalized_words = []
        for word in words:
            if word.lower() in ['c', 'and', 'or', 'the', 'of', 'for', 'in', 'on', 'at', 'to', 'a', 'an']:
                if word == words[0]:  # Always capitalize first word
                    capitalized_words.append(word.capitalize())
                else:
                    capitalized_words.append(word.lower())
            else:
                capitalized_words.append(word.capitalize())
        
        return ' '.join(capitalized_words)
    
    elif 'literary-periods' in str(file_path):
        # For literary period files
        title = filename.replace('-', ' ').replace('_', ' ')
        # Capitalize appropriately
        words = title.split()
        capitalized_words = []
        for word in words:
            if word.lower() in ['c', 'and', 'or', 'the', 'of', 'for', 'in', 'on', 'at', 'to', 'a', 'an']:
                if word == words[0]:  # Always capitalize first word
                    capitalized_words.append(word.capitalize())
                else:
                    capitalized_words.append(word.lower())
            else:
                capitalized_words.append(word.capitalize())
        
        return ' '.join(capitalized_words)
    
    else:
        # Default case - just clean up the filename
        return filename.replace('-', ' ').replace('_', ' ').title()

def process_file(file_path):
    """Process a single markdown file to add/fix frontmatter"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has frontmatter
        if content.startswith('---\n'):
            # File has frontmatter, check if it has both title and course
            frontmatter_end = content.find('\n---\n', 4)
            if frontmatter_end == -1:
                print(f"ERROR: Malformed frontmatter in {file_path}")
                return False
            
            frontmatter = content[4:frontmatter_end]
            has_title = 'title:' in frontmatter
            has_course = 'course:' in frontmatter
            
            if has_title and has_course:
                print(f"SKIP: {file_path} already has both title and course")
                return True
            
            if not has_course:
                # Add course field
                new_frontmatter = frontmatter + '\ncourse: literature'
                new_content = f"---\n{new_frontmatter}\n---\n{content[frontmatter_end + 5:]}"
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"UPDATED: Added course field to {file_path}")
                return True
        
        else:
            # File has no frontmatter, add complete frontmatter
            title = generate_title_from_path(file_path)
            frontmatter = f"---\ntitle: {title}\ncourse: literature\n---\n\n"
            new_content = frontmatter + content
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"ADDED: Complete frontmatter to {file_path}")
            return True
            
    except Exception as e:
        print(f"ERROR processing {file_path}: {e}")
        return False

def main():
    """Main function to process all markdown files"""
    base_dir = "/data/data/com.termux/files/home/Astro/edumynt/src/content/courses/literature"
    
    if not os.path.exists(base_dir):
        print(f"ERROR: Directory {base_dir} does not exist")
        return
    
    # Find all markdown files
    md_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    
    print(f"Found {len(md_files)} markdown files to process")
    
    processed = 0
    errors = 0
    
    for file_path in sorted(md_files):
        if process_file(file_path):
            processed += 1
        else:
            errors += 1
    
    print(f"\nSummary:")
    print(f"- Processed: {processed}")
    print(f"- Errors: {errors}")
    print(f"- Total: {len(md_files)}")

if __name__ == "__main__":
    main()