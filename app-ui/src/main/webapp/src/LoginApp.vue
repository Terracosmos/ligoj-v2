<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/ligoj.svg" alt="Ligoj" class="login-logo" />
        <h1>Ligoj</h1>
      </div>

      <form class="login-form" @submit.prevent="doLogin">
        <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            autofocus
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Sign in</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function doLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams()
    params.append('username', username.value)
    params.append('password', password.value)
    const resp = await fetch('login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      credentials: 'include',
    })
    const data = await resp.json().catch(() => null)
    if (!resp.ok || (data && !data.success)) {
      errorMsg.value = resp.status === 401 ? 'Invalid username or password' : 'Login failed'
      return
    }
    window.location.href = 'v-index.html'
  } catch {
    errorMsg.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%);
  font-family: 'Segoe UI', Roboto, sans-serif;
}
.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}
.login-logo {
  height: 48px;
  margin-bottom: 0.5rem;
}
.login-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a237e;
}
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 2px rgba(26,35,126,0.15);
}
.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #1a237e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.login-btn:hover:not(:disabled) {
  background: #0d47a1;
}
.login-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.login-error {
  background: #ffebee;
  color: #c62828;
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
