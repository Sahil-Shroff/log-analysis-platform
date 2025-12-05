import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import ServicesOverviewPage from "./pages/ServicesOverview";
import ServiceDetailsPage from "./pages/ServiceDetails";
import LiveLogsPage from "./pages/LiveLogs";
import LogSearchPage from "./pages/LogSearch";
import OlapAnalyticsPage from "./pages/OlapAnalytics";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/services", label: "Services" },
  { to: "/live-logs", label: "Live Logs" },
  { to: "/search", label: "Log Search" },
  { to: "/analytics", label: "OLAP" }
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <div className="dot" />
          <div>
            <div className="logo-title">LogScope</div>
            <div className="logo-sub">Observability UI</div>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/services" element={<ServicesOverviewPage />} />
          <Route path="/services/:service" element={<ServiceDetailsPage />} />
          <Route path="/live-logs" element={<LiveLogsPage />} />
          <Route path="/search" element={<LogSearchPage />} />
          <Route path="/analytics" element={<OlapAnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
