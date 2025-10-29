import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CardsListPage } from './pages/CardsListPage';
import { CardDetailPage } from './pages/CardDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cards" replace />} />
        <Route path="/cards" element={<CardsListPage />} />
        <Route path="/cards/:id" element={<CardDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
