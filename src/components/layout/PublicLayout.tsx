import type { FC } from "react";
import { Outlet } from "react-router-dom";
import PreAuthNavbar from "./PreAuthNavbar";
import Footer from "./Footer";

const PublicLayout: FC = () => (
  <div className="min-h-screen bg-white font-sans flex flex-col">
    <PreAuthNavbar />
    <main className="flex-1">
      <Outlet /> {/* ← child route renders here */}
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
