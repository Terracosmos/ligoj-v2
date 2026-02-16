<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Groups</h1>
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
      {{ dt.error.value === 'internal' ? 'No identity provider is configured. Connect an IAM plugin (LDAP, AD, etc.) to manage groups.' : dt.error.value }}
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
      <template #item.locked="{ item }">
        <v-icon v-if="item.locked" color="error" size="small">mdi-lock</v-icon>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataTable } from '@/composables/useDataTable.js'
import { useAppStore } from '@/stores/app.js'

const appStore = useAppStore()
const DEMO_GROUPS = [
  { name: 'Engineering', scope: 'Group', count: 4, locked: false },
  { name: 'Marketing', scope: 'Group', count: 1, locked: false },
  { name: 'DevOps', scope: 'Group', count: 2, locked: false },
  { name: 'Management', scope: 'Group', count: 2, locked: false },
  { name: 'Sales', scope: 'Group', count: 1, locked: false },
]
const dt = useDataTable('service/id/group', { defaultSort: 'name', demoData: DEMO_GROUPS })
const itemsPerPage = ref(25)
let searchTimeout = null

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Scope', key: 'scope', sortable: false },
  { title: 'Members', key: 'count', sortable: false, width: '100px' },
  { title: 'Locked', key: 'locked', sortable: false, width: '80px' },
]

function loadData(options) {
  dt.load(options)
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => dt.load({ page: 1, itemsPerPage: itemsPerPage.value }), 300)
}

onMounted(() => {
  appStore.setTitle('Groups')
  appStore.setBreadcrumbs([
    { title: 'Home', to: '/' },
    { title: 'Identity' },
    { title: 'Groups' },
  ])
})
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>
