<template>
  <div class="d-flex align-center ga-2">
    <!-- Export button -->
    <v-btn
      v-if="exportEndpoint"
      variant="outlined"
      size="small"
      prepend-icon="mdi-download"
      :loading="exporting"
      @click="doExport"
    >{{ t('common.export') }}</v-btn>

    <!-- Import button with file input -->
    <v-btn
      v-if="importEndpoint"
      variant="outlined"
      size="small"
      prepend-icon="mdi-upload"
      :loading="ie.uploading.value"
      @click="fileInput?.click()"
    >{{ t('common.import') }}</v-btn>
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      style="display: none"
      @change="onFileSelected"
    />

    <!-- Upload result snackbar -->
    <v-snackbar v-model="showResult" :color="ie.uploadResult.value?.success ? 'success' : 'error'" :timeout="4000">
      {{ ie.uploadResult.value?.success ? t('common.importSuccess') : (ie.uploadResult.value?.message || t('common.importFail')) }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useImportExport } from '@/composables/useImportExport.js'
import { useI18nStore } from '@/stores/i18n.js'

const props = defineProps({
  exportEndpoint: { type: String, default: '' },
  importEndpoint: { type: String, default: '' },
  exportFilename: { type: String, default: 'export.csv' },
  accept: { type: String, default: '.csv,.xls,.xlsx' },
})

const emit = defineEmits(['imported'])

const ie = useImportExport()
const i18n = useI18nStore()
const t = i18n.t

const fileInput = ref(null)
const exporting = ref(false)
const showResult = ref(false)

async function doExport() {
  exporting.value = true
  await ie.exportCsv(props.exportEndpoint, props.exportFilename)
  exporting.value = false
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const ok = await ie.uploadFile(props.importEndpoint, file)
  showResult.value = true
  if (ok) emit('imported')
  // Reset file input
  if (fileInput.value) fileInput.value.value = ''
}
</script>
