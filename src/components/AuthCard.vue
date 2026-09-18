<script setup>
defineProps({ title: String, subtitle: String })
</script>

<template>
  <main class="auth-page">
    <div class="auth-logo">PS</div>
    <section class="auth-card">
      <h1>{{ title }}</h1>
      <p class="muted">{{ subtitle }}</p>
      <slot />
    </section>
  </main>
</template>

