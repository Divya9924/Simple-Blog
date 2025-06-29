
require('dotenv').config();

const express = require('express');
const cors = require('cors'); 
const admin = require('firebase-admin'); 

const serviceAccount = require('./serviceAccountKey.json');


let db; 
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully!');
    db = admin.firestore();
    console.log('Firestore reference obtained successfully!');
} catch (error) {
    console.error('CRITICAL ERROR: Failed to initialize Firebase Admin SDK. Please check serviceAccountKey.json and Firebase project settings:', error.message);
    process.exit(1); 
}


const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());


app.get('/api/posts', async (req, res) => {
    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef.orderBy('createdAt', 'desc').get(); 

        
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,        
            _id: doc.id,        
            ...doc.data()      
        }));

        res.json(posts); 
    } catch (err) {
        console.error('Error fetching posts from Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not retrieve posts from database.' });
    }
});


app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const postDoc = await db.collection('posts').doc(postId).get(); 

        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found' }); 
        }

        res.json({ id: postDoc.id, _id: postDoc.id, ...postDoc.data() });
    } catch (err) {
        console.error('Error fetching single post from Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not retrieve post.' });
    }
});


app.post('/api/posts', async (req, res) => {
    const { title, content } = req.body;


    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const newPostRef = await db.collection('posts').add({
            title,
            content,
            createdAt: admin.firestore.FieldValue.serverTimestamp() 
        });

        const newPostDoc = await newPostRef.get();
        res.status(201).json({ id: newPostDoc.id, _id: newPostDoc.id, ...newPostDoc.data() });
    } catch (err) {
        console.error('Error creating post in Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not create post.' });
    }
});


app.put('/api/posts/:id', async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id; 

    if (!title && !content) {
        return res.status(400).json({ message: 'At least one field (title or content) is required for update' });
    }

    try {
        const postRef = db.collection('posts').doc(postId); 
        await postRef.update({ title, content }); 

        const updatedPostDoc = await postRef.get();
        res.json({ id: updatedPostDoc.id, _id: updatedPostDoc.id, ...updatedPostDoc.data() });
    } catch (err) {
        console.error('Error updating post in Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not update post.' });
    }
});


app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id; 
        await db.collection('posts').doc(postId).delete(); 

        res.status(204).send(); 
    } catch (err) {
        console.error('Error deleting post from Firestore:', err.message);
        res.status(500).json({ message: 'Server Error: Could not delete post.' });
    }
});

app.get('/', (req, res) => {
    res.send('Simple Blog API with Firestore is running!');
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});