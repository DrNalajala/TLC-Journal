import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { AppStoreProvider } from "./store/AppStore";
import Layout from "./components/Layout";
import { IArrow } from "./components/ui";
import Home from "./pages/Home";
import About from "./pages/About";
import Browse from "./pages/Browse";
import ArticlePage from "./pages/ArticlePage";
import Submit from "./pages/Submit";
import Dashboard from "./pages/Dashboard";
import Guidelines from "./pages/Guidelines";
import Knowledge from "./pages/Knowledge";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.22em] text-uvdeep">404</p>
      <h1 className="mt-3 font-display text-4xl font-black text-ink">This lane ran off the plate.</h1>
      <p className="mt-3 text-[0.9rem] text-inksoft">The page you are looking for was not developed in this solvent system.</p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 border border-navy px-5 py-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.12em] text-navy transition-colors hover:bg-navy hover:text-white"
      >
        Back to the journal <IArrow size={13} />
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/submit/:id" element={<Submit />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppStoreProvider>
  );
}
