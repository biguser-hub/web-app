import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectView from '../views/ProjectView.vue'
import ProfileView from '../views/ProfileView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import AdminView from '../views/AdminView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/login', component: LoginView, meta: { guest: true } },
  { path: '/register', component: RegisterView, meta: { guest: true } },
  { path: '/forgot-password', component: ForgotPasswordView, meta: { guest: true } },
  { path: '/reset-password', component: ResetPasswordView },
  { path: '/', component: DashboardView, meta: { auth: true } },
  { path: '/projects', component: ProjectsView, meta: { auth: true } },
  { path: '/projects/:id', component: ProjectView, meta: { auth: true } },
  { path: '/profile', component: ProfileView, meta: { auth: true } },
  { path: '/notifications', component: NotificationsView, meta: { auth: true } },
  { path: '/admin', component: AdminView, meta: { auth: true, admin: true } },
  { path: '/:pathMatch(.*)*', component: NotFoundView }
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getUser()
  if (to.meta.auth && !data.user) return '/login'
  if (to.meta.guest && data.user) return '/'
  if (to.meta.admin && data.user) {
    const profile = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    if (profile.data?.role !== 'admin') return '/'
  }
})

export default router

