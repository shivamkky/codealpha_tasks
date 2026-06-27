// ── Auth Page Logic ──
// Handles both login and registration forms

async function handleLogin(e) {
  e.preventDefault();

  const btn = document.getElementById('login-btn');
  const alert = document.getElementById('login-alert');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAlert(alert, 'Please fill in all fields.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in...';
  alert.classList.remove('visible');

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showToast(`Welcome back, ${data.user.name}!`);

    // Redirect
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    setTimeout(() => {
      window.location.href = redirect;
    }, 500);
  } catch (err) {
    showAlert(alert, err.message || 'Login failed. Please try again.');
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const btn = document.getElementById('register-btn');
  const alert = document.getElementById('register-alert');

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;

  if (!name || !email || !password || !confirm) {
    showAlert(alert, 'Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    showAlert(alert, 'Password must be at least 6 characters.');
    return;
  }

  if (password !== confirm) {
    showAlert(alert, 'Passwords do not match.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating account...';
  alert.classList.remove('visible');

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    // Store auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showToast(`Welcome to NovaBuy, ${data.user.name}!`);

    // Redirect
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    setTimeout(() => {
      window.location.href = redirect;
    }, 500);
  } catch (err) {
    showAlert(alert, err.message || 'Registration failed. Please try again.');
    btn.disabled = false;
    btn.innerHTML = 'Create Account';
  }
}

function showAlert(element, message) {
  element.textContent = message;
  element.classList.add('visible');
}

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    window.location.href = redirect;
  }
});
