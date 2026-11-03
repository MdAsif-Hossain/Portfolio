export type Document = {
  id: string;
  title: string;
  href: string;
  kind: string;
  agentScore: number;
  text: string;
  summary: string;
  image?: string;
};

// Knowledge base the portfolio agent retrieves from.
// Every answer the agent gives must cite one of these documents.
export const KB: Document[] = [
  {
    id: 'agribot',
    title: 'AgriBot',
    href: '#p-agribot',
    kind: 'project',
    agentScore: 10,
    text: 'AgriBot offline bilingual Bengali English agentic RAG agriculture chatbot capstone. LangGraph agent reasoning, tool routing, PDF ingestion, vector indexing, vector database, retrieval augmented generation, Qwen2.5 LLM, GPU optimised inference 8.5x faster than CPU, runs on 4 GB VRAM consumer hardware, FastAPI backend, TypeScript interface. Team lead of 4.',
    summary:
      'LangGraph agentic RAG assistant for farmers, fully offline on 4 GB of VRAM, 8.5× faster than CPU. Asif led a team of 4.',
    image: 'projects/agribot-cover.webp',
  },
  {
    id: 'attest',
    title: 'Attest',
    href: '#p-attest',
    kind: 'project',
    agentScore: 6,
    text: 'Attest verified document data extraction invoices production backend FastAPI PostgreSQL Redis SQLAlchemy React TypeScript PyMuPDF LLM APIs Anthropic OpenAI Gemini. Confidence score, source text, human review, human in the loop, deterministic validation layer, reliability, trustworthy. 97.2% field accuracy 211 fields, 6 of 6 injected errors caught, 317 ms per document, 276 tests 80% coverage, testing. Solo project.',
    summary:
      'Invoice extraction with evidence for every value: 97.2% field accuracy, 6 of 6 injected errors caught, 276 tests. Solo.',
    image: 'projects/attest-cover.webp',
  },
  {
    id: 'ewu',
    title: 'EWU AI Engine',
    href: '#p-ewu',
    kind: 'project',
    agentScore: 8,
    text: 'EWU AI Engine university policy assistant RAG open source LLMs LangChain FastAPI PDF ingestion semantic vector search agent like query routing. Hackathon champion 1st place LLM-based AI Engine Development Innovation Challenge EWU Robotic Club. Team lead of 3. Winner award.',
    summary:
      'RAG policy assistant with agent-like query routing. Won 1st place at the EWU Robotic Club LLM challenge, Asif as team lead.',
    image: 'projects/ewu-cover.webp',
  },
  {
    id: 'about',
    title: 'About Asif',
    href: '#about',
    kind: 'profile',
    agentScore: 0,
    text: 'About Md. Asif Hossain bio background. Final-year CSE student and undergraduate researcher at East West University in Dhaka, Bangladesh. Builds AI where the constraints are real: limited hardware, unreliable internet, and low-resource languages like Bengali. Offline agents for Bengali-speaking farmers, document systems that show their evidence, and research that tests whether an improvement holds up.',
    summary:
      'Final-year CSE student and undergraduate researcher at East West University in Dhaka, building AI for limited hardware, unreliable internet and low-resource languages.',
  },
  {
    id: 'skills',
    title: 'Skills and tech stack',
    href: '#expertise',
    kind: 'profile',
    agentScore: 0,
    text: 'Skills tech stack tools expertise. Agentic systems: LangGraph, LangChain, tool calling, n8n, agentic RAG. Retrieval and LLMs: BM25, BGE-M3, FAISS, reranking, LoRA, PEFT, Qwen2.5. Engineering and delivery: Python, FastAPI, PostgreSQL, Redis, Docker, React, TypeScript. Evaluation and research: PyTorch, TensorFlow, Hugging Face, OpenCV, statistical testing.',
    summary:
      'Agentic systems (LangGraph, LangChain, n8n), retrieval and LLMs (BM25, BGE-M3, FAISS, LoRA), engineering (Python, FastAPI, PostgreSQL, Docker, React) and evaluation (PyTorch, Hugging Face).',
  },
  {
    id: 'education',
    title: 'Education',
    href: '#about',
    kind: 'profile',
    agentScore: 0,
    text: 'Education university degree. B.Sc. in Computer Science and Engineering, CSE, at East West University, expected December 2026. Final-year student doing undergraduate research with Dr. Farhana Huq.',
    summary:
      'B.Sc. in Computer Science & Engineering at East West University, expected December 2026, with undergraduate research under Dr. Farhana Huq.',
  },
  {
    id: 'articleai',
    title: 'ArticleAI',
    href: 'https://github.com/MdAsif-Hossain/ArticleAI',
    kind: 'project',
    agentScore: 7,
    text: 'ArticleAI agentic workflow automation n8n webhook FastAPI async background tasks Groq Llama 3.3 70B analysis Google Sheets HTML email reports orchestration. Solo.',
    summary:
      'Agentic workflow: FastAPI hands work to n8n, which runs Llama 3.3 70B on Groq, logs to Google Sheets and emails reports.',
  },
  {
    id: 't5',
    title: 'AgriBanglaT5',
    href: '#p-t5',
    kind: 'project',
    agentScore: 2,
    text: 'AgriBanglaT5 BanglaT5 247M LoRA PEFT fine-tuning English to Bengali translation agriculture NLP low resource language. AgriEnBn corpus 3232 sentence pairs, legacy Bijoy font PDFs, NLLB-200 back-translation, LaBSE filtering. chrF++ 54.2 +6.1, BLEU 28.1 +4.7, term accuracy 81.8%, negation faithfulness 93.1%. rice blast mistranslated as explosion. Hugging Face.',
    summary:
      'LoRA-tuned BanglaT5 for farming translation: +6.1 chrF++, 81.8% term accuracy, on Hugging Face.',
  },
  {
    id: 'kaggle',
    title: 'Kaggle legal retrieval',
    href: 'https://www.kaggle.com/competitions/llm-agentic-legal-information-retrieval/leaderboard',
    kind: 'project',
    agentScore: 5,
    text: 'Kaggle LLM agentic legal information retrieval competition search retrieval BGE-M3 dense BM25 sparse RRF fusion cross-encoder reranking multi-hop citation chaining FAISS rank 75 of 550 teams solo.',
    summary:
      'Solo hybrid retrieval pipeline (BGE-M3 + BM25, RRF, reranking) that ranked 75 of 550+ teams.',
  },
  {
    id: 'solar',
    title: 'HybridSolarNet',
    href: '#p-solar',
    kind: 'research',
    agentScore: 0,
    text: 'HybridSolarNet lightweight explainable EfficientNet CBAM attention computer vision real-time solar panel fault detection deep learning PyTorch arXiv preprint first author.',
    summary:
      'Lightweight, explainable EfficientNet-CBAM model for real-time solar panel fault detection (arXiv).',
  },
  {
    id: 'pub-icoste',
    title: 'IEEE i-COSTE 2026 paper',
    href: '#publications',
    kind: 'publication',
    agentScore: 0,
    text: 'Data leakage and the limits of attention significance-tested benchmark solar panel fault detection IEEE i-COSTE 2026 accepted first author research paper publication evaluation statistics.',
    summary:
      'IEEE i-COSTE 2026 (accepted): a significance-tested benchmark showing how data leakage inflates solar fault detection results.',
  },
  {
    id: 'pub-compas',
    title: 'IEEE COMPAS 2026 paper',
    href: '#publications',
    kind: 'publication',
    agentScore: 0,
    text: 'English Bengali agricultural parallel corpus construction safety-aware evaluation machine translation IEEE COMPAS 2026 accepted first author research paper publication.',
    summary:
      'IEEE COMPAS 2026 (accepted): an English–Bengali agricultural corpus with safety-aware translation evaluation.',
  },
  {
    id: 'pub-rag',
    title: 'Cross-lingual RAG preprint',
    href: 'https://arxiv.org/abs/2601.02065',
    kind: 'publication',
    agentScore: 3,
    text: 'Cost-efficient cross-lingual retrieval augmented generation RAG low-resource languages Bengali agricultural advisory arXiv preprint first author research publication.',
    summary: 'arXiv preprint on cost-efficient cross-lingual RAG for Bengali agricultural advice.',
  },
  {
    id: 'reviewer',
    title: 'Springer Nature reviewer',
    href: '#achievements',
    kind: 'achievement',
    agentScore: 0,
    text: 'Peer reviewer World Wide Web journal Springer Nature reviewer certificate 2026 undergraduate research review.',
    summary:
      'Reviewed a manuscript for Springer Nature’s World Wide Web journal as an undergraduate.',
  },
  {
    id: 'certs',
    title: 'Certifications',
    href: '#certifications',
    kind: 'certification',
    agentScore: 1,
    text: 'Certifications courses AI Engineering Bootcamp Ostad LLM RAG LangChain LangGraph FastAPI, Machine Learning Specialization DeepLearning.AI Stanford Andrew Ng, Google Data Analytics Professional Certificate, ITEE IT Passport.',
    summary:
      'AI Engineering Bootcamp (Ostad), Machine Learning Specialization (DeepLearning.AI and Stanford), Google Data Analytics, ITEE IT Passport.',
  },
  {
    id: 'gci',
    title: 'GCI World 2026',
    href: '#achievements',
    kind: 'achievement',
    agentScore: 0,
    text: 'GCI World 2026 data science program Matsuo-Iwasawa Laboratory University of Tokyo selected.',
    summary:
      'Selected for GCI World 2026, the University of Tokyo’s Matsuo-Iwasawa Lab data science program.',
  },
  {
    id: 'site',
    title: 'This portfolio on AWS',
    href: '#top',
    kind: 'project',
    agentScore: 4,
    text: 'This portfolio built with React TypeScript Vite React Three Fiber Three.js Motion. Interactive 3D agent network, local BM25 retrieval demonstration, configured for AWS Amplify Hosting.',
    summary:
      'This site: React, TypeScript, React Three Fiber and Motion, with local portfolio retrieval and AWS Amplify build configuration.',
  },
  {
    id: 'contact',
    title: 'Contact',
    href: '#contact',
    kind: 'contact',
    agentScore: 0,
    text: 'Contact email asifhossain8612@gmail.com LinkedIn GitHub Hugging Face hire reach open to AI engineering roles research collaboration graduate study.',
    summary: 'Email asifhossain8612@gmail.com, or find him on LinkedIn and GitHub.',
  },
];
