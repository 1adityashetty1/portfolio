import { useState, useEffect, useRef, createContext, useContext } from "react";

/* ─── Theme System ──────────────────────────────── */

const THEMES = {
  dark: {
    accent: "#5EE6C0",
    accentDim: "rgba(94,230,192,0.14)",
    // Layered atmospheric background — glass needs something rich to refract
    bg: "#070B14",
    bgGradient: "radial-gradient(120% 80% at 20% 0%, #122033 0%, #0A1120 45%, #070B14 100%)",
    // Glass surfaces: translucent fills that let the backdrop bleed through
    glassFill: "rgba(255,255,255,0.06)",
    glassFillHover: "rgba(255,255,255,0.10)",
    glassBorder: "rgba(255,255,255,0.14)",
    glassBorderHover: "rgba(94,230,192,0.45)",
    // Specular highlight — the bright top edge that reads as a light catch
    specular: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 18%, transparent 40%)",
    glassShadow: "0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
    glassShadowHover: "0 16px 48px rgba(0,0,0,0.50), 0 4px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.18)",
    text: "#EDF2F7",
    textDim: "#9FB0C3",
    navBg: "rgba(12,18,30,0.55)",
    tagBg: "rgba(255,255,255,0.05)",
    selection: "#5EE6C040",
    blur: 24,
  },
  light: {
    accent: "#0E8C6A",
    accentDim: "rgba(14,140,106,0.10)",
    bg: "#EAF0F5",
    bgGradient: "radial-gradient(120% 80% at 20% 0%, #FFFFFF 0%, #E8EFF6 45%, #DDE6EF 100%)",
    glassFill: "rgba(255,255,255,0.55)",
    glassFillHover: "rgba(255,255,255,0.72)",
    glassBorder: "rgba(255,255,255,0.70)",
    glassBorderHover: "rgba(14,140,106,0.40)",
    specular: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 16%, transparent 38%)",
    glassShadow: "0 8px 32px rgba(31,45,61,0.12), 0 2px 8px rgba(31,45,61,0.08), inset 0 1px 0 rgba(255,255,255,0.90)",
    glassShadowHover: "0 16px 48px rgba(31,45,61,0.18), 0 4px 16px rgba(31,45,61,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
    text: "#0F1E2E",
    textDim: "#51647A",
    navBg: "rgba(255,255,255,0.45)",
    tagBg: "rgba(15,30,46,0.05)",
    selection: "#0E8C6A33",
    blur: 20,
  },
};

const ThemeContext = createContext(THEMES.dark);
const ThemeToggleContext = createContext(() => {});
const MobileContext = createContext(false);

function useTheme() { return useContext(ThemeContext); }
function useToggleTheme() { return useContext(ThemeToggleContext); }
function useIsMobile() { return useContext(MobileContext); }

/* Reusable Liquid Glass surface style.
   `hovered` swaps to brighter fill + stronger border/shadow + lift.
   `interactive` controls whether hover lift is applied. */
function glassStyle(t, { hovered = false, radius = 20, lift = true } = {}) {
  return {
    position: "relative",
    background: hovered ? t.glassFillHover : t.glassFill,
    backdropFilter: `blur(${t.blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${t.blur}px) saturate(180%)`,
    border: `1px solid ${hovered ? t.glassBorderHover : t.glassBorder}`,
    borderRadius: radius,
    boxShadow: hovered ? t.glassShadowHover : t.glassShadow,
    transform: hovered && lift ? "translateY(-2px)" : "translateY(0)",
    transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
    overflow: "hidden",
  };
}

/* The specular highlight overlay — a bright top sheen that reads as
   light catching the edge of glass. Drop inside any glass surface. */
function Specular({ radius = 20 }) {
  const t = useTheme();
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius,
        background: t.specular,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}

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
        width: 38,
        height: 38,
        borderRadius: 12,
        background: hovered ? t.glassFillHover : t.glassFill,
        backdropFilter: `blur(${t.blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${t.blur}px) saturate(180%)`,
        border: `1px solid ${hovered ? t.glassBorderHover : t.glassBorder}`,
        boxShadow: hovered ? t.glassShadowHover : t.glassShadow,
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
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
          top: mobile ? 12 : 16,
          left: mobile ? 12 : "50%",
          right: mobile ? 12 : "auto",
          transform: mobile ? "none" : "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: mobile ? 0 : 28,
          padding: mobile ? "10px 16px" : "10px 14px 10px 24px",
          height: 56,
          width: mobile ? "auto" : "min(720px, calc(100vw - 48px))",
          background: t.navBg,
          backdropFilter: `blur(${t.blur}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${t.blur}px) saturate(180%)`,
          border: `1px solid ${t.glassBorder}`,
          borderRadius: 999,
          boxShadow: scrolled
            ? t.glassShadowHover
            : t.glassShadow,
          transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
          overflow: "hidden",
        }}
      >
        <Specular radius={999} />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 16,
            color: t.accent,
            letterSpacing: "0.04em",
            position: "relative",
          }}
        >
          AS
        </span>

        {mobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <ThemeToggle />
            <HamburgerBtn open={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 28, alignItems: "center", position: "relative" }}>
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
            top: 76,
            left: 12,
            right: 12,
            zIndex: 99,
            background: t.navBg,
            backdropFilter: `blur(${t.blur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${t.blur}px) saturate(180%)`,
            border: menuOpen ? `1px solid ${t.glassBorder}` : "1px solid transparent",
            borderRadius: 24,
            boxShadow: menuOpen ? t.glassShadow : "none",
            maxHeight: menuOpen ? 320 : 0,
            opacity: menuOpen ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s cubic-bezier(.16,1,.3,1), opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            padding: menuOpen ? "8px 20px 16px" : "0 20px",
          }}
        >
          {NAV_ITEMS.map((item, idx) => (
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
                borderBottom: idx < NAV_ITEMS.length - 1 ? `1px solid ${t.glassBorder}` : "none",
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

/* ─── Scroll Companion ──────────────────────────── */

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

/* Tiny pixel grid renderer used by the scroll companion */
function MiniPixelGrid({ grid, colorMap, px }) {
  const cols = Math.max(...grid.map((r) => r.length));
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${px}px)`, gap: 0 }}>
      {grid.flat().map((cell, i) => (
        <div
          key={i}
          style={{
            width: px,
            height: px,
            background: colorMap[cell] || "transparent",
          }}
        />
      ))}
    </div>
  );
}

function ScrollCompanion() {
  const t = useTheme();
  const mobile = useIsMobile();
  const progress = useScrollProgress();
  const isDark = t.bg === THEMES.dark.bg;

  if (mobile) return null;

  const trackHeight = 70; // vh units for the travel range
  const ufoY = progress * trackHeight;

  const ufoColors = { 1: t.accent, 2: "#9CA3AF", 3: "#1a1a2e", 4: "#FF6B6B", 5: "#FBBF24", 6: "#60A5FA" };
  const flowerHeadColors = { 5: "#FBBF24", 9: "#F472B6" };

  const MINI_UFO = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,3,3,1,1,0],
    [2,2,2,2,2,2,2,2],
    [0,4,6,5,4,6,5,0],
  ];

  const MINI_FLOWER_HEAD = [
    [0,0,9,9,0,0],
    [0,9,5,5,9,0],
    [9,9,5,5,9,9],
    [0,9,9,9,9,0],
    [0,0,9,9,0,0],
  ];

  /* Root path segments - each is an SVG path that "draws" in based on scroll progress */
  const rootSegments = [
    // main taproot
    { d: "M 20 0 L 20 200", len: 200, start: 0, end: 0.6 },
    // left branch 1
    { d: "M 20 40 Q 10 55 4 75", len: 45, start: 0.1, end: 0.35 },
    // right branch 1
    { d: "M 20 60 Q 30 75 38 90", len: 40, start: 0.15, end: 0.4 },
    // left branch 2
    { d: "M 20 100 Q 8 115 2 140", len: 50, start: 0.25, end: 0.5 },
    // right branch 2
    { d: "M 20 130 Q 32 145 40 165", len: 45, start: 0.3, end: 0.55 },
    // left tendril deep
    { d: "M 20 160 Q 5 180 0 210", len: 55, start: 0.4, end: 0.7 },
    // right tendril deep
    { d: "M 20 175 Q 35 195 42 220", len: 55, start: 0.45, end: 0.75 },
    // left tiny
    { d: "M 4 75 Q 0 85 2 95", len: 22, start: 0.35, end: 0.55 },
    // right tiny
    { d: "M 38 90 Q 42 100 40 112", len: 24, start: 0.4, end: 0.6 },
    // deep center continuation
    { d: "M 20 200 Q 18 230 20 260", len: 60, start: 0.6, end: 0.85 },
    // deep left
    { d: "M 20 230 Q 6 250 0 275", len: 55, start: 0.65, end: 0.9 },
    // deep right
    { d: "M 20 240 Q 36 260 44 280", len: 55, start: 0.7, end: 0.95 },
    // final deep tap
    { d: "M 20 260 Q 22 280 20 310", len: 50, start: 0.8, end: 1.0 },
  ];

  if (isDark) {
    /* ─── UFO drifting down ─── */
    // Stars that appear in the wake
    const numStars = 12;
    const stars = Array.from({ length: numStars }, (_, i) => ({
      y: (i / numStars) * trackHeight,
      x: 10 + Math.sin(i * 2.3) * 16,
      delay: i * 0.15,
      size: (i % 3 === 0) ? 3 : 2,
    }));

    return (
      <div
        style={{
          position: "fixed",
          right: 36,
          top: "10vh",
          width: 60,
          height: `${trackHeight}vh`,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Beam trail line */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 2,
            height: `${ufoY}vh`,
            background: `linear-gradient(to bottom, transparent, ${t.accent}22, ${t.accent}44)`,
            transform: "translateX(-50%)",
            transition: "height 0.1s linear",
          }}
        />

        {/* Wake stars */}
        {stars.map((s, i) => {
          const visible = (s.y / trackHeight) < progress;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x,
                top: `${s.y}vh`,
                width: s.size,
                height: s.size,
                borderRadius: "50%",
                background: t.accent,
                opacity: visible ? 0.6 : 0,
                transition: "opacity 0.5s ease",
                animation: visible ? `star-twinkle 2s ${s.delay}s ease-in-out infinite` : "none",
              }}
            />
          );
        })}

        {/* Scanning dots below UFO */}
        {[0, 1, 2].map((i) => (
          <div
            key={`scan-${i}`}
            style={{
              position: "absolute",
              left: "50%",
              top: `calc(${ufoY}vh + ${28 + i * 10}px)`,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: t.accent,
              opacity: 0.3 + (i * 0.1),
              transform: "translateX(-50%)",
              animation: `ufo-beam 1.5s ${i * 0.3}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* UFO */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${ufoY}vh`,
            transform: `translateX(-50%) rotate(${Math.sin(progress * Math.PI * 4) * 3}deg)`,
            transition: "top 0.1s linear",
          }}
        >
          <MiniPixelGrid grid={MINI_UFO} colorMap={ufoColors} px={4} />
          {/* Mini beam under UFO */}
          <div
            style={{
              width: 16,
              height: 12,
              margin: "0 auto",
              background: `linear-gradient(to bottom, ${t.accent}33, transparent)`,
              clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)",
              animation: "ufo-beam 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    );
  }

  /* ─── Flower with growing roots ─── */
  return (
    <div
      style={{
        position: "fixed",
        right: 32,
        top: "12vh",
        width: 60,
        zIndex: 10,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Flower head */}
      <div style={{ animation: "flower-sway 5s ease-in-out infinite" }}>
        <MiniPixelGrid grid={MINI_FLOWER_HEAD} colorMap={flowerHeadColors} px={4} />
      </div>

      {/* Stem + roots SVG */}
      <svg
        width="44"
        height="320"
        viewBox="0 0 44 320"
        style={{ overflow: "visible", marginTop: -1 }}
      >
        {/* Stem */}
        <line
          x1="20" y1="0" x2="20" y2="16"
          stroke="#22C55E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Soil line */}
        <line
          x1="0" y1="16" x2="44" y2="16"
          stroke="#92400E"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Soil dots */}
        {[4, 12, 24, 32, 40].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={18 + (i % 2) * 3}
            r="1.5"
            fill="#92400E"
            opacity="0.4"
          />
        ))}

        {/* Root segments that draw in based on scroll */}
        <g transform="translate(2, 20)">
          {rootSegments.map((seg, i) => {
            const segProgress = Math.max(0, Math.min(1, (progress - seg.start) / (seg.end - seg.start)));
            const dashOffset = seg.len * (1 - segProgress);
            return (
              <path
                key={i}
                d={seg.d}
                fill="none"
                stroke="#92400E"
                strokeWidth={i < 2 ? 2.5 : i < 6 ? 1.8 : 1.2}
                strokeLinecap="round"
                strokeDasharray={seg.len}
                strokeDashoffset={dashOffset}
                opacity={segProgress > 0 ? 0.4 + segProgress * 0.4 : 0}
                style={{ transition: "stroke-dashoffset 0.15s linear, opacity 0.3s ease" }}
              />
            );
          })}

          {/* Root tip nodes that appear as roots reach them */}
          {[
            { x: 2, y: 95, at: 0.55 },
            { x: 40, y: 112, at: 0.6 },
            { x: 0, y: 210, at: 0.7 },
            { x: 42, y: 220, at: 0.75 },
            { x: 0, y: 275, at: 0.9 },
            { x: 44, y: 280, at: 0.95 },
            { x: 20, y: 310, at: 1.0 },
          ].map((tip, i) => {
            const visible = progress >= tip.at;
            return (
              <circle
                key={i}
                cx={tip.x}
                cy={tip.y}
                r={visible ? 2.5 : 0}
                fill="#92400E"
                opacity={visible ? 0.6 : 0}
                style={{ transition: "r 0.4s ease, opacity 0.4s ease" }}
              />
            );
          })}
        </g>
      </svg>
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
          backgroundImage: `radial-gradient(${t.glassBorder} 1px, transparent 1px)`,
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
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: mobile ? "11px 16px" : "11px 20px",
        borderRadius: 999,
        background: hovered ? t.glassFillHover : t.glassFill,
        backdropFilter: `blur(${t.blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${t.blur}px) saturate(180%)`,
        border: `1px solid ${hovered ? t.glassBorderHover : t.glassBorder}`,
        boxShadow: hovered ? t.glassShadowHover : t.glassShadow,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: mobile ? 12 : 13,
        color: hovered ? t.accent : t.textDim,
        textDecoration: "none",
        transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
        cursor: href ? "pointer" : "default",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <Specular radius={999} />
      <span style={{ fontSize: 14, flexShrink: 0, position: "relative" }}>{icon}</span>
      <span style={{ position: "relative" }}>{text}</span>
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
        ...glassStyle(t, { hovered: hovered || open, radius: mobile ? 20 : 26 }),
        padding: mobile ? "20px 16px" : "28px 32px",
        marginBottom: mobile ? 12 : 16,
        cursor: "pointer",
      }}
      onClick={() => setOpen(!open)}
    >
      <Specular radius={mobile ? 20 : 26} />
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
          position: "relative",
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
          position: "relative",
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
          position: "relative",
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
                borderLeft: `1px solid ${t.glassBorder}`,
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
        ...glassStyle(t, { hovered, radius: mobile ? 16 : 20, lift: false }),
        display: "block",
        padding: mobile ? "16px 14px" : "20px 24px",
        textDecoration: "none",
        transform: hovered && !mobile ? "translateX(6px)" : "translateX(0)",
        marginBottom: 12,
      }}
    >
      <Specular radius={mobile ? 16 : 20} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
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
        ...glassStyle(t, { radius: mobile ? 16 : 20, lift: false }),
        padding: mobile ? "18px 16px" : "24px 28px",
        marginBottom: 12,
      }}
    >
      <Specular radius={mobile ? 16 : 20} />
      <div style={{
        position: "relative",
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
            position: "relative",
            marginTop: 14,
            padding: mobile ? "10px 12px" : "12px 16px",
            borderRadius: 10,
            background: t.accentDim,
            border: `1px solid ${t.glassBorder}`,
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
        ...glassStyle(t, { radius: mobile ? 16 : 20, lift: false }),
        padding: mobile ? "16px 14px" : "20px 24px",
      }}
    >
      <Specular radius={mobile ? 16 : 20} />
      <p
        style={{
          position: "relative",
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
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 8 }}>
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
        padding: "6px 13px",
        borderRadius: 999,
        fontSize: 13,
        fontFamily: "'Source Sans 3', sans-serif",
        background: hovered ? t.accentDim : t.tagBg,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: hovered ? t.accent : t.textDim,
        border: `1px solid ${hovered ? t.glassBorderHover : t.glassBorder}`,
        transition: "all 0.25s cubic-bezier(.16,1,.3,1)",
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
        borderTop: `1px solid ${t.glassBorder}`,
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
              backgroundImage: theme.bgGradient,
              backgroundAttachment: "fixed",
              color: theme.text,
              minHeight: "100vh",
              fontFamily: "'Source Sans 3', sans-serif",
              overflowX: "hidden",
              transition: "background 0.5s ease, color 0.5s ease",
              position: "relative",
            }}
          >
            {/* Ambient color orbs — give the glass something rich to refract */}
            <div
              aria-hidden
              style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: "8%",
                left: "12%",
                width: 380,
                height: 380,
                borderRadius: "50%",
                background: theme.accent,
                opacity: mode === "dark" ? 0.10 : 0.14,
                filter: "blur(90px)",
                animation: "orb-drift-a 22s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute",
                top: "45%",
                right: "8%",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: mode === "dark" ? "#4F7CFF" : "#7AA8FF",
                opacity: mode === "dark" ? 0.10 : 0.16,
                filter: "blur(100px)",
                animation: "orb-drift-b 26s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute",
                bottom: "10%",
                left: "30%",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: mode === "dark" ? "#B45EFF" : "#E0A0FF",
                opacity: mode === "dark" ? 0.08 : 0.13,
                filter: "blur(100px)",
                animation: "orb-drift-c 30s ease-in-out infinite",
              }} />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html { scroll-behavior: smooth; scroll-padding-top: 90px; }
              body { background: ${theme.bg}; transition: background 0.5s ease; }
              ::selection { background: ${theme.selection}; color: ${theme.text}; }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
              @keyframes orb-drift-a {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(40px, 30px) scale(1.1); }
              }
              @keyframes orb-drift-b {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(-50px, 40px) scale(0.9); }
              }
              @keyframes orb-drift-c {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(30px, -40px) scale(1.15); }
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
              ::-webkit-scrollbar { width: 7px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: ${theme.glassBorder}; border-radius: 4px; }
              ::-webkit-scrollbar-thumb:hover { background: ${theme.textDim}; }
            `}</style>

            <Nav />
            <ScrollCompanion />
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
          </div>
        </MobileContext.Provider>
      </ThemeToggleContext.Provider>
    </ThemeContext.Provider>
  );
}
