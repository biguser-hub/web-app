<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { userStore } from '../stores/user'

const items = ref([]), loading = ref(true)
const router = useRouter()
async function load() { const r = await supabase.from('notifications').select('*').eq('user_id', userStore.user.id).order('created_at', { ascending: false }); items.value = r.data || []; loading.value = false }
async function open(item) { if (!item.is_read) await supabase.from('notifications').update({ is_read: true }).eq('id', item.id); if (item.link) router.push(item.link); else load() }
async function readAll() { await supabase.from('notifications').update({ is_read: true }).eq('user_id', userStore.user.id).eq('is_read', false); load() }
onMounted(load)
</script>
<template><AppLayout><div class="page-head"><div><h1>Уведомления</h1><p>Сообщения о задачах и событиях</p></div><button v-if="items.some(i => !i.is_read)" class="secondary" @click="readAll">Прочитать все</button></div><div v-if="loading" class="empty">Загрузка...</div><div v-else-if="!items.length" class="empty">Новых уведомлений пока нет</div><section v-else class="panel notifications"><button v-for="item in items" :key="item.id" :class="['notification-row', { unread: !item.is_read }]" @click="open(item)"><span class="notification-icon">!</span><span><b>{{ item.message }}</b><small>{{ new Date(item.created_at).toLocaleString('ru') }}</small></span></button></section></AppLayout></template>
