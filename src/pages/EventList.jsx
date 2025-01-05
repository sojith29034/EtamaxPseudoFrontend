import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleEnroll = (event) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
    } else {
      navigate(`/event/${event._id}`, { state: { event } });
    }
  };

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
    } else {
      navigate('/profile');
    }
  };
  const featuredEvents = events.filter((event) =>
    event.isFeatured
  );

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.startTime.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col md={6} className="text-center">
          <h2 className="mb-3">Available Events</h2>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by event"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm"
          />
        </Col>
        <Col>
            <Button variant="success" onClick={() => handleLogin()}>Profile</Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive variant="dark">
        <thead className="text-center">
          <tr><th colSpan={8}>Featured Events</th></tr>
          <tr>
            <th>Sr No</th>
            <th>Name</th>
            <th>Day</th>
            <th>Category</th>
            <th>Time</th>
            <th>Limit</th>
            <th>Entry Fee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="text-center align-middle">
          {featuredEvents.map((event, index) => (
            <tr key={event._id}>
              <td>{index + 1}</td>
              <td>{event.eventName}</td>
              <td>Day {event.eventDay}</td>
              <td style={{ textTransform: 'capitalize' }}>{event.eventCategory}</td>
              <td>{`${event.startTime} - ${event.endTime}`}</td>
              <td>{event.maxSeats === 0 ? 'Unlimited' : `${event.maxSeats}`}</td>
              <td>{event.maxSeats === 0 ? '0' : `${event.entryFees}`}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleEnroll(event)} className="shadow-sm">
                  Enroll
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Table striped bordered hover responsive variant="dark">
        <thead className="text-center">
        <tr><th colSpan={8}>All Events</th></tr>
          <tr>
            <th>Sr No</th>
            <th>Name</th>
            <th>Day</th>
            <th>Category</th>
            <th>Time</th>
            <th>Limit</th>
            <th>Entry Fee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="text-center align-middle">
          {filteredEvents.map((event, index) => (
            <tr key={event._id}>
              <td>{index + 1}</td>
              <td>{event.eventName}</td>
              <td>Day {event.eventDay}</td>
              <td style={{ textTransform: 'capitalize' }}>{event.eventCategory}</td>
              <td>{`${event.startTime} - ${event.endTime}`}</td>
              <td>{event.maxSeats === 0 ? 'Unlimited' : `${event.maxSeats}`}</td>
              <td>{event.maxSeats === 0 ? '0' : `${event.entryFees}`}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleEnroll(event)} className="shadow-sm">
                  Enroll
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

EventList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      eventName: PropTypes.string.isRequired,
      eventDay: PropTypes.string.isRequired,
      eventCategory: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      maxSeats: PropTypes.number.isRequired,
      entryFees: PropTypes.number.isRequired,
    })
  ),
};

export default EventList;