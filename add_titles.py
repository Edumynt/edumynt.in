

import os
import re

def add_title_to_mdx_files(vault_path):
    for root, _, files in os.walk(vault_path):
        for file_name in files:
            if file_name.endswith(".mdx"):
                file_path = os.path.join(root, file_name)
                with open(file_path, "r") as f:
                    content = f.read()

                # Extract title from filename
                title = os.path.splitext(file_name)[0].replace("-", " ").replace("_", " ").strip()

                # Check if frontmatter exists
                if content.startswith("---"):
                    # Check if title exists in frontmatter
                    match = re.match(r"---(.*?)---(.*)", content, re.DOTALL)
                    if match:
                        frontmatter = match.group(1)
                        body = match.group(2)
                        if "title:" not in frontmatter:
                            new_frontmatter = f"title: \"{title}\"\n{frontmatter.strip()}"
                            new_content = f"---\n{new_frontmatter}\n---\n{body.strip()}"
                            with open(file_path, "w") as f:
                                f.write(new_content)
                            print(f"Added title to: {file_path}")
                        else:
                            print(f"Title already exists in: {file_path}")
                    else:
                        # Malformed frontmatter, add new one
                        new_content = f"---\ntitle: \"{title}\"\n---\n{content.strip()}"
                        with open(file_path, "w") as f:
                            f.write(new_content)
                        print(f"Added new frontmatter with title to: {file_path}")
                else:
                    # No frontmatter, add new one
                    new_content = f"---\ntitle: \"{title}\"\n---\n{content.strip()}"
                    with open(file_path, "w") as f:
                        f.write(new_content)
                    print(f"Added frontmatter with title to: {file_path}")

if __name__ == "__main__":
    vault_directory = "/data/data/com.termux/files/home/Astro/edumynt/src/content/vault"
    add_title_to_mdx_files(vault_directory)

