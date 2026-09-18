<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '../components/AuthCard.vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function login() {
  error.value = ''
  loading.value = true
  const result = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  loading.value = false
  if (result.error) error.value = 'Не удалось войти. Проверьте почту и пароль.'
  else router.push('/')
}
</script>

<template>
  <AuthCard title="Вход" subtitle="Войдите в свой рабочий кабинет">
    <form @submit.prevent="login">
      <label>Электронная почта<input v-model="email" type="email" required /></label>
      <label>Пароль<input v-model="password" type="password" minlength="6" required /></label>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="primary full" :disabled="loading">{{ loading ? 'Подождите...' : 'Войти' }}</button>
    </form>
    <div class="auth-links"><RouterLink to="/forgot-password">Забыли пароль?</RouterLink><RouterLink to="/register">Регистрация</RouterLink></div>
  </AuthCard>
</template>

