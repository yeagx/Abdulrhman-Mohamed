/* =============================================================
   data.js — everything the site says lives here.
   Edit this file, not index.html.
   ============================================================= */

const PROFILE = {
  name:      'Abdulrhman Mohamed Gomaa',
  short:     'A. Mohamed Gomaa',
  role:      'Data Engineer',
  location:  'Cairo, Egypt',
  email:     'abdulrhman.mohamed026@gmail.com',
  phone:     '+20 102 323 2234',
  phoneAlt:  '+20 100 082 3191',
  phoneIntl: '201023232234',          // digits only, for the wa.me link
  cv:        'CV.pdf',
  photo:     'Images/my photo.jpeg',

  degree:   'B.Sc. Computer Science',
  school:   'Arab Academy for Science, Technology & Maritime Transport',
  schoolShort: 'AASTMT',
  years:    'Sept 2022 — June 2026',
  gpa:      '3.66 / 4.0',
  honours:  ['Dean’s List — Semester 2, 2022/23 (GPA 3.9)', 'Graduation project graded A+'],

  languages: 'Arabic (native) · English (intermediate)',
  links: {
    github:   'https://github.com/yeagx',
    linkedin: 'https://www.linkedin.com/in/abdulrhman-mohamed-da',
    youtube:  'https://www.youtube.com/@YeagX'
  },
};

/* ---------- what I'm doing now ---------- */
const NOW = {
  title:   'Big Data Track — full time',
  company: 'Samsung Innovation Campus',
  shortCompany: 'Samsung IC',
  when:    'June 2026 — present',
  where:   'Cairo, Egypt',
  body:    'A data engineering programme run across the whole pipeline, four hours a session, three ' +
           'sessions a week. Ingestion and storage, distributed processing on Hadoop and Spark, ' +
           'warehousing and dimensional modeling, then streaming, cloud and governance. The timetable ' +
           'on the training section below is the real agenda, and it shows the module I am in today.',
  tools:   ['Hadoop / HDFS', 'PySpark', 'Apache Hive', 'Sqoop', 'Apache NiFi', 'Kafka'],
  note: {
    h: 'What I have built in it so far',
    p: 'The capstone: an end-to-end churn pipeline over four disconnected banking sources. I owned the ' +
       'Hive warehouse, the monthly churn KPI and the orchestration. It is the first project in the ' +
       'list below, and the first thing I have built that is data engineering rather than analysis.'
  }
};

/* ---------- the role before this one ---------- */
const PAST = [
  {
    role:    'Intern — AI-Driven Automation & Core Banking',
    company: 'Finnovate (ICT Misr Group)',
    when:    'July — Sept 2026',
    note:    'Automation and core banking solutions for banking, insurance and oil & gas clients, plus ' +
             'the solution-sales side. Not a data engineering title — what it gave me was time inside ' +
             'production enterprise systems: real relational databases, real process automation, and ' +
             'the access and governance rules that come with regulated financial data.',
    tools:   ['RPA', 'BPM', 'Oracle FLEXCUBE', 'PostgreSQL / EDB']
  }
];

/* ---------- data engineering projects ---------- */
const WORK = [
  {
    id: 'churn',
    name: 'Customer Churn Pipeline',
    sub: 'Four sources → zoned data lake → Hive star schema',
    meta: 'Samsung IC capstone · 2026 · four-person team',
    lead: 'An end-to-end big data pipeline for bank customer churn. Four disconnected sources land in a ' +
          'zoned HDFS lake, get cleaned and enriched with PySpark, and are served as a partitioned ' +
          'star-schema dimension through Hive. I owned the warehouse, the KPI layer and the orchestration.',
    blocks: [
      { h: 'The question',
        p: 'Who is leaving, and what do they have in common? The answer needed four systems that did not ' +
           'talk to each other: customer records in MySQL, support tickets and marketing offers as CSV, ' +
           'and usage activity as JSON Lines. 10,000 customers, 2,037 of them churned.',
        dl: 'Scope:', d: '4 disconnected sources → 1 queryable warehouse' },
      { h: 'The lake',
        p: 'HDFS split into four zones, each with one job. Raw is immutable and never edited, so it stays ' +
           'the audit trail. Clean is typed, deduplicated and referentially valid. Warehouse is ' +
           'feature-enriched and partitioned. Reject quarantines bad rows with the reason attached, ' +
           'rather than dropping them silently.',
        dl: 'Shape:', d: 'raw → clean → warehouse, plus a reject zone' },
      { h: 'My part',
        p: 'The Hive layer and the orchestration. An external Parquet dim_customer at one row per ' +
           'customer, 21 columns, partitioned by geography, with SCD-2 columns carried on it. The monthly ' +
           'churn KPI is a window function rather than a correlated subquery, which Hive will not take in ' +
           'a SELECT list, and it computes the whole running series in one pass. Every stage overwrites, ' +
           'so the run is idempotent: 6m 37s end to end.',
        dl: 'Checks:', d: 'reconciles to 2,037 churned, exactly' },
      { h: 'What it found',
        p: 'Germany churns at roughly twice the rate of France and Spain — 32.4% against 16.2% and 16.7% ' +
           '— on the same product at the same prices. A random forest over the warehouse scores 0.7997 ' +
           'ROC AUC, and its riskiest decile churns at 67% against a 20.3% baseline.',
        dl: 'Found:', d: '4.0× lift on the top decile' }
    ],
    stack: ['Hadoop / HDFS', 'PySpark', 'Apache Hive', 'Sqoop', 'Apache NiFi', 'Parquet', 'MySQL',
            'Star schema', 'SCD Type 2', 'scikit-learn', 'Streamlit'],
    links: [
      { label: 'Pipeline & warehouse', url: 'https://github.com/yeagx/sic-churn-data-pipeline' }
    ]
  },
  {
    id: 'f1',
    name: 'F1 Performance Warehouse',
    sub: 'Race data → star schema → champion predictor',
    meta: 'Personal project · 2018–2021 seasons',
    lead: 'Four seasons of Formula 1 race data, cleaned in two passes, modeled into a star schema, then ' +
          'used for both dashboards and a model that predicts the season champion.',
    blocks: [
      { h: 'Cleaning',
        p: 'The source was one wide table with contradictions in it. First pass fixed invalid pit times ' +
           'and normalised tire-compound naming. Second pass enforced the rule that stints = pit stops + 1, ' +
           'which exposed broken final-stint values. Only once that held did I derive anything on top.',
        d: 'contradictory source → stints = pit stops + 1 holds' },
      { h: 'The model',
        p: 'A star schema at three grains: Fact_PitStops per event, DriverRace per race, DriverSeason per ' +
           'season. Dimensions for driver, constructor, race and season. Three grains on purpose — the ' +
           'dashboards read the race grain, the predictor reads the season grain, from one warehouse.',
        d: '1 wide table → 3 fact grains + 4 dimensions' },
      { h: 'What I added',
        p: 'Metrics that were not in the source: point efficiency, pit-stop gap against the field, per-lap ' +
           'aggression, driver consistency, wet versus dry compound strength, and team tire-strategy patterns.',
        d: '0 → 7 engineered metrics' },
      { h: 'The prediction',
        p: 'An XGBoost classifier over DriverSeason using average finish, aggression score, pit efficiency ' +
           'and constructor performance.',
        d: '70–85% accuracy across historical seasons' }
    ],
    stack: ['Python', 'Pandas', 'SQL', 'Star schema', 'XGBoost', 'Power BI'],
    links: [
      { label: 'Warehouse & analysis', url: 'https://github.com/yeagx/F1-Race-Data-Analysis' },
      { label: 'Predictor', url: 'https://github.com/yeagx/f1-season-winner-predictor' }
    ]
  }
];

/* ---------- the graduation project ----------
   Kept out of WORK on purpose: it is a full-stack AI product, not a
   data engineering build, and it is grouped separately on the page so
   the data work is read on its own terms.
--------------------------------------------------------------- */
const GRAD = [
  {
    id: 'docmind',
    name: 'DocMind',
    sub: 'AI academic assistant',
    meta: 'Graduation project · 2025–2026 · graded A+ · seven-person team',
    lead: 'A university platform where students chat with their own course documents. I led the UI/UX ' +
          'and the frontend, in a team of seven across frontend, backend, mobile and the RAG layer.',
    blocks: [
      { h: 'What it does',
        p: 'Students upload course material and ask questions against it. Answers come back grounded in ' +
           'their own documents rather than from a general model, with subject-specific tutors and a ' +
           'multi-role admin dashboard behind it.',
        d: 'general model → answers grounded in the student’s own files' },
      { h: 'My part',
        p: 'Design and frontend: React 19, Vite, Tailwind CSS and Framer Motion, from the Figma work ' +
           'through to the shipped interface, including the analytics and admin views for three ' +
           'different user roles.',
        d: 'Figma → shipped interface · 3 user roles' },
      { h: 'The data side',
        p: 'The retrieval layer is a document pipeline, and the chunking is structure-aware rather ' +
           'than a fixed window: tables come out as intact Markdown, and section headings are ' +
           'detected by font size and prepended to each chunk as breadcrumbs. Chunks are embedded ' +
           'into PostgreSQL with pgvector, stamped with their material and page, and every answer ' +
           'cites the slide it came from.',
        dl: 'Shape:', d: 'PDF / PPTX → tables + headings → cited chunks' }
    ],
    stack: ['React 19', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'FastAPI',
            'SQLAlchemy 2', 'PostgreSQL 16', 'pgvector', 'Gemini API', 'RAG'],
    links: [
      { label: 'Team repo', url: 'https://github.com/mohamedAY2004/DOCMIND' }
    ]
  },
];

/* ---------- smaller builds, one line each ---------- */
const ALSO = [
  { name: 'red.',      note: 'PHP/MySQL tech store — auth, cart, category browsing, search and price sorting',
    url: 'https://github.com/yeagx/red.-E-commerce-Tech-Store' },
  { name: 'StepUp',    note: 'Java/Jakarta EE servlets and JSP — cart, order history, admin inventory',
    url: 'https://github.com/yeagx/StepUp-Java-Web-App' },
  { name: 'Rufuf POS', note: 'R Shiny supermarket POS — barcode scanning, live stock, PDF receipts',
    url: 'https://github.com/yeagx/Rufuf' }
];

/* ---------- toolkit ----------
   learning: true  → currently picking it up (marked, not hidden)
--------------------------------------------------------------- */
const TOOLKIT = [
  { group: 'Languages',
    items: [ {n:'Python'}, {n:'SQL'}, {n:'Java'}, {n:'C / C++'}, {n:'PHP'}, {n:'R'}, {n:'JavaScript'} ] },

  { group: 'Databases & warehousing',
    items: [ {n:'PostgreSQL'}, {n:'MySQL'}, {n:'pgvector'}, {n:'Star schema'},
             {n:'Dimensional modeling'}, {n:'SCD Type 2'}, {n:'ETL / ELT'}, {n:'Sqoop'}, {n:'Parquet'}, {n:'Apache Hive'},
             {n:'NoSQL', learning:true} ] },

  { group: 'Big data',
    items: [ {n:'Apache Spark'}, {n:'Hadoop / HDFS'},
             {n:'Apache Kafka', learning:true}, {n:'Apache NiFi'},
             {n:'Databricks', learning:true}, {n:'Snowflake', learning:true} ] },

  { group: 'Analysis & BI',
    items: [ {n:'Power BI'}, {n:'Streamlit'}, {n:'Excel / Power Query'}, {n:'Pandas'}, {n:'NumPy'} ] },

  { group: 'AI / ML',
    items: [ {n:'RAG pipelines'}, {n:'Gemini API'}, {n:'LangChain'},
             {n:'scikit-learn'}, {n:'XGBoost'} ] },

  { group: 'Frontend',
    items: [ {n:'React'}, {n:'Tailwind CSS'}, {n:'Framer Motion'}, {n:'Figma'} ] },

  { group: 'Tools',
    items: [ {n:'Git & GitHub'}, {n:'Docker'}, {n:'Linux'}, {n:'VS Code'} ] }
];

/* ---------- training ---------- */
const TRAINING = [
  {
    id: 'sic',
    name: 'Big Data Track',
    org: 'Samsung Innovation Campus',
    when: 'June 2026 — present',
    current: true,
    body: 'Data engineering programme across the full pipeline: ingestion, storage, distributed ' +
          'processing, warehousing, streaming and cloud, ending in a capstone project.'
  },
  {
    id: 'depi',
    name: 'Data Analytics Track',
    org: 'Digital Egypt Pioneers Initiative (DEPI)',
    when: 'June 2025 — Jan 2026',
    body: 'Government-sponsored programme covering SQL, Power BI dashboarding and data cleaning. ' +
          'Built four dashboards applying real reporting techniques. This is where I started in data.'
  },
  {
    id: 'iti',
    name: 'Full Stack Web Development',
    org: 'Information Technology Institute (ITI)',
    when: 'Jan — Feb 2025 · 60 hrs',
    body: 'Government-accredited training in MySQL, PHP and Laravel.'
  },
  {
    id: 'icthub',
    name: 'Artificial Intelligence',
    org: 'IcTHub Egypt',
    when: 'Sept 2024 · 60 hrs',
    body: 'Hands-on machine learning. Built a spam detection model at 92% accuracy and a Gradio chatbot.'
  }
];


/* ---------- SIC syllabus ----------
   The full BD 802 agenda. Module ranges, the module I am currently in,
   and the next session are all DERIVED from these dates at page load —
   nothing here needs editing as the course runs.
   sessions: [ session#, module#, topic, ISO date, hours ]
------------------------------------------------------------------ */
const SIC = {
  name: 'Samsung Innovation Campus — Big Data',
  modules: [
    { n: 1,  name: 'Foundations & tooling' },
    { n: 2,  name: 'SQL & NoSQL' },
    { n: 3,  name: 'Distributed processing' },
    { n: 4,  name: 'Warehousing & modeling' },
    { n: 5,  name: 'Hive & ingestion' },
    { n: 6,  name: 'Streaming' },
    { n: 7,  name: 'Cloud' },
    { n: 8,  name: 'Governance & practices' },
    { n: 9,  name: 'Deploy & monitoring' },
    { n: 10, name: 'DataOps & modern stack' },
    { n: 11, name: 'Visualization' }
  ],
  sessions: [
    [1,  1,  'Introduction to Big Data',            '2026-07-26', 4],
    [2,  1,  'Linux & Git',                         '2026-07-28', 4],
    [3,  1,  'Python revision',                     '2026-07-30', 4],
    [4,  1,  'Docker',                              '2026-07-31', 4],
    [5,  2,  'SQL revision & tricks',               '2026-08-02', 4],
    [6,  2,  'NoSQL fundamentals',                  '2026-08-04', 4],
    [7,  2,  'NoSQL practical',                     '2026-08-06', 4],
    [8,  3,  'Hadoop #1',                           '2026-08-07', 4],
    [9,  3,  'Hadoop #2',                           '2026-08-09', 4],
    [10, 3,  'Spark #1',                            '2026-08-11', 4],
    [11, 3,  'Spark #2',                            '2026-08-13', 4],
    [12, 3,  'Spark #3',                            '2026-08-14', 4],
    [13, 3,  'Spark #4 — review',                   '2026-08-16', 4],
    [14, 4,  'Data warehouse fundamentals',         '2026-08-18', 4],
    [15, 4,  'Data modeling #1',                    '2026-08-20', 4],
    [16, 4,  'Data modeling #2',                    '2026-08-23', 4],
    [17, 4,  'ELT & ETL',                           '2026-08-25', 4],
    [18, 5,  'Apache Hive #1',                      '2026-08-27', 4],
    [19, 5,  'Apache Hive #2',                      '2026-08-30', 4],
    [20, 5,  'Project #1 — NiFi on a VM',           '2026-09-01', 4],
    [21, 5,  'Project #2 — on a VM',                '2026-09-03', 4],
    [22, 5,  'Capstone project #1',                 '2026-09-04', 10],
    [23, 6,  'Streaming fundamentals',              '2026-09-06', 4],
    [24, 6,  'Apache Spark Streaming',              '2026-09-08', 4],
    [25, 6,  'Apache Kafka',                        '2026-09-10', 4],
    [26, 6,  'Apache Flink',                        '2026-09-13', 4],
    [27, 7,  'Cloud fundamentals',                  '2026-09-15', 4],
    [28, 7,  'AWS cloud #1',                        '2026-09-17', 4],
    [29, 7,  'AWS cloud #2',                        '2026-09-20', 4],
    [30, 7,  'Azure cloud',                         '2026-09-22', 4],
    [31, 7,  'Databricks',                          '2026-09-24', 4],
    [32, 8,  'Data governance & security',          '2026-09-25', 4],
    [33, 8,  'Big data engineering best practices', '2026-09-27', 4],
    [34, 9,  'Deployment',                          '2026-09-29', 4],
    [35, 9,  'Monitoring fundamentals',             '2026-10-01', 4],
    [36, 9,  'Grafana',                             '2026-10-04', 4],
    [37, 10, 'DataOps & MLOps',                     '2026-10-06', 4],
    [38, 10, 'Big data trends #1',                  '2026-10-08', 4],
    [39, 10, 'Big data trends #2',                  '2026-10-11', 4],
    [40, 10, 'dbt, Airbyte & Fivetran',             '2026-10-13', 4],
    [41, 10, 'Snowflake',                           '2026-10-15', 4],
    [42, 11, 'Data visualization #1',               '2026-10-18', 4],
    [43, 11, 'Data visualization #2',               '2026-10-20', 4]
  ]
};

/* ---------- YouTube ---------- */
const YOUTUBE = {
  channelId: 'UCyrZcIzWhSUJUxpa5mzYF9w',
  handle: 'YeagX',
  url: 'https://www.youtube.com/@YeagX',

  // Replace Images/yeagx_logo.jpg with your current channel picture.
  // If the live feed loads, the real channel avatar overrides this anyway.
  logo: 'Images/yeagx_logo.jpg',

  blurb: 'I run a small tech channel. It is mostly practice at explaining something technical to ' +
         'someone who is not already in the room with me.',

  // The feed is read through a public CORS proxy and those go down sometimes.
  // Put one of your video IDs here (the part after v= in a watch URL) so the
  // player always shows a real video instead of an error.
  fallbackVideoId: 'Doi5B7cjK_0'
};

/* ---------- Clash Royale ---------- */
const CLASH = {
  updated: 'August 2025',      // just a label — update it when you update the numbers
  player: { name: 'The Honored One', tag: '#C02QGP0QV' },
  metrics: [
    { label: 'Trophies',    value: '10,000+' },
    { label: 'Battles won', value: '4,366'   },
    { label: 'King level',  value: '55'      },
    { label: 'Best streak', value: '17'      }
  ],
  deck: {
    name: 'Balloon–Prince control',
    avgElixir: 4.0,
    cards: [
      { name: 'Wizard',        elixir: 5, img: 'Images/cards/WizardCard.png' },
      { name: 'Valkyrie',      elixir: 4, img: 'Images/cards/ValkyrieCard.png' },
      { name: 'Balloon',       elixir: 5, img: 'Images/cards/BalloonCard.png' },
      { name: 'Prince',        elixir: 5, img: 'Images/cards/PrinceCard.png', fav: true },
      { name: 'Zap',           elixir: 2, img: 'Images/cards/ZapCard.png' },
      { name: 'Arrows',        elixir: 3, img: 'Images/cards/ArrowsCard.png' },
      { name: 'Skeleton Army', elixir: 3, img: 'Images/cards/SkeletonArmyCard.png' },
      { name: 'Inferno Tower', elixir: 5, img: 'Images/cards/InfernoTowerCard.png' }
    ]
  },
  note: 'Still playing. Prince is the card I trust when a match is close.'
};

/* ---------- Contact ----------
   See the README, section "Turning the contact form on".
   Get a free key at https://web3forms.com — no signup, they email it to you.
------------------------------------------------------------------ */
const WEB3FORMS_ACCESS_KEY = 'e25c9290-2e41-4eff-a88f-038053944820';
