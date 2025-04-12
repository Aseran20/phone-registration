require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Twilio client
console.log('Loading Twilio credentials...');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Log the actual client configuration
console.log('Twilio client initialized with account:', twilioClient.accountSid);

// API endpoint to save phone number
app.post('/api/save-phone', async (req, res) => {
    const { phone } = req.body;
    
    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }

    try {
        const { data, error } = await supabase
            .from('phones')
            .insert([{ phone_number: phone }]);

        if (error) throw error;
        
        res.json({ message: 'Phone number saved successfully' });
    } catch (error) {
        console.error('Error saving phone number:', error);
        res.status(500).json({ message: 'Error saving phone number' });
    }
});

// API endpoint to get all phone numbers
app.get('/api/phones', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('phones')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching phone numbers:', error);
        res.status(500).json({ message: 'Error fetching phone numbers' });
    }
});

// Endpoint to send SMS
app.post('/api/send-sms', async (req, res) => {
    try {
        // Extract data from request
        const requestBody = req.body;
        const smsText = requestBody.message;
        const phoneList = requestBody.phoneNumbers;
        
        // Validate input
        if (!smsText || !phoneList || !Array.isArray(phoneList)) {
            console.error('Invalid request parameters:', { smsText, phoneList });
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        console.log('Attempting to send SMS to:', phoneList);
        console.log('Message content:', smsText);

        // Process each phone number
        const results = [];
        for (const phoneNumber of phoneList) {
            try {
                // Validate phone number format
                if (!isValidPhoneNumber(phoneNumber)) {
                    console.error('Invalid phone number format:', phoneNumber);
                    results.push({
                        phoneNumber,
                        status: 'error',
                        error: `Invalid phone number format: ${phoneNumber}`
                    });
                    continue;
                }

                console.log('Sending SMS to:', phoneNumber);
                
                // Create Twilio message
                const twilioResult = await twilioClient.messages.create({
                    body: smsText,
                    to: phoneNumber,
                    from: process.env.TWILIO_PHONE_NUMBER
                });
                
                console.log('SMS sent successfully to:', phoneNumber, 'Message SID:', twilioResult.sid);
                results.push({
                    phoneNumber,
                    status: 'success',
                    messageId: twilioResult.sid
                });
            } catch (error) {
                console.error('Error sending SMS to:', phoneNumber, 'Error:', error.message);
                results.push({
                    phoneNumber,
                    status: 'error',
                    error: error.message
                });
            }
        }

        console.log('SMS sending results:', results);
        res.json({ results });
    } catch (error) {
        console.error('Error in /api/send-sms endpoint:', error);
        res.status(500).json({ error: 'Failed to send SMS messages' });
    }
});

// Helper function to validate phone numbers
function isValidPhoneNumber(phone) {
    // Basic validation for E.164 format
    // Should start with + and contain only digits after that
    return /^\+[1-9]\d{1,14}$/.test(phone);
}

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 