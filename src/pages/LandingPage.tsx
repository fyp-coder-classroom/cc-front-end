import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CodeIcon, CheckIcon } from "../components/ui/Icons";
import { FEATURES, ROLES_INFO } from "../data/mockData";
import CodeEditorPreview from "../components/landing/CodeEditorPreview";

const FeatureCard: FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div
    className="bg-surface rounded-xl p-6 border border-border cursor-default select-none
    transition-all duration-300 ease-out
    hover:border-border-strong hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1
    active:translate-y-0 active:shadow-none"
  >
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
      <CodeIcon />
    </div>
    <h3 className="font-bold text-text text-sm mb-2">{title}</h3>
    <p className="text-text-muted text-xs leading-relaxed">{desc}</p>
  </div>
);

const RoleCard: FC<{
  r: (typeof ROLES_INFO)[0];
  onSignup: () => void;
}> = ({ r, onSignup }) => (
  <div
    className="bg-surface-raised rounded-2xl p-8 border border-border cursor-default select-none
    transition-all duration-300 ease-out
    hover:border-border-strong hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1"
  >
    <span className="text-xs uppercase tracking-widest text-text-muted">
      {r.role}
    </span>
    <p className="mt-3 text-text-secondary text-sm leading-relaxed">{r.desc}</p>
    <ul className="mt-6 space-y-3">
      {r.perks.map((perk) => (
        <li
          key={perk}
          className="flex items-center gap-3 text-sm text-text-secondary"
        >
          <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0">
            <CheckIcon />
          </span>
          {perk}
        </li>
      ))}
    </ul>
    <button
      onClick={onSignup}
      className="mt-8 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold
                 transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95"
    >
      {r.cta}
    </button>
  </div>
);

const LandingPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section
        id="home"
        className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12"
      >
        <div className="flex-1">
          <span className="text-xs uppercase tracking-widest text-text-muted font-medium border border-border rounded-full px-3 py-1">
            Coding Assignment Management Solution
          </span>
          <h1 className="mt-6 text-5xl sm:text-6xl font-black text-text leading-none tracking-tight">
            Write.
            <br />
            <span>Submit your work.</span>
            <br />
            <span className="text-text-muted">
              Improve with
              <br />
              every iteration.
            </span>
          </h1>
          <p className="mt-6 text-text-muted text-base leading-relaxed max-w-md">
            Students write code in-browser, teachers review it instantly, and
            grades are managed with clarity.
          </p>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm
                         transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started <ChevronRight />
            </button>
            <button className="text-sm text-text-muted hover:text-text transition-colors duration-200">
              Watch Demo
            </button>
          </div>

          <div className="mt-12 grid grid-cols-4 gap-4">
            {[
              { num: "01", label: "Platform" },
              { num: "2", label: "Roles" },
              { num: "∞", label: "Classes" },
              { num: "100%", label: "Browser" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-text">{s.num}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Typewriter code block */}
        <div className="w-full lg:w-[500px] flex-shrink-0">
          {" "}
          <CodeEditorPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-surface px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-12">
            <h2 className="text-4xl font-black text-text">
              Everything you need.
              <br />
              <span className="text-text-muted">In one place.</span>
            </h2>
            <p className="text-text-muted text-sm max-w-xs leading-relaxed">
              CoderClassroom brings key workflow tools together so you can focus
              on teaching.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Who uses */}
      <section id="who" className="py-20 px-6 max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
          Who uses CoderClassroom?
        </p>
        <h2 className="text-4xl font-black text-text mb-12">
          Designed for
          <br />
          <span className="text-text-muted">everyone.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ROLES_INFO.map((r) => (
  <RoleCard
    key={r.role}
    r={r}
    onSignup={() =>
      navigate(r.role === "Teacher" ? "/signup?role=teacher" : "/signup?role=student")
    }
  />
))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
