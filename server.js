const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-json');

const app = express();

app.use(bodyParser.json());

// Initialize Firebase admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com'
});

const db = admin.firestore();

// Serve the frontend
app.use(express.static('public'));

// Endpoint to add messages
app.post('/addMessage', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const newMessage = {
            text: message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('messages').add(newMessage);
        return res.status(201).json({ message: 'Message added successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Endpoint to get messages
app.get('/getMessages', async (req, res) => {
    try {
        const messagesSnapshot = await db.collection('messages').orderBy('timestamp', 'asc').get();
        const messages = messagesSnapshot.docs.map(doc => doc.data());
        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
