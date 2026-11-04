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

export type AgentResult = {
  title: string;
  sources: Document[];
  trace: string[];
  weak: boolean;
  followUps: string[];
};

type Route = {
  intent: string;
  pattern: RegExp;
  query: string;
  title: string;
  tool?: string;
  // Document kinds this route may cite; omitted means any kind.
  kinds?: string[];
  rankByAgentScore?: boolean;
  followUps: string[];
};

// Checked in order; the first matching route wins.
const routes: Route[] = [
  {
    intent: 'hiring',
    pattern: /\b(hire|hiring|recruiter|strengths|good fit)\b/i,
    query: 'agentic production tests team lead champion',
    title: 'Engineering depth. Research mindset.',
    followUps: ['Which skills does he use most?', 'Where did he study?', 'How can I contact him?'],
  },
  {
    intent: 'research',
    pattern: /\b(research|papers?|publications?|published|ieee|arxiv)\b/i,
    query: 'publication first author ieee arxiv',
    title: 'Two accepted IEEE papers. Two preprints.',
    tool: 'List publications and preserve their publication status',
    kinds: ['publication', 'research'],
    followUps: [
      'Tell me about AgriBanglaT5',
      'Which certifications does he have?',
      'How can I contact him?',
    ],
  },
  {
    intent: 'agents',
    pattern: /\b(agentic|agents?|langgraph)\b/i,
    query: 'agentic langgraph routing workflow',
    title: 'Agents built around real constraints.',
    tool: 'Rank matching projects by documented agent capability',
    kinds: ['project'],
    rankByAgentScore: true,
    followUps: [
      'How does AgriBot run offline?',
      'How does he handle retrieval?',
      'Is his work production-ready?',
    ],
  },
  {
    intent: 'skills',
    pattern:
      /\b(skills?|stack|tech|technolog(y|ies)|tools|frameworks?|programming|python|expertise)\b/i,
    query: 'skills stack python langgraph fastapi pytorch',
    title: 'The whole system, not just the model.',
    tool: 'Read the skills summary and the projects that use them',
    kinds: ['profile', 'project'],
    followUps: ['What has he built?', 'Is his work production-ready?', 'How can I contact him?'],
  },
  {
    intent: 'education',
    pattern:
      /\b(study|studies|studied|studying|university|degree|education|college|graduat\w*|student)\b/i,
    query: 'education university degree cse certifications',
    title: 'Computer science at East West University.',
    tool: 'Read education and certification records',
    kinds: ['profile', 'certification'],
    followUps: [
      'What research has he done?',
      'Which certifications does he have?',
      'Tell me more about him',
    ],
  },
  {
    intent: 'about',
    pattern: /\b(who is|who's|background|bio|introduce|yourself|about (him|asif|you))\b/i,
    query: 'about bio engineer researcher dhaka',
    title: 'Meet Asif.',
    tool: 'Read the biography and education records',
    kinds: ['profile'],
    followUps: ['Where did he study?', 'What has he built?', 'How can I contact him?'],
  },
  {
    intent: 'projects',
    pattern: /\b(projects?|built|build)\b/i,
    query: 'agribot attest ewu',
    title: 'Built for the real world.',
    tool: 'Read the featured project documents',
    kinds: ['project'],
    rankByAgentScore: true,
    followUps: [
      'Tell me about Attest',
      'How does AgriBot run offline?',
      'Which skills does he use most?',
    ],
  },
  {
    intent: 'engineering',
    pattern: /\b(production|backend|deploy|reliable|reliability)\b/i,
    query: 'fastapi testing validation production',
    title: 'Beyond a working prototype.',
    followUps: ['Tell me about Attest', 'How does he handle retrieval?', 'How can I contact him?'],
  },
  {
    intent: 'retrieval',
    pattern: /\b(rag|retrieval|search)\b/i,
    query: 'rag retrieval bm25 vector',
    title: 'From retrieval to a useful answer.',
    followUps: [
      'Tell me about the Kaggle result',
      'How does AgriBot run offline?',
      'What has he built?',
    ],
  },
  {
    intent: 'contact',
    pattern: /\b(contact|email|reach|touch|linkedin)\b/i,
    query: 'contact email linkedin github',
    title: 'Here’s how to reach him.',
    tool: 'Read the contact record',
    kinds: ['contact'],
    followUps: ['What has he built?', 'Where did he study?'],
  },
];

const generalFollowUps = ['What has he built?', 'Where did he study?', 'How can I contact him?'];
const weakFollowUps = [
  'What has he built?',
  'Which skills does he use most?',
  'How can I contact him?',
];

export function answerQuestion(question: string): AgentResult {
  const q = question.trim().slice(0, 300);
  const route = routes.find((r) => r.pattern.test(q));
  const intent = route?.intent ?? 'general';
  const results = searchPortfolio(route?.query ?? q);
  let matches = route?.kinds ? results.filter((r) => route.kinds!.includes(r.doc.kind)) : results;
  if (route?.rankByAgentScore)
    matches = [...matches].sort((a, b) => b.doc.agentScore - a.doc.agentScore);
  const queryTerms = tokens(q);
  const covered = queryTerms.filter((t) =>
    results.slice(0, 3).some((r) => tokens(r.doc.text).includes(t)),
  ).length;
  const weak =
    !results.length || (intent === 'general' && covered / Math.max(queryTerms.length, 1) < 0.5);
  const sources = weak ? [] : matches.slice(0, intent === 'research' ? 4 : 3).map((r) => r.doc);
  const title = weak
    ? 'I don’t have enough evidence for that.'
    : (route?.title ?? 'Here’s what the portfolio supports.');
  const followUps = weak ? weakFollowUps : (route?.followUps ?? generalFollowUps);
  return {
    title,
    sources,
    weak,
    followUps,
    trace: [
      `Route question → ${intent}`,
      `BM25 search → ${results.length} matching documents`,
      route?.tool ?? 'Read the highest-scoring portfolio documents',
      weak
        ? 'Insufficient keyword coverage → decline to guess'
        : `Check source references → ${sources.length} valid portfolio documents`,
      weak ? 'Suggest asking Asif directly' : 'Compose a template answer from source summaries',
    ],
  };
}
