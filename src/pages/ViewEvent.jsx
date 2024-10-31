import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ViewEvent = () => {
  const { state } = useLocation();
  const event = state?.event; // Get event data passed from EventList
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState(['']); // Initial team member input
  const [error, setError] = useState('');
  const [newMember, setNewMember] = useState(''); // State to track new member input

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.rollNumber) {
      setTeamMembers([user.rollNumber]); // Set logged-in roll number by default
    }
  }, []);

  const handleEnroll = () => {
    // Here you can send a request to enroll in the event along with the team members' roll numbers
    console.log(`Enrolling user: ${teamMembers[0]} in event: ${event.eventName} with team members: ${teamMembers}`);
  
    // Redirect to event list or confirmation page after enrollment
    navigate('/');
  };
  
  const handleAddMember = async () => { // Make this function async
    // Check if the new member is registered
    const isRegistered = await checkIfStudentRegistered(newMember); // Await the function
  
    if (isRegistered) {
      setTeamMembers([...teamMembers, newMember]); // Add the new member
      setNewMember(''); // Clear the input field
      setError(''); // Clear any previous error messages
    } else {
      setError('Student not registered yet'); // Show error if student is not registered
    }
  };
  
  const handleMemberChange = (value) => {
    setNewMember(value);
  };
  
  // Function to check if a student is registered
  const checkIfStudentRegistered = async (rollNumber) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/students/rollNo/${rollNumber}`);
      return response.data ? true : false; // Return true if the student exists
    } catch (error) {
      console.error('Error checking student registration:', error);
      return false; // Return false if there's an error (e.g., student not found)
    }
  };
  
  
  return (
    <Container className="mt-4">
      <h2>{event?.eventName}</h2>
      <p>Description: {event?.eventDetails}</p>
      <p>Day: Day {event?.eventDay}</p>
      <p>Category: {event?.eventCategory}</p>
      <p>Time: {`${event?.startTime} - ${event?.endTime}`}</p>
      <p>Entry Fees: {event?.eventFees}</p>
      {event?.maxSeats > 0 && <p>Intake: {event?.maxSeats}</p>}
      {event?.teamSize > 1 ? (
        <>
          <p>Team Size: {event?.teamSize}</p>
          <h4>Added Team Members Roll Numbers:</h4>
          <ul>
            {teamMembers.map((member, index) => (
              member && <span key={index}>{member}, </span>  // Only display non-empty roll numbers
            ))}
          </ul>
          <h4>Enter Team Member Roll Number</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Label>Member Roll Number</Form.Label>
            <Form.Control
              type="text"
              value={newMember}
              onChange={(e) => handleMemberChange(e.target.value)}
              placeholder="Enter roll number"
              required
            />
          </Form.Group>
          <Button variant="secondary" onClick={handleAddMember}>
            Add Team Member
          </Button>
        </>
      ) : (
        <p>Individual Participation</p>
      )}
      <Button variant="primary" className="m-3" onClick={handleEnroll}>
        Enroll
      </Button>
    </Container>
  );
};

export default ViewEvent;