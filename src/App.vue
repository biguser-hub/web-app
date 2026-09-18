<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { loadUser } from './stores/user'

onMounted(() => loadUser())
</script>

<template>
  <RouterView />
</template>

