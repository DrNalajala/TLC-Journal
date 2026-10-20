import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { AppStoreProvider } from "./store/AppStore";
import { AdminStoreProvider } from "./admin/AdminStore";
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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

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
      <AdminStoreProvider>
        <HashRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/browse" element={<Layout><Browse /></Layout>} />
            <Route path="/article/:id" element={<Layout><ArticlePage /></Layout>} />
            <Route path="/submit" element={<Layout><Submit /></Layout>} />
            <Route path="/submit/:id" element={<Layout><Submit /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/guidelines" element={<Layout><Guidelines /></Layout>} />
            <Route path="/knowledge" element={<Layout><Knowledge /></Layout>} />
            <Route path="/auth" element={<Layout><Auth /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            
            {/* Admin routes - no Layout wrapper for isolated admin interface */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* 404 */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </HashRouter>
      </AdminStoreProvider>
    </AppStoreProvider>
  );
}
