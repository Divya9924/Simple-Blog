// backend/server.js

// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const admin = require('firebase-admin'); // Firebase Admin SDK for Node.js

// IMPORTANT: Path to your service account key file
// Make sure 'serviceAccountKey.json' is in the same directory as server.js
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK - CRITICAL: ADDED ERROR HANDLING HERE
let db; // Declare db here so it's accessible globally after initialization
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully!');
    // Get a reference to the Firestore database
    db = admin.firestore();
    console.log('Firestore reference obtained successfully!');
} catch (error) {
    console.error('CRITICAL ERROR: Failed to initialize Firebase Admin SDK. Please check serviceAccountKey.json and Firebase project settings:', error.message);
    // If Firebase initialization fails, the server cannot function, so exit.
    process.exit(1); 
}

// Create an Express application instance
const app = express();

// Define the port the server will listen on.
// It tries to use the PORT environment variable, otherwise defaults to 5000.
const PORT = process.env.PORT || 5000;

// Middleware setup
// -----------------------------------------------------------------------------
// Enable CORS for all routes. This is important for the frontend (React app)
// to be able to make requests to this backend from a different origin (port/domain).
app.use(cors());

// Enable Express to parse JSON formatted request bodies.
// This allows you to access data sent in the request body (e.g., from POST requests)
// via req.body.
app.use(express.json());

// API Routes for Blog Posts
// Base API path: /api/posts
// -----------------------------------------------------------------------------

// Route 1: GET all posts
// Method: GET
// Path: /api/posts
// Description: Retrieves all blog posts from Firestore, sorted by creation date (newest first).
app.get('/api/posts', async (req, res) => {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef.orderBy('createdAt', 'desc').get(); // Order by createdAt field

        // Map Firestore documents to a cleaner array of objects
        // Also map 'id' from Firestore to '_id' for frontend compatibility (React often uses _id for keys)
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,         // Firestore's unique document ID
            _id: doc.id,        // Alias for frontend's convenience
            ...doc.data()       // All other fields like title, content
        }));

        res.json(posts); // Send the posts as a JSON response
    } catch (err) {
        // Log errors to the backend terminal
        console.error('Error fetching posts from Firestore:', err.message);
        // Send a 500 Internal Server Error response to the frontend
        res.status(500).json({ message: 'Server Error: Could not retrieve posts from database.' });
    }
});

// Route 2: GET a single post by ID
// Method: GET
// Path: /api/posts/:id
// Description: Retrieves a single blog post using its unique ID from Firestore.
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const postDoc = await db.collection('posts').doc(postId).get(); // Get a single document by ID

        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found' }); // If no post is found, send a 404 response
        }

        // Map Firestore document to a cleaner object, including _id alias
        res.json({ id: postDoc.id, _id: postDoc.id, ...postDoc.data() });
    } catch (err) {
        console.error('Error fetching single post from Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not retrieve post.' });
    }
});

// Route 3: CREATE a new post
// Method: POST
// Path: /api/posts
// Description: Creates a new blog post in Firestore using data from the request body.
app.post('/api/posts', async (req, res) => {
    // Extract title and content from the request body
    const { title, content } = req.body;

    // Basic validation: ensure title and content are provided
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        // Add a new document to the 'posts' collection
        const newPostRef = await db.collection('posts').add({
            title,
            content,
            createdAt: admin.firestore.FieldValue.serverTimestamp() // Firestore's server timestamp
        });

        // Retrieve the newly created document to send back its data including its ID
        const newPostDoc = await newPostRef.get();
        res.status(201).json({ id: newPostDoc.id, _id: newPostDoc.id, ...newPostDoc.data() });
    } catch (err) {
        console.error('Error creating post in Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not create post.' });
    }
});

// Route 4: UPDATE an existing post
// Method: PUT
// Path: /api/posts/:id
// Description: Updates an existing blog post identified by its ID in Firestore.
app.put('/api/posts/:id', async (req, res) => {
    // Extract title and content from the request body
    const { title, content } = req.body;
    const postId = req.params.id; // Get post ID from URL parameter

    // Basic validation: ensure at least one field is provided for update
    if (!title && !content) {
        return res.status(400).json({ message: 'At least one field (title or content) is required for update' });
    }

    try {
        const postRef = db.collection('posts').doc(postId); // Get a reference to the specific document
        await postRef.update({ title, content }); // Update the document

        // Retrieve the updated document to send back
        const updatedPostDoc = await postRef.get();
        res.json({ id: updatedPostDoc.id, _id: updatedPostDoc.id, ...updatedPostDoc.data() });
    } catch (err) {
        console.error('Error updating post in Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not update post.' });
    }
});

// Route 5: DELETE a post
// Method: DELETE
// Path: /api/posts/:id
// Description: Deletes a blog post identified by its ID from Firestore.
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id; // Get post ID from URL parameter
        await db.collection('posts').doc(postId).delete(); // Delete the document

        // Send a 204 No Content status for successful deletion
        res.status(204).send(); // No content to send back after successful deletion
    } catch (err) {
        console.error('Error deleting post from Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not delete post.' });
    }
});

// Basic route for root URL (optional, for testing if server is running)
app.get('/', (req, res) => {
    res.send('Simple Blog API with Firestore is running!');
});

// Start the server
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});