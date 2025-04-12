const twilio = require('twilio');

exports.handler = async function(event, context) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Parse the request body
        const { message, phoneNumbers } = JSON.parse(event.body);

        // Initialize Twilio client
        const twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Process each phone number
        const results = [];
        for (const phoneNumber of phoneNumbers) {
            try {
                // Create Twilio message
                const twilioResult = await twilioClient.messages.create({
                    body: message,
                    to: phoneNumber,
                    from: process.env.TWILIO_PHONE_NUMBER
                });

                results.push({
                    phoneNumber,
                    status: 'success',
                    messageId: twilioResult.sid
                });
            } catch (error) {
                results.push({
                    phoneNumber,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ results })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to send SMS messages" })
        };
    }
}; 