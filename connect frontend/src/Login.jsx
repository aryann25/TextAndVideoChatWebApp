import { useState } from 'react';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // We'll need custom CSS for specific styling

export default function Login() {
  const [mobile, setMobile] = useState('');

  return (
    <div className="login-container">
      {/* Title */}
      <h1 className="connect-title">Connect</h1>
      
      {/* Speech Bubble */}
      <div className="d-flex justify-content-center mb-5">
        <div className="speech-bubble-container">
          <div className="speech-bubble">
            <span className="bubble-text">hi</span>
          </div>
          <div className="bubble-tail-1"></div>
          <div className="bubble-tail-2"></div>
        </div>
      </div>
      
      {/* Input Container */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="input-card">
              <div className="d-flex align-items-center gap-3">
                <input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="form-control mobile-input"
                />
                <button className="btn btn-otp">
                  OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Register Link */}
       <div className="text-center mt-4">
        <p className="register-text">Don't have account?</p>
        <Link to="/register" className="btn btn-link register-link">
          Register
        </Link>
      </div>
    </div>
  );
}