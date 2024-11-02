import './App.css';
import EventList from './pages/EventList';
import { Routes, Route } from 'react-router-dom';
import ViewEvent from './pages/ViewEvent';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EventList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/event/:eventId" element={<ViewEvent />} />
    </Routes>
  );
}

export default App;