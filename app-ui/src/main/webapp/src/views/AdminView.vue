<template>
  <div>
    <h1 class="text-h4 mb-4">System Administration</h1>

    <!-- System Health & Version -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-text class="d-flex align-center">
            <v-icon :color="healthColor" size="48" class="mr-4">{{ healthIcon }}</v-icon>
            <div>
              <div class="text-overline text-medium-emphasis">System Status</div>
              <div class="text-h5 font-weight-medium">{{ health.status || 'Unknown' }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-text class="d-flex align-center">
            <v-icon color="primary" size="48" class="mr-4">mdi-information</v-icon>
            <div>
              <div class="text-overline text-medium-emphasis">API Version</div>
              <div class="text-h5 font-weight-medium">{{ appVersion }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-text class="d-flex align-center">
            <v-icon color="deep-purple" size="48" class="mr-4">mdi-puzzle</v-icon>
            <div>
              <div class="text-overline text-medium-emphasis">Installed Plugins</div>
              <div class="text-h5 font-weight-medium">{{ plugins.length }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Plugins -->
    <h2 class="text-h5 mb-3">Plugins</h2>
    <v-card class="mb-6" :loading="loadingPlugins">
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Version</th>
            <th>Type</th>
            <th>Vendor</th>
            <th>Nodes</th>
            <th>Subscriptions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in plugins" :key="p.id">
            <td class="font-weight-medium">{{ p.name }}</td>
            <td><code>{{ p.id }}</code></td>
            <td>{{ p.plugin?.version || '-' }}</td>
            <td>
              <v-chip size="small" :color="typeColor(p.plugin?.type)">{{ p.plugin?.type || '-' }}</v-chip>
            </td>
            <td>{{ p.vendor || '-' }}</td>
            <td>{{ p.nodes }}</td>
            <td>{{ p.subscriptions }}</td>
            <td>
              <v-chip size="small" :color="p.deleted ? 'error' : 'success'">
                {{ p.deleted ? 'Deleted' : 'Active' }}
              </v-chip>
            </td>
          </tr>
          <tr v-if="plugins.length === 0 && !loadingPlugins">
            <td colspan="8" class="text-center text-medium-emphasis py-4">No plugins installed</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- System Configuration (collapsible) -->
    <h2 class="text-h5 mb-3">Configuration</h2>
    <v-card :loading="loadingConfig">
      <v-card-text class="pa-0">
        <v-text-field
          v-model="configSearch"
          prepend-inner-icon="mdi-magnify"
          label="Filter configuration"
          variant="outlined"
          density="compact"
          hide-details
          class="ma-4"
        />
      </v-card-text>
      <v-table density="compact" fixed-header height="400">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Source</th>
            <th>Persisted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filteredConfig" :key="c.name">
            <td><code class="text-caption">{{ c.name }}</code></td>
            <td class="text-caption" style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ c.secured ? '••••••••' : c.value }}
            </td>
            <td>
              <v-chip size="x-small" variant="tonal">{{ c.source }}</v-chip>
            </td>
            <td>
              <v-icon v-if="c.persisted" size="small" color="success">mdi-check</v-icon>
              <v-icon v-else size="small" color="grey">mdi-minus</v-icon>
            </td>
          </tr>
          <tr v-if="filteredConfig.length === 0 && !loadingConfig">
            <td colspan="4" class="text-center text-medium-emphasis py-4">No configuration entries</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi.js'
import { useAppStore } from '@/stores/app.js'
import { useAuthStore } from '@/stores/auth.js'

const api = useApi()
const appStore = useAppStore()
const auth = useAuthStore()

const loadingPlugins = ref(false)
const loadingConfig = ref(false)
const plugins = ref([])
const health = ref({})
const configuration = ref([])
const configSearch = ref('')

const appVersion = computed(() => auth.appSettings?.buildVersion || '-')

const healthColor = computed(() => {
  if (health.value.status === 'UP') return 'success'
  if (health.value.status === 'DOWN') return 'error'
  return 'grey'
})

const healthIcon = computed(() => {
  if (health.value.status === 'UP') return 'mdi-check-circle'
  if (health.value.status === 'DOWN') return 'mdi-alert-circle'
  return 'mdi-help-circle'
})

const filteredConfig = computed(() => {
  if (!configSearch.value) return configuration.value
  const q = configSearch.value.toLowerCase()
  return configuration.value.filter(c =>
    c.name.toLowerCase().includes(q) || (c.value && c.value.toLowerCase().includes(q))
  )
})

function typeColor(type) {
  if (type === 'FEATURE') return 'blue'
  if (type === 'SERVICE') return 'green'
  if (type === 'TOOL') return 'orange'
  return 'grey'
}

onMounted(async () => {
  appStore.setTitle('Administration')
  appStore.setBreadcrumbs([
    { title: 'Home', to: '/' },
    { title: 'Administration' },
  ])

  // Load plugins
  loadingPlugins.value = true
  const pluginsData = await api.get('rest/system/plugin')
  if (Array.isArray(pluginsData)) {
    plugins.value = pluginsData
  }
  loadingPlugins.value = false

  // Load health
  try {
    const resp = await fetch('manage/health', { credentials: 'include' })
    if (resp.ok) health.value = await resp.json()
  } catch { /* ignore */ }

  // Load configuration
  loadingConfig.value = true
  const configData = await api.get('rest/system/configuration')
  if (Array.isArray(configData)) {
    configuration.value = configData.sort((a, b) => a.name.localeCompare(b.name))
  }
  loadingConfig.value = false
})
</script>
