import { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/login`, {
        rollNumber,
        password,
      });
      // Save token or user details in local storage or context
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/');
    } catch (err) {
        console.log(err.message)
        setError('Invalid roll number or password');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleLogin}>
        <Form.Group controlId="formRollNumber">
          <Form.Label>Roll Number</Form.Label>
          <Form.Control
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className='m-3'>
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default Login;