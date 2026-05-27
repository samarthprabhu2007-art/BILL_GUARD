// public/script.js
// Handles signup form submission and talks to Vercel serverless API

/**
 * Register a new user using the /api/users endpoint.
 * Expects a JSON body { name, email }.
 */
async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !email) {
    alert('Both name and email are required');
    return;
  }

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    alert('User created! ID: ' + data.insertedId);
    // Optionally reset the form
    document.getElementById('loginForm').reset();
  } catch (err) {
    console.error('Error creating user:', err);
    alert('Failed to create user: ' + err.message);
  }
}

// Attach the handler to the form when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', registerUser);
  }
});
