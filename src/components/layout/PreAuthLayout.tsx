import type { FC, ReactNode } from "react";
import PreAuthNavbar from "./PreAuthNavbar";

interface Props {
  children: ReactNode;
  leftTitle: ReactNode;
  features: string[];
}

const PreAuthLayout: FC<Props> = ({ children, leftTitle, features }) => (
  <div className="min-h-screen flex flex-col sm:flex-row bg-white">
    <PreAuthNavbar />

    {/*  LEFT PANEL  */}
    <div className="hidden sm:flex sm:w-[38%] bg-[#111111] flex-col justify-center px-12 pt-16">
      <h2 className="text-3xl font-black text-white leading-tight">
        {leftTitle}
      </h2>
      <ul className="mt-8 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>

    {/*  RIGHT PANEL  */}
    <div className="flex-1 flex items-center justify-center px-8 pt-16">
      {children}
    </div>
  </div>
);

export default PreAuthLayout;
