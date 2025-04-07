require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 