const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer'); // Import multer for handling file uploads

// Load environment variables
dotenv.config();

// Check required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not found, using local MongoDB');
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes

// Configure Multer for file uploads
// We'll store files in memory as a Buffer to directly pass to Gemini.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/humint', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper function to convert Buffer to GoogleGenerativeAI.Part object for images
function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString('base64'), // Convert buffer to base64 string
      mimeType: file.mimetype, // Use the detected mime type
    },
  };
}

// Chat route - CORRECTED to handle multipart/form-data and call Gemini API correctly
app.post('/api/chat', upload.array('files'), async (req, res) => {
  try {
    let textMessage = req.body.message || ''; // Text input from the frontend
    const uploadedFiles = req.files || []; // 'files' must match the FormData key from the frontend

    console.log(`📩 Received request with message: "${textMessage}"`);
    if (uploadedFiles.length > 0) {
        console.log(`📦 Received ${uploadedFiles.length} files:`, uploadedFiles.map(f => `${f.originalname} (${f.mimetype})`));
    }

    // This array will hold the different parts of the prompt (text and images)
    const promptParts = [];
    
    // Add image parts for each uploaded file
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file.mimetype.startsWith('image/')) {
          promptParts.push(fileToGenerativePart(file));
        } else {
          // For non-image files, just acknowledge their presence in the text part.
          console.warn(`⚠️ File type ${file.mimetype} is not an image and will be described in text only.`);
          // This text will be combined with the main message later.
          textMessage += `\n\n[User also uploaded a file named "${file.originalname}" which cannot be viewed directly.]`;
        }
      }
    }
    
    // Add the text part AFTER processing files, so file acknowledgements are included
    if (textMessage.trim()) {
      promptParts.push({ text: textMessage.trim() });
    }

    // Validate input before calling Gemini
    if (promptParts.length === 0) {
      return res.status(400).json({ error: 'No content (text or supported files) provided.' });
    }

    console.log('🤖 Sending to Gemini API with prompt parts:', promptParts.map(p => p.text ? `Text: "${p.text.substring(0, 50)}..."` : `Image: ${p.inlineData.mimeType}`).join(', '));
    
    // The generateContent method takes an array of prompt parts directly.
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = await response.text();

    console.log('✅ AI Response:', text);

    res.json({ response: text });
  } catch (error) {
    console.error('❌ Error in chat:', error);
    // Log detailed error for development
    if (error.response && error.response.data) {
        console.error('Gemini API Error Details:', error.response.data);
    }
    res.status(500).json({
      error: 'Failed to get a response from the AI model.',
      details: error.message,
    });
  }
});


// Start server
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});