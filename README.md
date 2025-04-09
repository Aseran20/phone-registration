# Sendo Swiss - SMS Dashboard

A web application for managing SMS campaigns and phone number registrations for coffee shops. Built with Node.js, Express, Firebase, and Twilio.

## Features

- User authentication with Firebase
- Phone number registration and validation
- SMS campaign management
- Real-time dashboard statistics
- Support for both Swiss and French phone numbers
- Secure SMS sending through Twilio

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account
- Twilio account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sendo-swiss.git
cd sendo-swiss
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your configuration:
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Start the development server:
```bash
node server.js
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
sendo-swiss/
├── assets/
│   └── images/
├── css/
│   └── styles.css
├── js/
│   ├── coffee-shop-dashboard.js
│   ├── coffee-shop-phones.js
│   └── debug.js
├── server.js
├── coffee-shop-dashboard.html
├── coffee-shop-phones.html
└── coffee-shop-login.html
```

## Usage

1. Register or log in to your coffee shop account
2. View dashboard statistics
3. Manage registered phone numbers
4. Send SMS campaigns to all registered numbers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 