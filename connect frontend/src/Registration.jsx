import { useState } from 'react';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    mobile: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.birthDate || !formData.mobile) {
      alert('Please fill all mandatory fields');
      return;
    }
    console.log('Form submitted:', formData);
    alert('Registration successful!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d8b5ff 0%, #ffc6e3 50%, #c084fc 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Connect Title - Outside the container */}
      <h1 style={{
        color: '#6b21a8',
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
      }}>Connect</h1>

      <div style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        width: '100%',
        maxWidth: '600px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '2rem',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{
            color: '#6b21a8',
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>Register</h2>

                    {/* First Name */}
                    <div className="mb-4">
                        <label style={{
                            color: '#6b21a8',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            First Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1.1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #e9d5ff'
                            }}
                            placeholder="Enter first name"
                        />
                    </div>

                    {/* Middle Name */}
                    <div className="mb-4">
                        <label style={{
                            color: '#6b21a8',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Middle Name
                        </label>
                        <input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1.1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #e9d5ff'
                            }}
                            placeholder="Enter middle name (optional)"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-4">
                        <label style={{
                            color: '#6b21a8',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Last Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1.1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #e9d5ff'
                            }}
                            placeholder="Enter last name"
                        />
                    </div>

                    {/* Birth Date */}
                    <div className="mb-4">
                        <label style={{
                            color: '#6b21a8',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Birth Date <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1.1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #e9d5ff'
                            }}
                        />
                    </div>

                    {/* Mobile Number */}
                    <div className="mb-4">
                        <label style={{
                            color: '#6b21a8',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1.1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #e9d5ff'
                            }}
                            placeholder="Enter mobile number"
                            pattern="[0-9]{10}"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="btn w-100"
                        style={{
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            padding: '1rem',
                            borderRadius: '1rem',
                            border: 'none',
                            marginTop: '1.5rem',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#6366f1'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
                    >
                        Register
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                        <p style={{ color: '#6b21a8', fontSize: '1rem' }}>
                            Already have an account?{' '}
                            <Link
                                to="/"
                                style={{
                                    color: '#4f46e5',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#6366f1'}
                                onMouseLeave={(e) => e.target.style.color = '#4f46e5'}
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}