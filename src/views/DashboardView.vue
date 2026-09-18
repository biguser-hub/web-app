<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { userStore } from '../stores/user'

const projects = ref([]), tasks = ref([]), activity = ref([]), loading = ref(true)
const firstName = computed(() => (userStore.profile?.full_name || 'пользователь').split(' ')[0])
const activeProjects = computed(() => projects.value.filter(p => p.status === 'active').length)
const openTasks = computed(() => tasks.value.filter(t => t.status !== 'done').length)
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done').length)

async function load() {
  const p = await supabase.from('projects').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5)
  const t = await supabase.from('tasks').select('id, title, status, due_date, project:projects(name)').order('created_at', { ascending: false })
  const a = await supabase.from('activity_logs').select('id, action, created_at, profile:profiles(full_name)').order('created_at', { ascending: false }).limit(6)
  projects.value = p.data || []; tasks.value = t.data || []; activity.value = a.data || []; loading.value = false
}
onMounted(load)
</script>

<template><AppLayout>
  <div class="page-head"><div><h1>Здравствуйте, {{ firstName }}!</h1><p>Краткая информация о проектах и задачах</p></div><RouterLink class="primary button-link" to="/projects">Все проекты</RouterLink></div>
  <div v-if="loading" class="empty">Загрузка...</div><template v-else>
    <div class="stat-grid"><div class="stat-card"><span>Проекты в работе</span><b>{{ activeProjects }}</b></div><div class="stat-card"><span>Открытые задачи</span><b>{{ openTasks }}</b></div><div class="stat-card"><span>Выполнено задач</span><b>{{ doneTasks }}</b></div><div class="stat-card"><span>Всего проектов</span><b>{{ projects.length }}</b></div></div>
    <div class="dashboard-grid"><section class="panel"><div class="section-title"><h2>Последние проекты</h2><RouterLink to="/projects">Смотреть все</RouterLink></div><div v-if="!projects.length" class="small-empty">Проектов пока нет</div><RouterLink v-for="project in projects" :key="project.id" :to="'/projects/' + project.id" class="list-row"><span>{{ project.name }}</span><span :class="['badge', project.status]">{{ project.status === 'active' ? 'В работе' : project.status === 'completed' ? 'Завершён' : 'Пауза' }}</span></RouterLink></section>
    <section class="panel"><div class="section-title"><h2>Последняя активность</h2></div><div v-if="!activity.length" class="small-empty">Событий пока нет</div><div v-for="item in activity" :key="item.id" class="activity-row"><span class="activity-dot"></span><div><b>{{ item.profile?.full_name || 'Пользователь' }}</b> {{ item.action }}<small>{{ new Date(item.created_at).toLocaleString('ru') }}</small></div></div></section></div>
  </template>
</AppLayout></template>
