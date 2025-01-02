import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/students`, formData);

      if (response.status === 200) {
        console.log('Data saved:', response.data);
        alert(`${response.data.student.rollNumber} registered successfully. Check ${response.data.student.email} inbox`);

        setFormData({
          name: '',
          rollNumber: '',
          email: '',
        });
      } else {
        console.error('Error:', response.status);
        alert('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Student Registration Form</h2>
            {isLoading ? (
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            ) : (
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                <label htmlFor="name" className="form-label">Name:</label>
                <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="mb-3">
                <label htmlFor="rollNumber" className="form-label">Roll Number:</label>
                <input
                    type="text"
                    className="form-control"
                    id="rollNumber"
                    name="rollNumber"
                    placeholder="Enter your roll number"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="mb-3">
                <label htmlFor="email" className="form-label">Email:</label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="text-center">
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
                </div>
            </form>
            )}
        </div>
  );
}

export default Register;
