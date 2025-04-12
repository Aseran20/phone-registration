# Phone Registration System

A web application for coffee shops to register customer phone numbers and send SMS messages to their customers.

## Features

- **User Authentication**: Secure login and registration for coffee shop owners
- **Phone Number Registration**: Collect and store customer phone numbers
- **Dashboard**: View statistics and manage registered phone numbers
- **SMS Messaging**: Send messages to all registered customers
- **Message History**: Track and view sent messages and their delivery status

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Authentication, Firestore)
- **SMS API**: Twilio (for sending SMS messages)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/phone-registration.git
   cd phone-registration
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Update the Firebase configuration in `js/firebase-config.js`

4. Configure SMS API:
   - Sign up for a Twilio account at [https://www.twilio.com/](https://www.twilio.com/)
   - Update the SMS API configuration in your backend

5. Start the development server:
   ```
   npm start
   ```

6. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Project Structure

- `index.html`: Landing page
- `login.html`: User login page
- `register.html`: User registration page
- `coffee-shop-dashboard.html`: Dashboard for coffee shop owners
- `coffee-shop-phones.html`: Phone number management page
- `coffee-shop-messages.html`: Message history page
- `css/`: Stylesheets
- `js/`: JavaScript files
- `assets/`: Images and other assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Firebase for authentication and database
- Twilio for SMS messaging
- Font Awesome for icons
- Google Fonts for typography 