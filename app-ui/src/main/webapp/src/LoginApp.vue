<template>
  <v-app>
    <v-main class="login-bg d-flex align-center justify-center">
      <v-card width="400" elevation="8" rounded="lg" class="pa-4">
        <v-card-text class="text-center pb-0">
          <img src="@/assets/ligoj.svg" alt="Ligoj" style="width: 48px; height: 48px" />
          <h1 class="text-h5 font-weight-bold mt-2 mb-4" style="color: #1a237e">Ligoj</h1>
        </v-card-text>

        <v-card-text>
          <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mb-4">
            {{ errorMsg }}
          </v-alert>

          <v-form @submit.prevent="doLogin">
            <v-text-field
              v-model="username"
              :label="msg.username"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              autofocus
              autocomplete="username"
              :rules="[v => !!v || msg.required]"
              class="mb-2"
            />
            <v-text-field
              v-model="password"
              :label="msg.password"
              prepend-inner-icon="mdi-lock"
              :type="showPwd ? 'text' : 'password'"
              :append-inner-icon="showPwd ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPwd = !showPwd"
              variant="outlined"
              autocomplete="current-password"
              :rules="[v => !!v || msg.required]"
              class="mb-4"
            />
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
            >{{ msg.submit }}</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive } from 'vue'

const isFr = (navigator.language || '').startsWith('fr')

const msg = reactive(isFr ? {
  username: 'Nom d\'utilisateur',
  password: 'Mot de passe',
  submit: 'Se connecter',
  required: 'Ce champ est requis',
  failed: 'Identifiant ou mot de passe invalide',
  error: 'Échec de la connexion',
  network: 'Erreur réseau. Veuillez réessayer.',
} : {
  username: 'Username',
  password: 'Password',
  submit: 'Sign in',
  required: 'This field is required',
  failed: 'Invalid username or password',
  error: 'Login failed',
  network: 'Network error. Please try again.',
})

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showPwd = ref(false)

async function doLogin() {
  if (!username.value || !password.value) return
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
      errorMsg.value = resp.status === 401 ? msg.failed : msg.error
      return
    }
    window.location.href = 'v-index.html'
  } catch {
    errorMsg.value = msg.network
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%);
}
</style>
