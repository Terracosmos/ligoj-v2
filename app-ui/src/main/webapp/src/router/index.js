import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import HomeView from '@/views/HomeView.vue'
import UserListView from '@/views/UserListView.vue'
import GroupListView from '@/views/GroupListView.vue'
import CompanyListView from '@/views/CompanyListView.vue'
import DelegateListView from '@/views/DelegateListView.vue'
import ProjectListView from '@/views/ProjectListView.vue'
import ProjectEditView from '@/views/ProjectEditView.vue'
import ProfileView from '@/views/ProfileView.vue'
import AboutView from '@/views/AboutView.vue'
import SectionView from '@/views/SectionView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/id/user', name: 'id-user', component: UserListView },
  { path: '/id/group', name: 'id-group', component: GroupListView },
  { path: '/id/company', name: 'id-company', component: CompanyListView },
  { path: '/id/delegate', name: 'id-delegate', component: DelegateListView },
  { path: '/home/project', name: 'project', component: ProjectListView },
  { path: '/home/project/new', name: 'project-new', component: ProjectEditView },
  { path: '/home/project/:id', name: 'project-edit', component: ProjectEditView },
  // Catch-all for future routes
  { path: '/:pathMatch(.*)*', name: 'not-found', component: SectionView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    const ok = await auth.fetchSession()
    if (!ok) {
      window.location.href = 'v-login.html'
      return false
    }
  }
})

export default router
