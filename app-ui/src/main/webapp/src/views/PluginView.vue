<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <v-alert v-else-if="error" type="error" variant="tonal">
      Failed to load plugin "{{ pluginKey }}": {{ error }}
    </v-alert>
    <component :is="pluginComponent" v-else-if="pluginComponent" />
  </div>
</template>

<script setup>
import { ref, watch, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app.js'
import { loadPlugin } from '@/plugins/loader.js'
import registry from '@/plugins/registry.js'

const props = defineProps({
  pluginKey: { type: String, default: '' },
})

const route = useRoute()
const appStore = useAppStore()

const loading = ref(false)
const error = ref(null)
const pluginComponent = shallowRef(null)

async function activate(key) {
  const pluginId = key.split('/')[0]
  if (!pluginId) return

  loading.value = true
  error.value = null
  pluginComponent.value = null

  try {
    if (!registry.has(pluginId)) {
      await loadPlugin(pluginId)
    }
    const plugin = registry.get(pluginId)
    pluginComponent.value = plugin?.component || null
    appStore.setTitle(plugin?.label || pluginId)
    appStore.currentPlugin = pluginId
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.pluginKey, (key) => {
  if (key) activate(key)
}, { immediate: true })
</script>
