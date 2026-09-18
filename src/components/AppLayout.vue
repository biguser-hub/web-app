<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { userStore } from '../stores/user'

const router = useRouter()
const initials = computed(() => {
  let name = userStore.profile?.full_name || userStore.user?.email || 'U'
  return name.slice(0, 2).toUpperCase()
})

async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/"><span>PS</span> ProjectSpace</RouterLink>
      <nav>
        <RouterLink to="/">Главная</RouterLink>
        <RouterLink to="/projects">Проекты</RouterLink>
        <RouterLink to="/notifications">Уведомления</RouterLink>
        <RouterLink to="/profile">Профиль</RouterLink>
        <RouterLink v-if="userStore.profile?.role === 'admin'" to="/admin">Администратор</RouterLink>
      </nav>
      <button class="logout" @click="logout">Выйти</button>
    </aside>
    <div class="main-part">
      <header class="topbar">
        <button class="mobile-menu" onclick="document.querySelector('.sidebar').classList.toggle('opened')">☰</button>
        <div></div>
        <RouterLink class="user-short" to="/profile">
          <span class="avatar">{{ initials }}</span>
          <span>{{ userStore.profile?.full_name || userStore.user?.email }}</span>
        </RouterLink>
      </header>
      <main class="content"><slot /></main>
    </div>
  </div>
</template>

