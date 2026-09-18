<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { userStore } from '../stores/user'

const users = ref([]), projects = ref([]), tasksCount = ref(0), tab = ref('users'), search = ref(''), message = ref('')
const filteredUsers = computed(() => users.value.filter(u => u.full_name.toLowerCase().includes(search.value.toLowerCase())))
const filteredProjects = computed(() => projects.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase())))

async function load() {
  const u = await supabase.from('profiles').select('id, full_name, role, is_blocked, created_at').order('created_at', { ascending: false })
  const p = await supabase.from('projects').select('id, name, status, created_at, owner:profiles(full_name)').order('created_at', { ascending: false })
  const t = await supabase.from('tasks').select('*', { count: 'exact', head: true })
  users.value = u.data || []; projects.value = p.data || []; tasksCount.value = t.count || 0
}
async function updateUser(user, field, value) {
  if (user.id === userStore.user.id && field === 'blocked') { message.value = 'Нельзя заблокировать свой аккаунт'; return }
  const role = field === 'role' ? value : user.role
  const blocked = field === 'blocked' ? value : user.is_blocked
  const r = await supabase.rpc('admin_update_user', { target_id: user.id, new_role: role, blocked })
  message.value = r.error ? r.error.message : 'Данные пользователя обновлены'; load()
}
async function deleteProject(project) { if (!confirm('Удалить проект «' + project.name + '»?')) return; const r = await supabase.from('projects').delete().eq('id', project.id); message.value = r.error ? r.error.message : 'Проект удалён'; load() }
onMounted(load)
</script>

<template><AppLayout><div class="page-head"><div><h1>Панель администратора</h1><p>Пользователи, проекты и статистика системы</p></div></div>
  <div class="stat-grid admin-stats"><div class="stat-card"><span>Пользователей</span><b>{{ users.length }}</b></div><div class="stat-card"><span>Проектов</span><b>{{ projects.length }}</b></div><div class="stat-card"><span>Задач</span><b>{{ tasksCount }}</b></div></div>
  <p v-if="message" class="notice panel message-box">{{ message }}</p><div class="admin-tabs"><button :class="{ active: tab === 'users' }" @click="tab = 'users'; search = ''">Пользователи</button><button :class="{ active: tab === 'projects' }" @click="tab = 'projects'; search = ''">Проекты</button></div><input v-model="search" class="admin-search" :placeholder="tab === 'users' ? 'Поиск пользователя...' : 'Поиск проекта...'" />
  <section class="panel table-wrap"><table v-if="tab === 'users'"><thead><tr><th>Пользователь</th><th>Роль</th><th>Дата регистрации</th><th>Состояние</th></tr></thead><tbody><tr v-for="user in filteredUsers" :key="user.id"><td>{{ user.full_name || 'Без имени' }}</td><td><select :value="user.role" @change="updateUser(user, 'role', $event.target.value)"><option value="user">Пользователь</option><option value="admin">Администратор</option></select></td><td>{{ new Date(user.created_at).toLocaleDateString('ru') }}</td><td><button :class="user.is_blocked ? 'success-button' : 'danger-outline'" @click="updateUser(user, 'blocked', !user.is_blocked)">{{ user.is_blocked ? 'Разблокировать' : 'Заблокировать' }}</button></td></tr></tbody></table>
  <table v-else><thead><tr><th>Проект</th><th>Владелец</th><th>Статус</th><th>Действие</th></tr></thead><tbody><tr v-for="project in filteredProjects" :key="project.id"><td><RouterLink :to="'/projects/' + project.id">{{ project.name }}</RouterLink></td><td>{{ project.owner?.full_name || 'Не указан' }}</td><td>{{ project.status }}</td><td><button class="danger-outline" @click="deleteProject(project)">Удалить</button></td></tr></tbody></table></section>
</AppLayout></template>
