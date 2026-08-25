import { marked } from 'marked';

const cache = {};

marked.setOptions({
  breaks: true,
  gfm: true
});

function parseMarkdown(raw) {
  const steps = [];
  const sections = raw.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headerLine = lines[0] || '';
    const titleMatch = headerLine.match(/^Step\s+(\d+):\s*(.+)/);
    if (titleMatch) {
      const stepNum = parseInt(titleMatch[1]);
      const title = titleMatch[2].trim();
      const body = lines.slice(1).join('\n').trim();
      const html = marked.parse(body);
      steps.push({ stepNum, title, explanation: html });
    }
  }

  return steps;
}

export async function loadTopicMarkdown(topicId, lang = 'en') {
  const key = `${topicId}-${lang}`;
  if (cache[key]) return cache[key];

  const suffix = lang === 'en' ? '' : `-${lang}`;
  const url = `/topics/${topicId}${suffix}.md`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const raw = await res.text();
    const steps = parseMarkdown(raw);
    cache[key] = steps;
    return steps;
  } catch (err) {
    console.warn(`Markdown not found: ${url}`, err);
    cache[key] = [];
    return [];
  }
}

export function preloadAllTopics(scenarioIds, lang = 'en') {
  return Promise.all(scenarioIds.map(id => loadTopicMarkdown(id, lang)));
}
