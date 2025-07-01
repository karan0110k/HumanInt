# Human Intelligence Chatbot

A modern chatbot application that leverages Google's Gemini AI to provide intelligent conversational capabilities. This full-stack application includes user authentication, file handling, and real-time chat functionality.

## Features

- User Authentication (Email/Password and Google Sign-In)
- Real-time chat with Gemini AI
- File upload and processing capabilities
- Multiple chat sessions support
- Responsive design for desktop and mobile
- Secure user data storage

## Technologies Used

### Frontend
- React 19.1.0
- Firebase Authentication
- Material UI components
- CSS for styling
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB for data storage
- Google Generative AI (Gemini)
- Multer for file uploads
- CORS for cross-origin requests

### Dependencies

#### Client (Frontend)
```json
{
  "react": "^19.1.0",
  "firebase": "^11.9.1",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^13.5.0",
  "web-vitals": "^2.1.4"
}
```

#### Server (Backend)
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.8.7",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "@google/generative-ai": "^0.6.0",
  "multer": "^2.0.1"
}
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google Cloud Project with Gemini API enabled
- Firebase Project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ownchatbot-2
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Configure Environment Variables
Create a `.env` file in the backend directory with the following variables:
```env
PORT=4003
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
```

5. Start the development servers
In separate terminals:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend development server
cd client
npm start
```

## Project Structure

```
ownchatbot-2/
├── backend/
│   ├── server.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js
│   │   │   ├── Login.js
│   │   │   └── Login.css
│   │   ├── App.js
│   │   ├── index.js
│   │   └── firebase.js
│   └── package.json
└── README.md
```

## Usage

1. Access the application at `http://localhost:3000`
2. Sign up or log in using email/password or Google Sign-In
3. Create new chat sessions or continue previous conversations
4. Send text messages and upload files for processing
5. View AI responses in real-time

## Security

- All API endpoints are protected
- User authentication is enforced
- File uploads are validated
- Environment variables are used for sensitive data
- HTTPS is recommended for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers directly.
