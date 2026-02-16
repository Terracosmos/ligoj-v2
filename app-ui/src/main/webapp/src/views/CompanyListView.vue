<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">{{ t('company.title') }}</h1>
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
      <v-alert-title>{{ t('user.noProvider') }}</v-alert-title>
      {{ dt.error.value === 'internal' ? t('company.noProvider') : dt.error.value }}
    </v-alert>

    <v-alert v-if="dt.demoMode.value" type="info" variant="tonal" density="compact" class="mb-4">
      {{ t('user.demoMode') }}
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
import { ref, computed, onMounted } from 'vue'
import { useDataTable } from '@/composables/useDataTable.js'
import { useAppStore } from '@/stores/app.js'
import { useI18nStore } from '@/stores/i18n.js'

const appStore = useAppStore()
const i18n = useI18nStore()
const t = i18n.t

const DEMO_COMPANIES = [
  { name: 'Ligoj', scope: 'Company', count: 4, locked: false },
  { name: 'AcmeCorp', scope: 'Company', count: 2, locked: false },
  { name: 'TechSolutions', scope: 'Company', count: 2, locked: false },
]
const dt = useDataTable('service/id/company', { defaultSort: 'name', demoData: DEMO_COMPANIES })
const itemsPerPage = ref(25)
let searchTimeout = null

const headers = computed(() => [
  { title: t('common.name'), key: 'name', sortable: true },
  { title: t('group.scope'), key: 'scope', sortable: false },
  { title: t('group.members'), key: 'count', sortable: false, width: '100px' },
  { title: t('group.locked'), key: 'locked', sortable: false, width: '80px' },
])

function loadData(options) {
  dt.load(options)
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => dt.load({ page: 1, itemsPerPage: itemsPerPage.value }), 300)
}

onMounted(() => {
  appStore.setTitle(t('company.title'))
  appStore.setBreadcrumbs([
    { title: t('nav.home'), to: '/' },
    { title: t('nav.identity') },
    { title: t('company.title') },
  ])
})
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>
