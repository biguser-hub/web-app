<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { userStore } from '../stores/user'

const projects = ref([]), search = ref(''), filter = ref('all'), showForm = ref(false)
const loading = ref(true), error = ref('')
const form = ref({ name: '', description: '', start_date: '', end_date: '', status: 'active' })

const filtered = computed(() => projects.value.filter(project => {
  let find = project.name.toLowerCase().includes(search.value.toLowerCase())
  return find && (filter.value === 'all' || project.status === filter.value)
}))

async function loadProjects() {
  loading.value = true
  const result = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  projects.value = result.data || []
  error.value = result.error?.message || ''
  loading.value = false
}

async function createProject() {
  error.value = ''
  const values = { ...form.value, owner_id: userStore.user.id, start_date: form.value.start_date || null, end_date: form.value.end_date || null }
  const result = await supabase.from('projects').insert(values).select().single()
  if (result.error) { error.value = result.error.message; return }
  showForm.value = false
  form.value = { name: '', description: '', start_date: '', end_date: '', status: 'active' }
  await loadProjects()
}

function statusName(value) { return { active: 'В работе', completed: 'Завершён', paused: 'Приостановлен' }[value] }
onMounted(loadProjects)
</script>

<template><AppLayout>
  <div class="page-head"><div><h1>Проекты</h1><p>Создание и управление проектами</p></div><button class="primary" @click="showForm = !showForm">{{ showForm ? 'Отмена' : '+ Новый проект' }}</button></div>
  <section v-if="showForm" class="panel create-box"><h2>Новый проект</h2><form @submit.prevent="createProject">
    <div class="form-grid"><label>Название<input v-model="form.name" required maxlength="100" /></label><label>Статус<select v-model="form.status"><option value="active">В работе</option><option value="paused">Приостановлен</option><option value="completed">Завершён</option></select></label><label>Дата начала<input v-model="form.start_date" type="date" /></label><label>Дата окончания<input v-model="form.end_date" type="date" /></label></div>
    <label>Описание<textarea v-model="form.description" rows="3"></textarea></label><p v-if="error" class="error">{{ error }}</p><button class="primary">Создать</button>
  </form></section>
  <div class="filters"><input v-model="search" placeholder="Поиск проекта..." /><select v-model="filter"><option value="all">Все статусы</option><option value="active">В работе</option><option value="paused">Приостановлены</option><option value="completed">Завершены</option></select></div>
  <p v-if="error && !showForm" class="error">{{ error }}</p><div v-if="loading" class="empty">Загрузка...</div><div v-else-if="!filtered.length" class="empty">Проекты не найдены</div>
  <div v-else class="project-grid"><RouterLink v-for="project in filtered" :key="project.id" :to="'/projects/' + project.id" class="project-card"><div><span :class="['badge', project.status]">{{ statusName(project.status) }}</span><h3>{{ project.name }}</h3><p>{{ project.description || 'Описание не добавлено' }}</p></div><div class="card-bottom"><span>Создан {{ new Date(project.created_at).toLocaleDateString('ru') }}</span><b>Открыть →</b></div></RouterLink></div>
</AppLayout></template>
