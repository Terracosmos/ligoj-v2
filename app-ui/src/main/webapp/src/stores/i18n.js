import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref(navigator.language?.substring(0, 2) || 'en')
  const messages = ref({})
  const loadedBundles = ref(new Set())

  const t = computed(() => {
    const msgs = messages.value
    return (key, params) => {
      let val = msgs[key]
      if (val === undefined) return key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          val = val.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v)
        })
      }
      return val
    }
  })

  function merge(newMessages) {
    messages.value = { ...messages.value, ...newMessages }
  }

  function setLocale(loc) {
    locale.value = loc
  }

  function markLoaded(bundleId) {
    loadedBundles.value.add(bundleId)
  }

  function isLoaded(bundleId) {
    return loadedBundles.value.has(bundleId)
  }

  return { locale, messages, t, merge, setLocale, markLoaded, isLoaded }
})
