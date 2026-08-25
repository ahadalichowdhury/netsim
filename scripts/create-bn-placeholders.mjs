import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const topicsDir = join(process.cwd(), 'public', 'topics');
const files = readdirSync(topicsDir).filter(f => f.endsWith('.md') && !f.includes('-bn'));

let count = 0;
for (const file of files) {
  const enContent = readFileSync(join(topicsDir, file), 'utf8');
  const bnContent = enContent.replace(/^(## Step \d+:.+)$/gm, '$1 [বাংলা অনুবাদ প্রয়োজন]');
  const bnFile = file.replace('.md', '-bn.md');
  writeFileSync(join(topicsDir, bnFile), bnContent, 'utf8');
  count++;
}

console.log(`Created ${count} Bangla placeholder files`);
