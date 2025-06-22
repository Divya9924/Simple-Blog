// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';

// Define the base URL for your backend API.
// IMPORTANT: Replace this with your actual deployed backend URL
// (e.g., 'https://your-blog-backend.render.com/api')
// If testing locally, use 'http://localhost:5000/api'.
const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
    // State to store the list of blog posts
    const [posts, setPosts] = useState([]);
    // State for loading indicator
    const [loading, setLoading] = useState(true);
    // State for error messages
    const [error, setError] = useState(null);
    // State for the title of a new/edited post
    const [title, setTitle] = useState('');
    // State for the content of a new/edited post
    const [content, setContent] = useState('');
    // State to track if we are in 'edit' mode and which post is being edited
    const [editingPost, setEditingPost] = useState(null); // null if not editing, post object if editing
    // State for displaying a custom message/modal to the user
    const [message, setMessage] = useState('');
    // State to control visibility of the message modal
    const [showMessageModal, setShowMessageModal] = useState(false);

    // Function to display a message modal
    const showModal = (msg) => {
        setMessage(msg);
        setShowMessageModal(true);
    };

    // Function to close the message modal
    const closeModal = () => {
        setShowMessageModal(false);
        setMessage('');
    };

    // useEffect hook to fetch posts when the component mounts
    useEffect(() => {
        fetchPosts();
    }, []); // Empty dependency array means this runs once on mount

    // Function to fetch all posts from the backend API
    const fetchPosts = async () => {
        setLoading(true); // Set loading to true before fetching
        setError(null);   // Clear any previous errors
        try {
            const response = await fetch(`${API_BASE_URL}/posts`);
            if (!response.ok) {
                // If response is not OK (e.g., 404, 500), throw an error
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch posts');
            }
            const data = await response.json();
            // Firestore's `createdAt` is a Timestamp object, convert it for display
            const formattedData = data.map(post => ({
                ...post,
                createdAt: post.createdAt ? new Date(post.createdAt._seconds * 1000 + post.createdAt._nanoseconds / 1000000) : new Date()
            }));
            setPosts(formattedData); // Update the posts state with fetched data
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message); // Set the error message
            showModal(`Error: ${err.message}. Please check if the backend is running.`); // Show error in modal
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    // Function to handle adding a new post or updating an existing one
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior (page reload)
        setError(null);     // Clear any previous errors

        if (!title.trim() || !content.trim()) {
            showModal('Title and Content cannot be empty.');
            return;
        }

        const postData = { title, content };
        let url = `${API_BASE_URL}/posts`;
        let method = 'POST';

        if (editingPost) {
            // If editingPost is not null, it means we are updating an existing post
            url = `${API_BASE_URL}/posts/${editingPost._id}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json', // Specify content type as JSON
                },
                body: JSON.stringify(postData), // Send post data as a JSON string
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${editingPost ? 'update' : 'add'} post`);
            }

            // Clear the form fields
            setTitle('');
            setContent('');
            setEditingPost(null); // Exit editing mode
            fetchPosts(); // Re-fetch posts to update the list
            showModal(`Post successfully ${editingPost ? 'updated' : 'added'}!`); // Show success message in modal

        } catch (err) {
            console.error(`Error ${editingPost ? 'updating' : 'adding'} post:`, err);
            setError(err.message);
            showModal(`Error: ${err.message}.`);
        }
    };

    // Function to set up the form for editing an existing post
    const handleEdit = (post) => {
        setTitle(post.title);
        setContent(post.content);
        setEditingPost(post); // Set the post to be edited
    };

    // Function to cancel editing and clear the form
    const handleCancelEdit = () => {
        setTitle('');
        setContent('');
        setEditingPost(null);
    };

    // Function to handle deleting a post
    const handleDelete = async (postId) => {
        setError(null); // Clear any previous errors
        // Ask for confirmation using a custom modal instead of alert/confirm
        showModal(
            <div className="flex flex-col items-center p-4">
                <p className="text-xl font-semibold text-gray-800 mb-6">Are you sure you want to delete this post?</p>
                <div className="flex space-x-6">
                    <button
                        className="flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={async () => {
                            closeModal(); // Close confirmation modal
                            try {
                                const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                                    method: 'DELETE', // HTTP DELETE method
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.message || 'Failed to delete post');
                                }

                                fetchPosts(); // Re-fetch posts to update the list
                                showModal('Post successfully deleted!'); // Show success message
                            } catch (err) {
                                console.error('Error deleting post:', err);
                                setError(err.message);
                                showModal(`Error: ${err.message}.`);
                            }
                        }}
                    >
                        {/* SVG Icon for Delete */}
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete
                    </button>
                    <button
                        className="flex items-center px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-lg hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={closeModal} // Close confirmation modal
                    >
                        {/* SVG Icon for Cancel */}
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Overall container: Removed background gradient and min-h-screen.
                These will now be applied to html, body in index.css for full page coverage. */}
            <div className="p-4 sm:p-8 font-inter antialiased flex flex-col items-center">

                {/* Header Section */}
                <header className="w-full text-center py-8 mb-10 bg-white bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300 px-4 sm:px-8">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4 drop-shadow-lg">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700">Simple Blog Manager</span>
                    </h1>
                    {/* The max-w-2xl mx-auto on the paragraph below keeps its text centered and readable on wide screens */}
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Your personal space to <span className="font-semibold text-blue-500">create</span>, <span className="font-semibold text-green-500">read</span>, <span className="font-semibold text-yellow-500">update</span>, and <span className="font-semibold text-red-500">delete</span> your insightful thoughts!
                    </p>
                </header>

                {/* Main Content Area */}
                {/* This main element already uses w-full and mx-auto, allowing it to take full available width, centered. */}
                <main className="w-full mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-200 backdrop-blur-sm bg-opacity-95">

                    {/* Post Form Section */}
                    <section className="mb-12 p-6 sm:p-8 bg-blue-50 rounded-2xl shadow-inner border border-blue-200 transition-all duration-300">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center bg-white rounded-xl py-3 shadow-md border border-gray-200">
                            {editingPost ? 'Edit Your Post' : 'Craft a New Post'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                            <div>
                                <label htmlFor="title" className="block text-gray-700 text-lg font-semibold mb-3">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition duration-300 ease-in-out text-gray-800 placeholder-gray-400 text-base outline-none"
                                    placeholder="e.g., My First Blog Post"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-gray-700 text-lg font-semibold mb-3">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows="8"
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition duration-300 ease-in-out text-gray-800 placeholder-gray-400 text-base resize-y outline-none"
                                    placeholder="Share your thoughts here..."
                                    required
                                ></textarea>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                                {editingPost && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105"
                                    >
                                        {/* SVG Icon for Cancel */}
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        Cancel Edit
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105"
                                >
                                    {editingPost ? (
                                        <>
                                            {/* SVG Icon for Update */}
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            Update Post
                                        </>
                                    ) : (
                                        <>
                                            {/* SVG Icon for Add */}
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Add Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Post List Section */}
                    <section className="p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center bg-blue-50 rounded-xl py-3 shadow-md border border-blue-100">All Posts</h2>

                        {/* Loading and Error Messages */}
                        {loading && (
                            <p className="text-center text-xl text-blue-600 font-medium animate-pulse py-8">Loading posts...</p>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center text-lg font-medium shadow-md" role="alert">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        {!loading && posts.length === 0 && (
                            <p className="text-center text-gray-500 text-xl py-8">No posts yet. Start by crafting your first masterpiece above!</p>
                        )}

                        {/* Posts Grid */}
                        {/* Changed lg:grid-cols-2 to md:grid-cols-2 to make two columns appear on smaller screen widths */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {posts.map((post) => (
                                <div key={post._id} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl hover:border-blue-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-700 text-base mb-4 flex-grow line-clamp-4"> {/* line-clamp for content preview */}
                                        {post.content}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-5 border-t border-gray-100 pt-3">
                                        Published on: {post.createdAt instanceof Date ? post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </p>
                                    <div className="flex justify-end space-x-4 mt-auto"> {/* mt-auto pushes buttons to bottom */}
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="flex items-center px-5 py-2 bg-yellow-500 text-white font-medium rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition duration-300 ease-in-out transform hover:scale-105"
                                        >
                                            {/* SVG Icon for Edit */}
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="flex items-center px-5 py-2 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-300 ease-in-out transform hover:scale-105"
                                        >
                                            {/* SVG Icon for Delete */}
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>

            {/* Custom Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center transform scale-100 opacity-100 transition-all duration-300 ease-out animate-scale-in border border-blue-200">
                        <div className="text-gray-800 text-xl font-semibold mb-6">
                            {message}
                        </div>
                        {typeof message === 'string' && ( // Only show "OK" button if message is a simple string
                            <button
                                onClick={closeModal}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tailwind Custom Animations - IMPORTANT: These need to be in a style tag for the CDN to pick them up */}
            <style>
                {`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }

                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }

                /* For the line-clamp utility */
                .line-clamp-4 {
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                `}
            </style>
        </>
    );
}
