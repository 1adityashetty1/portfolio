import { useState, useEffect, useRef, createContext, useContext } from "react";

/* ─── Theme System ──────────────────────────────── */

const THEMES = {
  dark: {
    accent: "#00E5A0",
    accentDim: "rgba(0,229,160,0.12)",
    bg: "#0A0E17",
    bgCard: "#111827",
    bgCardHover: "#1a2332",
    text: "#E2E8F0",
    textDim: "#94A3B8",
    border: "#1E293B",
    navBg: "rgba(10,14,23,0.85)",
    tagBg: "rgba(148,163,184,0.08)",
    selection: "#00E5A033",
  },
  light: {
    accent: "#0D9668",
    accentDim: "rgba(13,150,104,0.09)",
    bg: "#F8FAFB",
    bgCard: "#FFFFFF",
    bgCardHover: "#F1F5F9",
    text: "#0F172A",
    textDim: "#475569",
    border: "#E2E8F0",
    navBg: "rgba(248,250,251,0.85)",
    tagBg: "rgba(71,85,105,0.07)",
    selection: "#0D966833",
  },
};

const ThemeContext = createContext(THEMES.dark);
const ThemeToggleContext = createContext(() => {});
const MobileContext = createContext(false);

function useTheme() { return useContext(ThemeContext); }
function useToggleTheme() { return useContext(ThemeToggleContext); }
function useIsMobile() { return useContext(MobileContext); }

/* ─── Data ──────────────────────────────────────── */

const NAV_ITEMS = ["Experience", "Patents", "Education", "Skills"];

const EXPERIENCE = [
  {
    company: "Google",
    role: "Software Engineer",
    team: "Cloud Infrastructure",
    dates: "Dec 2021 – Present",
    location: "Seattle, WA",
    bullets: [
      "Technical lead for distributed storage features in cloud compute infrastructure, designing REST APIs, control plane architecture, and rollback/recovery mechanisms at scale.",
      "Led hypervisor storage qualification and performance engineering for next-generation CPU-based virtual machine platforms.",
      "Developed stochastic fuzz testing frameworks for detecting I/O loss and data corruption across distributed storage systems.",
      "Cross-functional storage lead for VM boot time optimization — instrumenting and coordinating improvements across multiple partner teams.",
      "Taught a semester-long Data Structures lab to university students through a Google.org education partnership.",
    ],
  },
  {
    company: "Tableau",
    role: "Researcher",
    team: "Hyper Database Team",
    dates: "Sep 2020 – Dec 2020",
    location: "Remote",
    bullets: [
      "Led initial research into data migration tools and frameworks enabling relations to exist simultaneously on OLTP and OLAP databases.",
      "Coordinated cross-functional stakeholders across SF Bay Area and Munich offices.",
    ],
  },
  {
    company: "Salesforce",
    role: "Member of Technical Staff",
    team: "Database Storage Engine",
    dates: "Jul 2018 – Aug 2020",
    location: "San Francisco, CA",
    bullets: [
      "Designed custom compression algorithm for truncating key data in a cloud-native KV store, reducing data footprint by 50%.",
      "Invented a Merkle Tree-based fingerprint technique for Postgres schemas, eliminating costly manual debugging of multi-hour schema upgrades.",
      "Led design and implementation of on-disk metadata structures that sped up range queries by 90%, supporting millions of queries per day.",
      "Built a Bloom Filter API native to the storage engine's architecture, optimizing data lookups and insertions to/from cold storage by up to 30% for the vast majority of queries.",
      "Wrote a custom streaming TAR API for migrating data from live storage onto S3, speeding up standby node creation by 30%.",
    ],
  },
];

const PATENTS = [
  { title: "Merges using Key Range Data Structures", id: "US12001409" },
  { title: "Database Key Compression", id: "US20220129428A1" },
  { title: "Hierarchical Schema Fingerprinting in Multitenant Row Stores", id: "US20210191903A1", note: "1st Author" },
  { title: "Building of Tries over Sorted Keys", id: "US20220129433A1" },
  { title: "Index for Multi-level Data Structures", id: "US20220245113A1" },
];

const EDUCATION = [
  {
    school: "Carnegie Mellon University",
    college: "School of Computer Science",
    degree: "M.S. Computational Data Science",
    year: "Dec 2021",
    capstone: "Offloading Block Compression in LSM KV stores to NVMe SSDs",
  },
  {
    school: "UC Berkeley",
    college: "College of Engineering",
    degree: "B.S. Electrical Engineering & Computer Science",
    year: "May 2018",
  },
];

const SKILLS = {
  Languages: ["Python", "C/C++", "Java", "R", "SQL"],
  Frameworks: ["NumPy", "Pandas", "Scikit-learn", "PyTorch", "Apache Spark"],
  Infrastructure: ["Postgres", "Apache Kafka", "Zookeeper", "Docker", "Linux", "AWS", "GCP"],
  Tools: ["Git", "gcloud CLI", "Unix"],
};

/* ─── Helpers ───────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useMobileDetect() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

const _e = ["YWRpdHlhc2hldHR5", "QGJlcmtlbGV5LmVkdQ=="];
const _p = ["MjE0LTYx", "Ni0xNDEw"];

function useObfuscated() {
  const [email, setEmail] = useState("loading...");
  const [phone, setPhone] = useState("loading...");
  useEffect(() => {
    const d = (s) => atob(s);
    setEmail(d(_e[0]) + d(_e[1]));
    setPhone(d(_p[0]) + d(_p[1]));
  }, []);
  return { email, phone };
}

/* ─── Shared Components ─────────────────────────── */

function Section({ id, children }) {
  const [ref, visible] = useInView(0.08);
  const mobile = useIsMobile();
  return (
    <section
      id={id}
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1)",
        marginBottom: mobile ? 56 : 96,
      }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ children }) {
  const t = useTheme();
  const mobile = useIsMobile();
  return (
    <h2
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: mobile ? 11 : 13,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        color: t.accent,
        marginBottom: mobile ? 24 : 40,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span style={{ display: "inline-block", width: 32, height: 1, background: t.accent }} />
      {children}
    </h2>
  );
}

/* ─── Theme Toggle ──────────────────────────────── */

function ThemeToggle() {
  const t = useTheme();
  const toggle = useToggleTheme();
  const [hovered, setHovered] = useState(false);
  const isDark = t.bg === THEMES.dark.bg;

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${hovered ? t.accent : t.border}`,
        background: hovered ? t.accentDim : "transparent",
        cursor: "pointer",
        transition: "all 0.25s ease",
        color: hovered ? t.accent : t.textDim,
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}

/* ─── Hamburger Button ────────────────────────────── */

function HamburgerBtn({ open, onClick }) {
  const t = useTheme();
  const bar = {
    display: "block",
    width: 20,
    height: 2,
    background: t.textDim,
    borderRadius: 1,
    transition: "all 0.3s ease",
  };
  return (
    <button
      onClick={onClick}
      aria-label="Toggle menu"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: open ? 0 : 5,
        justifyContent: "center",
        alignItems: "center",
        width: 36,
        height: 36,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span style={{ ...bar, transform: open ? "rotate(45deg) translate(2px, 2px)" : "none" }} />
      <span style={{ ...bar, opacity: open ? 0 : 1 }} />
      <span style={{ ...bar, transform: open ? "rotate(-45deg) translate(2px, -2px)" : "none" }} />
    </button>
  );
}

/* ─── Nav ─────────────────────────────────────────── */

function Nav() {
  const t = useTheme();
  const mobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: mobile ? "0 20px" : "0 clamp(24px, 5vw, 64px)",
          height: 64,
          background: scrolled || menuOpen ? t.navBg : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
          borderBottom: scrolled ? `1px solid ${t.border}` : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 16,
            color: t.accent,
            letterSpacing: "0.04em",
          }}
        >
          AS
        </span>

        {mobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <HamburgerBtn open={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: t.textDim,
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = t.accent)}
                onMouseLeave={(e) => (e.target.style.color = t.textDim)}
              >
                {item}
              </a>
            ))}
            <ThemeToggle />
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {mobile && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            background: t.navBg,
            backdropFilter: "blur(16px)",
            borderBottom: menuOpen ? `1px solid ${t.border}` : "none",
            maxHeight: menuOpen ? 300 : 0,
            opacity: menuOpen ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s ease, opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            padding: menuOpen ? "12px 20px 20px" : "0 20px",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: t.textDim,
                textDecoration: "none",
                letterSpacing: "0.08em",
                padding: "14px 0",
                borderBottom: `1px solid ${t.border}`,
                transition: "color 0.2s",
              }}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Pixel Art ─────────────────────────────────── */

const PX = 5;

const UFO_GRID = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,3,1,1,3,1,1,0,0],
  [0,2,2,2,2,2,2,2,2,2,2,0],
  [2,2,2,2,2,2,2,2,2,2,2,2],
  [0,4,0,6,0,5,0,4,0,6,0,5],
];

const FLOWER_GRID = [
  [0,0,0,0,9,9,0,0,0,0],
  [0,0,0,9,9,9,9,0,0,0],
  [0,0,9,9,5,5,9,9,0,0],
  [0,0,0,9,9,9,9,0,0,0],
  [0,0,0,0,9,9,0,0,0,0],
  [0,0,0,0,7,7,0,0,0,0],
  [0,0,0,0,7,7,0,0,0,0],
  [0,0,8,8,7,7,0,0,0,0],
  [0,0,0,0,7,7,0,0,0,0],
  [0,0,0,0,7,7,8,8,0,0],
  [0,0,0,0,7,7,0,0,0,0],
  [0,0,0,0,7,7,0,0,0,0],
  ["A","A","A","A","A","A","A","A","A","A"],
];

function PixelArt() {
  const t = useTheme();
  const mobile = useIsMobile();
  const isDark = t.bg === THEMES.dark.bg;

  const colorMap = isDark
    ? { 1: t.accent, 2: "#9CA3AF", 3: "#1a1a2e", 4: "#FF6B6B", 5: "#FBBF24", 6: "#60A5FA" }
    : { 5: "#FBBF24", 7: "#22C55E", 8: "#16A34A", 9: "#F472B6", A: "#92400E" };

  const grid = isDark ? UFO_GRID : FLOWER_GRID;
  const cols = Math.max(...grid.map((r) => r.length));
  const px = mobile ? 3 : PX;

  return (
    <div
      style={{
        position: mobile ? "relative" : "absolute",
        right: mobile ? undefined : "clamp(24px, 8vw, 120px)",
        bottom: mobile ? undefined : (isDark ? 120 : 60),
        margin: mobile ? "32px auto 0" : undefined,
        animation: isDark ? "ufo-float 4s ease-in-out infinite" : "flower-sway 6s ease-in-out infinite",
        transformOrigin: isDark ? "center" : "bottom center",
        opacity: 0.85,
        pointerEvents: "none",
        width: mobile ? "fit-content" : undefined,
      }}
    >
      {isDark &&
        [
          { x: -20, y: -10, d: 0 },
          { x: 70, y: -25, d: 0.8 },
          { x: -15, y: 40, d: 1.6 },
          { x: 80, y: 20, d: 0.4 },
          { x: 30, y: -30, d: 1.2 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x * (mobile ? 0.6 : 1),
              top: s.y * (mobile ? 0.6 : 1),
              width: px,
              height: px,
              background: "#fff",
              animation: `star-twinkle 2s ${s.d}s ease-in-out infinite`,
            }}
          />
        ))}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${px}px)`,
          gap: 0,
          animation: !isDark ? "flower-grow 1.5s ease-out forwards" : undefined,
          transformOrigin: "bottom",
        }}
      >
        {grid.flat().map((cell, i) => {
          const color = colorMap[cell];
          const isLight = isDark && [4, 5, 6].includes(cell);
          return (
            <div
              key={i}
              style={{
                width: px,
                height: px,
                background: color || "transparent",
                animation: isLight
                  ? `ufo-lights 1.5s ${(i % 4) * 0.2}s ease-in-out infinite`
                  : !isDark && cell === 9
                  ? `flower-bloom 0.8s ${0.8 + (i % 5) * 0.1}s ease-out both`
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {isDark && (
        <div
          style={{
            width: cols * px * 0.5,
            height: mobile ? 30 : 50,
            margin: "0 auto",
            background: `linear-gradient(to bottom, ${t.accent}44, transparent)`,
            clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
            animation: "ufo-beam 2s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────── */

function Hero() {
  const t = useTheme();
  const mobile = useIsMobile();
  const [loaded, setLoaded] = useState(false);
  const { email, phone } = useObfuscated();
  useEffect(() => {
    const t2 = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t2);
  }, []);

  const stagger = (i) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.8s ${i * 0.12}s cubic-bezier(.16,1,.3,1), transform 0.8s ${i * 0.12}s cubic-bezier(.16,1,.3,1)`,
  });

  return (
    <header
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: mobile ? "80px 20px 40px" : "0 clamp(24px, 5vw, 64px)",
        maxWidth: 900,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${t.border} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.4,
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 60% 60% at 30% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 30% 50%, black 20%, transparent 70%)",
        }}
      />
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: mobile ? 12 : 13,
          color: t.accent,
          marginBottom: mobile ? 12 : 16,
          letterSpacing: "0.08em",
          ...stagger(0),
        }}
      >
        Hi, I'm
      </p>
      <h1
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: mobile ? 42 : "clamp(48px, 8vw, 80px)",
          fontWeight: 400,
          color: t.text,
          lineHeight: 1.05,
          marginBottom: mobile ? 16 : 24,
          ...stagger(1),
        }}
      >
        Aditya Shetty.
      </h1>
      <p
        style={{
          fontSize: mobile ? 13 : 16,
          lineHeight: 1.5,
          color: t.textDim,
          maxWidth: 560,
          marginBottom: mobile ? 28 : 40,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.04em",
          ...stagger(2),
        }}
      >
        Distributed Systems | Data Storage Systems | Cloud Infrastructure
      </p>
      <div style={{
        display: "flex",
        gap: mobile ? 10 : 20,
        flexWrap: "wrap",
        flexDirection: mobile ? "column" : "row",
        ...stagger(3),
      }}>
        <ContactPill icon="✉" text={email} href={email !== "loading..." ? `mailto:${email}` : undefined} />
        <ContactPill icon="in" text="LinkedIn" href="https://linkedin.com/in/aditya-shetty" />
        <ContactPill icon="☎" text={phone} />
      </div>

      <PixelArt />

      {!mobile && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "clamp(24px, 5vw, 64px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            ...stagger(4),
          }}
        >
          <div
            style={{
              width: 1,
              height: 48,
              background: `linear-gradient(to bottom, ${t.accent}, transparent)`,
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: t.textDim,
              letterSpacing: "0.1em",
            }}
          >
            SCROLL
          </span>
        </div>
      )}
    </header>
  );
}

function ContactPill({ icon, text, href }) {
  const t = useTheme();
  const mobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const Tag = href ? "a" : "span";
  return (
    <Tag
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: mobile ? "10px 14px" : "10px 18px",
        borderRadius: 8,
        border: `1px solid ${hovered ? t.accent : t.border}`,
        background: hovered ? t.accentDim : "transparent",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: mobile ? 12 : 13,
        color: hovered ? t.accent : t.textDim,
        textDecoration: "none",
        transition: "all 0.25s ease",
        cursor: href ? "pointer" : "default",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      {text}
    </Tag>
  );
}

/* ─── Experience Card ───────────────────────────── */

function ExperienceCard({ data }) {
  const t = useTheme();
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered || open ? t.accent + "44" : t.border}`,
        borderRadius: 12,
        background: hovered ? t.bgCardHover : t.bgCard,
        padding: mobile ? "20px 16px" : "28px 32px",
        marginBottom: mobile ? 12 : 16,
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => setOpen(!open)}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3,
          height: "100%",
          background: t.accent,
          opacity: open ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: mobile ? "flex-start" : "flex-start",
          gap: 8,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: mobile ? 19 : 22,
              fontWeight: 400,
              color: t.text,
              marginBottom: 4,
            }}
          >
            {data.role}
          </h3>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: mobile ? 12 : 13,
              color: t.accent,
              marginBottom: 2,
            }}
          >
            {data.company}{" "}
            <span style={{ color: t.textDim, fontWeight: 400 }}>— {data.team}</span>
          </p>
        </div>
        <div style={{ textAlign: mobile ? "left" : "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: mobile ? 11 : 12, color: t.textDim }}>
            {data.dates}
          </p>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: mobile ? 12 : 13, color: t.textDim, opacity: 0.7 }}>
            {data.location}
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: mobile ? 10 : 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: t.textDim,
          letterSpacing: "0.06em",
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
            color: t.accent,
          }}
        >
          ▸
        </span>
        {open ? "COLLAPSE" : "EXPAND DETAILS"}
      </div>
      <div
        style={{
          maxHeight: open ? 800 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(.16,1,.3,1), opacity 0.4s ease",
        }}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0 0" }}>
          {data.bullets.map((b, i) => (
            <li
              key={i}
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: mobile ? 14 : 15,
                lineHeight: 1.7,
                color: t.textDim,
                padding: mobile ? "6px 0 6px 16px" : "8px 0 8px 20px",
                borderLeft: `1px solid ${t.border}`,
                marginLeft: 4,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -3,
                  top: mobile ? 13 : 15,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: t.accent,
                }}
              />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Patent Card ───────────────────────────────── */

function PatentCard({ data }) {
  const t = useTheme();
  const mobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`https://patents.google.com/patent/${data.id}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        padding: mobile ? "16px 14px" : "20px 24px",
        borderRadius: 10,
        border: `1px solid ${hovered ? t.accent + "44" : t.border}`,
        background: hovered ? t.bgCardHover : t.bgCard,
        textDecoration: "none",
        transition: "all 0.25s ease",
        transform: hovered && !mobile ? "translateX(6px)" : "none",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: mobile ? 14 : 16,
              color: t.text,
              marginBottom: 6,
              lineHeight: 1.4,
            }}
          >
            {data.title}
            {data.note && (
              <span
                style={{
                  marginLeft: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: t.accent,
                  background: t.accentDim,
                  padding: "2px 8px",
                  borderRadius: 4,
                  verticalAlign: "middle",
                }}
              >
                {data.note}
              </span>
            )}
          </p>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: mobile ? 10 : 12,
            color: t.textDim,
            wordBreak: "break-all",
          }}>
            {data.id}
          </p>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: hovered ? t.accent : t.textDim,
            transition: "color 0.2s",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          ↗
        </span>
      </div>
    </a>
  );
}

/* ─── Education Card ────────────────────────────── */

function EducationCard({ data }) {
  const t = useTheme();
  const mobile = useIsMobile();
  return (
    <div
      style={{
        padding: mobile ? "18px 16px" : "24px 28px",
        borderRadius: 10,
        border: `1px solid ${t.border}`,
        background: t.bgCard,
        marginBottom: 12,
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div>
          <h3
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: mobile ? 18 : 20,
              fontWeight: 400,
              color: t.text,
              marginBottom: 4,
            }}
          >
            {data.school}
          </h3>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: mobile ? 13 : 14, color: t.accent, marginBottom: 2 }}>
            {data.degree}
          </p>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: mobile ? 12 : 13, color: t.textDim }}>
            {data.college}
          </p>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: t.textDim }}>
          {data.year}
        </p>
      </div>
      {data.capstone && (
        <p
          style={{
            marginTop: 14,
            padding: mobile ? "10px 12px" : "12px 16px",
            borderRadius: 6,
            background: t.accentDim,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: mobile ? 11 : 12,
            color: t.accent,
            lineHeight: 1.5,
          }}
        >
          Capstone: {data.capstone}
        </p>
      )}
    </div>
  );
}

/* ─── Skills ────────────────────────────────────── */

function SkillsSection() {
  const mobile = useIsMobile();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
        gap: mobile ? 12 : 16,
      }}
    >
      {Object.entries(SKILLS).map(([category, items]) => (
        <SkillGroup key={category} category={category} items={items} />
      ))}
    </div>
  );
}

function SkillGroup({ category, items }) {
  const t = useTheme();
  const mobile = useIsMobile();
  return (
    <div
      style={{
        padding: mobile ? "16px 14px" : "20px 24px",
        borderRadius: 10,
        border: `1px solid ${t.border}`,
        background: t.bgCard,
      }}
    >
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: t.accent,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: mobile ? 10 : 14,
        }}
      >
        {category}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((skill) => (
          <SkillTag key={skill} name={skill} />
        ))}
      </div>
    </div>
  );
}

function SkillTag({ name }) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: 6,
        fontSize: 13,
        fontFamily: "'Source Sans 3', sans-serif",
        background: hovered ? t.accentDim : t.tagBg,
        color: hovered ? t.accent : t.textDim,
        border: `1px solid ${hovered ? t.accent + "33" : "transparent"}`,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
    >
      {name}
    </span>
  );
}

/* ─── Footer ────────────────────────────────────── */

function Footer() {
  const t = useTheme();
  const mobile = useIsMobile();
  return (
    <footer
      style={{
        borderTop: `1px solid ${t.border}`,
        padding: mobile ? "28px 20px" : "40px clamp(24px, 5vw, 64px)",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: mobile ? "flex-start" : "center",
        gap: 12,
      }}
    >
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: t.textDim }}>
        © {new Date().getFullYear()} Aditya Shetty
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: t.textDim,
          opacity: 0.5,
        }}
      >
        Seattle, WA · U.S. Citizen
      </span>
    </footer>
  );
}

/* ─── App ───────────────────────────────────────── */

export default function Portfolio() {
  const [mode, setMode] = useState("dark");
  const mobile = useMobileDetect();
  const theme = THEMES[mode];
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeToggleContext.Provider value={toggle}>
        <MobileContext.Provider value={mobile}>
          <div
            style={{
              background: theme.bg,
              color: theme.text,
              minHeight: "100vh",
              fontFamily: "'Source Sans 3', sans-serif",
              overflowX: "hidden",
              transition: "background 0.4s ease, color 0.4s ease",
            }}
          >
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html { scroll-behavior: smooth; scroll-padding-top: 80px; }
              body { background: ${theme.bg}; transition: background 0.4s ease; }
              ::selection { background: ${theme.selection}; color: ${theme.text}; }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
              @keyframes ufo-float {
                0%, 100% { transform: translateY(0) rotate(-2deg); }
                50% { transform: translateY(-12px) rotate(2deg); }
              }
              @keyframes ufo-beam {
                0%, 100% { opacity: 0.15; }
                50% { opacity: 0.4; }
              }
              @keyframes ufo-lights {
                0%, 100% { opacity: 1; }
                33% { opacity: 0.3; }
                66% { opacity: 0.7; }
              }
              @keyframes flower-grow {
                0% { transform: scaleY(0); transform-origin: bottom; }
                100% { transform: scaleY(1); transform-origin: bottom; }
              }
              @keyframes flower-bloom {
                0% { transform: scale(0) rotate(-30deg); opacity: 0; }
                60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
              }
              @keyframes flower-sway {
                0%, 100% { transform: rotate(-2deg); }
                50% { transform: rotate(2deg); }
              }
              @keyframes star-twinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
              }
              ::-webkit-scrollbar { width: 6px; }
              ::-webkit-scrollbar-track { background: ${theme.bg}; }
              ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
              ::-webkit-scrollbar-thumb:hover { background: ${theme.textDim}; }
            `}</style>

            <Nav />
            <Hero />

            <main
              style={{
                maxWidth: 840,
                margin: "0 auto",
                padding: mobile ? "0 20px 60px" : "0 clamp(24px, 5vw, 64px) 80px",
              }}
            >
              <Section id="experience">
                <SectionTitle>Experience</SectionTitle>
                {EXPERIENCE.map((exp) => (
                  <ExperienceCard key={exp.company} data={exp} />
                ))}
              </Section>

              <Section id="patents">
                <SectionTitle>Patents</SectionTitle>
                {PATENTS.map((p) => (
                  <PatentCard key={p.id} data={p} />
                ))}
              </Section>

              <Section id="education">
                <SectionTitle>Education</SectionTitle>
                {EDUCATION.map((e) => (
                  <EducationCard key={e.school} data={e} />
                ))}
              </Section>

              <Section id="skills">
                <SectionTitle>Skills</SectionTitle>
                <SkillsSection />
              </Section>
            </main>

            <Footer />
          </div>
        </MobileContext.Provider>
      </ThemeToggleContext.Provider>
    </ThemeContext.Provider>
  );
}
