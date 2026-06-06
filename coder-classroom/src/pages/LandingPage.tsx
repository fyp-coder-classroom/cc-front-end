// Props: see LandingPageProps in types/index.ts

import type { FC } from "react";
import type { LandingPageProps } from "../types";
import { GridIcon, ChevronRight, CodeIcon, CheckIcon } from "../components/ui/Icons";
import { FEATURES, ROLES_INFO } from "../data/mockData";

const LandingPage: FC<LandingPageProps> = ({ setScreen }) => (
  <div className="min-h-screen bg-white font-sans">

    {/* ── Navbar ── */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-black">
        <GridIcon />
        <span className="font-bold text-sm">CoderClassroom</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
        <a href="#home" className="hover:text-black transition-colors">Home</a>
        <a href="#features" className="hover:text-black transition-colors">Features</a>
        <a href="#who" className="hover:text-black transition-colors">About</a>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setScreen("signin")}
          className="text-sm text-gray-700 hover:text-black transition-colors px-3 py-1.5"
        >
          Sign In
        </button>
        <button
          onClick={() => setScreen("signup")}
          className="text-sm bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors font-medium">
          Get Started
        </button>
      </div>
    </nav>

    {/* ── Hero ── */}
    <section id="home" className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
      <div className="flex-1 max-w-xl">
        <span className="text-xs uppercase tracking-widest text-gray-400 font-medium border border-gray-200 rounded-full px-3 py-1">
          Coding Assignment Management Solution
        </span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-black text-black leading-none tracking-tight">
          Write.<br />
          <span>Submit your work.</span><br />
          <span className="text-gray-400">Improve with<br />every iteration.</span>
        </h1>
        <p className="mt-6 text-gray-500 text-base leading-relaxed max-w-md">
          Students write code in-browser, teachers review it instantly, and grades are managed with clarity.
        </p>
        <div className="mt-8 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setScreen("signup")}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            Get Started <ChevronRight />
          </button>
          <button className="text-sm text-gray-500 hover:text-black transition-colors">
            Watch Demo
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-4 gap-4">
          {[
            { num: "01", label: "Platform" },
            { num: "2", label: "Roles" },
            { num: "∞", label: "Classes" },
            { num: "100%", label: "Browser" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-black text-black">{s.num}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Code mockup */}
      <div className="flex-1 w-full max-w-md">
        <div className="bg-[#0d0d0d] rounded-2xl p-5 shadow-2xl border border-gray-800">
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-gray-500 text-xs">main.cpp — Arrays & Pointers</span>
          </div>
          <pre className="text-xs text-green-400 font-mono leading-relaxed overflow-x-auto">
            {`#include <iostream>
using namespace std;

int main() {
  int arr[] = {1, 2, 3, 4, 5};
  int *ptr = arr;

  for(int i = 0; i < 5; i++) {
    cout << *(ptr + i) << " ";
  }
  return 0;
}`}
          </pre>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-gray-500 text-xs">Output: 1 2 3 4 5</span>
            <span className="text-green-400 text-xs font-medium">✓ Compiled</span>
          </div>
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section id="features" className="py-20 bg-gray-50 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-12">
          <h2 className="text-4xl font-black text-black">
            Everything you need.<br />
            <span className="text-gray-400">In one place.</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
            CoderClassroom brings key workflow tools together so you can focus on teaching.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-300 transition-colors">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white mb-4">
                <CodeIcon />
              </div>
              <h3 className="font-bold text-black text-sm mb-2">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Who Uses ── */}
    <section id="who" className="py-20 px-6 max-w-6xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Who uses CoderClassroom?</p>
      <h2 className="text-4xl font-black text-black mb-12">
        Designed for<br /><span className="text-gray-400">everyone.</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ROLES_INFO.map((r) => (
          <div key={r.role} className="bg-[#0d0d0d] rounded-2xl p-8 text-white">
            <span className="text-xs uppercase tracking-widest text-gray-400">{r.role}</span>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed">{r.desc}</p>
            <ul className="mt-6 space-y-3">
              {r.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-gray-200">
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-black flex-shrink-0">
                    <CheckIcon />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setScreen("signup")}
              className="mt-8 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              {r.cta}
            </button>
          </div>
        ))}
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="border-t border-gray-100 py-8 px-6 text-center text-gray-400 text-xs">
      © {new Date().getFullYear()} CoderClassroom. All rights reserved.
    </footer>
  </div>
);

export default LandingPage;
