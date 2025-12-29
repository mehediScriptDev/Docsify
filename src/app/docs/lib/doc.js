import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { log } from 'console';

const postsDirectory = path.join(process.cwd(), 'src', 'app', 'docs');


export function getDocuments() {
  if (!fs.existsSync(postsDirectory)) {
    console.warn(`Posts directory not found: ${postsDirectory}`);
    return [];
  }
  // Only consider markdown files
  const fileNames = fs.readdirSync(postsDirectory).filter((n) => n.toLowerCase().endsWith('.md'));

  const allDocuments = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/i, "");

    const fullPath = path.join(postsDirectory, fileName);

    // skip directories or missing files
    try {
      const stat = fs.lstatSync(fullPath);
      if (!stat.isFile()) {
        console.warn(`Skipping non-file: ${fullPath}`);
        return null;
      }
    } catch (err) {
      console.warn(`Cannot access ${fullPath}: ${err.message}`);
      return null;
    }

    try {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        id,
        ...matterResult.data,
      };
    } catch (err) {
      console.warn(`Failed to read/parse ${fullPath}: ${err.message}`);
      return null;
    }
  }).filter(Boolean);

  return allDocuments.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    } else if (a.order > b.order) {
      return 1;
    } else {
      return 0;
    }
  });
}

