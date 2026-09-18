<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { userStore } from '../stores/user'

const route = useRoute(), router = useRouter()
const project = ref(null), tasks = ref([]), members = ref([]), allProfiles = ref([]), newMember = ref('')
const showTaskForm = ref(false), selectedTask = ref(null), comments = ref([]), comment = ref(''), error = ref('')
const taskForm = ref({ title: '', description: '', status: 'new', priority: 'medium', assignee_id: '', due_date: '' })
const editMode = ref(false), editForm = ref({})
const columns = computed(() => [
  { value: 'new', name: 'Новые', items: tasks.value.filter(t => t.status === 'new') },
  { value: 'in_progress', name: 'В работе', items: tasks.value.filter(t => t.status === 'in_progress') },
  { value: 'done', name: 'Готово', items: tasks.value.filter(t => t.status === 'done') }
])

async function load() {
  const p = await supabase.from('projects').select('*').eq('id', route.params.id).maybeSingle()
  project.value = p.data
  const t = await supabase.from('tasks').select('*, assignee:profiles!tasks_assignee_id_fkey(full_name)').eq('project_id', route.params.id).order('created_at')
  tasks.value = t.data || []
  const m = await supabase.from('project_members').select('user_id, member_role, profile:profiles(full_name)').eq('project_id', route.params.id)
  members.value = m.data || []
  const profiles = await supabase.from('profiles').select('id, full_name').order('full_name')
  allProfiles.value = profiles.data || []
  error.value = p.error?.message || t.error?.message || ''
}

async function saveTask() {
  const values = { ...taskForm.value, project_id: route.params.id, creator_id: userStore.user.id, assignee_id: taskForm.value.assignee_id || null, due_date: taskForm.value.due_date || null }
  const result = await supabase.from('tasks').insert(values)
  if (result.error) { error.value = result.error.message; return }
  if (values.assignee_id && values.assignee_id !== userStore.user.id) {
    await supabase.from('notifications').insert({ user_id: values.assignee_id, message: 'Вам назначена задача «' + values.title + '»', link: '/projects/' + route.params.id })
  }
  await supabase.from('activity_logs').insert({ project_id: route.params.id, user_id: userStore.user.id, action: 'создал(а) задачу «' + values.title + '»' })
  showTaskForm.value = false
  taskForm.value = { title: '', description: '', status: 'new', priority: 'medium', assignee_id: '', due_date: '' }
  load()
}

async function changeStatus(task, status) { await supabase.from('tasks').update({ status }).eq('id', task.id); load() }
async function removeTask(task) { if (!confirm('Удалить задачу?')) return; await supabase.from('tasks').delete().eq('id', task.id); selectedTask.value = null; load() }
async function openTask(task) { selectedTask.value = task; editMode.value = false; editForm.value = { title: task.title, description: task.description, status: task.status, priority: task.priority, assignee_id: task.assignee_id || '', due_date: task.due_date || '' }; const r = await supabase.from('comments').select('*, author:profiles(full_name)').eq('task_id', task.id).order('created_at'); comments.value = r.data || [] }
async function saveEdit() { const values = { ...editForm.value, assignee_id: editForm.value.assignee_id || null, due_date: editForm.value.due_date || null }; const r = await supabase.from('tasks').update(values).eq('id', selectedTask.value.id).select('*, assignee:profiles!tasks_assignee_id_fkey(full_name)').single(); if (r.error) error.value = r.error.message; else { selectedTask.value = r.data; editMode.value = false; load() } }
async function addComment() { if (!comment.value.trim()) return; const r = await supabase.from('comments').insert({ task_id: selectedTask.value.id, author_id: userStore.user.id, content: comment.value }); if (!r.error) { comment.value = ''; openTask(selectedTask.value) } }
async function addMember() { if (!newMember.value) return; const r = await supabase.from('project_members').insert({ project_id: route.params.id, user_id: newMember.value }); if (r.error) error.value = r.error.message; else { newMember.value = ''; load() } }
async function removeMember(id) { await supabase.from('project_members').delete().eq('project_id', route.params.id).eq('user_id', id); load() }
async function deleteProject() { if (!confirm('Удалить весь проект со всеми задачами?')) return; const r = await supabase.from('projects').delete().eq('id', project.value.id); if (!r.error) router.push('/projects'); else error.value = r.error.message }
function priorityName(v) { return { low:'Низкий', medium:'Средний', high:'Высокий' }[v] }
onMounted(load)
</script>

<template><AppLayout><div v-if="!project" class="empty">{{ error || 'Загрузка проекта...' }}</div><template v-else>
  <div class="page-head"><div><RouterLink to="/projects">← Все проекты</RouterLink><h1>{{ project.name }}</h1><p>{{ project.description }}</p></div><div class="head-buttons"><button class="danger-outline" @click="deleteProject">Удалить проект</button><button class="primary" @click="showTaskForm = !showTaskForm">+ Добавить задачу</button></div></div>
  <section v-if="showTaskForm" class="panel create-box"><h2>Новая задача</h2><form @submit.prevent="saveTask"><div class="form-grid"><label>Название<input v-model="taskForm.title" required /></label><label>Исполнитель<select v-model="taskForm.assignee_id"><option value="">Не назначен</option><option v-for="m in members" :key="m.user_id" :value="m.user_id">{{ m.profile?.full_name || 'Пользователь' }}</option></select></label><label>Статус<select v-model="taskForm.status"><option value="new">Новая</option><option value="in_progress">В работе</option><option value="done">Готово</option></select></label><label>Приоритет<select v-model="taskForm.priority"><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></label><label>Срок<input v-model="taskForm.due_date" type="date" /></label></div><label>Описание<textarea v-model="taskForm.description" rows="3"></textarea></label><button class="primary">Сохранить задачу</button></form></section>
  <p v-if="error" class="error">{{ error }}</p><div class="board"><section v-for="col in columns" :key="col.value" class="board-column"><h3>{{ col.name }} <span>{{ col.items.length }}</span></h3><div v-if="!col.items.length" class="column-empty">Нет задач</div><article v-for="task in col.items" :key="task.id" class="task-card" @click="openTask(task)"><span :class="['priority', task.priority]">{{ priorityName(task.priority) }}</span><h4>{{ task.title }}</h4><p>{{ task.description }}</p><div class="task-foot"><span>{{ task.assignee?.full_name || 'Не назначен' }}</span><select :value="task.status" @click.stop @change="changeStatus(task, $event.target.value)"><option value="new">Новая</option><option value="in_progress">В работе</option><option value="done">Готово</option></select></div></article></section></div>
  <section class="panel team-panel"><h2>Участники проекта</h2><div class="member-list"><div v-for="member in members" :key="member.user_id"><span>{{ member.profile?.full_name || 'Пользователь' }} — {{ member.member_role === 'owner' ? 'владелец' : 'участник' }}</span><button v-if="member.member_role !== 'owner'" @click="removeMember(member.user_id)">Удалить</button></div></div><form class="add-member" @submit.prevent="addMember"><select v-model="newMember" required><option value="">Выберите пользователя</option><option v-for="person in allProfiles.filter(p => !members.some(m => m.user_id === p.id))" :key="person.id" :value="person.id">{{ person.full_name || 'Без имени' }}</option></select><button class="primary">Добавить</button></form></section>
  <div v-if="selectedTask" class="modal-bg" @click.self="selectedTask = null"><section class="modal"><button class="close" @click="selectedTask = null">×</button><template v-if="!editMode"><span :class="['priority', selectedTask.priority]">{{ priorityName(selectedTask.priority) }}</span><h2>{{ selectedTask.title }}</h2><p>{{ selectedTask.description || 'Без описания' }}</p><p><b>Исполнитель:</b> {{ selectedTask.assignee?.full_name || 'не назначен' }}</p><p><b>Срок:</b> {{ selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString('ru') : 'не указан' }}</p><div class="modal-buttons"><button class="secondary" @click="editMode = true">Редактировать</button><button class="danger-outline small" @click="removeTask(selectedTask)">Удалить задачу</button></div></template><form v-else @submit.prevent="saveEdit"><h2>Редактирование задачи</h2><label>Название<input v-model="editForm.title" required /></label><label>Описание<textarea v-model="editForm.description" rows="3"></textarea></label><div class="form-grid"><label>Статус<select v-model="editForm.status"><option value="new">Новая</option><option value="in_progress">В работе</option><option value="done">Готово</option></select></label><label>Приоритет<select v-model="editForm.priority"><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></label><label>Исполнитель<select v-model="editForm.assignee_id"><option value="">Не назначен</option><option v-for="m in members" :key="m.user_id" :value="m.user_id">{{ m.profile?.full_name }}</option></select></label><label>Срок<input v-model="editForm.due_date" type="date" /></label></div><div class="modal-buttons"><button class="primary">Сохранить</button><button type="button" class="secondary" @click="editMode = false">Отмена</button></div></form><hr/><h3>Комментарии</h3><div class="comments"><div v-for="item in comments" :key="item.id" class="comment"><b>{{ item.author?.full_name || 'Пользователь' }}</b><small>{{ new Date(item.created_at).toLocaleString('ru') }}</small><p>{{ item.content }}</p></div></div><form class="comment-form" @submit.prevent="addComment"><input v-model="comment" placeholder="Напишите комментарий" required/><button class="primary">Отправить</button></form></section></div>
</template></AppLayout></template>
