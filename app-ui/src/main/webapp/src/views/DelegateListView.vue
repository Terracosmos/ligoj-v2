<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">{{ t('delegate.title') }}</h1>
      <v-spacer />
      <v-text-field
        v-model="dt.search.value"
        prepend-inner-icon="mdi-magnify"
        :label="t('common.search')"
        variant="outlined"
        density="compact"
        hide-details
        class="search-field"
        @update:model-value="onSearch"
      />
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
      @update:options="loadData"
    >
      <template #item.receiver="{ item }">
        {{ item.receiver?.name || item.receiver?.id || item.name || '-' }}
      </template>
      <template #item.type="{ item }">
        <v-chip size="small" :color="typeColor(item.type || item.receiverType)">
          {{ item.type || item.receiverType || '-' }}
        </v-chip>
      </template>
      <template #item.canAdmin="{ item }">
        <v-icon v-if="item.canAdmin" color="success" size="small">mdi-check</v-icon>
      </template>
      <template #item.canWrite="{ item }">
        <v-icon v-if="item.canWrite" color="success" size="small">mdi-check</v-icon>
      </template>
    </v-data-table-server>

    <v-alert v-if="!dt.loading.value && !dt.error.value && dt.totalItems.value === 0" type="info" variant="tonal" class="mt-4">
      {{ t('delegate.empty') }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataTable } from '@/composables/useDataTable.js'
import { useAppStore } from '@/stores/app.js'
import { useI18nStore } from '@/stores/i18n.js'

const appStore = useAppStore()
const i18n = useI18nStore()
const t = i18n.t

const dt = useDataTable('security/delegate', { defaultSort: 'receiver' })
const itemsPerPage = ref(25)
let searchTimeout = null

const headers = computed(() => [
  { title: t('delegate.receiver'), key: 'receiver', sortable: true },
  { title: t('delegate.type'), key: 'type', sortable: false, width: '120px' },
  { title: t('delegate.resource'), key: 'name', sortable: false },
  { title: t('delegate.admin'), key: 'canAdmin', sortable: false, width: '80px' },
  { title: t('delegate.write'), key: 'canWrite', sortable: false, width: '80px' },
])

function typeColor(type) {
  const colors = { USER: 'blue', GROUP: 'teal', COMPANY: 'indigo', TREE: 'orange' }
  return colors[type] || 'grey'
}

function loadData(options) {
  dt.load(options)
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => dt.load({ page: 1, itemsPerPage: itemsPerPage.value }), 300)
}

onMounted(() => {
  appStore.setTitle(t('delegate.title'))
  appStore.setBreadcrumbs([
    { title: t('nav.home'), to: '/' },
    { title: t('nav.identity') },
    { title: t('delegate.title') },
  ])
})
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>
