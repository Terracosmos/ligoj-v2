<template>
  <div>
    <h1 class="text-h4 mb-6">About Ligoj</h1>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Application
          </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <tbody>
                <tr>
                  <td class="font-weight-medium">Version</td>
                  <td>{{ auth.appSettings.buildVersion || '-' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-medium">Build Date</td>
                  <td>{{ buildDate }}</td>
                </tr>
                <tr>
                  <td class="font-weight-medium">Build Number</td>
                  <td>{{ auth.appSettings.buildNumber || '-' }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-puzzle</v-icon>
            Installed Features
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item v-for="plugin in features" :key="plugin">
                <template #prepend><v-icon size="small">mdi-check-circle</v-icon></template>
                <v-list-item-title>{{ plugin }}</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="!features.length">
                <v-list-item-title class="text-medium-emphasis">No features detected</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-monitor-dashboard</v-icon>
            Frontend
          </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <tbody>
                <tr>
                  <td class="font-weight-medium">Framework</td>
                  <td>Vue 3 + Vuetify 3</td>
                </tr>
                <tr>
                  <td class="font-weight-medium">Build Tool</td>
                  <td>Vite 6</td>
                </tr>
                <tr>
                  <td class="font-weight-medium">State</td>
                  <td>Pinia 2</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useAppStore } from '@/stores/app.js'

const auth = useAuthStore()
const appStore = useAppStore()

const features = computed(() => auth.appSettings.plugins || [])

const buildDate = computed(() => {
  const ts = auth.appSettings.buildTimestamp
  if (!ts) return '-'
  return new Date(Number(ts)).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
})

onMounted(() => {
  appStore.setTitle('About')
  appStore.setBreadcrumbs([
    { title: 'Home', to: '/' },
    { title: 'About' },
  ])
})
</script>
