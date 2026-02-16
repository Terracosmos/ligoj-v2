<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">{{ isEdit ? 'Edit Project' : 'New Project' }}</h1>
    </div>

    <v-card :loading="loading" max-width="700">
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.name"
            label="Name"
            :rules="[rules.required]"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="form.pkey"
            label="Project Key"
            :rules="[rules.required]"
            :disabled="isEdit"
            :hint="isEdit ? '' : 'Unique identifier, cannot be changed after creation'"
            persistent-hint
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="form.description"
            label="Description"
            variant="outlined"
            rows="3"
            class="mb-2"
          />
          <v-text-field
            v-model="form.teamLeader"
            label="Team Leader"
            hint="User login ID (e.g. admin)"
            persistent-hint
            variant="outlined"
            class="mb-2"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="isEdit" color="error" variant="tonal" @click="confirmDelete = true">
          <v-icon start>mdi-delete</v-icon> Delete
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="router.push('/home/project')">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" :loading="saving" @click="save">
          <v-icon start>mdi-content-save</v-icon> Save
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>Delete Project</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ form.name }}</strong>? This action cannot be undone.
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

const route = useRoute()
const router = useRouter()
const api = useApi()
const appStore = useAppStore()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  pkey: '',
  description: '',
  teamLeader: '',
})

const rules = {
  required: v => !!v || 'This field is required',
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    const data = await api.get(`rest/project/${route.params.id}`)
    if (data) {
      form.value.name = data.name || ''
      form.value.pkey = data.pkey || ''
      form.value.description = data.description || ''
      form.value.teamLeader = data.teamLeader?.id || ''
    }
    loading.value = false
    appStore.setTitle('Edit Project')
    appStore.setBreadcrumbs([
      { title: 'Home', to: '/' },
      { title: 'Projects', to: '/home/project' },
      { title: data?.name || 'Edit' },
    ])
  } else {
    appStore.setTitle('New Project')
    appStore.setBreadcrumbs([
      { title: 'Home', to: '/' },
      { title: 'Projects', to: '/home/project' },
      { title: 'New' },
    ])
  }
})

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  const payload = {
    name: form.value.name,
    pkey: form.value.pkey,
    description: form.value.description,
    teamLeader: form.value.teamLeader || null,
  }

  let result
  if (isEdit.value) {
    result = await api.put('rest/project', { id: Number(route.params.id), ...payload })
    // PUT returns 204 (null) on success
    if (result !== null && result?.code) {
      saving.value = false
      return
    }
  } else {
    result = await api.post('rest/project', payload)
    if (result == null) {
      saving.value = false
      return
    }
  }
  saving.value = false
  router.push('/home/project')
}

async function remove() {
  deleting.value = true
  await api.del(`rest/project/${route.params.id}`)
  deleting.value = false
  confirmDelete.value = false
  router.push('/home/project')
}
</script>
