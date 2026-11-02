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
  title:   'Open to work — data engineering',
  status:  'Available now',
  short:   'Open to data engineering roles',
  when:    'November 2026',
  where:   'Cairo · remote',
  body:    'The degree finished in June 2026 and the Samsung Innovation Campus big data track in October, ' +
           'so for the first time in four years I am not enrolled in anything. What I want next is a data ' +
           'engineering role: ingestion, warehousing and orchestration, and the tests that say whether the ' +
           'numbers can be trusted.',
  tools:   ['Apache Kafka', 'Apache Spark', 'Snowflake', 'dbt', 'Apache Airflow', 'Apache Hive'],
  note: {
    h: 'The latest thing I shipped',
    p: 'Smart Grid Monitor, the SIC graduation project: a streaming pipeline over 100,000 simulated smart ' +
       'meters that found all 25 planted grid threats with no false alarms. I owned the cloud setup, the ' +
       'end-to-end integration, the Airflow orchestration and the serving layer. It is the first project ' +
       'in the list below.'
  }
};

/* ---------- what came before this, newest first ---------- */
const PAST = [
  {
    role:    'Big Data Engineering Track — full time',
    company: 'Samsung Innovation Campus',
    when:    'June — Oct 2026',
    note:    '43 four-hour sessions across the whole pipeline, three a week. ' +
             'It produced the first two projects below: the churn pipeline as the capstone, and Smart Grid ' +
             'Monitor as the graduation project.',
    tools:   ['Hadoop / HDFS', 'Apache Spark', 'Apache Hive', 'Apache NiFi', 'Apache Kafka', 'Snowflake']
  },
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

/* ---------- data engineering projects ----------
   gauge: the figures the build is judged on, printed as a readout
   strip under the header. Real numbers from the linked repo only —
   v is the figure, k says what it counts.
--------------------------------------------------------------- */
const WORK = [
  {
    id: 'grid',
    name: 'Smart Grid Monitor',
    sub: 'Smart meters → Kafka → S3 lake → Snowflake → alerts',
    meta: 'SIC graduation project · 2026 · four-person team',
    lead: 'A streaming pipeline that watches 100,000 simulated smart electricity meters across Cairo and ' +
          'Giza and flags three threats to the grid: electricity theft, transformer overload and line ' +
          'drop. I owned the cloud, the integration that joined the four parts end to end, the ' +
          'orchestration and the serving layer.',
    gauge: [
      { v: '100,000', k: 'smart meters on 500 transformers' },
      { v: '9.65M',   k: 'readings streamed through Kafka, 0 failed' },
      { v: '25 / 25', k: 'planted threats found, 0 false alarms' },
      { v: '15 min',  k: 'Airflow cycle, clean → load → test' }
    ],
    blocks: [
      { h: 'The question',
        p: 'Where is power being stolen, where is a transformer overheating, and where is the voltage ' +
           'too low to run anything — every 15 minutes, for a whole city? Real meter data is private, so ' +
           'the team wrote a simulator that builds the grid, plants 25 problems in it, and writes an ' +
           'answer key the pipeline never sees. Accuracy is measured against that key, not assumed.' },
      { h: 'The flow',
        p: 'Kafka carries meter and transformer readings into Spark Structured Streaming. Bronze on S3 ' +
           'keeps every message exactly as it arrived, with its topic, partition and offset. Silver is ' +
           'Delta Lake, de-duplicated with MERGE, with rejected rows sent to a dead-letter queue along ' +
           'with the reason. Snowflake loads it with COPY INTO, and dbt builds an SCD2 snapshot, a star ' +
           'schema, the three checks and the KPIs.' },
      { h: 'My part',
        p: 'The AWS and Snowflake setup, and joining four people’s parts into one run. The Airflow DAG ' +
           'repeats the batch half every 15 minutes — clean, load, snapshot, model, test — behind 15 dbt ' +
           'tests, plus one that fails on purpose to prove the gate stops a bad run. Then the four-page ' +
           'Power BI dashboard, the web app’s Snowflake integration and pages, and the technical ' +
           'documentation.' },
      { h: 'What it found',
        p: 'All 25 planted threats, with no false alarms and none missed: 100% precision and recall ' +
           'against the answer key. 24 hours of meter data streams through in about 80 minutes. The ' +
           'rules are tuned to the simulator’s patterns, though, and real meters would need them tuned ' +
           'again.' }
    ],
    stack: ['Apache Kafka', 'Apache Spark', 'Delta Lake', 'AWS S3', 'Snowflake', 'dbt',
            'Apache Airflow', 'SCD Type 2', 'Star schema', 'Power BI', 'Docker', 'Python'],
    links: [
      { label: 'Pipeline & web app', url: 'https://github.com/yeagx/smart-grid-monitor' }
    ]
  },
  {
    id: 'churn',
    name: 'Customer Churn Pipeline',
    sub: 'Four sources → zoned data lake → Hive star schema',
    meta: 'SIC capstone · 2026 · four-person team',
    lead: 'An end-to-end big data pipeline for bank customer churn. Four disconnected sources land in a ' +
          'zoned HDFS lake, get cleaned and enriched with PySpark, and are served as a partitioned ' +
          'star-schema dimension through Hive. I owned the warehouse, the KPI layer and the orchestration.',
    gauge: [
      { v: '4 → 1',  k: 'sources into one Hive warehouse' },
      { v: '2,037',  k: 'churned customers, reconciled exactly' },
      { v: '6m 37s', k: 'idempotent run, end to end' },
      { v: '4.0×',   k: 'churn lift in the 50 riskiest customers' }
    ],
    blocks: [
      { h: 'The question',
        p: 'Who is leaving, and what do they have in common? The answer needed four systems that did not ' +
           'talk to each other: customer records in MySQL, support tickets and marketing offers as CSV, ' +
           'and usage activity as JSON Lines. 10,000 customers, 2,037 of them churned.' },
      { h: 'The lake',
        p: 'HDFS split into four zones, each with one job. Raw is immutable and never edited, so it stays ' +
           'the audit trail. Clean is typed, deduplicated and referentially valid. Warehouse is ' +
           'feature-enriched and partitioned. Reject quarantines bad rows with the reason attached, ' +
           'rather than dropping them silently.' },
      { h: 'My part',
        p: 'The Hive layer and the orchestration. An external Parquet dim_customer at one row per ' +
           'customer, 21 columns, partitioned by geography, with SCD-2 columns carried on it. The monthly ' +
           'churn KPI is a window function rather than a correlated subquery, which Hive will not take in ' +
           'a SELECT list, and it computes the whole running series in one pass. Every stage overwrites, ' +
           'so the run is idempotent and reconciles to the same 2,037 churned every time.' },
      { h: 'What it found',
        p: 'Germany churns at roughly twice the rate of France and Spain — 32.4% against 16.2% and 16.7% ' +
           '— on the same product at the same prices. A random forest over the warehouse scores 0.7997 ' +
           'ROC AUC, and its riskiest decile churns at 67% against a 20.3% baseline.' }
    ],
    stack: ['Hadoop / HDFS', 'Apache Spark', 'Apache Hive', 'Sqoop', 'Apache NiFi', 'Parquet', 'MySQL',
            'Star schema', 'SCD Type 2', 'scikit-learn', 'Streamlit'],
    links: [
      { label: 'Pipeline & warehouse', url: 'https://github.com/yeagx/sic-churn-data-pipeline' }
    ]
  },
  {
    id: 'f1',
    name: 'F1 Performance Warehouse',
    sub: 'Race data → star schema → champion predictor',
    meta: 'DEPI graduation project · 2025–2026 · six-person team',
    lead: 'Four seasons of Formula 1 race data (2018–2021), cleaned in two passes, modeled into a star ' +
          'schema, then ' +
          'used for both dashboards and a model that predicts the season champion.',
    gauge: [
      { v: '2',      k: 'cleaning passes before anything was derived' },
      { v: '3',      k: 'fact grains in one star schema' },
      { v: '6',      k: 'engineered metrics the source lacked' },
      { v: '70–85%', k: 'champion-prediction accuracy' }
    ],
    blocks: [
      { h: 'Cleaning',
        p: 'The source was one wide table with contradictions in it. First pass fixed invalid pit times ' +
           'and normalised tire-compound naming. Second pass enforced the rule that stints = pit stops + 1, ' +
           'which exposed broken final-stint values. Only once that held did I derive anything on top.' },
      { h: 'The model',
        p: 'A star schema at three grains: Fact_PitStops per event, DriverRace per race, DriverSeason per ' +
           'season. Dimensions for driver, constructor, race and season. Three grains on purpose — the ' +
           'dashboards read the race grain, the predictor reads the season grain, from one warehouse.' },
      { h: 'What I added',
        p: 'Metrics that were not in the source: point efficiency, pit-stop gap against the field, per-lap ' +
           'aggression, driver consistency, wet versus dry compound strength, and team tire-strategy patterns.' },
      { h: 'My part',
        p: 'A six-person team, and I worked across the pipeline rather than owning one stage of it: ' +
           'the two cleaning passes, the star schema, the engineered metrics and the predictor. The ' +
           'schema design is the part I took most out of — it is why I went looking for warehouse work.' },
      { h: 'The prediction',
        p: 'An XGBoost classifier over DriverSeason using average finish, aggression score, pit efficiency ' +
           'and constructor performance, scoring 70–85% across historical seasons.' }
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
    gauge: [
      { v: 'A+', k: 'graduation project grade' },
      { v: '3',  k: 'user roles, Figma to shipped' },
      { v: '7',  k: 'people across four disciplines' }
    ],
    blocks: [
      { h: 'What it does',
        p: 'Students upload course material and ask questions against it. Answers come back grounded in ' +
           'their own documents rather than from a general model, with subject-specific tutors and a ' +
           'multi-role admin dashboard behind it.' },
      { h: 'My part',
        p: 'Design and frontend: React 19, Vite, Tailwind CSS and Framer Motion, from the Figma work ' +
           'through to the shipped interface, including the analytics and admin views for three ' +
           'different user roles.' },
      { h: 'The data side',
        p: 'The retrieval layer is a document pipeline, and the chunking is structure-aware rather ' +
           'than a fixed window: tables come out as intact Markdown, and section headings are ' +
           'detected by font size and prepended to each chunk as breadcrumbs. Chunks are embedded ' +
           'into PostgreSQL with pgvector, stamped with their material and page, and every answer ' +
           'cites the slide it came from.' }
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
    items: [ {n:'PostgreSQL'}, {n:'MySQL'}, {n:'Snowflake'}, {n:'dbt'}, {n:'pgvector'}, {n:'Star schema'},
             {n:'Dimensional modeling'}, {n:'SCD Type 2'}, {n:'ETL / ELT'}, {n:'Sqoop'}, {n:'Parquet'}, {n:'Apache Hive'},
             {n:'NoSQL'} ] },

  { group: 'Big data',
    items: [ {n:'Apache Spark'}, {n:'Hadoop / HDFS'}, {n:'Apache Kafka'}, {n:'Delta Lake'},
             {n:'Apache NiFi'}, {n:'Apache Airflow'}, {n:'AWS S3'},
             {n:'Databricks'} ] },

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

/* ---------- training ----------
   current: true  → a programme still running (its plate takes the live offset)
--------------------------------------------------------------- */
const TRAINING = [
  {
    id: 'sic',
    name: 'Big Data Engineering Track',
    org: 'Samsung Innovation Campus',
    when: 'June — Oct 2026 · 43 sessions',
    body: 'Full time, across the whole pipeline: Linux, Docker and SQL/NoSQL first, then Hadoop and ' +
          'Spark, warehousing and dimensional modeling, Hive and NiFi, streaming on Kafka and Flink, ' +
          'AWS, Azure and Databricks, governance and monitoring, dbt and Snowflake, and data visualization to close. ' +
          'Finished with the churn capstone and Smart Grid Monitor as the graduation project.'
  },
  {
    id: 'depi',
    name: 'Data Analytics Track',
    org: 'Digital Egypt Pioneers Initiative (DEPI)',
    when: 'June 2025 — Jan 2026',
    body: 'Government-sponsored programme covering SQL, Power BI dashboarding and data cleaning. ' +
          'Built four dashboards applying real reporting techniques, and finished it with the Formula 1 ' +
          'warehouse as the graduation project. This is where I started in data.'
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


/* ---------- YouTube ---------- */
const YOUTUBE = {
  channelId: 'UCyrZcIzWhSUJUxpa5mzYF9w',
  handle: 'YeagX',
  url: 'https://www.youtube.com/@YeagX',

  // Kept current automatically: scripts/youtube-sync.js saves the channel
  // picture over this file whenever it changes. The channel id itself is
  // also set in api/_youtube.js — change both together.
  logo: 'Images/yeagx_logo.jpg',

  blurb: 'I run a small tech channel. It is mostly practice at explaining something technical to ' +
         'someone who is not already in the room with me.',

  // Last resort only, if both the saved snapshot (data/youtube.js) and the
  // live endpoint fail — which in practice means the snapshot file is missing.
  // One of your video IDs: the part after v= in a watch URL.
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
