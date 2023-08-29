const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        messageInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
// Initialize Firebase
// Replace with your own Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userDetails = document.getElementById('user-details');

const auth = firebase.auth();

auth.onAuthStateChanged(user => {
    if (user) {
        userDetails.textContent = `Logged in as: ${user.email}`;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        messageInput.disabled = false;
        sendButton.disabled = false;
    } else {
        userDetails.textContent = 'Not logged in';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        messageInput.disabled = true;
        sendButton.disabled = true;
    }
});

loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .catch(error => {
            console.error(error.message);
        });
});

logoutButton.addEventListener('click', () => {
    auth.signOut()
        .catch(error => {
            console.error(error.message);
        });
});

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
        console.log('User not logged in');
        return;
    }

    const message = messageInput.value.trim();
    if (message !== '') {
        // Save the message to the database or display it in the chat box
        // ...

        messageInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
// Update the sendButton.addEventListener block
sendButton.addEventListener('click', sendMessage);

// Function to send a message to the server
function sendMessage() {
    const user = auth.currentUser;
    if (!user) {
        console.log('User not logged in');
        return;
    }

    const message = messageInput.value.trim();
    if (message !== '') {
        const messageObj = {
            text: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid,
            userName: user.displayName,
        };

        // Save the message to the Firestore database
        db.collection('messages')
            .add(messageObj)
            .then(() => {
                console.log('Message sent successfully');
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });

        messageInput.value = '';
    }
}

// Function to display messages in the chat box
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `${message.userName}: ${message.text}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen for new messages from the Firestore database
db.collection('messages')
    .orderBy('timestamp', 'asc')
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                displayMessage(change.doc.data());
            }
        });
    });
