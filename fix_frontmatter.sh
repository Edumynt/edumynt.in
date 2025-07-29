#!/bin/bash

# Script to add missing frontmatter to literature markdown files

BASE_DIR="/data/data/com.termux/files/home/Astro/edumynt/src/content/courses/literature"

# Function to generate title from file path
generate_title() {
    local file_path="$1"
    local filename=$(basename "$file_path" .md)
    local parent_dir=$(basename "$(dirname "$file_path")")
    
    # Handle different file patterns
    if [[ "$file_path" == *"3_Major_Works_Analysis"* ]]; then
        # For work analysis files
        local author_dir=$(basename "$(dirname "$(dirname "$file_path")")")
        local work_name=$(echo "$filename" | sed 's/_/ /g')
        echo "$work_name - Analysis"
    elif [[ "$filename" == "1_Biography" ]]; then
        local author_dir=$(basename "$(dirname "$file_path")")
        local author_name=$(echo "$author_dir" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
        # Handle specific cases
        if [[ "$author_dir" == "rabindra-nath-tagore" ]]; then
            author_name="Rabindranath Tagore"
        elif [[ "$author_dir" == "rk-narayan" ]]; then
            author_name="R.K. Narayan"
        elif [[ "$author_dir" == "mulk-raj-anand" ]]; then
            author_name="Mulk Raj Anand"
        fi
        echo "$author_name - Biography"
    elif [[ "$filename" == "2_Works_and_Awards" ]]; then
        local author_dir=$(basename "$(dirname "$file_path")")
        local author_name=$(echo "$author_dir" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
        # Handle specific cases
        if [[ "$author_dir" == "rabindra-nath-tagore" ]]; then
            author_name="Rabindranath Tagore"
        elif [[ "$author_dir" == "rk-narayan" ]]; then
            author_name="R.K. Narayan"
        elif [[ "$author_dir" == "mulk-raj-anand" ]]; then
            author_name="Mulk Raj Anand"
        fi
        echo "$author_name - Works and Awards"
    elif [[ "$filename" == "4_Literary_Style_and_Themes" ]]; then
        local author_dir=$(basename "$(dirname "$file_path")")
        local author_name=$(echo "$author_dir" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
        # Handle specific cases
        if [[ "$author_dir" == "rabindra-nath-tagore" ]]; then
            author_name="Rabindranath Tagore"
        elif [[ "$author_dir" == "rk-narayan" ]]; then
            author_name="R.K. Narayan"
        elif [[ "$author_dir" == "mulk-raj-anand" ]]; then
            author_name="Mulk Raj Anand"
        fi
        echo "$author_name - Literary Style and Themes"
    elif [[ "$filename" == "5_Mindmap" ]]; then
        local author_dir=$(basename "$(dirname "$file_path")")
        local author_name=$(echo "$author_dir" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
        # Handle specific cases
        if [[ "$author_dir" == "rabindra-nath-tagore" ]]; then
            author_name="Rabindranath Tagore"
        elif [[ "$author_dir" == "rk-narayan" ]]; then
            author_name="R.K. Narayan"
        elif [[ "$author_dir" == "mulk-raj-anand" ]]; then
            author_name="Mulk Raj Anand"
        fi
        echo "$author_name - Mindmap"
    elif [[ "$filename" == "6_Practice_MCQs" ]]; then
        local author_dir=$(basename "$(dirname "$file_path")")
        local author_name=$(echo "$author_dir" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
        # Handle specific cases
        if [[ "$author_dir" == "rabindra-nath-tagore" ]]; then
            author_name="Rabindranath Tagore"
        elif [[ "$author_dir" == "rk-narayan" ]]; then
            author_name="R.K. Narayan"
        elif [[ "$author_dir" == "mulk-raj-anand" ]]; then
            author_name="Mulk Raj Anand"
        fi
        echo "$author_name - Practice MCQs"
    else
        # Default case - clean up filename
        echo "$filename" | sed 's/-/ /g' | sed 's/_/ /g' | sed 's/\b\w/\U&/g'
    fi
}

# Process files missing course field in frontmatter
echo "Processing files with frontmatter missing course field..."
find "$BASE_DIR" -name "*.md" | while read -r file; do
    if head -n 5 "$file" | grep -q "^---$"; then
        if ! head -n 10 "$file" | grep -q "^course:"; then
            echo "Adding course field to: $file"
            # Create temp file with course field added
            {
                head -n 1 "$file"  # First ---
                head -n 10 "$file" | tail -n +2 | head -n -1  # frontmatter content
                echo "course: literature"
                tail -n +2 "$file" | sed -n '/^---$/,$p'  # from second --- onwards
            } > "${file}.tmp" && mv "${file}.tmp" "$file"
        fi
    fi
done

echo "Processing files with no frontmatter..."
find "$BASE_DIR" -name "*.md" | while read -r file; do
    if ! head -n 5 "$file" | grep -q "^---$"; then
        echo "Adding complete frontmatter to: $file"
        title=$(generate_title "$file")
        # Create temp file with frontmatter added
        {
            echo "---"
            echo "title: $title"
            echo "course: literature"
            echo "---"
            echo ""
            cat "$file"
        } > "${file}.tmp" && mv "${file}.tmp" "$file"
    fi
done

echo "Done!"