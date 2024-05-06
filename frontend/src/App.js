// App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import {
  bufferToBase64URLString,
  base64URLStringToBuffer,
} from '@simplewebauthn/browser';

function App() {
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(null); // null, true, or false
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleNext = async () => {
    try {
      const response = await axios.post('http://localhost:5000/check-user', { email });
      setUserExists(response.data.exists);
      console.log('User exists:', response.data.exists);

      if (!response.data.exists) {
        // Generate OTP for new user registration
        await axios.post('http://localhost:5000/generate-otp', { email });
        setIsOtpSent(true);
        alert('OTP has been generated. Check the backend console for the OTP.');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        email,
        name,
        age,
        otp,
      });
      if (response.data.success) {
        alert('Registration successful! Setting up biometric authentication...');
        // Start biometric registration
        await handleBiometricRegistration();
      }
    } catch (error) {
      alert('Registration failed. Please check the OTP and try again.');
      console.error('Error during registration:', error);
    }
  };

  const handleBiometricRegistration = async () => {
    try {
      // Get options from the server
      const optionsResponse = await axios.post(
        'http://localhost:5000/generate-registration-options',
        { email }
      );
  
      const options = optionsResponse.data;
  
      console.log('Registration Options from Server:', options);
  
      // No need to convert challenge and user.id if they are already strings
  
      const attestationResponse = await startRegistration(options);
  
      // Send the attestation response back to the server for verification
      const verificationResponse = await axios.post(
        'http://localhost:5000/verify-registration',
        {
          email,
          attestationResponse,
        }
      );
  
      if (verificationResponse.data.verified) {
        alert('Biometric registration successful! You can now log in using biometrics.');
        // Redirect to home page or show login button
        setUserExists(true);
      } else {
        alert('Biometric registration failed.');
      }
    } catch (error) {
      console.error('Error during biometric registration:', error);
    }
  };
  

  const handleBiometricAuthentication = async () => {
    try {
      // Get options from the server
      const optionsResponse = await axios.post(
        'http://localhost:5000/generate-authentication-options',
        { email }
      );
  
      const options = optionsResponse.data;
  
      console.log('Authentication Options from Server:', options);
  
      // No need to convert challenge or allowCredentials ids
  
      const authenticationResponse = await startAuthentication(options);
  
      // Send the authentication response back to the server for verification
      const verificationResponse = await axios.post(
        'http://localhost:5000/verify-authentication',
        {
          email,
          authenticationResponse,
        }
      );
  
      if (verificationResponse.data.verified) {
        alert('Authentication successful!');
        // Redirect to home page
        window.location.href = '/home';
      } else {
        alert('Authentication failed.');
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      alert('Authentication failed.');
    }
  };
  

  return (
    <div className="App">
      <h2>Passwordless Login</h2>

      {userExists === null && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleNext}>Next</button>
        </>
      )}

      {userExists === true && (
        <div>
          <p>User exists. Proceed to biometric authentication.</p>
          <button onClick={handleBiometricAuthentication}>Authenticate</button>
        </div>
      )}

      {userExists === false && (
        <div>
          <h3>Sign Up</h3>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          {isOtpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </>
          )}
          <button onClick={handleSignup}>Sign Up</button>
        </div>
      )}
    </div>
  );
}

export default App;
