import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from '@/stores/i18n.js'

describe('useI18nStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has default locale from navigator', () => {
    const store = useI18nStore()
    expect(store.locale).toBeDefined()
  })

  it('setLocale changes locale', () => {
    const store = useI18nStore()
    store.setLocale('fr')
    expect(store.locale).toBe('fr')
  })

  it('t returns key when no translation exists', () => {
    const store = useI18nStore()
    expect(store.t('missing.key')).toBe('missing.key')
  })

  it('merge adds messages and t resolves them', () => {
    const store = useI18nStore()
    store.merge({ 'hello': 'Bonjour', 'bye': 'Au revoir' })
    expect(store.t('hello')).toBe('Bonjour')
    expect(store.t('bye')).toBe('Au revoir')
  })

  it('t supports parameter substitution', () => {
    const store = useI18nStore()
    store.merge({ 'greeting': 'Hello {{name}}, welcome to {{place}}' })
    expect(store.t('greeting', { name: 'Jean', place: 'Ligoj' })).toBe('Hello Jean, welcome to Ligoj')
  })

  it('markLoaded and isLoaded track bundles', () => {
    const store = useI18nStore()
    expect(store.isLoaded('plugin-a')).toBe(false)
    store.markLoaded('plugin-a')
    expect(store.isLoaded('plugin-a')).toBe(true)
  })
})
