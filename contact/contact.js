export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields',
                warning: 'All fields are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address',
                warning: 'Please enter a valid email'
            });
        }

        // Message length validation
        if (message.length < 10 || message.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Message must be between 10 and 5000 characters',
                warning: 'Please write a more detailed message'
            });
        }

        // Log submission (in production, you'd send emails or save to a database)
        console.log('New contact form submission:', {
            name,
            email,
            message,
            timestamp: new Date().toISOString()
        });

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Thank you! Your message has been received.',
            data: { name, email, timestamp: new Date().toISOString() }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request',
            warning: 'Please try again or email us directly'
        });
    }
}
