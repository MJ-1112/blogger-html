// Global state
let currentPost = null;
let posts = [];

// DOM Elements
const blogList = document.getElementById('blog-list');
const postContainer = document.getElementById('post-container');
const blogForm = document.getElementById('blog-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const contentInput = document.getElementById('content');

// API Functions
async function fetchPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

async function fetchPost(id) {
  try {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    
    const post = await response.json();
    currentPost = post;
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function createPost(postData) {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

async function updatePost(id, postData) {
  try {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) throw new Error('Failed to update post');
    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

async function deletePost(id) {
  try {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete post');
    return await response.json();
  } catch (error) {
    console.error('Error deleting post:', error);
    return null;
  }
}

// UI Functions
function renderPosts(posts) {
  if (!blogList) return;
  
  blogList.innerHTML = '';
  
  if (posts.length === 0) {
    blogList.innerHTML = '<p class="no-posts">No blog posts yet. Be the first to create one!</p>';
    return;
  }
  
  posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'blog-card';
    postEl.innerHTML = `
      <h3 class="card-title">${post.title}</h3>
      <p class="card-author">By: ${post.author}</p>
      <p class="card-preview">${post.content.slice(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
      <a href="/view?id=${post.id}" class="btn">Read More</a>
    `;
    blogList.appendChild(postEl);
  });
}

function renderPost(post) {
  if (!postContainer) return;
  
  postContainer.innerHTML = `
    <article class="blog-post">
      <h2 class="post-title">${post.title}</h2>
      <span class="post-meta">Written by ${post.author}</span>
      <div class="post-content">${post.content}</div>
      <div class="action-buttons">
        <a href="/create?edit=${post.id}" class="btn btn-edit">Edit</a>
        <button class="btn btn-delete" data-id="${post.id}">Delete</button>
      </div>
    </article>
  `;
  
  // Add delete event listener
  const deleteBtn = postContainer.querySelector('.btn-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        const id = deleteBtn.getAttribute('data-id');
        await deletePost(id);
        window.location.href = '/';
      }
    });
  }
}

function setupFormForEdit(post) {
  if (!blogForm) return;
  
  titleInput.value = post.title;
  authorInput.value = post.author;
  contentInput.value = post.content;
  
  const submitBtn = blogForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = 'Update Post';
  }
  
  blogForm.setAttribute('data-edit-id', post.id);
}

// Page Initialization
function initHomePage() {
  if (!blogList) return;
  
  fetchPosts().then(posts => {
    renderPosts(posts);
  });
}

function initViewPage() {
  if (!postContainer) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  
  if (postId) {
    fetchPost(postId).then(post => {
      if (post) {
        renderPost(post);
      } else {
        postContainer.innerHTML = `
          <div class="error-message">
            <h2>Post Not Found</h2>
            <p>The post you're looking for doesn't exist or has been removed.</p>
            <a href="/" class="btn">Back to Home</a>
          </div>
        `;
      }
    });
  } else {
    window.location.href = '/';
  }
}

function initCreatePage() {
  if (!blogForm) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    fetchPost(editId).then(post => {
      if (post) {
        setupFormForEdit(post);
      }
    });
  }
  
  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const postData = {
      title: titleInput.value,
      author: authorInput.value,
      content: contentInput.value
    };
    
    const editId = blogForm.getAttribute('data-edit-id');
    let result;
    
    if (editId) {
      result = await updatePost(editId, postData);
    } else {
      result = await createPost(postData);
    }
    
    if (result) {
      window.location.href = `/view?id=${result.id}`;
    }
  });
}

// Initialize page based on current URL
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  if (path === '/' || path === '/index.html') {
    initHomePage();
  } else if (path === '/view' || path === '/view.html') {
    initViewPage();
  } else if (path === '/create' || path === '/create.html') {
    initCreatePage();
  }
});