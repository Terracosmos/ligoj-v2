<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">{{ project.name || 'Project' }}</h1>
      <v-chip v-if="project.pkey" class="ml-3" variant="outlined">{{ project.pkey }}</v-chip>
      <v-spacer />
      <v-btn variant="tonal" prepend-icon="mdi-pencil" class="mr-2" @click="router.push('/home/project/' + route.params.id + '/edit')">
        Edit
      </v-btn>
      <v-btn color="error" variant="tonal" prepend-icon="mdi-delete" @click="confirmDelete = true">
        Delete
      </v-btn>
    </div>

    <!-- Project Info Card -->
    <v-card class="mb-6" :loading="loading">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Description</div>
            <div>{{ project.description || '-' }}</div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">Team Leader</div>
            <div>{{ project.teamLeader?.id || '-' }}</div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">Created</div>
            <div>{{ formatDate(project.createdDate) }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Subscriptions Section -->
    <div class="d-flex align-center mb-3">
      <h2 class="text-h5">Subscriptions</h2>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :disabled="availableNodes.length === 0"
        @click="addDialog = true"
      >
        Add Subscription
      </v-btn>
    </div>

    <v-alert v-if="demoMode" type="info" variant="tonal" density="compact" class="mb-4">
      Demo data — Install plugins (JIRA, Jenkins, SonarQube, etc.) to manage real subscriptions.
    </v-alert>

    <v-alert v-if="!demoMode && subscriptions.length === 0 && !loading" type="info" variant="tonal" class="mb-4">
      No subscriptions. Install plugins and add subscriptions to connect this project to your tools.
    </v-alert>

    <v-row>
      <v-col v-for="sub in subscriptions" :key="sub.id" cols="12" md="6" lg="4">
        <v-card variant="outlined" hover>
          <v-card-text class="d-flex align-center">
            <v-icon :color="sub.color" size="40" class="mr-4">{{ sub.icon }}</v-icon>
            <div class="flex-grow-1">
              <div class="text-subtitle-1 font-weight-medium">{{ sub.toolName }}</div>
              <div class="text-caption text-medium-emphasis">{{ sub.serviceName }}</div>
              <div class="text-body-2 mt-1">{{ sub.detail }}</div>
            </div>
            <v-chip :color="sub.statusColor" size="small" variant="tonal">
              {{ sub.status }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn size="small" variant="text" color="error" @click="startDeleteSub(sub)">
              <v-icon size="small">mdi-delete</v-icon> Remove
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Subscription Dialog -->
    <v-dialog v-model="addDialog" max-width="500">
      <v-card>
        <v-card-title>Add Subscription</v-card-title>
        <v-card-text>
          <v-select
            v-model="newSub.node"
            :items="availableNodes"
            item-title="name"
            item-value="id"
            label="Service / Tool"
            variant="outlined"
            class="mb-3"
          />
          <v-alert v-if="demoMode" type="warning" variant="tonal" density="compact">
            Demo mode — Install plugins to add real subscriptions.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" :disabled="!newSub.node || demoMode" @click="createSubscription">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Subscription Dialog -->
    <v-dialog v-model="deleteSubDialog" max-width="400">
      <v-card>
        <v-card-title>Remove Subscription</v-card-title>
        <v-card-text>
          Remove <strong>{{ deleteSubTarget?.toolName }}</strong> from this project?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteSubDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteSubscription">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Project Dialog -->
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>Delete Project</v-card-title>
        <v-card-text>
          Delete <strong>{{ project.name }}</strong> and all its subscriptions? This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="deleteProject">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi.js'
import { useAppStore } from '@/stores/app.js'

const route = useRoute()
const router = useRouter()
const api = useApi()
const appStore = useAppStore()

const loading = ref(false)
const deleting = ref(false)
const demoMode = ref(false)
const confirmDelete = ref(false)
const addDialog = ref(false)
const deleteSubDialog = ref(false)
const deleteSubTarget = ref(null)

const project = ref({})
const subscriptions = ref([])
const availableNodes = ref([])
const newSub = ref({ node: null })

// Demo subscriptions to show the UI when no plugins are installed
const DEMO_SUBSCRIPTIONS = [
  { id: 'demo-1', node: 'service:bt:jira:instance', serviceName: 'Bug Tracker', toolName: 'JIRA', detail: 'ligoj.atlassian.net / LIGOJ', icon: 'mdi-bug', color: 'blue', status: 'Active', statusColor: 'success' },
  { id: 'demo-2', node: 'service:build:jenkins:instance', serviceName: 'Build', toolName: 'Jenkins', detail: 'jenkins.ligoj.org / ligoj-api', icon: 'mdi-cog', color: 'orange', status: 'Active', statusColor: 'success' },
  { id: 'demo-3', node: 'service:scm:git:instance', serviceName: 'Source Control', toolName: 'Git', detail: 'github.com/ligoj/ligoj', icon: 'mdi-source-branch', color: 'deep-purple', status: 'Active', statusColor: 'success' },
  { id: 'demo-4', node: 'service:qa:sonarqube:instance', serviceName: 'Quality', toolName: 'SonarQube', detail: 'sonar.ligoj.org / ligoj', icon: 'mdi-shield-check', color: 'teal', status: 'Warning', statusColor: 'warning' },
  { id: 'demo-5', node: 'service:km:confluence:instance', serviceName: 'Knowledge', toolName: 'Confluence', detail: 'ligoj.atlassian.net/wiki / DEV', icon: 'mdi-book-open-variant', color: 'indigo', status: 'Active', statusColor: 'success' },
]

function formatDate(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleDateString()
}

function startDeleteSub(sub) {
  deleteSubTarget.value = sub
  deleteSubDialog.value = true
}

onMounted(async () => {
  loading.value = true
  const data = await api.get(`rest/project/${route.params.id}`)
  if (data && !data.code) {
    project.value = data

    // Load real subscriptions from project data
    if (data.subscriptions && data.subscriptions.length > 0) {
      subscriptions.value = data.subscriptions.map(sub => ({
        id: sub.id,
        node: sub.node?.id,
        serviceName: sub.node?.refined?.refined?.name || sub.node?.refined?.name || '-',
        toolName: sub.node?.refined?.name || sub.node?.name || sub.node?.id || '-',
        detail: sub.node?.name || sub.node?.id || '',
        icon: 'mdi-puzzle',
        color: 'grey',
        status: sub.status || 'Active',
        statusColor: sub.status === 'Active' ? 'success' : 'warning',
      }))
    } else {
      // No real subscriptions — use demo data
      demoMode.value = true
      subscriptions.value = DEMO_SUBSCRIPTIONS
    }

    // Load available nodes for "Add" dialog
    const nodesResp = await api.get('rest/node?rows=100&page=1&sidx=id&sord=asc')
    if (nodesResp?.data) {
      availableNodes.value = nodesResp.data
    }
  }
  loading.value = false

  appStore.setTitle(project.value.name || 'Project')
  appStore.setBreadcrumbs([
    { title: 'Home', to: '/' },
    { title: 'Projects', to: '/home/project' },
    { title: project.value.name || 'Detail' },
  ])
})

async function createSubscription() {
  if (!newSub.value.node) return
  await api.post('rest/subscription', {
    project: Number(route.params.id),
    node: newSub.value.node,
  })
  addDialog.value = false
  newSub.value.node = null
  // Reload project to get updated subscriptions
  const data = await api.get(`rest/project/${route.params.id}`)
  if (data) project.value = data
}

async function deleteSubscription() {
  if (demoMode.value) {
    // Remove from demo list
    subscriptions.value = subscriptions.value.filter(s => s.id !== deleteSubTarget.value.id)
    deleteSubDialog.value = false
    return
  }
  await api.del(`rest/subscription/${deleteSubTarget.value.id}`)
  deleteSubDialog.value = false
  const data = await api.get(`rest/project/${route.params.id}`)
  if (data) project.value = data
}

async function deleteProject() {
  deleting.value = true
  await api.del(`rest/project/${route.params.id}`)
  deleting.value = false
  router.push('/home/project')
}
</script>
