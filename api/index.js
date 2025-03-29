const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Determine the correct path to static files (adjust this to your actual file structure)
// This will serve files from the root directory 
app.use(express.static(path.join(__dirname, '..')));

// In-memory data store (would use a database in production)
let blogPosts = [];
let currentId = 1;

// API Routes
// Get all blog posts
app.get('/api/posts', (req, res) => {
  res.json(blogPosts);
});

// Get a specific blog post
app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = blogPosts.find(post => post.id === id);
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  res.json(post);
});

// Create a new blog post
app.post('/api/posts', (req, res) => {
  const { title, author, content } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }
  
  const newPost = {
    id: currentId++,
    title,
    author,
    content: content || '',
    createdAt: new Date().toISOString()
  };
  
  blogPosts.push(newPost);
  res.status(201).json(newPost);
});

// Update a blog post
app.put('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, content } = req.body;
  const postIndex = blogPosts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  const updatedPost = {
    ...blogPosts[postIndex],
    title: title || blogPosts[postIndex].title,
    author: author || blogPosts[postIndex].author,
    content: content || blogPosts[postIndex].content,
    updatedAt: new Date().toISOString()
  };
  
  blogPosts[postIndex] = updatedPost;
  res.json(updatedPost);
});

// Delete a blog post
app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const postIndex = blogPosts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  const deletedPost = blogPosts[postIndex];
  blogPosts.splice(postIndex, 1);
  
  res.json(deletedPost);
});

// Handle direct access to routes for SPA behavior
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/create', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'create.html'));
});

app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'view.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'about.html'));
});

// Default fallback handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server when running directly (not when imported by Vercel)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
}

// Export for Vercel serverless function
module.exports = app;