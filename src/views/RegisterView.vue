<script setup>
import { ref } from 'vue'
import AuthCard from '../components/AuthCard.vue'
import { supabase } from '../lib/supabase'

const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const message = ref('')
const error = ref('')

async function register() {
  error.value = ''; message.value = ''
  if (password.value !== password2.value) { error.value = 'Пароли не совпадают'; return }
  const result = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: { data: { full_name: name.value } }
  })
  if (result.error) error.value = result.error.message
  else message.value = 'Регистрация выполнена. Проверьте почту или перейдите на страницу входа.'
}
</script>

<template>
  <AuthCard title="Регистрация" subtitle="Создайте аккаунт в ProjectSpace">
    <form @submit.prevent="register">
      <label>Имя и фамилия<input v-model="name" required /></label>
      <label>Электронная почта<input v-model="email" type="email" required /></label>
      <label>Пароль<input v-model="password" type="password" minlength="6" required /></label>
      <label>Повторите пароль<input v-model="password2" type="password" minlength="6" required /></label>
      <p v-if="error" class="error">{{ error }}</p><p v-if="message" class="success">{{ message }}</p>
      <button class="primary full">Зарегистрироваться</button>
    </form>
    <div class="auth-links center"><RouterLink to="/login">Уже есть аккаунт? Войти</RouterLink></div>
  </AuthCard>
</template>

