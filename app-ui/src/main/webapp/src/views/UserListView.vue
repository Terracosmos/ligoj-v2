<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Users</h1>
      <v-spacer />
      <v-text-field
        v-model="dt.search.value"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        variant="outlined"
        density="compact"
        hide-details
        class="search-field mr-3"
        @update:model-value="onSearch"
      />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="router.push('/id/user/new')">
        New User
      </v-btn>
    </div>

    <v-alert v-if="dt.error.value" type="warning" variant="tonal" class="mb-4">
      <v-alert-title>Identity provider not available</v-alert-title>
      {{ dt.error.value === 'internal' ? 'No identity provider is configured. Connect an IAM plugin (LDAP, AD, etc.) to manage users.' : dt.error.value }}
    </v-alert>

    <v-alert v-if="dt.demoMode.value" type="info" variant="tonal" density="compact" class="mb-4">
      Showing cached identity data. Connect an IAM plugin for live management.
    </v-alert>

    <v-data-table-server
      v-if="!dt.error.value"
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="dt.items.value"
      :items-length="dt.totalItems.value"
      :loading="dt.loading.value"
      hover
      @update:options="loadData"
      @click:row="(_, { item }) => router.push('/id/user/' + item.id)"
    >
      <template #item.mails="{ item }">
        {{ item.mails?.[0] || '' }}
      </template>
      <template #item.groups="{ item }">
        <v-chip
          v-for="g in (item.groups || []).slice(0, 3)"
          :key="g.name || g"
          size="small"
          class="mr-1"
        >{{ g.name || g }}</v-chip>
        <span v-if="(item.groups || []).length > 3" class="text-caption text-medium-emphasis">
          +{{ item.groups.length - 3 }}
        </span>
      </template>
      <template #item.locked="{ item }">
        <v-icon v-if="item.locked" color="error" size="small">mdi-lock</v-icon>
        <v-icon v-else color="success" size="small">mdi-lock-open-variant</v-icon>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" @click.stop="router.push('/id/user/' + item.id)">
          <v-icon size="small">mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click.stop="startDelete(item)">
          <v-icon size="small">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete User</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ deleteTarget?.id }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="confirmDeleteUser">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataTable } from '@/composables/useDataTable.js'
import { useApi } from '@/composables/useApi.js'
import { useAppStore } from '@/stores/app.js'
import { useErrorStore } from '@/stores/error.js'

const router = useRouter()
const appStore = useAppStore()
const api = useApi()
const errorStore = useErrorStore()
const DEMO_USERS = [
  { id: 'admin', firstName: 'Admin', lastName: 'User', company: 'Ligoj', mails: ['admin@ligoj.org'], groups: [{ name: 'Engineering' }, { name: 'Management' }], locked: false },
  { id: 'jdupont', firstName: 'Jean', lastName: 'Dupont', company: 'Ligoj', mails: ['jean.dupont@ligoj.org'], groups: [{ name: 'Engineering' }, { name: 'DevOps' }], locked: false },
  { id: 'mmartin', firstName: 'Marie', lastName: 'Martin', company: 'AcmeCorp', mails: ['marie.martin@acme.com'], groups: [{ name: 'Marketing' }], locked: false },
  { id: 'pdurand', firstName: 'Pierre', lastName: 'Durand', company: 'AcmeCorp', mails: ['pierre.durand@acme.com'], groups: [{ name: 'Engineering' }], locked: false },
  { id: 'sleblanc', firstName: 'Sophie', lastName: 'Leblanc', company: 'TechSolutions', mails: ['sophie.leblanc@techsol.com'], groups: [{ name: 'DevOps' }], locked: false },
  { id: 'tmoreau', firstName: 'Thomas', lastName: 'Moreau', company: 'TechSolutions', mails: ['thomas.moreau@techsol.com'], groups: [{ name: 'Sales' }], locked: false },
  { id: 'crichard', firstName: 'Claire', lastName: 'Richard', company: 'Ligoj', mails: ['claire.richard@ligoj.org'], groups: [{ name: 'Management' }], locked: false },
  { id: 'agarcia', firstName: 'Antoine', lastName: 'Garcia', company: 'Ligoj', mails: ['antoine.garcia@ligoj.org'], groups: [{ name: 'Engineering' }], locked: false },
]
const dt = useDataTable('service/id/user', { defaultSort: 'id', demoData: DEMO_USERS })
const itemsPerPage = ref(25)
let searchTimeout = null

const deleteDialog = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const headers = [
  { title: 'Login', key: 'id', sortable: true },
  { title: 'First Name', key: 'firstName', sortable: true },
  { title: 'Last Name', key: 'lastName', sortable: true },
  { title: 'Company', key: 'company', sortable: true },
  { title: 'Email', key: 'mails', sortable: false },
  { title: 'Groups', key: 'groups', sortable: false },
  { title: 'Status', key: 'locked', sortable: false, width: '80px' },
  { title: '', key: 'actions', sortable: false, width: '100px', align: 'end' },
]

function loadData(options) {
  dt.load(options)
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => dt.load({ page: 1, itemsPerPage: itemsPerPage.value }), 300)
}

function startDelete(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}

async function confirmDeleteUser() {
  if (dt.demoMode.value) {
    errorStore.push({ message: 'Demo mode — Connect an IAM plugin to delete users', status: 0 })
    deleteDialog.value = false
    return
  }
  deleting.value = true
  await api.del(`rest/service/id/user/${deleteTarget.value.id}`)
  deleting.value = false
  deleteDialog.value = false
  deleteTarget.value = null
  dt.load({ page: 1, itemsPerPage: itemsPerPage.value })
}

onMounted(() => {
  appStore.setTitle('Users')
  appStore.setBreadcrumbs([
    { title: 'Home', to: '/' },
    { title: 'Identity' },
    { title: 'Users' },
  ])
})
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>
