import { KB, type Document } from './knowledge';

const stopWords = new Set(
  'a an the is are of for to in on and or with his he asif does do can me show what which who how about tell has have it this i you my your as at by be best'.split(
    ' ',
  ),
);
const tokens = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !stopWords.has(t));
const documents = KB.map((doc) => ({ doc, tokens: tokens(`${doc.title} ${doc.text}`) }));
const averageLength = documents.reduce((sum, doc) => sum + doc.tokens.length, 0) / documents.length;
const frequency = new Map<string, number>();
documents.forEach((doc) =>
  new Set(doc.tokens).forEach((t) => frequency.set(t, (frequency.get(t) ?? 0) + 1)),
);

export function searchPortfolio(query: string) {
  const terms = [...new Set(tokens(query))];
  return documents
    .map(({ doc, tokens: words }) => {
      const score = terms.reduce((sum, term) => {
        const count = words.filter((t) => t === term).length;
        if (!count) return sum;
        const df = frequency.get(term) ?? 0;
        const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
        return (
          sum +
          (idf * (count * 2.4)) / (count + 1.4 * (0.25 + (0.75 * words.length) / averageLength))
        );
      }, 0);
      return { doc, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

export type AgentResult = { title: string; sources: Document[]; trace: string[]; weak: boolean };

export function answerQuestion(question: string): AgentResult {
  const q = question.trim().slice(0, 300);
  let query = q;
  let title = 'Here’s what the portfolio supports.';
  let tool = 'Read the highest-scoring portfolio documents';
  let intent = 'general';
  if (/\b(hire|hiring|recruiter|strengths|good fit)\b/i.test(q)) {
    intent = 'hiring';
    query = 'agentic production tests team lead champion';
    title = 'Engineering depth. Research mindset.';
  } else if (/\b(research|papers?|publications?|published|ieee|arxiv)\b/i.test(q)) {
    intent = 'research';
    query = 'publication first author ieee arxiv';
    title = 'Two accepted IEEE papers. Two preprints.';
    tool = 'List publications and preserve their publication status';
  } else if (/\b(agentic|agents?|langgraph)\b/i.test(q)) {
    intent = 'agents';
    query = 'agentic langgraph routing workflow';
    title = 'Agents built around real constraints.';
    tool = 'Rank matching projects by documented agent capability';
  } else if (/\b(production|backend|deploy|reliable|reliability)\b/i.test(q)) {
    intent = 'engineering';
    query = 'fastapi testing validation production';
    title = 'Beyond a working prototype.';
  } else if (/\b(rag|retrieval|search)\b/i.test(q)) {
    intent = 'retrieval';
    query = 'rag retrieval bm25 vector';
    title = 'From retrieval to a useful answer.';
  }
  const results = searchPortfolio(query);
  let matches = results;
  if (intent === 'research')
    matches = results.filter((r) => r.doc.kind === 'publication' || r.doc.id === 'solar');
  if (intent === 'agents')
    matches = results
      .filter((r) => r.doc.kind === 'project')
      .sort((a, b) => b.doc.agentScore - a.doc.agentScore);
  const queryTerms = tokens(q);
  const covered = queryTerms.filter((t) =>
    results.slice(0, 3).some((r) => tokens(r.doc.text).includes(t)),
  ).length;
  const weak =
    !results.length || (intent === 'general' && covered / Math.max(queryTerms.length, 1) < 0.5);
  const sources = weak ? [] : matches.slice(0, intent === 'research' ? 4 : 3).map((r) => r.doc);
  return {
    title: weak ? 'I don’t have enough evidence for that.' : title,
    sources,
    weak,
    trace: [
      `Route question → ${intent}`,
      `BM25 search → ${results.length} matching documents`,
      tool,
      weak
        ? 'Insufficient keyword coverage → decline to guess'
        : `Check source references → ${sources.length} valid portfolio documents`,
      weak ? 'Suggest asking Asif directly' : 'Compose a template answer from source summaries',
    ],
  };
}
