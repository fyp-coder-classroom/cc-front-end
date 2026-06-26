import type { FC } from "react";
import { GridIcon } from "../ui/Icons";

const Footer: FC = () => (
  <footer className="border-t border-gray-100 py-12 px-6">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <GridIcon />
        <span className="font-bold text-sm text-black">CoderClassroom</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 text-xs text-gray-400">
        <a
          href="#features"
          className="hover:text-black transition-colors duration-200"
        >
          Features
        </a>
        <a
          href="#who"
          className="hover:text-black transition-colors duration-200"
        >
          About
        </a>
        <span className="text-gray-200">|</span>
        <span>
          © {new Date().getFullYear()} CoderClassroom. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
