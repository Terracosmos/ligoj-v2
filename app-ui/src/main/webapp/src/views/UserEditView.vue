<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">{{ isEdit ? 'Edit User' : 'New User' }}</h1>
    </div>

    <v-alert v-if="demoMode" type="info" variant="tonal" density="compact" class="mb-4">
      Demo mode — No identity provider configured. Connect an IAM plugin (LDAP, AD, etc.) to manage users.
    </v-alert>

    <v-card :loading="loading" max-width="700">
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.id"
            label="Login"
            :rules="[rules.required]"
            :disabled="isEdit"
            :hint="isEdit ? '' : 'Unique login, cannot be changed after creation'"
            persistent-hint
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="form.firstName"
            label="First Name"
            :rules="[rules.required]"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="form.lastName"
            label="Last Name"
            :rules="[rules.required]"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="form.company"
            label="Company"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="form.mail"
            label="Email"
            type="email"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-if="isEdit"
            :model-value="groupsDisplay"
            label="Groups"
            variant="outlined"
            readonly
            class="mb-2"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="isEdit" color="error" variant="tonal" @click="confirmDelete = true">
          <v-icon start>mdi-delete</v-icon> Delete
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="router.push('/id/user')">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" :loading="saving" @click="save">
          <v-icon start>mdi-content-save</v-icon> Save
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>Delete User</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ form.id }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="remove">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi.js'
import { useAppStore } from '@/stores/app.js'
import { useErrorStore } from '@/stores/error.js'

const route = useRoute()
const router = useRouter()
const api = useApi()
const appStore = useAppStore()
const errorStore = useErrorStore()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)
const demoMode = ref(false)
const groups = ref([])

const isEdit = computed(() => !!route.params.id)
const groupsDisplay = computed(() => groups.value.map(g => g.name || g).join(', ') || '-')

const form = ref({
  id: '',
  firstName: '',
  lastName: '',
  company: '',
  mail: '',
})

const rules = {
  required: v => !!v || 'This field is required',
}

// Demo users matching UserListView
const DEMO_USERS = [
  { id: 'admin', firstName: 'Admin', lastName: 'User', company: 'Ligoj', mails: ['admin@ligoj.org'], groups: [{ name: 'Engineering' }, { name: 'Management' }] },
  { id: 'jdupont', firstName: 'Jean', lastName: 'Dupont', company: 'Ligoj', mails: ['jean.dupont@ligoj.org'], groups: [{ name: 'Engineering' }, { name: 'DevOps' }] },
  { id: 'mmartin', firstName: 'Marie', lastName: 'Martin', company: 'AcmeCorp', mails: ['marie.martin@acme.com'], groups: [{ name: 'Marketing' }] },
  { id: 'pdurand', firstName: 'Pierre', lastName: 'Durand', company: 'AcmeCorp', mails: ['pierre.durand@acme.com'], groups: [{ name: 'Engineering' }] },
  { id: 'sleblanc', firstName: 'Sophie', lastName: 'Leblanc', company: 'TechSolutions', mails: ['sophie.leblanc@techsol.com'], groups: [{ name: 'DevOps' }] },
  { id: 'tmoreau', firstName: 'Thomas', lastName: 'Moreau', company: 'TechSolutions', mails: ['thomas.moreau@techsol.com'], groups: [{ name: 'Sales' }] },
  { id: 'crichard', firstName: 'Claire', lastName: 'Richard', company: 'Ligoj', mails: ['claire.richard@ligoj.org'], groups: [{ name: 'Management' }] },
  { id: 'agarcia', firstName: 'Antoine', lastName: 'Garcia', company: 'Ligoj', mails: ['antoine.garcia@ligoj.org'], groups: [{ name: 'Engineering' }] },
]

function loadDemoUser(id) {
  const user = DEMO_USERS.find(u => u.id === id)
  if (user) {
    form.value.id = user.id
    form.value.firstName = user.firstName
    form.value.lastName = user.lastName
    form.value.company = user.company
    form.value.mail = user.mails?.[0] || ''
    groups.value = user.groups || []
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    const data = await api.get(`rest/service/id/user/${route.params.id}`)
    if (data && !data.code) {
      form.value.id = data.id || ''
      form.value.firstName = data.firstName || ''
      form.value.lastName = data.lastName || ''
      form.value.company = data.company || ''
      form.value.mail = data.mails?.[0] || ''
      groups.value = data.groups || []
    } else {
      // API unavailable — use demo data
      demoMode.value = true
      errorStore.clear()
      loadDemoUser(route.params.id)
    }
    loading.value = false
    appStore.setTitle('Edit User')
    appStore.setBreadcrumbs([
      { title: 'Home', to: '/' },
      { title: 'Identity' },
      { title: 'Users', to: '/id/user' },
      { title: form.value.id || 'Edit' },
    ])
  } else {
    appStore.setTitle('New User')
    appStore.setBreadcrumbs([
      { title: 'Home', to: '/' },
      { title: 'Identity' },
      { title: 'Users', to: '/id/user' },
      { title: 'New' },
    ])
    // Check if API is available
    const check = await api.get('rest/service/id/user/admin')
    if (!check || check.code) {
      demoMode.value = true
      errorStore.clear()
    }
  }
})

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (demoMode.value) {
    errorStore.push({ message: 'Demo mode — Connect an IAM plugin to save changes', status: 0 })
    return
  }

  saving.value = true
  const payload = {
    id: form.value.id,
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    company: form.value.company,
    mail: form.value.mail,
  }

  if (isEdit.value) {
    await api.put('rest/service/id/user', payload)
  } else {
    await api.post('rest/service/id/user', payload)
  }
  saving.value = false
  router.push('/id/user')
}

async function remove() {
  if (demoMode.value) {
    errorStore.push({ message: 'Demo mode — Connect an IAM plugin to delete users', status: 0 })
    confirmDelete.value = false
    return
  }

  deleting.value = true
  await api.del(`rest/service/id/user/${route.params.id}`)
  deleting.value = false
  confirmDelete.value = false
  router.push('/id/user')
}
</script>
