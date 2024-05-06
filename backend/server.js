const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const base64url = require('base64url');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Temporary in-memory storage
let users = [
  {
    email: 'existinguser@example.com',
    name: 'Alice',
    age: 28,
    userID: crypto.randomBytes(16),
    credentials: [],
  },
];

let otps = {};
let sessions = {};

// Endpoint to check if user exists
app.post('/check-user', (req, res) => {
  const { email } = req.body;
  const userExists = users.some((user) => user.email === email);
  res.json({ exists: userExists });
});

// Endpoint to generate OTP (for signup)
app.post('/generate-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps[email] = otp;
  console.log(`generated otp for ${email}`,otp)
  res.json({ message: 'OTP generated' });
});

// Endpoint to register a new user
app.post('/register', (req, res) => {
  const { email, name, age, otp } = req.body;
  if (otps[email] && otps[email] === otp) {
    const userID = crypto.randomBytes(16);
    users.push({ email, name, age, userID, credentials: [] });
    delete otps[email];
    res.json({ success: true, message: 'Registration successful' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

// Endpoint to generate registration options (for WebAuthn)
app.post('/generate-registration-options', async (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const options = await generateRegistrationOptions({
      rpName: 'Passwordless App',
      rpID: 'localhost',
      userID: user.userID,
      userName: email,
      userDisplayName: email,
      attestationType: 'direct',
      authenticatorSelection: {
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    sessions[email] = { challenge: options.challenge };
    res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return res.status(500).json({ error: 'Failed to generate registration options' });
  }
});

// Endpoint to verify registration response
app.post('/verify-registration', async (req, res) => {
  const { email, attestationResponse } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !sessions[email]) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: sessions[email].challenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
      requireUserVerification: true,
    });

    if (verification.verified) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      const newCredential = {
        credentialID: base64url.encode(credentialID),
        credentialPublicKey: base64url.encode(credentialPublicKey),
        counter,
      };

      user.credentials.push(newCredential);
      delete sessions[email];

      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Endpoint to generate authentication options
app.post('/generate-authentication-options', async (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || user.credentials.length === 0) {
    return res.status(400).json({ error: 'User not registered with credentials' });
  }

  const options = await generateAuthenticationOptions({
    rpID: 'localhost',
    userVerification: 'preferred',
    allowCredentials: user.credentials.map((cred) => ({
      id: cred.credentialID,
      type: 'public-key',
      transports: ['internal'],
    })),
  });

  sessions[email] = { challenge: options.challenge };
  res.json(options);
});

// Endpoint to verify authentication response
app.post('/verify-authentication', async (req, res) => {
  const { email, authenticationResponse } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !sessions[email]) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  try {
    const credential = user.credentials.find(
      (cred) => cred.credentialID === authenticationResponse.rawId
    );

    if (!credential) {
      return res.status(400).json({ error: 'Credential not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: sessions[email].challenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
      authenticator: {
        credentialPublicKey: base64url.toBuffer(credential.credentialPublicKey),
        credentialID: base64url.toBuffer(credential.credentialID),
        counter: credential.counter,
        transports: ['internal'],
      },
      requireUserVerification: true,
    });

    if (verification.verified) {
      credential.counter = verification.authenticationInfo.newCounter;
      delete sessions[email];
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
