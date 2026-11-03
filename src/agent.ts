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
  language: 'en' | 'bn';
  followUps: string[];
};

type Route = {
  intent: string;
  en: RegExp;
  bn: RegExp;
  query: string;
  title: string;
  titleBn: string;
  tool?: string;
  // Document kinds this route may cite; omitted means any kind.
  kinds?: string[];
  rankByAgentScore?: boolean;
  followUps: string[];
};

// Bengali letters such as ড় and য় have two Unicode spellings; NFC makes typed input and
// these patterns agree. JavaScript's \b only understands ASCII, so Bengali patterns omit it.
const bengali = (pattern: string) => new RegExp(pattern.normalize('NFC'));

// Checked in order; the first matching route wins.
const routes: Route[] = [
  {
    intent: 'hiring',
    en: /\b(hire|hiring|recruiter|strengths|good fit)\b/i,
    bn: bengali('নিয়োগ|হায়ার|চাকরি'),
    query: 'agentic production tests team lead champion',
    title: 'Engineering depth. Research mindset.',
    titleBn: 'প্রকৌশলের গভীরতা। গবেষকের মানসিকতা।',
    followUps: ['Which skills does he use most?', 'Where does he study?', 'How can I contact him?'],
  },
  {
    intent: 'research',
    en: /\b(research|papers?|publications?|published|ieee|arxiv)\b/i,
    bn: bengali('গবেষণা|রিসার্চ|পেপার|প্রকাশনা'),
    query: 'publication first author ieee arxiv',
    title: 'Two accepted IEEE papers. Two preprints.',
    titleBn: 'দুটি IEEE পেপার গৃহীত। দুটি প্রিপ্রিন্ট।',
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
    en: /\b(agentic|agents?|langgraph)\b/i,
    bn: bengali('এজেন্ট'),
    query: 'agentic langgraph routing workflow',
    title: 'Agents built around real constraints.',
    titleBn: 'বাস্তব সীমাবদ্ধতার মধ্যে কাজ করা এজেন্ট।',
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
    en: /\b(skills?|stack|tech|technolog(y|ies)|tools|frameworks?|programming|python|expertise)\b/i,
    bn: bengali('দক্ষতা|স্কিল|প্রযুক্তি|পাইথন'),
    query: 'skills stack python langgraph fastapi pytorch',
    title: 'The whole system, not just the model.',
    titleBn: 'শুধু মডেল নয়, পুরো সিস্টেম।',
    tool: 'Read the skills summary and the projects that use them',
    kinds: ['profile', 'project'],
    followUps: ['What has he built?', 'Is his work production-ready?', 'How can I contact him?'],
  },
  {
    intent: 'education',
    en: /\b(study|studies|studied|studying|university|degree|education|college|graduat\w*|student)\b/i,
    bn: bengali('পড়াশোনা|পড়াশুনা|শিক্ষা|বিশ্ববিদ্যালয়|ইউনিভার্সিটি|ডিগ্রি'),
    query: 'education university degree cse certifications',
    title: 'Final-year CSE at East West University.',
    titleBn: 'ইস্ট ওয়েস্ট ইউনিভার্সিটিতে সিএসই, শেষ বর্ষ।',
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
    en: /\b(who is|who's|background|bio|introduce|yourself|about (him|asif|you))\b/i,
    bn: bengali('পরিচয়|সম্পর্কে|(^|\\s)কে(\\s|[?।]|$)'),
    query: 'about bio student researcher university dhaka',
    title: 'Meet Asif.',
    titleBn: 'আসিফের পরিচয়।',
    tool: 'Read the biography and education records',
    kinds: ['profile'],
    followUps: ['What’s he studying?', 'What has he built?', 'How can I contact him?'],
  },
  {
    intent: 'projects',
    en: /\b(projects?|built|build)\b/i,
    bn: bengali('প্রজেক্ট|প্রকল্প|বানিয়েছ|তৈরি'),
    query: 'agribot attest ewu',
    title: 'Built for the real world.',
    titleBn: 'বাস্তব সমস্যার জন্য তৈরি।',
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
    en: /\b(production|backend|deploy|reliable|reliability)\b/i,
    bn: bengali('প্রোডাকশন|ব্যাকএন্ড'),
    query: 'fastapi testing validation production',
    title: 'Beyond a working prototype.',
    titleBn: 'প্রোটোটাইপের চেয়েও বেশি।',
    followUps: ['Tell me about Attest', 'How does he handle retrieval?', 'How can I contact him?'],
  },
  {
    intent: 'retrieval',
    en: /\b(rag|retrieval|search)\b/i,
    bn: bengali('সার্চ|খোঁজ'),
    query: 'rag retrieval bm25 vector',
    title: 'From retrieval to a useful answer.',
    titleBn: 'তথ্য খোঁজা থেকে কাজের উত্তর।',
    followUps: [
      'Tell me about the Kaggle result',
      'How does AgriBot run offline?',
      'What has he built?',
    ],
  },
  {
    intent: 'contact',
    en: /\b(contact|email|reach|touch|linkedin)\b/i,
    bn: bengali('যোগাযোগ|ইমেইল|ইমেল'),
    query: 'contact email linkedin github',
    title: 'Here’s how to reach him.',
    titleBn: 'যেভাবে যোগাযোগ করবেন।',
    tool: 'Read the contact record',
    kinds: ['contact'],
    followUps: ['What has he built?', 'Where does he study?'],
  },
];

const generalFollowUps = ['What has he built?', 'Where does he study?', 'How can I contact him?'];
const weakFollowUps = [
  'What has he built?',
  'Which skills does he use most?',
  'How can I contact him?',
];
const bengaliFollowUps = [
  { intent: 'skills', text: 'আসিফের দক্ষতা কী কী?' },
  { intent: 'projects', text: 'আসিফ কী কী প্রজেক্ট করেছে?' },
  { intent: 'education', text: 'আসিফ কোথায় পড়াশোনা করছে?' },
  { intent: 'contact', text: 'আসিফের সাথে কীভাবে যোগাযোগ করব?' },
];

export function answerQuestion(question: string): AgentResult {
  const q = question.normalize('NFC').trim().slice(0, 300);
  const language = /[ঀ-৿]/.test(q) ? 'bn' : 'en';
  const route = routes.find((r) => r.en.test(q) || r.bn.test(q));
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
  const bn = language === 'bn';
  let title = bn
    ? (route?.titleBn ?? 'পোর্টফোলিওতে যা পাওয়া গেল।')
    : (route?.title ?? 'Here’s what the portfolio supports.');
  if (weak)
    title = bn ? 'এ বিষয়ে আমার কাছে যথেষ্ট তথ্য নেই।' : 'I don’t have enough evidence for that.';
  const followUps = bn
    ? bengaliFollowUps
        .filter((f) => f.intent !== intent)
        .map((f) => f.text)
        .slice(0, 3)
    : weak
      ? weakFollowUps
      : (route?.followUps ?? generalFollowUps);
  return {
    title,
    sources,
    weak,
    language,
    followUps,
    trace: [
      `Route question → ${intent}${bn ? ' (asked in Bengali)' : ''}`,
      `BM25 search → ${results.length} matching documents`,
      route?.tool ?? 'Read the highest-scoring portfolio documents',
      weak
        ? 'Insufficient keyword coverage → decline to guess'
        : `Check source references → ${sources.length} valid portfolio documents`,
      weak ? 'Suggest asking Asif directly' : 'Compose a template answer from source summaries',
    ],
  };
}
