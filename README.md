# Passwordless Authentication with WebAuthn, React, and Node.js

This project implements a passwordless authentication system using biometric authentication (e.g., Windows Hello, Touch ID) via the Web Authentication API (WebAuthn). It consists of a React frontend and a Node.js backend combined in a single Git repository, leveraging the @simplewebauthn libraries to handle WebAuthn processes.

## Table of Contents
- Features
- Prerequisites
- Installation
- Running the Application
  - Usage
  - Registration Process
  - Authentication Process
- Project Structure
- Troubleshooting
- Security Considerations
- Next Steps


### Features
**Password less Authentication:** Users can register and authenticate without a password using biometrics.\
**WebAuthn Integration:** Utilizes the Web Authentication API for secure authentication.\
**React Frontend:** A user-friendly interface built with React.\
**Express Backend:** An API server built with Node.js and Express.\
**OTP Verification:** One-time password verification during user registration.\
**Biometric Registration and Authentication:** Supports platform authenticators like Windows Hello and Touch ID.

### Prerequisites
**Node.js:** Version 14.17.0 or higher is recommended.\
**npm:** Comes with Node.js installation.\
**Modern Browser:** Latest version of Chrome, Firefox, Edge, or Safari.\
**Platform Authenticator:** A device with biometric capabilities (e.g., fingerprint scanner, facial recognition).\
**Git:** For cloning the repository.

### Installation
Clone the Repository
```bash
git clone https://github.com/sbhand22/passwordless-login-functionality.git
cd your-repo-name
```
Install Dependencies
- Backend Dependencies
```bash
cd backend
npm install
```
- Frontend Dependencies
```bash
cd frontend
npm install
```
Running the Application
- Start the Backend Server
Navigate to the Backend Directory
```bash
node server.js
```
The backend server will run on http://localhost:5000.
You should see Server is running on port 5000 in your console.

- Start the Frontend Application
Navigate to the Frontend Directory
```bash
npm start
```
The frontend will run on http://localhost:3000.
A new browser window should open automatically.

### Usage
- Registration Process
 1. Access the Application
2. Open your browser and navigate to http://localhost:3000.
3. Enter Email

4. On the home page, enter your email address and click Next.
5. OTP Generation: Since it's a new email, an OTP will be generated.\
Note: In this demo, the OTP is displayed in the backend console.
Complete Registration Form

6. Enter your Name, Age, and the OTP you obtained from the backend console.
7. Click Sign Up.
8. Biometric Registration

9. Upon successful registration, the app will prompt you to set up biometric authentication.
10. Follow the browser prompts to register your biometric authenticator (e.g., fingerprint, facial recognition).

11. Registration Confirmation: If successful, you'll receive a confirmation message.

- Authentication Process
1. Access the Application

2. Navigate to http://localhost:3000.
3. Enter Email

4. Enter the same email address you used during registration and click Next.
5. Biometric Authentication

 6. Click on Authenticate.
7. Follow the browser prompts to authenticate using your registered biometric method.
8. Authentication Confirmation: If successful, you'll receive an authentication success message.

### Project Structure
```java
your-repo-name/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── package-lock.json
└── README.md
```
backend/: Contains the Node.js Express server.\
frontend/: Contains the React application.\
README.md: Project documentation.

### Troubleshooting

**Error: No Passkeys Available**\
Issue: When authenticating, you receive a message stating no passkeys are available for localhost.\
Solution:\
Ensure that you completed the biometric registration without errors.\
Verify that your platform authenticator (e.g., Windows Hello) is properly configured.\
Confirm that the RP ID (localhost) and origin (http://localhost:3000) are consistent in your code.\
Try deleting existing passkeys from your system settings and re-registering.\
Check that the credential IDs match between registration and authentication.

**TypeErrors or Undefined Variables**
Issue: Encountering TypeError or variables being undefined.\
Solution:\
Ensure that all properties are correctly assigned in objects.\
Verify that you're using the correct variable names and data types.\
Check that all dependencies are installed and up to date.\
Make sure that userID and credentialID are properly defined and stored.

**Node.js Version Compatibility**
Issue: Some functions or methods are not available.\
Solution:\
Ensure you're using a compatible Node.js version (v14.17.0 or higher).\
Update Node.js if necessary.

**WebAuthn Not Supported**
Issue: The browser indicates that WebAuthn is not supported.\
Solution:\
Use a modern browser that supports WebAuthn (e.g., latest Chrome, Firefox, Edge).\
Ensure that you're accessing the application via localhost.\
Check for any browser flags that need to be enabled.

### Security Considerations
**Use HTTPS in Production:** Always serve your application over HTTPS in a production environment.\
**Persistent Storage:** Implement a database to store users and credentials securely.\
**Session Management:** Use secure session handling mechanisms to maintain user sessions.\
**Input Validation:** Validate all user inputs to prevent injection attacks.\
**Rate Limiting:** Implement rate limiting to protect against brute-force attacks.\
**Environment Variables:** Store sensitive configurations in environment variables.\
**Error Handling:** Do not expose sensitive information in error messages.

### Next Steps
- Implement Database Integration
  - Replace in-memory storage with a persistent database like MongoDB or PostgreSQL.
  - Ensure credentials and user data are stored securely.
- Email Service Integration
  - Use an email service (e.g., SendGrid, Mailgun) to send OTPs to users instead of displaying them in the console.
- Enhance UI/UX
  - Improve the frontend interface for better user experience.
  - Add form validations and user feedback mechanisms.
- Deployment
  - Prepare the application for deployment by configuring environment variables and securing the servers.
  - Set up HTTPS certificates and domain configurations.