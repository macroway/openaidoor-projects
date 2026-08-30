import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Workspace from './pages/Workspace';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-3 border-b border-border shadow-nav">
        <div className="max-w-results mx-auto flex items-center">
          <Link to="/" className="flex items-center gap-2 mr-8 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-sm shadow-btn group-hover:shadow-btn-hover transition-shadow">
              ✦
            </div>
            <span className="text-heading-sm text-ink">询价整理助手</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/" className="px-3 py-1.5 rounded-md text-body-md text-text-secondary hover:text-ink hover:bg-surface-badge transition-all">工作台</Link>
            <Link to="/results" className="px-3 py-1.5 rounded-md text-body-md text-text-secondary hover:text-ink hover:bg-surface-badge transition-all">结果页</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
