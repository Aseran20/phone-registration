# Phone Registration App with Firebase

A simple web application for registering phone numbers using Firebase Firestore.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "phone-registration")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change security rules later)
4. Select a location closest to your users
5. Click "Enable"

### 3. Configure Your App

1. In the Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Register your app with a nickname (e.g., "phone-registration-web")
5. Copy the Firebase configuration object

### 4. Update Firebase Configuration

1. Open `js/firebase.js` in your project
2. Replace the placeholder values in `firebaseConfig` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Run the Application

1. Install dependencies: `npm install`
2. Start a local server: `npm start`
3. Open your browser to the URL shown in the terminal (typically http://localhost:3000)

## Features

- Register phone numbers
- View list of registered phone numbers
- Debug panel for troubleshooting
- Responsive design

## Security Considerations

For production use, you should:

1. Set up proper Firestore security rules
2. Implement user authentication
3. Validate phone numbers before storing
4. Consider rate limiting to prevent abuse

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Use the debug panel (Ctrl+Shift+D) to view detailed logs
3. Verify your Firebase configuration is correct
4. Ensure your Firestore database is properly set up 