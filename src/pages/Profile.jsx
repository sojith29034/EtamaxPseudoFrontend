import { useEffect, useState } from 'react';
import { Container, Card, Button, Modal, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [confirmedEvents, setConfirmedEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [userName, setUserName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollmentsAndUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/login');
        return;
      }
  
      try {
        // Fetch user details
        const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/students/rollNo/${storedUser.rollNumber}`);
        setUserName(userResponse.data.name);
  
        // Fetch all transactions
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/transactions`);
        const allTransactions = response.data;
  
        // Filter transactions for this user
        const userEvents = allTransactions.filter(event => event.enrolledId === storedUser.rollNumber);
        const confirmed = userEvents.filter(event => event.payment === 1);
        const pending = userEvents.filter(event => event.payment === 0);
        setConfirmedEvents(confirmed);
        setPendingEvents(pending);
  
        // Fetch event details for all user's transactions
        const eventPromises = userEvents.map(event => 
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/${event.eventId}`)
        );
        const eventResponses = await Promise.all(eventPromises);
        const details = eventResponses.reduce((acc, curr) => {
          acc[curr.data._id] = curr.data;
          return acc;
        }, {});
        setEventDetails(details);
  
        // Store all transactions globally for calculating filled seats
        setAllTransactions(allTransactions);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEnrollmentsAndUser();
  }, [navigate]);
  
  // Function to calculate filled seats for a particular eventId across all transactions
  const calculateFilledSeats = (eventId) => {
    const filledSeats = allTransactions.filter(transaction => transaction.eventId === eventId && transaction.payment === 1);
    return filledSeats.length;
  };
  

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/transactions/${eventToDelete._id}`);
      setConfirmedEvents(confirmedEvents.filter(userEvents => userEvents._id !== eventToDelete._id));
      setPendingEvents(pendingEvents.filter(userEvents => userEvents._id !== eventToDelete._id));
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
        <Row>
            <Col>
                <Button variant="success" onClick={() => navigate('/')}>
                    Home
                </Button>
            </Col>
            <Col> 
                {error && <Alert variant="danger">{error}</Alert>}
                {userName && <h4>Welcome, {userName}</h4>}
            </Col>
            <Col>            
                <Button variant="danger" onClick={handleLogout}>
                    Logout
                </Button>
            </Col>
        </Row>
        <hr />
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <h3>Confirmed Enrollments</h3>
          <div className="row justify-content-center align-items-center">
            {confirmedEvents.length > 0 ? (
              confirmedEvents.map((event) => {
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
                      </Card.Body>
                    </Card>
                  </div>
                );
              })
            ) : (
              <p>No confirmed enrollments available.</p>
            )}
          </div>
          <hr />
          <h3>Pending Enrollments</h3>
          <div className="row justify-content-center align-items-center">
            {pendingEvents.length > 0 ? (
              pendingEvents.map((event) => {
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
                          <strong>Seats:</strong> {calculateFilledSeats(event.eventId)} / {eventDetail?.maxSeats || 'Free for all'} <br />
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
              })
            ) : (
              <p>No pending enrollments available.</p>
            )}
          </div>
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor:'#333' }}>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor:'#333' }}>
          Are you sure you want to delete your enrollment for {eventToDelete ? eventDetails[eventToDelete.eventId]?.eventName : ''}?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor:'#333' }}>
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