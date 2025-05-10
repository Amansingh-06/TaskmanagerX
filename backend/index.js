const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');


// Supabase Client Setup
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set VAPID keys
webpush.setVapidDetails(
    'mailto:you@example.com',  // Replace with your email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// 👉 Save Subscription in Supabase
app.post('/api/save-subscription', async (req, res) => {
    const { endpoint, expirationTime, keys } = req.body;

    // Check if already exists
    const { data: existing, error: checkError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('endpoint', endpoint);

    if (checkError) {
        console.error('Check error:', checkError);
        return res.status(500).json({ error: 'Internal error while checking subscription' });
    }

    if (existing.length > 0) {
        return res.status(200).json({ message: 'Subscription already exists' });
    }

    // Insert new
    const { data, error } = await supabase
        .from('subscriptions')
        .insert({
            endpoint,
            expirationTime,
            keys_p256dh: keys.p256dh,
            keys_auth: keys.auth
        });

    if (error) {
        console.error('Error saving subscription:', error);
        return res.status(500).json({ error: 'Failed to save subscription' });
    }

    res.status(201).json({ message: 'Subscription saved', data });
});

// 👉 Send Notification
app.post('/api/send-notification', async (req, res) => {
    const { title, message } = req.body;

    const notificationPayload = JSON.stringify({
        title,
        body: message
    });

    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*');

    if (error) {
        console.error('Error fetching subscriptions:', error);
        return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    const results = await Promise.allSettled(
        subscriptions.map((sub, index) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.keys_p256dh,
                        auth: sub.keys_auth,
                    },
                },
                notificationPayload
            ).then(() => {
                console.log(`✅ Notification sent to subscription ${index + 1}`);
            }).catch((err) => {
                console.error(`❌ Failed to send notification to subscription ${index + 1}`);
                console.error('Error details:', err);

                // If subscription is expired or app is closed
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.warn('👉 This subscription is no longer valid (may be app closed or expired)');
                }
            })
        )
    );

    res.json({ status: 'sent', results });
});

// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
