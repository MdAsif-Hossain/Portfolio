// The portfolio agent: a small plan -> retrieve -> act -> draft -> verify loop
// that runs entirely in the browser. Each step announces the graph node it is
// using, so the 3D graph in the hero can light up in sync.
(() => {
  const KB = window.KB;
  const $ = (s, el = document) => el.querySelector(s);
  const consoleEl = $('#console');
  const form = $('.ask', consoleEl);
  const input = $('#goal-input');
  const statusEl = $('[data-status]', consoleEl);
  const runEl = $('.run', consoleEl);
  const traceEl = $('.trace', consoleEl);
  const answerEl = $('.answer', consoleEl);
  const goalBtns = [...consoleEl.querySelectorAll('.goal')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const memory = { goals: [], surpriseIndex: 0 };
  let running = false;

  /* ---------------- Retrieval: BM25 over the knowledge base ---------------- */
  const STOP = new Set('a an the is are was of for to in on and or with his her he she asif does do can me show what which who how about tell some something has have it its this that i you my your as at by be best'.split(' '));
  const SYNONYMS = {
    agentic: ['agent', 'langgraph', 'tool', 'routing', 'workflow', 'orchestration'],
    agents: ['agent', 'langgraph', 'tool', 'routing'],
    agent: ['agentic', 'langgraph', 'tool'],
    production: ['fastapi', 'tests', 'testing', 'validation', 'deployed', 'reliability', 'backend'],
    ship: ['fastapi', 'tests', 'deployed', 'production'],
    deploy: ['deployed', 'aws', 'amplify', 'fastapi'],
    rag: ['retrieval', 'augmented', 'generation', 'vector'],
    llm: ['llm', 'llms', 'langchain', 'qwen2', 'llama'],
    research: ['paper', 'publication', 'preprint', 'ieee', 'arxiv'],
    published: ['paper', 'publication', 'ieee', 'arxiv'],
    publish: ['paper', 'publication', 'ieee', 'arxiv'],
    vision: ['computer', 'efficientnet', 'cbam', 'solar'],
    cloud: ['aws', 'amplify', 'deployed'],
    hire: ['team', 'lead', 'champion', 'production'],
    award: ['champion', 'winner', 'rank'],
    bengali: ['bangla', 'bengali', 'low-resource'],
    bangla: ['bengali'],
    translation: ['translation', 'nllb', 'banglat5'],
    search: ['retrieval', 'bm25', 'rerank'],
  };
  const tokenize = (s) => s.toLowerCase().replace(/[^a-z0-9.+\-\s]/g, ' ')
    .split(/\s+/).map((t) => t.replace(/[.,]+$/, '')).filter((t) => t && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t));

  const docs = KB.map((d) => ({ ...d, tokens: tokenize(d.title + ' ' + d.text) }));
  const avgLen = docs.reduce((n, d) => n + d.tokens.length, 0) / docs.length;
  const df = {};
  docs.forEach((d) => new Set(d.tokens).forEach((t) => { df[t] = (df[t] || 0) + 1; }));

  function expand(qTokens) {
    const out = [...qTokens];
    qTokens.forEach((t) => (SYNONYMS[t] || []).forEach((s) => out.push(...tokenize(s))));
    return [...new Set(out)];
  }

  function searchPortfolio(query, k = 4) {
    const q = expand(tokenize(query));
    const k1 = 1.4, b = 0.75, N = docs.length;
    return docs.map((d) => {
      let score = 0;
      q.forEach((t) => {
        const tf = d.tokens.filter((x) => x === t).length;
        if (!tf) return;
        const idf = Math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5));
        score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * d.tokens.length / avgLen));
      });
      return { doc: d, score };
    }).filter((r) => r.score > 0).sort((a, b2) => b2.score - a.score).slice(0, k);
  }

  /* ---------------- Planner: route the goal to a strategy ---------------- */
  const ROUTES = [
    { intent: 'hire', re: /\b(hire|hiring|why (should|would)|good fit|strength|recruit)/, query: 'agentic production champion team lead publication' },
    { intent: 'agentic', re: /\b(agent|agentic|langgraph|autonomous)/, query: 'agentic agent langgraph tool routing workflow' },
    { intent: 'production', re: /\b(production|ship|deploy|backend|reliab|real[- ]world|scale)/, query: 'production fastapi tests validation deployed' },
    { intent: 'research', re: /\b(publish|publication|paper|research|ieee|arxiv)/, query: 'paper publication ieee arxiv preprint research' },
    { intent: 'surprise', re: /\b(surpris|fun|interesting|cool|unexpected)/, query: 'rice blast bijoy data leakage reviewer' },
    { intent: 'certs', re: /\b(cert|certificate|course|bootcamp)/, query: 'certifications course bootcamp' },
    { intent: 'contact', re: /\b(contact|email|reach|talk to)/, query: 'contact email linkedin' },
  ];
  const PLANS = {
    hire: ['recall visitor context', 'search portfolio for evidence of impact', 'pull metrics for top projects', 'draft a short case', 'verify every claim has a source'],
    agentic: ['recall visitor context', 'search for agent and tool-use work', 'rank projects by agent capability', 'draft the answer', 'verify against sources'],
    production: ['recall visitor context', 'search for engineering rigour', 'pull test and latency metrics', 'draft the answer', 'verify against sources'],
    research: ['recall visitor context', 'search publications', 'list papers by venue', 'draft the answer', 'verify against sources'],
    surprise: ['recall what I already told you', 'search for unusual findings', 'pick one you haven’t seen', 'draft the answer', 'verify against sources'],
    certs: ['recall visitor context', 'search certifications', 'draft the answer', 'verify against sources'],
    contact: ['recall visitor context', 'look up contact details', 'draft the answer', 'verify against sources'],
    general: ['recall visitor context', 'search portfolio for your question', 'read the best matches', 'draft the answer', 'verify the evidence is strong enough'],
  };

  function plan(goal) {
    const g = goal.toLowerCase();
    const route = ROUTES.find((r) => r.re.test(g));
    return route ? { intent: route.intent, query: route.query } : { intent: 'general', query: goal };
  }

  /* ---------------- Tools ---------------- */
  const byId = (id) => docs.find((d) => d.id === id);
  const tools = {
    rank_by_agent_capability(ids) {
      return ids.map(byId).sort((a, b) => b.agentScore - a.agentScore);
    },
    get_metrics(id) {
      const m = {
        agribot: '4 GB VRAM, 8.5× vs CPU, fully offline',
        attest: '97.2% accuracy, 6/6 errors caught, 317 ms, 276 tests',
        ewu: '1st place, team lead of 3',
        t5: '+6.1 chrF++, 81.8% term accuracy',
        kaggle: 'rank 75 of 550+',
      };
      return m[id] || 'no metrics recorded';
    },
    list_publications() {
      return docs.filter((d) => d.kind === 'publication').concat(byId('solar'));
    },
  };

  /* ---------------- Answer drafting (templated, grounded in KB) ---------------- */
  const SURPRISES = [
    { id: 't5', title: 'A crop disease that became an explosion', text: 'A general translation model rendered the rice disease "rice blast" as "explosion" in Bengali. Asif built AgriBanglaT5 to fix exactly that kind of error, reaching 81.8% agricultural term accuracy.' },
    { id: 't5', title: 'Rescuing text from a legacy font', text: 'To build his English–Bengali corpus, Asif recovered Bengali text from government PDFs stored in the old Bijoy font encoding, which ordinary tools read as gibberish.' },
    { id: 'pub-icoste', title: 'Catching inflated accuracy', text: 'His i-COSTE 2026 paper shows that data leakage can make solar fault detectors look better than they are, and backs each comparison with significance testing.' },
    { id: 'reviewer', title: 'Reviewing before graduating', text: 'Asif reviewed a manuscript for Springer Nature’s World Wide Web journal while still an undergraduate.' },
  ];

  function draft(intent, goal, results) {
    const top = results.map((r) => r.doc);
    switch (intent) {
      case 'hire':
        return { title: 'Why Asif is a strong AI engineering hire', bullets: [
          ['He ships agents end to end. AgriBot is a LangGraph agentic RAG system that runs fully offline on 4 GB of VRAM, 8.5× faster than CPU.', 'agribot'],
          ['He builds AI you can audit. Attest reaches 97.2% field accuracy, caught 6 of 6 injected errors and has 276 tests.', 'attest'],
          ['He delivers under pressure. He led his team to 1st place in EWU’s LLM AI Engine challenge.', 'ewu'],
          ['He has research depth: first author of two accepted IEEE papers and two arXiv preprints.', 'pub-compas'],
        ] };
      case 'agentic': {
        const ranked = tools.rank_by_agent_capability(['agribot', 'ewu', 'articleai', 'attest']);
        return { title: 'Best agentic project: ' + ranked[0].title, bullets: [
          [ranked[0].summary, ranked[0].id],
          ['Runner-up: ' + ranked[1].title + '. ' + ranked[1].summary, ranked[1].id],
          ['Also worth a look: ' + ranked[2].title + '. ' + ranked[2].summary, ranked[2].id],
        ] };
      }
      case 'production':
        return { title: 'Yes. He builds to production standards', bullets: [
          ['Attest runs on FastAPI, PostgreSQL and Redis, with 276 tests at 80% coverage and 317 ms per document.', 'attest'],
          ['It routes uncertain values to human review and validates outputs deterministically instead of trusting the model blindly.', 'attest'],
          ['AgriBot pairs a FastAPI backend with a TypeScript client and GPU-optimised inference.', 'agribot'],
          ['This site is deployed on AWS Amplify straight from GitHub.', 'site'],
        ] };
      case 'research':
        return { title: 'Four first-author papers', bullets: tools.list_publications().map((d) => [d.summary, d.id]) };
      case 'surprise': {
        const s = SURPRISES[memory.surpriseIndex % SURPRISES.length];
        memory.surpriseIndex += 1;
        return { title: s.title, bullets: [[s.text, s.id]] };
      }
      case 'certs':
        return { title: 'Certifications', bullets: [[byId('certs').summary, 'certs'], ['He also holds a Springer Nature reviewer certificate.', 'reviewer']] };
      case 'contact':
        return { title: 'How to reach Asif', bullets: [['Email asifhossain8612@gmail.com. He is open to AI engineering roles, research collaborations and graduate study.', 'contact']] };
      default:
        const qTok = tokenize(goal);
        const covered = qTok.filter((t) => top.slice(0, 3).some((d) => d.tokens.includes(t) || (SYNONYMS[t] || []).some((x) => d.tokens.includes(x)))).length;
        if (!top.length || results[0].score < 1.6 || covered / Math.max(qTok.length, 1) < 0.5) {
          return { title: 'Not enough evidence', weak: true, bullets: top.length
            ? [['I couldn’t find a strong match for that in Asif’s portfolio. The closest thing I found: ' + top[0].title + '. ' + top[0].summary, top[0].id]]
            : [['I couldn’t find anything about that in Asif’s portfolio, so I won’t guess. You can ask him directly at asifhossain8612@gmail.com.', 'contact']] };
        }
        return { title: 'Here’s what I found', bullets: top.slice(0, 3).map((d) => [d.title + '. ' + d.summary, d.id]) };
    }
  }

  /* ---------------- Runtime ---------------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 120) : ms));
  const pipe = [...consoleEl.querySelectorAll('.pipeline li')];
  const emit = (node) => {
    let past = true;
    pipe.forEach((li) => {
      const isNow = li.dataset.node === node;
      if (isNow) past = false;
      li.classList.toggle('active', isNow);
      li.classList.toggle('done', past && !isNow);
    });
    window.dispatchEvent(new CustomEvent('agent:node', { detail: { node } }));
  };

  function addStep(node, html, ms) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="node-name ${node}">${node}</span><span class="msg">${html}${ms != null ? ` <span class="ms">${ms} ms</span>` : ''}</span>`;
    traceEl.appendChild(li);
    return li;
  }
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const jitter = (base) => Math.round(base + Math.random() * base * 0.6);

  async function typeInto(el, text) {
    if (reduced) { el.textContent = text; return; }
    el.classList.add('caret');
    for (let i = 0; i < text.length; i += 3) {
      el.textContent = text.slice(0, i + 3);
      await sleep(12);
    }
    el.classList.remove('caret');
  }

  async function run(goal) {
    if (running) return;
    goal = goal.trim().slice(0, 160);
    if (!goal) { input.focus(); return; }
    running = true;
    consoleEl.querySelectorAll('button, input').forEach((el) => { el.disabled = true; });
    statusEl.textContent = 'Running';
    statusEl.className = 'status running';
    runEl.hidden = false;
    traceEl.innerHTML = '';
    answerEl.hidden = true;
    answerEl.innerHTML = '';
    const t0 = performance.now();

    // 1. Planner
    emit('planner');
    const { intent, query } = plan(goal);
    await sleep(650);
    addStep('planner', `Goal: <i>"${esc(goal)}"</i><br>Strategy: ${intent}. Plan: ${PLANS[intent].join(' → ')}`, jitter(40));

    // 2. Memory
    emit('memory');
    await sleep(550);
    const prev = memory.goals.length;
    addStep('memory', prev ? `${prev} earlier goal${prev > 1 ? 's' : ''} this visit. Avoiding repeats.` : 'New visitor session. No earlier goals.', jitter(6));
    memory.goals.push(goal);

    // 3. Retriever
    emit('retriever');
    await sleep(700);
    const results = searchPortfolio(query);
    const hits = results.map((r) => `${r.doc.title} <i>${r.score.toFixed(2)}</i>`).join(', ') || '<i>no matches</i>';
    addStep('retriever', `search_portfolio("${esc(query.length > 40 ? query.slice(0, 40) + '…' : query)}") → ${results.length} hit${results.length === 1 ? '' : 's'}: ${hits}`, jitter(18));

    // 4. Tools
    emit('tools');
    await sleep(650);
    if (intent === 'agentic') {
      const ranked = tools.rank_by_agent_capability(['agribot', 'ewu', 'articleai', 'attest']);
      addStep('tools', `rank_by_agent_capability() → ${ranked.map((d) => d.title).join(' > ')}`, jitter(9));
    } else if (intent === 'research') {
      addStep('tools', `list_publications() → ${tools.list_publications().length} papers, all first author`, jitter(7));
    } else if (intent === 'general' || intent === 'surprise') {
      const ids = results.slice(0, 3).map((r) => r.doc.id);
      addStep('tools', ids.length ? `read_documents(${ids.map((x) => `"${x}"`).join(', ')}) → ${ids.length} loaded` : 'read_documents() → nothing to read', jitter(8));
    } else {
      const id = results[0] ? results[0].doc.id : 'contact';
      addStep('tools', `get_metrics("${id}") → ${tools.get_metrics(id)}`, jitter(7));
    }

    // 5. LLM draft
    emit('llm');
    await sleep(800);
    const out = draft(intent, goal, results);
    addStep('llm', `Drafted ${out.bullets.length} claim${out.bullets.length > 1 ? 's' : ''} from retrieved documents only.`, jitter(220));

    // 6. Critic
    emit('critic');
    await sleep(650);
    const grounded = out.bullets.filter(([, id]) => byId(id)).length;
    addStep('critic', out.weak
      ? 'Evidence too weak to answer confidently. Saying so instead of guessing.'
      : `${grounded}/${out.bullets.length} claims grounded in sources. Approved.`, jitter(12));

    // 7. Answer
    emit('agent');
    answerEl.hidden = false;
    const h = document.createElement('h3');
    h.textContent = out.title;
    const ul = document.createElement('ul');
    answerEl.append(h, ul);
    for (const [text] of out.bullets) {
      const li = document.createElement('li');
      ul.appendChild(li);
      await typeInto(li, text);
    }
    const check = document.createElement('p');
    check.className = 'check';
    check.textContent = out.weak ? 'Low confidence: answer limited to what the portfolio supports.' : `Verified against ${grounded} source${grounded > 1 ? 's' : ''}.`;
    const src = document.createElement('p');
    src.className = 'sources';
    const seen = new Set();
    out.bullets.forEach(([, id]) => {
      const d = byId(id);
      if (!d || seen.has(id)) return;
      seen.add(id);
      const a = document.createElement('a');
      a.href = d.href;
      a.textContent = d.title;
      if (d.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      src.appendChild(a);
    });
    answerEl.append(check, src);

    const total = Math.round(performance.now() - t0);
    statusEl.textContent = `Done in ${(total / 1000).toFixed(1)} s`;
    statusEl.className = 'status done';
    pipe.forEach((li) => { li.classList.remove('active'); li.classList.add('done'); });
    window.dispatchEvent(new CustomEvent('agent:done'));
    consoleEl.querySelectorAll('button, input').forEach((el) => { el.disabled = false; });
    running = false;
  }

  goalBtns.forEach((btn) => btn.addEventListener('click', () => {
    goalBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    input.value = '';
    run(btn.dataset.goal);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    goalBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    run(input.value);
  });

  // Exposed for testing in the console
  window.portfolioAgent = { run, searchPortfolio };
})();
