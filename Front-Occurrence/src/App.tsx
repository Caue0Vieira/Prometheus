import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OccurrencesList, OccurrenceDetail } from './pages';
import { Layout } from './components/common';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OccurrencesList />} />
          <Route path="/occurrences/:id" element={<OccurrenceDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

