import { scenarios } from '../src/simulations/scenarios.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const topicsDir = join(process.cwd(), 'public', 'topics');
mkdirSync(topicsDir, { recursive: true });

let count = 0;
for (const scenario of scenarios) {
  const lines = [];
  lines.push(`---`);
  lines.push(`name: ${scenario.name}`);
  lines.push(`description: ${scenario.description}`);
  lines.push(`category: ${scenario.category}`);
  lines.push(`order: ${scenario.order}`);
  lines.push(`---`);
  lines.push('');

  scenario.steps.forEach((step, i) => {
    lines.push(`## Step ${i + 1}: ${step.title}`);
    lines.push('');
    // Convert HTML to markdown-ish: <strong> → **, <code> → `, \n → newline
    let text = step.explanation || '';
    text = text.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    text = text.replace(/<code>(.*?)<\/code>/g, '`$1`');
    text = text.replace(/<em>(.*?)<\/em>/g, '*$1*');
    text = text.replace(/<br\s*\/?>/g, '\n');
    text = text.replace(/\n/g, '\n');
    lines.push(text);
    lines.push('');
  });

  const filename = `${scenario.id}.md`;
  writeFileSync(join(topicsDir, filename), lines.join('\n'), 'utf8');
  count++;
  console.log(`Created: ${filename} (${scenario.steps.length} steps)`);
}

console.log(`\nDone! Created ${count} markdown files in public/topics/`);
