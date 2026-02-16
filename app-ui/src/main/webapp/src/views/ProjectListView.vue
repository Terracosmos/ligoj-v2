<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Projects</h1>
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
      <v-btn color="primary" prepend-icon="mdi-plus" @click="router.push('/home/project/new')">
        New Project
      </v-btn>
    </div>

    <v-alert v-if="dt.error.value" type="warning" variant="tonal" class="mb-4">
      {{ dt.error.value }}
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
      @click:row="(_, { item }) => router.push('/home/project/' + item.id)"
    >
      <template #item.teamLeader="{ item }">
        {{ item.teamLeader?.id || '-' }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" @click.stop="router.push('/home/project/' + item.id)">
          <v-icon size="small">mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click.stop="startDelete(item)">
          <v-icon size="small">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>

    <v-alert v-if="!dt.loading.value && !dt.error.value && dt.totalItems.value === 0" type="info" variant="tonal" class="mt-4">
      No projects yet. Create a project to start managing subscriptions.
    </v-alert>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Project</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="confirmDelete">Delete</v-btn>
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

const router = useRouter()
const appStore = useAppStore()
const api = useApi()
const dt = useDataTable('project', { defaultSort: 'name' })
const itemsPerPage = ref(25)
let searchTimeout = null

const deleteDialog = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
let lastOptions = {}

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Team Leader', key: 'teamLeader', sortable: false },
  { title: 'Pkey', key: 'pkey', sortable: true },
  { title: '', key: 'actions', sortable: false, width: '100px', align: 'end' },
]

function loadData(options) {
  lastOptions = options
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

async function confirmDelete() {
  deleting.value = true
  await api.del(`rest/project/${deleteTarget.value.id}`)
  deleting.value = false
  deleteDialog.value = false
  deleteTarget.value = null
  dt.load(lastOptions)
}

onMounted(() => {
  appStore.setTitle('Projects')
  appStore.setBreadcrumbs([
    { title: 'Home', to: '/' },
    { title: 'Projects' },
  ])
})
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>
