import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Workspace from './pages/Workspace';
import Results from './pages/Results';

function Nav() {
  const location = useLocation();
  const isWorkspace = location.pathname === '/';

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '0 24px',
      height: 48,
      background: '#FFFFFF',
      borderBottom: '1px solid #DEE0E3',
    }}>
      <Link
        to="/"
        style={{
          fontSize: 14,
          fontWeight: isWorkspace ? 600 : 400,
          color: isWorkspace ? '#1D2129' : '#4E5969',
          padding: '6px 16px',
          borderRadius: 6,
          background: isWorkspace ? '#F2F3F5' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        工作台
      </Link>
      <Link
        to="/results"
        style={{
          fontSize: 14,
          fontWeight: !isWorkspace ? 600 : 400,
          color: !isWorkspace ? '#1D2129' : '#4E5969',
          padding: '6px 16px',
          borderRadius: 6,
          background: !isWorkspace ? '#F2F3F5' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        结果页
      </Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
