<template>
  <v-navigation-drawer v-model="appStore.sidebarOpen" app color="primary" dark>
    <v-list-item @click="router.push('/')" class="pa-4">
      <template #prepend>
        <img src="@/assets/ligoj.svg" alt="Ligoj" style="width: 32px; height: 32px; margin-right: 8px" />
      </template>
      <v-list-item-title class="text-h6 font-weight-bold">Ligoj</v-list-item-title>
      <v-list-item-subtitle class="text-caption">v{{ auth.appSettings.buildVersion || '?' }}</v-list-item-subtitle>
    </v-list-item>
    <v-divider />
    <v-list density="compact" nav :opened="openedGroups">
      <template v-for="item in auth.navItems" :key="item.id">
        <v-list-item
          v-if="!item.children"
          :prepend-icon="item.icon"
          :title="item.label"
          :to="item.route"
        />
        <v-list-group v-else :value="item.id">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.label" />
          </template>
          <v-list-item
            v-for="child in item.children"
            :key="child.id"
            :prepend-icon="child.icon"
            :title="child.label"
            :to="child.route"
          />
        </v-list-group>
      </template>
    </v-list>
    <template #append>
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-information-outline" title="About" to="/about" />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-app-bar app density="compact" elevation="1">
    <v-app-bar-nav-icon @click="appStore.toggleSidebar()" />
    <v-toolbar-title>{{ appStore.title }}</v-toolbar-title>
    <v-spacer />
    <v-btn icon size="small" @click="toggleTheme">
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
    <v-btn variant="text" prepend-icon="mdi-account" @click="router.push('/profile')">
      {{ auth.userName }}
    </v-btn>
    <v-btn icon @click="doLogout">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>

  <v-main>
    <v-container fluid>
      <v-breadcrumbs v-if="appStore.breadcrumbs.length" :items="appStore.breadcrumbs" />
      <slot />
    </v-container>
  </v-main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth.js'
import { useAppStore } from '@/stores/app.js'

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const auth = useAuthStore()
const appStore = useAppStore()

/** Auto-expand sidebar groups whose children match the current route */
const openedGroups = computed(() => {
  return auth.navItems
    .filter(item => item.children?.some(child => route.path.startsWith(child.route)))
    .map(item => item.id)
})

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'ligojLight' : 'ligojDark'
}

async function doLogout() {
  await auth.logout()
  window.location.href = 'v-login.html'
}
</script>
