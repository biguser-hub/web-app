<script setup>
import { ref } from 'vue'
import AuthCard from '../components/AuthCard.vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const message = ref('')
async function sendLink() {
  const redirectTo = window.location.origin + window.location.pathname + '#/reset-password'
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, { redirectTo })
  message.value = error ? error.message : 'Ссылка для восстановления отправлена на почту.'
}
</script>

<template><AuthCard title="Восстановление пароля" subtitle="Укажите почту, использованную при регистрации">
  <form @submit.prevent="sendLink"><label>Электронная почта<input v-model="email" type="email" required /></label><p v-if="message" class="notice">{{ message }}</p><button class="primary full">Отправить ссылку</button></form>
  <div class="auth-links center"><RouterLink to="/login">Вернуться ко входу</RouterLink></div>
</AuthCard></template>

