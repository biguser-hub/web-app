<script setup>
import { ref, watchEffect } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { userStore, loadUser } from '../stores/user'
const name = ref(''); const phone = ref(''); const about = ref(''); const message = ref('')
watchEffect(() => { if (userStore.profile) { name.value = userStore.profile.full_name || ''; phone.value = userStore.profile.phone || ''; about.value = userStore.profile.about || '' } })
async function save() {
  const { error } = await supabase.from('profiles').update({ full_name: name.value, phone: phone.value, about: about.value }).eq('id', userStore.user.id)
  message.value = error ? error.message : 'Данные сохранены'; if (!error) loadUser()
}
</script>
<template><AppLayout><div class="page-head"><div><h1>Профиль</h1><p>Личные данные пользователя</p></div></div><section class="panel narrow"><form @submit.prevent="save"><label>Имя и фамилия<input v-model="name" required /></label><label>Электронная почта<input :value="userStore.user?.email" disabled /></label><label>Телефон<input v-model="phone" /></label><label>О себе<textarea v-model="about" rows="4"></textarea></label><p v-if="message" class="notice">{{ message }}</p><button class="primary">Сохранить</button></form></section></AppLayout></template>

