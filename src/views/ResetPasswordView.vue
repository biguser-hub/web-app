<script setup>
import { ref } from 'vue'
import AuthCard from '../components/AuthCard.vue'
import { supabase } from '../lib/supabase'
const password = ref(''); const message = ref('')
async function save() {
  const { error } = await supabase.auth.updateUser({ password: password.value })
  message.value = error ? error.message : 'Пароль изменён. Теперь можно войти.'
}
</script>
<template><AuthCard title="Новый пароль" subtitle="Придумайте новый пароль"><form @submit.prevent="save"><label>Новый пароль<input v-model="password" type="password" minlength="6" required /></label><p v-if="message" class="notice">{{ message }}</p><button class="primary full">Сохранить пароль</button></form><div class="auth-links center"><RouterLink to="/login">Перейти ко входу</RouterLink></div></AuthCard></template>

