const API_URL = 'http://localhost:5000';

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const createPostForm = document.getElementById('create-post-form');
const postList = document.getElementById('post-list');
const logoutButton = document.createElement('button');
logoutButton.textContent = 'Logout';
logoutButton.style.display = 'none'; // Initially hide logout button
document.body.appendChild(logoutButton);

// Toggle between signup and login forms
document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
  document.getElementById('auth-title').textContent = 'Login';
});

document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  document.getElementById('auth-title').textContent = 'Signup';
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    alert(data.message);
  } catch (error) {
    alert('Error signing up');
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data.message);
    if (data.token) {
      localStorage.setItem('token', data.token);
      showLogoutButton(); // Display logout button after login
      loadPosts();
    }
  } catch (error) {
    alert('Error logging in');
  }
});

createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    alert(data.message);
    loadPosts();
  } catch (error) {
    alert('Error creating post');
  }
});

async function addComment(postId, content) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/comments/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    alert(data.message);
    if (data.comment) {
      const commentsDiv = document.getElementById(`comments-${postId}`);
      const commentElement = document.createElement('div');
      commentElement.textContent = data.comment.content;
      commentsDiv.appendChild(commentElement);
    }
  } catch (error) {
    alert('Error adding comment');
  }
}

function showCommentForm(postId) {
  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.placeholder = 'Enter your comment';
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.addEventListener('click', () => {
    const content = commentInput.value;
    if (content.trim() !== '') {
      addComment(postId, content);
      commentInput.value = ''; // Clear input after submitting
    } else {
      alert('Please enter a comment');
    }
  });

  const commentsDiv = document.getElementById(`comments-${postId}`);
  commentsDiv.appendChild(commentInput);
  commentsDiv.appendChild(submitButton);
}

async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();
    postList.innerHTML = posts.map(post => `
      <div class="post">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p>by ${post.author.username}</p>
        <div id="comments-${post._id}" class="comments">
          <input type="text" id="comment-content-${post._id}" placeholder="Enter your comment" required>
          <button onclick="addComment('${post._id}', document.getElementById('comment-content-${post._id}').value)">Submit</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    postList.innerHTML = '<p>Error loading posts</p>';
  }
}

async function logout() {
  localStorage.removeItem('token');
  logoutButton.style.display = 'none'; // Hide logout button after logout
  loginForm.style.display = 'block'; // Show login form after logout
  signupForm.style.display = 'block'; // Show signup form after logout
  createPostForm.style.display = 'none'; // Hide create post form after logout
  postList.innerHTML = ''; // Clear post list after logout
}

function showLogoutButton() {
  logoutButton.style.display = 'block'; // Show logout button after login
  loginForm.style.display = 'none'; // Hide login form after login
  signupForm.style.display = 'none'; // Hide signup form after login
  document.getElementById('posts').style.display = 'block'; // Show posts section after login
  createPostForm.style.display = 'block'; // Show create post form after login
}

logoutButton.addEventListener('click', logout);

document.getElementById('auth').appendChild(logoutButton); // Append logout button to auth section
loadPosts();
