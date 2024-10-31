import './App.css';
import EventList from './pages/EventList';
import { Routes, Route } from 'react-router-dom';
import ViewEvent from './pages/ViewEvent';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EventList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/event/:eventId" element={<ViewEvent />} />
    </Routes>
  );
}

export default App;