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

  const handleEnroll = async () => {
    try {
        // Define the transaction data
        const transactionData = {
            eventId: event._id, // Ensure `event._id` is the correct field
            enrolledId: teamMembers[0], // Assuming the first member is the one who enrolled
            teamMembers: teamMembers,
            amount: event.entryFees,
        };

        // Send a POST request to create the transaction in the backend
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/transactions`, transactionData);

        // Display a success message after enrollment
        setError(''); // Clear any existing errors
        alert('Enrollment successful!');
        
    } catch (error) {
      console.error('Error enrolling in event:', error);
      setError('Failed to enroll in the event. Please try again.');
    }
  };
  
  const handleAddMember = async () => { // Make this function async
    // Ensure that the new member is not already added and that the team is not full
    if (teamMembers.includes(newMember)) {
      setError('This student is already added to the team.');
      return;
    }
  
    if (teamMembers.length >= event?.teamSize) {
      setError(`Team size cannot exceed ${event?.teamSize} members.`);
      return;
    }
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
      <p>Entry Fees: {event?.entryFees}</p>
      {event?.maxSeats > 0 && <p>Intake: {event?.maxSeats}</p>}
      {event?.teamSize > 1 ? (
        <>
          <p>Team Size: {event?.teamSize}</p>
          <h4>Added Team Members Roll Numbers:</h4>
          <p>
            {teamMembers.map((member, index) => (
              member &&
              <span key={index} style={{ margin:'5px', border:'2px solid #333', padding:'5px', borderRadius:'10px', display:'inline-block', whiteSpace:'nowrap' }}>{member}</span>
            ))}
          </p>
          <h4>Enter Team Member Roll Number</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Control
              type="text"
              value={newMember}
              onChange={(e) => handleMemberChange(e.target.value)}
              placeholder="Enter roll number"
              required
            />
          </Form.Group>
          <Button variant="secondary" className="m-3" onClick={handleAddMember}>
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