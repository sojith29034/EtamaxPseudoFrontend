import { useEffect, useState } from 'react';
import { Container, Card, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [userName, setUserName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollmentsAndUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/login');
        return;
      }

      try {
        const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/students/rollNo/${storedUser.rollNumber}`);
        setUserName(userResponse.data.name);

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/transactions`, {
          params: { rollNumber: storedUser.rollNumber },
        });
        const events = response.data;
        setEnrolledEvents(events);

        const eventPromises = events.map(event => 
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/${event.eventId}`)
        );

        const eventResponses = await Promise.all(eventPromises);
        const details = eventResponses.reduce((acc, curr) => {
          acc[curr.data._id] = curr.data;
          return acc;
        }, {});
        
        setEventDetails(details);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentsAndUser();
  }, [navigate]);

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/transactions/${eventToDelete._id}`);
      setEnrolledEvents(enrolledEvents.filter(event => event._id !== eventToDelete._id));
      setShowModal(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      setError('Failed to delete enrollment. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Container className="mt-4">
      <h2>User Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {userName && <h4>Welcome, {userName}</h4>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <div className="row">
          {enrolledEvents.map((event) => {
            const eventDetail = eventDetails[event.eventId];

            return (
              <div className="col-md-4 mb-3" key={event._id}>
                <Card>
                  <Card.Body>
                    <Card.Title>{eventDetail?.eventName || 'Loading...'}</Card.Title>
                    <Card.Text style={{ textTransform: 'capitalize' }}>
                      <strong>Day:</strong> {eventDetail?.eventDay || 'Loading...'} <br />
                      <strong>Time:</strong> {eventDetail ? `${eventDetail.startTime} - ${eventDetail.endTime}` : 'Loading...'} <br />
                      <strong>Category:</strong> {eventDetail?.eventCategory || 'Loading...'} <br />
                      {eventDetail?.teamSize > 1 ? (
                        <> {event.teamMembers?.join(', ') || 'Loading...'} </>
                      ) : 'Individual Event'}
                    </Card.Text>
                    <Button 
                    variant="danger" 
                    onClick={() => {
                        setEventToDelete(event);
                        setShowModal(true);
                    }}
                    >
                    Delete Enrollment
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <Button variant="danger" onClick={handleLogout} className="mt-3">
        Logout
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className='dark'>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className='dark'>
          Are you sure you want to delete your enrollment for {eventToDelete?.eventName}?
        </Modal.Body>
        <Modal.Footer className='dark'>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;