import {
  Component,
  Fragment,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { motion, MotionConfig, useInView, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  BrainCircuit,
  Briefcase,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Database,
  FileCheck2,
  FileText,
  FlaskConical,
  GitBranch,
  Github,
  GraduationCap,
  Images,
  Layers3,
  Linkedin,
  Menu,
  Network,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  WifiOff,
  X,
} from 'lucide-react';
import {
  siDocker,
  siFastapi,
  siHuggingface,
  siLangchain,
  siLanggraph,
  siPostgresql,
  siPython,
  siPytorch,
  type SimpleIcon,
} from 'simple-icons';
import { answerQuestion, type AgentResult } from './agent';

const AgentScene = lazy(() => import('./AgentScene'));
const github = 'https://github.com/MdAsif-Hossain';
const email = 'asifhossain8612@gmail.com';
const base = import.meta.env.BASE_URL;
const asset = (name: string) => `${base}assets/img/${name}`;
const stages = ['Plan', 'Retrieve', 'Act', 'Verify', 'Respond'];
const stageDetails = [
  'Turn a goal into a sequence of useful steps.',
  'Find the right context before generating an answer.',
  'Call purpose-built tools and connect real workflows.',
  'Check the evidence. Surface uncertainty.',
  'Return a useful answer with traceable sources.',
];

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <div className="orb-fallback" /> : this.props.children;
  }
}

function External({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}

const suggestions = [
  'Why hire Asif?',
  'Show me his agentic AI work',
  'What research has he published?',
  'What’s his tech stack?',
  'Who is Asif?',
];

function AgentPlayground({ onStage }: { onStage: (stage: number) => void }) {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AgentResult | null>(null);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runLock = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function run(goal: string) {
    if (runLock.current) return;
    if (!goal.trim()) {
      input.current?.focus();
      return;
    }
    runLock.current = true;
    setQuestion(goal);
    setRunning(true);
    setResult(null);
    setStep(0);
    onStage(0);
    const answer = answerQuestion(goal);
    let current = 0;
    const advance = () => {
      current += 1;
      if (current < stages.length) {
        setStep(current);
        onStage(current);
        timer.current = setTimeout(advance, reduced ? 60 : 430);
      } else {
        setResult(answer);
        setRunning(false);
        runLock.current = false;
        onStage(-1);
      }
    };
    timer.current = setTimeout(advance, reduced ? 60 : 430);
  }

  return (
    <section id="playground" className="section playground-section">
      <div className="section-intro">
        <div>
          <p className="eyebrow">
            <Terminal size={15} /> Interactive lab
          </p>
          <h2>
            Don’t just read.
            <br />
            Run the workflow.
          </h2>
        </div>
        <p>
          Give my portfolio a question. Follow the retrieval,
          <br className="desktop-break" /> inspect the steps, and explore the evidence.
        </p>
      </div>
      <div className="playground">
        <div className="playground-controls">
          <div className="window-heading">
            <span className="window-dots">
              <i />
              <i />
              <i />
            </span>
            <span>portfolio.agent</span>
            <span className="live-label">
              <i /> Local demo
            </span>
          </div>
          <div className="prompt-content">
            <span className="small-label">Your objective</span>
            <h3>
              What would you like
              <br />
              to know about me?
            </h3>
            <div className="suggestions">
              {suggestions.map((text) => (
                <button key={text} disabled={running} onClick={() => run(text)}>
                  {text}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                run(question);
              }}
              className="question-form"
            >
              <label htmlFor="agent-question" className="sr-only">
                Ask about Asif’s work
              </label>
              <input
                id="agent-question"
                ref={input}
                name="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={running}
                maxLength={300}
                autoComplete="off"
                placeholder="Ask about skills, projects, research…"
              />
              <button aria-label="Run portfolio workflow" disabled={running} type="submit">
                {running ? <RotateCcw size={18} className="spin" /> : <ArrowRight size={20} />}
              </button>
            </form>
            <p className="demo-note">
              <ShieldCheck size={14} /> Real BM25 search. Template-based answers.
              <br />
              Runs locally in your browser; no LLM or API calls.
            </p>
          </div>
        </div>
        <div className="playground-output">
          <div className="output-heading">
            <span>
              <GitBranch size={16} /> Execution trace
            </span>
            <span className={running ? 'running-text' : ''} role="status">
              {running ? 'Running…' : result ? 'Complete' : 'Ready when you are'}
            </span>
          </div>
          <ol className="workflow-steps">
            {stages.map((name, i) => (
              <li
                key={name}
                className={step === i && running ? 'current' : step >= i ? 'complete' : ''}
              >
                <span>{step > i || result ? <Check size={12} /> : i + 1}</span>
                {name}
                {i < 4 && <i />}
              </li>
            ))}
          </ol>
          <div className="output-body" aria-live="polite" aria-atomic="true">
            {!running && !result && (
              <div className="empty-output">
                <div className="empty-symbol">
                  <Network size={40} strokeWidth={1} />
                </div>
                <h4>A little less black box.</h4>
                <p>
                  Every good answer starts with good evidence.
                  <br />
                  Choose a question to see the workflow in action.
                </p>
                <span>
                  <ArrowDownLeft size={14} /> Start with a suggested question
                </span>
              </div>
            )}
            {running && (
              <div className="trace-running">
                <span className="terminal-prompt">$ portfolio.run</span>
                {stages.slice(0, step + 1).map((s, i) => (
                  <p key={s}>
                    <Check size={14} />
                    <span>
                      {s.toLowerCase()}
                      <small>{stageDetails[i]}</small>
                    </span>
                    {i === step && <span className="cursor-block" />}
                  </p>
                ))}
              </div>
            )}
            {result && (
              <motion.div
                className="agent-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="result-label">
                  <CheckCheck size={14} />{' '}
                  {result.weak ? 'Evidence limit reached' : 'Portfolio sources found'}
                </span>
                <h4>{result.title}</h4>
                {result.weak ? (
                  <p>
                    Try asking about my projects, skills, or research. For anything else,{' '}
                    <a href={`mailto:${email}`}>ask me directly</a>.
                  </p>
                ) : (
                  <>
                    <ul>
                      {result.sources.map((source) => (
                        <li key={source.id} className={source.image ? 'has-thumb' : undefined}>
                          {source.image && (
                            <img
                              src={asset(source.image)}
                              alt=""
                              width={76}
                              height={48}
                              loading="lazy"
                            />
                          )}
                          <div>
                            <a
                              href={source.href}
                              {...(source.href.startsWith('http')
                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                : {})}
                            >
                              {source.title}
                              <ArrowUpRight size={13} />
                            </a>
                            <p>{source.summary}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="suggestions follow-ups">
                  <span>Ask next</span>
                  {result.followUps.map((text) => (
                    <button key={text} onClick={() => run(text)}>
                      {text}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
                <details className="trace-details">
                  <summary>
                    Inspect execution details <ChevronDown size={14} />
                  </summary>
                  <ol>
                    {result.trace.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ol>
                  <p>
                    Steps play sequentially for illustration. Source checks verify references, not
                    independent factual accuracy.
                  </p>
                </details>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const projects = [
  {
    id: 'agribot',
    number: '01',
    title: 'AgriBot',
    category: 'Agentic AI',
    subtitle: 'Intelligence that goes where the internet doesn’t.',
    description:
      'An offline Bengali–English farming assistant. LangGraph routes the question, retrieval grounds the answer, and Qwen2.5 runs on everyday hardware.',
    metric: '4 GB',
    metricLabel: 'VRAM footprint',
    second: '8.5×',
    secondLabel: 'faster than CPU',
    tags: ['LangGraph', 'Qwen2.5', 'FastAPI'],
    role: 'Team lead · 4-person capstone',
    href: `${github}/Agri_bot_capstone_project`,
    badge: 'Offline intelligence',
    badgeIcon: WifiOff,
    shots: [
      {
        src: 'agribot-home.webp',
        caption: 'Home screen: ask in Bengali or English, or upload a photo of a leaf.',
      },
      {
        src: 'agribot-bengali-question.webp',
        caption: 'A question asked in Bengali, answered with page-level citations to the manuals.',
      },
      {
        src: 'agribot-photo-diagnosis.webp',
        caption:
          'Photo upload: the CNN classifier flags brown spot and the answer comes in Bengali.',
      },
    ],
  },
  {
    id: 'attest',
    number: '02',
    title: 'Attest',
    category: 'AI engineering',
    subtitle: 'Every extracted value. Every piece of evidence.',
    description:
      'An invoice extraction pipeline with source-linked fields, deterministic validation, and human review when the model isn’t sure.',
    metric: '97.2%',
    metricLabel: 'field accuracy¹',
    second: '276',
    secondLabel: 'automated tests',
    tags: ['FastAPI', 'PostgreSQL', 'React'],
    role: 'Solo build · Document intelligence',
    href: `${github}/Attest`,
    badge: 'Document intelligence',
    badgeIcon: FileCheck2,
    shots: [
      {
        src: 'attest-queue.webp',
        caption: 'Document queue: every invoice is ready, queried, approved or unreadable.',
      },
      {
        src: 'attest-review.webp',
        caption:
          'Review: the total doesn’t match subtotal plus tax, so the field is flagged, not guessed.',
      },
      {
        src: 'attest-approved.webp',
        caption:
          'Approved invoice: extracted values, a balanced reconciliation and an audit trail.',
      },
    ],
  },
  {
    id: 'ewu',
    number: '03',
    title: 'EWU AI Engine',
    category: 'Agentic AI',
    subtitle: 'University policies, without the PDF hunt.',
    description:
      'A policy assistant combining open-source LLMs, semantic retrieval, and query routing. Built with a team of three. Took first place.',
    metric: '1st',
    metricLabel: 'place at EWU challenge',
    second: 'RAG',
    secondLabel: 'grounded responses',
    tags: ['LangChain', 'Vector search', 'Python'],
    role: 'Team lead · LLM innovation challenge',
    href: `${github}/EWU-AI-Engine-Policy-Assistant`,
    badge: 'Hackathon winner',
    badgeIcon: Trophy,
    shots: [
      {
        src: 'ewu-chat.webp',
        caption: 'A policy answer, with the agent’s routing and retrieval steps shown alongside.',
      },
      {
        src: 'ewu-workflow.webp',
        caption:
          'Workflow: chunking, embeddings, a vector database and reranking feed a local Qwen 2.5 model.',
      },
    ],
  },
] as const;
type Project = (typeof projects)[number];

function ProjectGallery({
  gallery,
  onChange,
}: {
  gallery: { project: Project; index: number } | null;
  onChange: (gallery: { project: Project; index: number } | null) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const open = gallery !== null;
  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const shots = gallery?.project.shots ?? [];
  const show = (index: number) =>
    gallery && onChange({ ...gallery, index: (index + shots.length) % shots.length });
  const shot = gallery ? shots[gallery.index] : null;
  return (
    <dialog
      ref={dialog}
      className="certificate-dialog gallery-dialog"
      aria-labelledby="gallery-title"
      onCancel={() => onChange(null)}
      onClick={(event) => {
        if (event.target === event.currentTarget) onChange(null);
      }}
      onKeyDown={(event) => {
        if (!gallery) return;
        if (event.key === 'ArrowRight') show(gallery.index + 1);
        if (event.key === 'ArrowLeft') show(gallery.index - 1);
      }}
    >
      <button
        className="dialog-close"
        onClick={() => onChange(null)}
        aria-label="Close screenshots"
      >
        <X size={20} />
      </button>
      {gallery && shot && (
        <>
          <h3 id="gallery-title">
            {gallery.project.title}
            <span>
              {gallery.index + 1} / {shots.length}
            </span>
          </h3>
          <figure>
            <img
              src={asset(`projects/${shot.src}`)}
              alt={`${gallery.project.title} screenshot: ${shot.caption}`}
            />
            <figcaption aria-live="polite">{shot.caption}</figcaption>
          </figure>
          <div className="gallery-nav">
            <button onClick={() => show(gallery.index - 1)} aria-label="Previous screenshot">
              <ChevronLeft size={18} />
            </button>
            <div className="gallery-thumbs">
              {shots.map((item, i) => (
                <button
                  key={item.src}
                  onClick={() => show(i)}
                  aria-label={`Screenshot ${i + 1} of ${shots.length}`}
                  aria-current={i === gallery.index}
                >
                  <img src={asset(`projects/${item.src}`)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <button onClick={() => show(gallery.index + 1)} aria-label="Next screenshot">
              <ChevronRight size={18} />
            </button>
          </div>
          <External href={gallery.project.href}>View the code on GitHub</External>
        </>
      )}
    </dialog>
  );
}

function Projects() {
  const initialFilter = () => new URLSearchParams(window.location.search).get('work') || 'All work';
  const [filter, setFilter] = useState(initialFilter);
  const [gallery, setGallery] = useState<{ project: Project; index: number } | null>(null);
  useEffect(() => {
    const update = () => setFilter(initialFilter());
    const revealProject = () => {
      if (!projects.some((p) => `#p-${p.id}` === window.location.hash)) return;
      setFilter('All work');
      const url = new URL(window.location.href);
      url.searchParams.delete('work');
      window.history.replaceState({}, '', url);
      requestAnimationFrame(() =>
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' }),
      );
    };
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', revealProject);
    revealProject();
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', revealProject);
    };
  }, []);
  const selected = ['All work', 'Agentic AI', 'AI engineering'].includes(filter)
    ? filter
    : 'All work';
  function select(value: string) {
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === 'All work') url.searchParams.delete('work');
    else url.searchParams.set('work', value);
    window.history.pushState({}, '', url);
  }
  return (
    <section id="projects" className="section projects-section">
      <div className="section-intro">
        <div>
          <p className="eyebrow">
            <Box size={15} /> Selected work
          </p>
          <h2>Built for the real world.</h2>
        </div>
        <External href={github} className="text-link">
          Explore GitHub
        </External>
      </div>
      <div className="project-filter" role="group" aria-label="Filter projects">
        {['All work', 'Agentic AI', 'AI engineering'].map((item) => (
          <button key={item} aria-pressed={selected === item} onClick={() => select(item)}>
            {item}
            {item === 'All work' && <span>3</span>}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {projects
          .filter((p) => selected === 'All work' || p.category === selected)
          .map((p) => (
            <motion.article
              key={p.id}
              id={`p-${p.id}`}
              className="project-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                className="project-art project-cover"
                onClick={() => setGallery({ project: p, index: 0 })}
                aria-label={`View ${p.shots.length} ${p.title} screenshots`}
              >
                <img
                  src={asset(`projects/${p.id}-cover.webp`)}
                  alt=""
                  width={900}
                  height={500}
                  loading="lazy"
                />
                <span className="art-caption">
                  <p.badgeIcon size={12} /> {p.badge}
                </span>
                <span className="shot-count">
                  <Images size={12} /> {p.shots.length} screenshots
                </span>
              </button>
              <div className="project-info">
                <div className="project-title">
                  <h3>{p.title}</h3>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${p.title} on GitHub`}
                  >
                    <ArrowUpRight size={21} />
                  </a>
                </div>
                <h4>{p.subtitle}</h4>
                <p>{p.description}</p>
                <div className="project-metrics">
                  <div>
                    <strong>{p.metric}</strong>
                    <span>{p.metricLabel}</span>
                  </div>
                  <div>
                    <strong>{p.second}</strong>
                    <span>{p.secondLabel}</span>
                  </div>
                </div>
                <div className="tags">
                  {p.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <span className="project-role">{p.role}</span>
              </div>
            </motion.article>
          ))}
      </div>
      <p className="metric-note">
        ¹ Attest: 211 evaluated fields. Metrics reflect the project evaluations documented in this
        portfolio.
      </p>
      <ProjectGallery gallery={gallery} onChange={setGallery} />
      <div className="more-builds">
        <span>Also on the workbench</span>
        <External href={`${github}/ArticleAI`}>
          ArticleAI <small>Workflow automation</small>
        </External>
        <External href={`${github}/AI-web-Scraper`}>
          AI Web Scraper <small>Structured extraction</small>
        </External>
        <External href={`${github}/LinkedIn-post-generator`}>
          Post Generator <small>LLM applications</small>
        </External>
      </div>
    </section>
  );
}

const skills = [
  {
    icon: BrainCircuit,
    title: 'Agentic systems',
    description: 'From a user goal to a reliable sequence of actions.',
    tags: [
      'LangGraph',
      'LangChain',
      'Tool calling',
      'Agentic RAG',
      'Multi-step planning',
      'n8n workflows',
    ],
    proof: 'AgriBot, EWU AI Engine, ArticleAI',
  },
  {
    icon: Sparkles,
    title: 'LLM engineering',
    description: 'Give language models the context they actually need.',
    tags: ['RAG', 'Prompt engineering', 'Vector databases', 'FAISS'],
    proof: 'Attest, AgriBot, LinkedIn Post Generator',
  },
  {
    icon: Search,
    title: 'Search & retrieval',
    description: 'Find the right evidence before the model answers.',
    tags: [
      'BM25',
      'BGE-M3',
      'Reciprocal rank fusion',
      'Cross-encoder reranking',
      'Semantic search',
    ],
    proof: 'Kaggle legal retrieval: 75 of 550+ teams',
  },
  {
    icon: Layers3,
    title: 'Engineering & delivery',
    description: 'Build the system around the model, all the way through.',
    tags: [
      'Python',
      'FastAPI',
      'REST APIs',
      'PostgreSQL',
      'Redis',
      'SQLAlchemy',
      'Docker',
      'Git',
      'Automated testing',
    ],
    proof: 'Attest: 276 tests, 80% coverage',
  },
  {
    icon: ShieldCheck,
    title: 'Deep learning & research',
    description: 'Train and fine-tune models. Measure them honestly.',
    tags: [
      'PyTorch',
      'TensorFlow',
      'Hugging Face Transformers',
      'LoRA / PEFT',
      'OpenCV',
      'Statistical testing',
    ],
    proof: 'Two accepted IEEE papers, AgriBanglaT5',
  },
  {
    icon: Cloud,
    title: 'Data, web & cloud',
    description: 'Clean the data, build the interface, ship it.',
    tags: [
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Seaborn',
      'Selenium',
      'JavaScript',
      'TypeScript',
      'React',
      'Three.js',
      'AWS Amplify',
    ],
    proof: 'AI Web Scraper, Attest, this site',
  },
];

const brand = (icon: SimpleIcon) => ({ name: icon.title, color: `#${icon.hex}`, path: icon.path });

// Logos come from Simple Icons. It has no AWS marks, so Amplify gets a plain cloud in AWS orange.
const stack: { name: string; color: string; path?: string }[] = [
  brand(siLanggraph),
  brand(siLangchain),
  brand(siPython),
  brand(siPytorch),
  brand(siHuggingface),
  brand(siFastapi),
  brand(siPostgresql),
  brand(siDocker),
  { name: 'AWS Amplify', color: '#ff9900' },
];

function Research() {
  const papers = [
    {
      venue: 'IEEE i-COSTE 2026',
      status: 'Accepted · To appear',
      title:
        'Data Leakage and the Limits of Attention: A Significance-Tested Benchmark for Solar Panel Fault Detection',
      description: 'Evaluation that separates model improvements from data leakage.',
      href: null,
    },
    {
      venue: 'IEEE COMPAS 2026',
      status: 'Accepted · To appear',
      title:
        'An English–Bengali Agricultural Parallel Corpus: Construction and Safety-Aware Evaluation',
      description: 'Domain translation where getting a term wrong has consequences.',
      href: null,
    },
    {
      venue: 'arXiv · January 2026',
      status: 'Preprint',
      title:
        'Cost-Efficient Cross-Lingual Retrieval-Augmented Generation for Low-Resource Languages: A Case Study in Bengali Agricultural Advisory',
      description: 'A case study in Bengali agricultural advisory.',
      href: 'https://arxiv.org/abs/2601.02065',
    },
    {
      venue: 'arXiv · January 2026',
      status: 'Preprint',
      title:
        'HybridSolarNet: A Lightweight and Explainable EfficientNet-CBAM Architecture for Real-Time Solar Panel Fault Detection',
      description: 'Real-time solar panel fault detection with a lightweight model.',
      href: 'https://arxiv.org/abs/2601.02928',
    },
  ];
  return (
    <section id="publications" className="section research-section">
      <div className="research-sidebar">
        <p className="eyebrow">
          <FileText size={15} /> Research & writing
        </p>
        <h2>
          Build it.
          <br />
          Question it.
          <br />
          Prove it.
        </h2>
        <p>I care as much about how we evaluate AI as how we build it.</p>
        <span className="author-note">
          <GraduationCap size={18} /> First author on all four papers
        </span>
        <div className="research-model" id="p-t5">
          <span className="small-label">Open model</span>
          <h3>AgriBanglaT5</h3>
          <p>
            LoRA-tuned Bengali translation.
            <br />
            3,232 parallel sentence pairs.
          </p>
          <External href="https://huggingface.co/Sabuktagin/AgriBanglaT5">
            Explore on Hugging Face
          </External>
        </div>
      </div>
      <div className="paper-list">
        {papers.map((p, i) => (
          <article key={p.title} id={i === 3 ? 'p-solar' : undefined}>
            <div className="paper-meta">
              <span>{p.venue}</span>
              <span className={i < 2 ? 'accepted' : ''}>{p.status}</span>
            </div>
            <h3>
              {p.href ? (
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  {p.title}
                  <ArrowUpRight size={19} />
                </a>
              ) : (
                p.title
              )}
            </h3>
            <p>{p.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const certificates = [
  { title: 'AI Engineering Bootcamp', issuer: 'Ostad · 2026', image: 'cert-ostad.jpg', href: null },
  {
    title: 'Machine Learning Specialization',
    issuer: 'Stanford Online & DeepLearning.AI · 2025',
    image: 'cert-ml.jpg',
    href: 'https://coursera.org/verify/specialization/KQ8UEJW7OHWO',
  },
  {
    title: 'Google Data Analytics',
    issuer: 'Google · 2024',
    image: 'cert-gda.jpg',
    href: 'https://coursera.org/verify/professional-cert/2ZF06XQSNIVK',
  },
];

function About() {
  const [certificate, setCertificate] = useState<(typeof certificates)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (certificate) {
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    dialog.current?.close();
  }, [certificate]);
  return (
    <section id="about" className="section about-section">
      <div className="about-main">
        <div className="portrait">
          <img
            src={asset('asif.jpg')}
            alt="Md. Asif Hossain"
            width={650}
            height={741}
            loading="lazy"
          />
          <div className="portrait-caption">
            <span>Md. Asif Hossain</span>
            <small>
              Dhaka, Bangladesh <span className="status-dot" />
            </small>
          </div>
        </div>
        <div className="about-copy">
          <p className="eyebrow">The person behind the systems</p>
          <h2>
            Curiosity in the lab.
            <br />
            Care in the details.
          </h2>
          <p>
            I’m Asif, an AI engineer and researcher based in Dhaka. I build AI for places where the
            constraints are real: limited hardware, unreliable internet, and languages that deserve
            better tools.
          </p>
          <p>
            That means offline agents for Bengali-speaking farmers, document systems that show their
            evidence, and research that asks whether an improvement actually holds up.
          </p>
          <div className="education-line">
            <GraduationCap size={22} />
            <div>
              <strong>B.Sc. in Computer Science & Engineering</strong>
              <span>East West University · Class of 2026</span>
              <span>Research with Dr. Farhana Huq</span>
            </div>
          </div>
          <div className="about-links">
            <External href="https://www.linkedin.com/in/md-asif-hossain20/">
              <Linkedin size={16} /> LinkedIn
            </External>
            <External href={github}>
              <Github size={16} /> GitHub
            </External>
          </div>
        </div>
      </div>
      <div id="achievements" className="recognition">
        <div>
          <Trophy size={21} />
          <strong>Hackathon champion</strong>
          <span>EWU LLM Innovation Challenge · 2026</span>
        </div>
        <div>
          <FileCheck2 size={21} />
          <strong>Springer Nature reviewer</strong>
          <span>World Wide Web journal · 2026</span>
        </div>
        <div>
          <GraduationCap size={21} />
          <strong>GCI World 2026</strong>
          <span>Selected · University of Tokyo program</span>
        </div>
        <div>
          <Code2 size={21} />
          <strong>75 / 550+ teams</strong>
          <span>Kaggle agentic legal retrieval · 2026</span>
        </div>
      </div>
      <div id="certifications" className="certifications">
        <div className="cert-heading">
          <span>Always learning.</span>
          <p>Selected certifications</p>
        </div>
        {certificates.map((c) => (
          <button key={c.title} className="certificate-button" onClick={() => setCertificate(c)}>
            <span>
              <strong>{c.title}</strong>
              <small>{c.issuer}</small>
            </span>
            <Plus size={19} />
          </button>
        ))}
        <div className="additional-cert">
          Also certified: ITEE IT Passport · ITPEC / BD-ITEC · October 2025
        </div>
      </div>
      <dialog
        ref={dialog}
        className="certificate-dialog"
        onCancel={() => setCertificate(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setCertificate(null);
        }}
        aria-labelledby="certificate-title"
      >
        <button
          className="dialog-close"
          onClick={() => setCertificate(null)}
          aria-label="Close certificate"
        >
          <X size={20} />
        </button>
        {certificate && (
          <>
            <h3 id="certificate-title">{certificate.title}</h3>
            <img
              src={asset(certificate.image)}
              width={900}
              height={680}
              alt={`${certificate.title} certificate for Md. Asif Hossain`}
            />
            {certificate.href && <External href={certificate.href}>Verify certificate</External>}
          </>
        )}
      </dialog>
    </section>
  );
}

const contactReasons = [
  {
    icon: Briefcase,
    title: 'AI engineering roles',
    text: 'Agentic AI, retrieval and LLM engineering on real products.',
    subject: 'AI engineering opportunity',
  },
  {
    icon: FlaskConical,
    title: 'Research collaboration',
    text: 'Evaluation, Bengali NLP and AI for low-resource settings.',
    subject: 'Research collaboration',
  },
  {
    icon: GraduationCap,
    title: 'Graduate study',
    text: 'Programs and labs working on applied, trustworthy AI.',
    subject: 'Graduate study',
  },
];
const dhakaTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Dhaka',
  hour: 'numeric',
  minute: '2-digit',
});

function DhakaClock() {
  const [time, setTime] = useState(() => dhakaTime.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(dhakaTime.format(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="contact-clock">
      <Clock size={14} /> {time} in Dhaka (GMT+6)
    </span>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setCopyError(false);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }
  return (
    <section id="contact" className="contact-section">
      <div className="contact-orbit" aria-hidden="true" />
      <div className="contact-top">
        <span className="availability">
          <i /> Open to AI engineering opportunities
        </span>
        <span className="small-label">Good work starts with a conversation.</span>
      </div>
      <div className="contact-heading">
        <h2>
          Let’s build
          <br />
          something that <em>works.</em>
        </h2>
        <a href={`mailto:${email}`} className="contact-arrow" aria-label="Email Asif">
          <ArrowUpRight size={50} strokeWidth={1.4} />
        </a>
      </div>
      <div className="contact-reasons">
        {contactReasons.map(({ icon: Icon, title, text, subject }) => (
          <a key={title} href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>
            <Icon size={22} strokeWidth={1.5} />
            <strong>{title}</strong>
            <span>{text}</span>
            <small>
              Email me about this <ArrowUpRight size={12} />
            </small>
          </a>
        ))}
      </div>
      <div className="contact-bottom">
        <div className="email-group">
          <a href={`mailto:${email}`}>{email}</a>
          <button onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <span role="status">
            {copied ? 'Copied!' : copyError ? 'Select the email to copy it.' : ''}
          </span>
        </div>
        <DhakaClock />
        <div>
          <External href="https://www.linkedin.com/in/md-asif-hossain20/">
            <Linkedin size={15} /> LinkedIn
          </External>
          <External href={github}>
            <Github size={15} /> GitHub
          </External>
          <External href="https://huggingface.co/Sabuktagin">Hugging Face</External>
        </div>
      </div>
    </section>
  );
}

const intro: { text: string; strong?: boolean; lineBreak?: 'always' | 'desktop' }[] = [
  { text: 'I’m ' },
  { text: 'Asif Hossain', strong: true },
  { text: '. AI engineer. Researcher. Builder. ', lineBreak: 'always' },
  { text: 'Turning language models into agents that reason, ', lineBreak: 'desktop' },
  { text: 'use tools, and solve real problems.' },
];
const introText = intro.map((part) => part.text).join('');

// The untyped text stays in the layout, hidden, so nothing moves while the intro types itself.
function HeroIntro() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let count = 0;
    let timer: ReturnType<typeof setTimeout>;
    const typeNext = () => {
      setTyped(++count);
      if (count < introText.length)
        timer = setTimeout(typeNext, introText[count - 1] === '.' ? 170 : 20);
    };
    timer = setTimeout(typeNext, 700);
    return () => clearTimeout(timer);
  }, [reduced]);
  const shown = reduced ? introText.length : typed;
  const done = shown === introText.length;
  let start = 0;
  return (
    <p className="hero-description">
      <span className="sr-only">{introText}</span>
      <span aria-hidden="true">
        {intro.map((part) => {
          const end = start + part.text.length;
          const visible = part.text.slice(0, Math.max(shown - start, 0));
          const hasCursor = !reduced && shown >= start && (shown < end || end === introText.length);
          const Tag = part.strong ? 'strong' : 'span';
          start = end;
          return (
            <Fragment key={part.text}>
              <Tag>
                {visible}
                {hasCursor && <span className={done ? 'typing-cursor done' : 'typing-cursor'} />}
                <span className="typing-rest">{part.text.slice(visible.length)}</span>
              </Tag>
              {part.lineBreak && (
                <br className={part.lineBreak === 'desktop' ? 'desktop-break' : undefined} />
              )}
            </Fragment>
          );
        })}
      </span>
    </p>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [selectedStage, setSelectedStage] = useState(0);
  const [visible, setVisible] = useState(!document.hidden);
  const reduced = useReducedMotion();
  const hero = useRef<HTMLDivElement>(null);
  const heroInView = useInView(hero, { margin: '100px' });
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('keydown', escape);
    };
  }, [menuOpen]);
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Asif Hossain, home">
            <span className="brand-mark">
              <Network size={20} strokeWidth={1.6} />
            </span>
            asif<span className="brand-period">.</span>
            <span className="brand-divider" />
            <span className="brand-role">AI engineer & researcher</span>
          </a>
          <nav id="main-nav" aria-label="Main navigation" className={menuOpen ? 'open' : ''}>
            {[
              ['Work', '#projects'],
              ['Skills', '#expertise'],
              ['Ask me', '#playground'],
              ['Research', '#publications'],
              ['About', '#about'],
            ].map(([title, link]) => (
              <a key={link} href={link} onClick={() => setMenuOpen(false)}>
                {title}
              </a>
            ))}
            <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>
              Let’s talk <ArrowUpRight size={14} />
            </a>
          </nav>
          <button
            ref={menuButton}
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <div id="top" className="hero" ref={hero}>
          <div className="hero-background" aria-hidden="true" />
          <div className="hero-content">
            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: reduced ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="availability">
                <i /> Available for AI engineering roles
              </p>
              <h1>
                I build systems
                <br />
                that <span>think.</span>
                <br />
                And <span className="outlined-word">get things done.</span>
              </h1>
              <HeroIntro />
              <div className="hero-actions">
                <a href="#projects" className="button-primary">
                  Explore my work <ArrowUpRight size={17} />
                </a>
                <a href="#playground" className="button-secondary">
                  <Play size={13} fill="currentColor" /> Run the agent demo
                </a>
              </div>
              <div className="hero-location">
                <span>Based in Dhaka, Bangladesh</span>
                <span className="tiny-cross">+</span>
                <span>Building for everywhere</span>
              </div>
            </motion.div>
            <div className="hero-visual">
              <div className="visual-heading">
                <span>
                  <span className="status-dot" /> Agent orchestration
                </span>
                <span>Interactive 3D</span>
              </div>
              <div className="scene-wrap">
                <SceneBoundary>
                  <Suspense fallback={<div className="orb-fallback" />}>
                    <AgentScene
                      paused={!!reduced || paused || !heroInView || !visible}
                      active={activeStage >= 0 ? activeStage : selectedStage}
                    />
                  </Suspense>
                </SceneBoundary>
                <div className="orb-center">
                  <BrainCircuit size={29} strokeWidth={1} />
                  <span>AGENT CORE</span>
                  <small>reason → act → reflect</small>
                </div>
                <div className="orbit-label label-planner">
                  <GitBranch size={13} />
                  <span>Planner</span>
                  <i />
                </div>
                <div className="orbit-label label-memory">
                  <Database size={13} />
                  <span>Memory</span>
                  <i />
                </div>
                <div className="orbit-label label-tools">
                  <Code2 size={13} />
                  <span>Tools</span>
                  <i />
                </div>
                <div className="orbit-label label-critic">
                  <ShieldCheck size={13} />
                  <span>Critic</span>
                  <i />
                </div>
              </div>
              <div className="scene-controls">
                <span>
                  <span className="status-dot" />{' '}
                  {activeStage >= 0
                    ? `${stages[activeStage]} active`
                    : 'Systems ready. Ideas welcome.'}
                </span>
                <button
                  aria-label={paused ? 'Play 3D animation' : 'Pause 3D animation'}
                  aria-pressed={paused}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={13} /> : <Pause size={13} />}
                  <span>{paused ? 'Play motion' : 'Pause motion'}</span>
                </button>
              </div>
              <div className="agent-process" role="group" aria-label="Explore the agent workflow">
                {stages.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStage(i)}
                    aria-pressed={selectedStage === i}
                    className={selectedStage === i ? 'selected' : ''}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {s}
                    {i < 4 && <ArrowRight size={12} />}
                  </button>
                ))}
              </div>
              <p className="stage-description" aria-live="polite">
                {stageDetails[selectedStage]}
              </p>
            </div>
          </div>
          <div className="hero-proof">
            <div className="proof-intro">
              Practical engineering.
              <br />
              <span>Backed by evidence.</span>
            </div>
            <div>
              <strong>
                2 <span>IEEE</span>
              </strong>
              <small>First-author papers accepted</small>
            </div>
            <div>
              <strong>
                1st <Trophy size={20} />
              </strong>
              <small>EWU LLM innovation challenge</small>
            </div>
            <div>
              <strong>
                4 <span>GB</span>
              </strong>
              <small>Offline agent. Consumer hardware.</small>
            </div>
            <a href="#projects" aria-label="Scroll to selected work">
              <ArrowDown size={22} />
            </a>
          </div>
        </div>
        <div className="stack-strip">
          <span>My working stack</span>
          <div>
            {stack.map((s) => (
              <span key={s.name} style={{ '--brand': s.color } as CSSProperties}>
                <span className="stack-logo">
                  {s.path ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  ) : (
                    <Cloud size={17} />
                  )}
                </span>
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <div className="page-container">
          <Projects />
          <section id="expertise" className="section expertise-section">
            <div className="section-intro">
              <div>
                <p className="eyebrow">
                  <Cpu size={15} /> Skills & expertise
                </p>
                <h2>
                  The whole system.
                  <br />
                  Not just the model.
                </h2>
              </div>
              <p>
                Good AI needs more than a good prompt.
                <br />I connect models, data, tools, and evaluation
                <br className="desktop-break" /> into systems people can actually use.
              </p>
            </div>
            <div className="expertise-grid">
              {skills.map((s) => (
                <article key={s.title}>
                  <div className="skill-icon">
                    <s.icon size={25} strokeWidth={1.4} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <div className="skill-tags">
                    {s.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="skill-proof">
                    <Check size={13} />
                    <span>{s.proof}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <AgentPlayground onStage={setActiveStage} />
          <Research />
          <About />
          <Contact />
        </div>
      </main>
      <footer className="site-footer">
        <a href="#top" className="footer-brand">
          asif<span>.</span>
        </a>
        <p>Thoughtfully built. Always iterating.</p>
        <span>© {new Date().getFullYear()} Md. Asif Hossain</span>
        <a href="#top">
          Back to top <ArrowUpRight size={14} />
        </a>
      </footer>
    </MotionConfig>
  );
}
