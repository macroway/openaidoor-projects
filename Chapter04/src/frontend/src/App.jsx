import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Workspace from './pages/Workspace';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '12px 20px', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ marginRight: 16 }}>工作台</Link>
        <Link to="/results">结果页</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
