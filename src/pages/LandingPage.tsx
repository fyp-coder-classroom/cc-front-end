import {
  type CSSProperties,
  type FC,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CodeIcon, CheckIcon } from "../components/ui/Icons";
import { FEATURES, ROLES_INFO } from "../data/mockData";
import CodeEditorPreview from "../components/landing/CodeEditorPreview";

/* ------------------------------------------------------------------ */
/* Design system for this page                                         */
/*                                                                     */
/* Radius  : 12 controls · 16 inner panels · 28 stages · 32 deck cards */
/* Depth   : inset top highlight on raised surfaces; heavy shadow only */
/*           on the hero frame and the feature deck                    */
/* Motif   : faint engineering grid + corner ticks + code-line bars    */
/* Pattern : hero = showcase                                           */
/*           features = pinned scroll deck (one big card per step)     */
/*           roles = split panel that leans toward the hovered side    */
/* Motion  : one hero entrance, scroll-linked deck, scroll reveals,    */
/*           pointer-following light. Reduced motion gets a plain,     */
/*           static, fully readable layout.                            */
/* ------------------------------------------------------------------ */

const STYLES = `
@keyframes lp-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes lp-line{from{transform:translateY(108%)}to{transform:none}}
@keyframes lp-frame{from{opacity:0;transform:translateY(32px) scale(.975)}to{opacity:1;transform:none}}

.lp-rise{animation:lp-rise .8s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0ms)}
.lp-mask{display:block;overflow:hidden;padding-bottom:.14em;margin-bottom:-.14em}
.lp-mask>span{display:block;animation:lp-line 1s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0ms)}
.lp-frame-in{animation:lp-frame 1.2s cubic-bezier(.2,.8,.2,1) .3s both}

.lp-reveal{opacity:0;transform:translateY(18px);transition:opacity .8s cubic-bezier(.2,.8,.2,1) var(--d,0ms),transform .8s cubic-bezier(.2,.8,.2,1) var(--d,0ms)}
.lp-reveal[data-visible="true"]{opacity:1;transform:none}
.lp-perk{opacity:0;transform:translateX(-10px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i,0)*80ms + 380ms)}
.lp-reveal[data-visible="true"] .lp-perk{opacity:1;transform:none}

/*
  Scroll deck. --t (continuous step index) is written by JS on the wrapper;
  each card derives its own offset d = i - t:
    d > 0  : still waiting, slides up from below
    d = 0  : in front
    d < 0  : recedes behind (scales down, shifts up, fades out)
*/
.lp-deck-card{--d:calc(var(--i) - var(--t,0));z-index:var(--i);transform-origin:50% 0;pointer-events:none;will-change:transform,opacity;
  transform:translateY(calc(clamp(0, var(--d), 1.2) * 112% + clamp(0, -1 * var(--d), 2) * -22px)) scale(calc(1 - clamp(0, -1 * var(--d), 2) * 0.045));
  opacity:calc((1 - clamp(0, (var(--d) - 1) * 5, 1)) * (1 - clamp(0, -1 * var(--d), 2) * 0.35) * (1 - clamp(0, (-1 * var(--d) - 1.5) * 2, 1)))}
.lp-rail-fill{transform-origin:center top;transform:scaleY(var(--p,0))}

/* Cursor-following spotlight + lit border. Colour comes from currentColor. */
.lp-spot{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .35s ease;
  background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,currentColor var(--spot-a,9%),transparent),transparent 70%)}
.lp-spot::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;
  background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,currentColor 65%,transparent),transparent 65%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude}
.lp-host:hover>.lp-spot,.lp-host:focus-within>.lp-spot{opacity:1}

/* Engineering grid */
.lp-grid,.lp-grid-lit{position:absolute;inset:0;pointer-events:none;background-size:56px 56px}
.lp-grid{background-image:linear-gradient(to right,rgba(240,239,244,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(240,239,244,.04) 1px,transparent 1px);
  -webkit-mask-image:radial-gradient(75% 80% at 70% 28%,#000,transparent);mask-image:radial-gradient(75% 80% at 70% 28%,#000,transparent)}
.lp-grid-lit{background-image:linear-gradient(to right,rgba(240,239,244,.17) 1px,transparent 1px),linear-gradient(to bottom,rgba(240,239,244,.17) 1px,transparent 1px);
  -webkit-mask-image:radial-gradient(260px circle at var(--hx,70%) var(--hy,28%),#000,transparent 72%);mask-image:radial-gradient(260px circle at var(--hx,70%) var(--hy,28%),#000,transparent 72%);
  opacity:var(--lit,0);transition:opacity .5s ease}

@media (prefers-reduced-motion:reduce){
  .lp-rise,.lp-mask>span,.lp-frame-in{animation:none}
  .lp-reveal,.lp-perk{opacity:1;transform:none;transition:none}
  .lp-grid-lit{display:none}
}
`;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const primaryButton = `inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_2px_rgba(0,0,0,0.45)] transition duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_2px_rgba(0,0,0,0.45),0_14px_34px_-10px_rgba(240,239,244,0.45)] motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing} focus-visible:ring-primary/70`;

const secondaryButton = `inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-200 hover:border-border-strong hover:bg-primary/[0.05] hover:text-text ${focusRing} focus-visible:ring-border-strong`;

/* ----------------------------- helpers ------------------------------ */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Writes the pointer position (relative to the element) as --mx / --my. */
const trackPointer = (e: ReactPointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const useReveal = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
};

const Reveal: FC<{
  children: ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-visible={visible}
      className={`lp-reveal ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
};

/** Cursor-following light. Parent needs `lp-host relative` + onPointerMove. */
const Spotlight: FC<{ tone?: string; soft?: boolean }> = ({
  tone = "text-text",
  soft = false,
}) => (
  <div
    aria-hidden="true"
    className={`lp-spot ${tone} ${soft ? "[--spot-a:4%]" : ""}`}
  />
);

/* ------------------------- hero product frame ----------------------- */

const ProductFrame: FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 3.5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 5).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="lp-frame-in relative w-full xl:-mr-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-3.5 -top-3.5 hidden h-3 w-3 border-l border-t border-border-strong sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3.5 -top-3.5 hidden h-3 w-3 border-r border-t border-border-strong sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3.5 -left-3.5 hidden h-3 w-3 border-b border-l border-border-strong sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3.5 -right-3.5 hidden h-3 w-3 border-b border-r border-border-strong sm:block"
      />

      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{
          transform:
            "perspective(1600px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
          transition: "transform .6s cubic-bezier(.2,.8,.2,1)",
        }}
        className="lp-host relative rounded-[28px] border border-border bg-surface p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_40px_80px_-30px_rgba(0,0,0,0.7)] will-change-transform"
      >
        <Spotlight soft />

        <div className="overflow-hidden rounded-[20px] border border-border bg-editor-bg">
          <CodeEditorPreview />
        </div>

        <dl className="grid grid-cols-2 divide-x divide-border px-1 pb-1 pt-3">
          <div className="flex items-center justify-between gap-3 px-3">
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Active classes
            </dt>
            <dd className="text-sm font-semibold tabular-nums tracking-[-0.02em] text-text">
              12
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 px-3">
            <dt className="text-xs text-text-muted">Review queue</dt>
            <dd className="text-sm font-semibold tabular-nums tracking-[-0.02em] text-text">
              03
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

/* ------------------------------ features ---------------------------- */

type Feature = (typeof FEATURES)[number];

/** Max number of cards in the scroll deck. Lower = shorter scroll. */
const DECK_LIMIT = 4;
/** Scroll distance per step, in svh. */
const STEP_SVH = 42;
/** Portion of each step where the card sits still (split front/back). */
const DWELL = 0.12;

const DECK: Feature[] = FEATURES.slice(0, DECK_LIMIT);

/**
 * Optional richer copy. If you later add `points: string[]` to an entry in
 * FEATURES, the card renders it as a checklist automatically. Nothing is
 * invented here: with the current data the field is simply absent.
 */
type FeatureExtras = { points?: string[] };

const FeaturesHeader: FC<{ stacked?: boolean }> = ({ stacked = false }) => (
  <div
    className={
      stacked
        ? ""
        : "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
    }
  >
    <h2
      id="features-heading"
      className="max-w-xl text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-text sm:text-[2.5rem]"
    >
      Everything you need.
      <span className="block text-text-muted">In one place.</span>
    </h2>
    <p
      className={`max-w-sm text-sm leading-relaxed text-text-muted sm:text-[15px] ${
        stacked ? "mt-4 lg:mt-5" : ""
      }`}
    >
      CoderClassroom brings key workflow tools together so you can focus on
      teaching.
    </p>
  </div>
);

/* ---- card visuals: small, believable product UI. Same tokens as the rest
        of the page (border / surface / editor-bg / primary / success). ---- */

const panel =
  "w-full overflow-hidden rounded-2xl border border-border bg-editor-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

/** Window chrome shared by every visual: three dots, a title, an optional slot. */
const Chrome: FC<{ title: string; right?: ReactNode }> = ({ title, right }) => (
  <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
    <span className="flex gap-1.5" aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-border-strong" />
      <span className="h-2 w-2 rounded-full bg-border-strong" />
      <span className="h-2 w-2 rounded-full bg-border-strong" />
    </span>
    <span className="truncate text-xs font-medium text-text-muted">
      {title}
    </span>
    {right && <span className="ml-auto flex items-center gap-2">{right}</span>}
  </div>
);

const Pill: FC<{
  tone: "primary" | "success" | "muted";
  children: ReactNode;
}> = ({ tone, children }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${
      tone === "primary"
        ? "border-primary/25 bg-primary/10 text-primary"
        : tone === "success"
          ? "border-success/25 bg-success/10 text-success"
          : "border-border bg-surface text-text-muted"
    }`}
  >
    {children}
  </span>
);

const Avatar: FC<{
  letter: string;
  tone?: "primary" | "success" | "muted";
}> = ({ letter, tone = "muted" }) => (
  <span
    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-inset ${
      tone === "primary"
        ? "bg-primary/10 text-primary ring-primary/25"
        : tone === "success"
          ? "bg-success/10 text-success ring-success/25"
          : "bg-surface text-text-muted ring-border-strong"
    }`}
  >
    {letter}
  </span>
);

/* Tiny syntax palette, built only from existing tokens. */
type Tok = [text: string, cls?: string];
const K = "text-primary"; // keyword
const F = "text-success"; // function / call
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const C = "text-text-muted"; // comment / punctuation

const CODE: Tok[][] = [
  [["def ", K], ["two_sum", F], ["(nums, target):"]],
  [["    seen = {}"]],
  [
    ["    for ", K],
    ["i, n ", undefined],
    ["in ", K],
    ["enumerate", F],
    ["(nums):"],
  ],
  [["        need = target - n"]],
  [["        if ", K], ["need ", undefined], ["in ", K], ["seen:"]],
  [["            return ", K], ["[seen[need], i]"]],
  [["        seen[n] = i"]],
  [["    return ", K], ["[]"]],
];

const CodeBlock: FC<{
  hot?: number;
  marks?: Record<number, ReactNode>;
  from?: number;
  to?: number;
}> = ({ hot, marks, from = 0, to = CODE.length }) => (
  <div className="py-2 font-mono text-[12px] leading-6 sm:text-[13px]">
    {CODE.slice(from, to).map((line, idx) => {
      const n = from + idx;
      const isHot = n === hot;
      return (
        <div
          key={n}
          className={`flex items-center gap-4 px-4 ${
            isHot
              ? "bg-primary/[0.07] shadow-[inset_2px_0_0_0_rgba(240,239,244,0.55)]"
              : ""
          }`}
        >
          <span className="w-4 flex-shrink-0 select-none text-right tabular-nums text-text-muted/60">
            {n + 1}
          </span>
          <span className="whitespace-pre text-text-secondary">
            {line.map(([t, cls], ti) => (
              <span key={ti} className={cls}>
                {t}
              </span>
            ))}
          </span>
          {marks?.[n] && <span className="ml-auto">{marks[n]}</span>}
        </div>
      );
    })}
  </div>
);

/** 0 · The in-browser editor: file tab, real code, run + test result. */
const EditorVisual: FC<{ i: number }> = () => (
  <div className={panel}>
    <Chrome
      title="two_sum.py"
      right={
        <span className="inline-flex h-6 items-center rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          Run
        </span>
      }
    />
    <CodeBlock hot={5} />
    <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-2.5">
      <span className="flex items-center gap-2 text-xs text-text-muted">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/10 text-success ring-1 ring-inset ring-success/25 [&>svg]:h-2.5 [&>svg]:w-2.5">
          <CheckIcon />
        </span>
        3 of 4 tests passed
      </span>
      <span className="font-mono text-[11px] tabular-nums text-text-muted">
        12 ms
      </span>
    </div>
  </div>
);

/** 1 · Teacher review: a comment pinned to a line, with a reply. */
const ReviewVisual: FC<{ i: number }> = () => (
  <div className={panel}>
    <Chrome
      title="Review · two_sum.py"
      right={<Pill tone="primary">2 comments</Pill>}
    />
    <CodeBlock from={3} to={7} hot={4} />
    <div className="space-y-3 border-t border-border bg-surface p-4">
      <div className="flex gap-3">
        <Avatar letter="T" tone="primary" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-text">Teacher</span>
            <span className="text-text-muted">on line 5</span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-text-secondary">
            Nice use of a hash map. What happens when the list is empty?
          </p>
        </div>
      </div>
      <div className="flex gap-3 pl-10">
        <Avatar letter="A" />
        <div className="min-w-0 flex-1 rounded-xl border border-border bg-editor-bg px-3 py-2 text-[13px] leading-5 text-text-muted">
          Reply…
        </div>
      </div>
      <div className="flex items-center gap-2 pl-10">
        <span className="inline-flex h-7 items-center rounded-lg border border-border px-3 text-xs font-medium text-text-muted">
          Reply
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-3 text-xs font-medium text-success">
          Resolve
        </span>
      </div>
    </div>
  </div>
);

/** 2 · Gradebook: real rows, score bars, letter grades. */
const GRADES = [
  { n: "Aisha K.", s: 94, g: "A" },
  { n: "Daniel M.", s: 82, g: "B" },
  { n: "Priya S.", s: 76, g: "C" },
  { n: "Omar R.", s: 68, g: "D" },
];

const GradeVisual: FC<{ i: number }> = () => (
  <div className={panel}>
    <Chrome
      title="Gradebook · Two Sum"
      right={<Pill tone="success">Avg 80%</Pill>}
    />
    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border px-4 py-2 text-[11px] font-medium text-text-muted">
      <span>Student</span>
      <span className="w-24 sm:w-32">Score</span>
      <span className="w-8 text-right">Grade</span>
    </div>
    <ul className="divide-y divide-border">
      {GRADES.map((r, idx) => (
        <li
          key={r.n}
          className={`grid grid-cols-[1fr_auto_auto] items-center gap-x-4 px-4 py-3 ${
            idx === 0 ? "bg-primary/[0.05]" : ""
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <Avatar letter={r.n[0]} tone={idx === 0 ? "primary" : "muted"} />
            <span className="truncate text-[13px] font-medium text-text">
              {r.n}
            </span>
          </span>
          <span className="flex w-24 items-center gap-2 sm:w-32">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong">
              <span
                className={`block h-full rounded-full ${
                  idx === 0 ? "bg-primary" : "bg-text-muted/60"
                }`}
                style={{ width: `${r.s}%` }}
              />
            </span>
            <span className="w-7 text-right font-mono text-[11px] tabular-nums text-text-muted">
              {r.s}
            </span>
          </span>
          <span className="w-8 text-right text-[13px] font-semibold text-text">
            {r.g}
          </span>
        </li>
      ))}
    </ul>
    <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2.5 text-xs text-text-muted">
      <span>4 of 12 graded</span>
      <span className="font-mono tabular-nums">Out of 100</span>
    </div>
  </div>
);

/** 3 · Submissions queue: filter tabs, names, assignment, time, status. */
const QUEUE = [
  { n: "Aisha K.", a: "Two Sum", t: "2m ago", s: "To review" },
  { n: "Daniel M.", a: "Two Sum", t: "9m ago", s: "To review" },
  { n: "Priya S.", a: "Binary Search", t: "1h ago", s: "Reviewed" },
  { n: "Omar R.", a: "Binary Search", t: "3h ago", s: "Reviewed" },
];

const QueueVisual: FC<{ i: number }> = () => (
  <div className={panel}>
    <Chrome title="Submissions" />
    <div className="flex items-center gap-1 border-b border-border px-3 py-2">
      {[
        { l: "All", c: "04", on: false },
        { l: "To review", c: "02", on: true },
        { l: "Reviewed", c: "02", on: false },
      ].map((tab) => (
        <span
          key={tab.l}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
            tab.on
              ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25"
              : "text-text-muted"
          }`}
        >
          {tab.l}
          <span className="font-mono tabular-nums opacity-70">{tab.c}</span>
        </span>
      ))}
    </div>
    <ul className="divide-y divide-border">
      {QUEUE.map((r) => {
        const open = r.s === "To review";
        return (
          <li
            key={r.n + r.a}
            className={`flex items-center gap-3 px-4 py-3 ${
              open ? "bg-primary/[0.05]" : ""
            }`}
          >
            <Avatar letter={r.n[0]} tone={open ? "primary" : "muted"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text">
                {r.n}
              </p>
              <p className="truncate text-xs text-text-muted">{r.a}</p>
            </div>
            <span className="hidden text-xs tabular-nums text-text-muted sm:block">
              {r.t}
            </span>
            <Pill tone={open ? "primary" : "success"}>{r.s}</Pill>
          </li>
        );
      })}
    </ul>
  </div>
);

const VISUALS: FC<{ i: number }>[] = [
  EditorVisual,
  ReviewVisual,
  GradeVisual,
  QueueVisual,
];

/* ---------------------------- card + deck --------------------------- */

const FeatureSlide: FC<{ f: Feature; i: number; deck?: boolean }> = ({
  f,
  i,
  deck = false,
}) => {
  const points = (f as unknown as FeatureExtras).points;
  const Visual = VISUALS[i % VISUALS.length];
  const flip = i % 2 === 1;

  // Inherits --d from .lp-deck-card; the visual drifts against the card as it
  // enters and leaves, which is what sells the "moving down" feeling.
  const drift = (px: number): CSSProperties | undefined =>
    deck
      ? {
          transform: `translateY(calc(clamp(-1, var(--d, 0), 1) * ${px}px))`,
        }
      : undefined;

  return (
    <article
      style={deck ? ({ "--i": i } as CSSProperties) : undefined}
      className={`overflow-hidden rounded-[32px] border border-border bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_70px_-30px_rgba(0,0,0,0.65)] ${
        deck ? "lp-deck-card absolute inset-0" : "relative"
      }`}
    >
      <div aria-hidden="true" className="lp-grid" />
      <span
        aria-hidden="true"
        style={drift(-70)}
        className={`pointer-events-none absolute -bottom-12 hidden select-none text-[13rem] font-semibold leading-none tracking-[-0.06em] text-border md:block ${
          flip ? "left-6" : "right-6"
        }`}
      >
        {String(i + 1).padStart(2, "0")}
      </span>

      <div
        className={`relative grid gap-8 p-7 sm:p-10 lg:p-12 md:grid-cols-2 ${
          deck ? "h-full" : "min-h-[340px]"
        }`}
      >
        <div
          className={`flex flex-col justify-between gap-8 ${
            flip ? "md:order-2" : ""
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:h-14 sm:w-14 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
            <CodeIcon />
          </div>

          <div>
            <h3 className="max-w-[16ch] text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-text [text-wrap:balance] sm:text-4xl lg:text-5xl">
              {f.title}
            </h3>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-text-muted sm:text-lg">
              {f.desc}
            </p>

            {points && points.length > 0 && (
              <ul className="mt-6 space-y-3">
                {points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-sm leading-5 text-text-secondary sm:text-[15px]"
                  >
                    <span className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/25 [&>svg]:h-3 [&>svg]:w-3">
                      <CheckIcon />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`hidden items-center md:flex ${flip ? "md:order-1" : ""}`}
        >
          <div className="w-full" style={drift(36)}>
            <Visual i={i} />
          </div>
        </div>
      </div>
    </article>
  );
};

const smoothstep = (x: number) => {
  const s = Math.min(1, Math.max(0, x));
  return s * s * (3 - 2 * s);
};

/**
 * The section pins to the viewport while the page scrolls through it. Scroll
 * progress drives a continuous step index; each card slides up over the last
 * one. Fewer cards, less scroll per card, and only a brief dwell keep it from
 * feeling like a blockade. Scroll position is written to CSS variables outside
 * React, so scrolling never triggers re-renders except when the active step
 * changes.
 */
const PinnedFeatures: FC = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = DECK.length;

  useEffect(() => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    if (!outer || !sticky || total < 1) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const span = outer.offsetHeight - sticky.offsetHeight;
      const p =
        span > 0
          ? Math.min(1, Math.max(0, -outer.getBoundingClientRect().top / span))
          : 0;
      const u = p * (total - 1);
      const k = Math.min(Math.floor(u), total - 1);
      // Short rest at the start/end of every step, ease through the rest.
      const t = Math.min(
        total - 1,
        k + smoothstep((u - k - DWELL) / (1 - DWELL * 2)),
      );
      outer.style.setProperty("--t", t.toFixed(4));
      outer.style.setProperty("--p", p.toFixed(4));
      setActive(Math.round(t));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [total]);

  const jumpTo = (idx: number) => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    if (!outer || !sticky || total < 2) return;
    const span = outer.offsetHeight - sticky.offsetHeight;
    const top =
      window.scrollY +
      outer.getBoundingClientRect().top +
      (idx / (total - 1)) * span;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative border-y border-border bg-surface"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />

      {/* STEP_SVH of scroll per step, plus one screen to pin in */}
      <div
        ref={outerRef}
        style={{ height: `${100 + (total - 1) * STEP_SVH}svh` }}
        className="relative"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-[100svh] overflow-hidden px-4 pb-8 pt-24 sm:px-6 lg:px-10 lg:pb-12 lg:pt-28"
        >
          <div className="mx-auto grid h-full max-w-[88rem] grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:grid-rows-1 lg:gap-12">
            {/* Left: heading + step index */}
            <div className="flex flex-col lg:justify-center">
              <FeaturesHeader stacked />

              {/* Mobile: compact step bars */}
              <div className="mt-5 flex items-center gap-1.5 lg:hidden">
                {DECK.map((f, i) => (
                  <button
                    key={f.title}
                    type="button"
                    aria-label={f.title}
                    aria-current={i === active ? "step" : undefined}
                    onClick={() => jumpTo(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${focusRing} focus-visible:ring-primary/60 ${
                      i === active
                        ? "w-8 bg-primary"
                        : "w-4 bg-border-strong hover:bg-text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Desktop: step list with scroll-linked rail */}
              <ol className="relative mt-10 hidden lg:block">
                <div
                  aria-hidden="true"
                  className="absolute bottom-5 left-[5px] top-5 w-px bg-border"
                >
                  <div className="lp-rail-fill h-full w-px bg-primary" />
                </div>
                {DECK.map((f, i) => {
                  const isActive = i === active;
                  return (
                    <li key={f.title}>
                      <button
                        type="button"
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => jumpTo(i)}
                        className={`relative flex h-10 w-full items-center gap-5 text-left text-[15px] transition-colors duration-300 ${focusRing} focus-visible:ring-primary/60 ${
                          isActive
                            ? "font-medium text-text"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`relative z-10 h-[11px] w-[11px] flex-shrink-0 rounded-full border transition-all duration-300 ${
                            isActive
                              ? "scale-125 border-primary bg-primary"
                              : "border-border-strong bg-surface"
                          }`}
                        />
                        <span className="truncate">{f.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Right: the deck */}
            <div className="relative min-h-0">
              {DECK.map((f, i) => (
                <FeatureSlide key={f.title} f={f} i={i} deck />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Reduced-motion fallback: same big cards, plain vertical flow, no pinning. */
const StaticFeatures: FC = () => (
  <section
    id="features"
    aria-labelledby="features-heading"
    className="relative border-y border-border bg-surface px-4 py-24 sm:px-6"
  >
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
    />
    <div className="mx-auto max-w-[88rem]">
      <div className="mb-14">
        <FeaturesHeader />
      </div>
      <div className="grid gap-6">
        {DECK.map((f, i) => (
          <FeatureSlide key={f.title} f={f} i={i} />
        ))}
      </div>
    </div>
  </section>
);

const FeaturesSection: FC = () => {
  const [pinned] = useState(() => !prefersReducedMotion());
  return pinned ? <PinnedFeatures /> : <StaticFeatures />;
};

/* ----------------------------- role split --------------------------- */

const RoleSplit: FC<{ onSignup: (role: string) => void }> = ({ onSignup }) => {
  const [focus, setFocus] = useState<number | null>(null);
  const cols = ROLES_INFO.map((_, i) => (focus === i ? "1.2fr" : "1fr")).join(
    " ",
  );

  return (
    <div
      style={{ "--cols": cols } as CSSProperties}
      className="grid grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-border bg-border shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] lg:transition-[grid-template-columns] lg:duration-500 lg:ease-[cubic-bezier(.2,.8,.2,1)] lg:[grid-template-columns:var(--cols)] motion-reduce:transition-none"
    >
      {ROLES_INFO.map((r, i) => {
        const isTeacher = r.role === "Teacher";
        const dim = focus !== null && focus !== i;

        return (
          <div
            key={r.role}
            onPointerMove={trackPointer}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setFocus(i);
            }}
            onPointerLeave={() => setFocus(null)}
            onFocus={() => setFocus(i)}
            onBlur={() => setFocus(null)}
            className="lp-host relative flex min-w-0 flex-col bg-background p-8 sm:p-10"
          >
            <Spotlight
              tone={isTeacher ? "text-primary" : "text-success"}
              soft
            />

            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b to-transparent ${
                isTeacher ? "from-primary/[0.07]" : "from-success/[0.07]"
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
                isTeacher ? "via-primary/60" : "via-success/60"
              }`}
            />

            <div
              className={`relative flex flex-1 flex-col transition-opacity duration-500 ${
                dim ? "opacity-55" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-2xl font-semibold tracking-[-0.03em] text-text">
                  {r.role}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    isTeacher
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-success/25 bg-success/10 text-success"
                  }`}
                >
                  {isTeacher ? "Instructor" : "Learner"}
                </span>
              </div>

              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-text-secondary sm:text-[17px]">
                {r.desc}
              </p>

              <div className="my-8 h-px bg-border" />

              <ul className="space-y-4">
                {r.perks.map((perk, pi) => (
                  <li
                    key={perk}
                    style={{ "--i": pi } as CSSProperties}
                    className="lp-perk flex items-start gap-3 text-sm leading-5 text-text-secondary sm:text-[15px]"
                  >
                    <span
                      className={`mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-inset [&>svg]:h-3 [&>svg]:w-3 ${
                        isTeacher
                          ? "bg-primary/10 text-primary ring-primary/25"
                          : "bg-success/10 text-success ring-success/25"
                      }`}
                    >
                      <CheckIcon />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <button
                  type="button"
                  onClick={() => onSignup(r.role)}
                  className={`${primaryButton} w-full sm:w-fit`}
                >
                  {r.cta}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------- page ------------------------------ */

const LandingPage: FC = () => {
  const navigate = useNavigate();

  const onHeroMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${e.clientX - r.left}px`);
    el.style.setProperty("--hy", `${e.clientY - r.top}px`);
    el.style.setProperty("--lit", "1");
  };

  const onHeroLeave = (e: ReactPointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--lit", "0");
  };

  return (
    <div className="bg-background text-text">
      <style>{STYLES}</style>

      {/* ------------------------------ Hero ------------------------------ */}
      <section
        id="home"
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 lg:pt-32"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(55%_60%_at_72%_28%,rgba(240,239,244,0.075),transparent_70%)]" />
          <div className="lp-grid" />
          <div className="lp-grid-lit" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="w-full max-w-xl">
              <span
                className="lp-rise inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                style={{ "--d": "0ms" } as CSSProperties}
              >
                Coding Assignment Management Solution
              </span>

              <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.045em] text-text sm:text-5xl lg:text-[3.5rem]">
                <span className="lp-mask">
                  <span style={{ "--d": "120ms" } as CSSProperties}>
                    Write.
                  </span>
                </span>
                <span className="lp-mask">
                  <span style={{ "--d": "220ms" } as CSSProperties}>
                    Submit your work.
                  </span>
                </span>
                <span className="lp-mask">
                  <span
                    className="text-text-muted [text-wrap:balance]"
                    style={{ "--d": "320ms" } as CSSProperties}
                  >
                    Improve with every iteration.
                  </span>
                </span>
              </h1>

              <p
                className="lp-rise mt-6 max-w-[46ch] text-base leading-7 text-text-muted"
                style={{ "--d": "520ms" } as CSSProperties}
              >
                Students write code in-browser, teachers review it instantly,
                and grades are managed with clarity.
              </p>

              <div
                className="lp-rise mt-8 flex flex-wrap items-center gap-3"
                style={{ "--d": "620ms" } as CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className={`group ${primaryButton}`}
                >
                  Get Started
                  <span className="inline-flex transition-transform duration-300 motion-safe:group-hover:translate-x-1">
                    <ChevronRight />
                  </span>
                </button>

                <button type="button" className={secondaryButton}>
                  Watch Demo
                </button>
              </div>

              <dl
                className="lp-rise mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4"
                style={{ "--d": "740ms" } as CSSProperties}
              >
                {[
                  { num: "01", label: "Platform" },
                  { num: "2", label: "Roles" },
                  { num: "∞", label: "Classes" },
                  { num: "100%", label: "Browser" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col-reverse bg-surface px-4 py-3.5 transition-colors duration-300 hover:bg-primary/[0.05]"
                  >
                    <dt className="mt-1 text-xs text-text-muted">{s.label}</dt>
                    <dd className="text-xl font-semibold tabular-nums tracking-[-0.04em] text-text">
                      {s.num}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <ProductFrame />
          </div>
        </div>
      </section>

      {/* ----------------------------- Features ---------------------------- */}
      <FeaturesSection />

      {/* ------------------------------- Who ------------------------------- */}
      <section
        id="who"
        aria-labelledby="who-heading"
        className="mx-auto max-w-6xl px-4 py-24 sm:px-6"
      >
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium text-text-muted">
            Who uses CoderClassroom?
          </p>
          <h2
            id="who-heading"
            className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-text sm:text-[2.5rem]"
          >
            Designed for
            <span className="block text-text-muted">everyone.</span>
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <RoleSplit
            onSignup={(role) =>
              navigate(
                role === "Teacher"
                  ? "/signup?role=teacher"
                  : "/signup?role=student",
              )
            }
          />
        </Reveal>
      </section>
    </div>
  );
};

export default LandingPage;
