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
        class="search-field"
        @update:model-value="onSearch"
      />
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
      @update:options="loadData"
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
    </v-data-table-server>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataTable } from '@/composables/useDataTable.js'
import { useAppStore } from '@/stores/app.js'

const appStore = useAppStore()
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

const headers = [
  { title: 'Login', key: 'id', sortable: true },
  { title: 'First Name', key: 'firstName', sortable: true },
  { title: 'Last Name', key: 'lastName', sortable: true },
  { title: 'Company', key: 'company', sortable: true },
  { title: 'Email', key: 'mails', sortable: false },
  { title: 'Groups', key: 'groups', sortable: false },
  { title: 'Status', key: 'locked', sortable: false, width: '80px' },
]

function loadData(options) {
  dt.load(options)
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => dt.load({ page: 1, itemsPerPage: itemsPerPage.value }), 300)
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
