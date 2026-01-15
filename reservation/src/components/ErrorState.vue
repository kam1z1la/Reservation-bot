<script setup lang="ts">
defineProps<{
  title?: string;
  message?: string;
}>();

const emit = defineEmits(['retry']);
</script>

<template>
  <div class="error-wrapper">
    <div class="icon-box">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="error-icon">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    
    <h2 class="error-title">{{ title || 'Сталася помилка' }}</h2>
    <p class="error-message">{{ message || 'Не вдалося завантажити дані. Спробуйте пізніше.' }}</p>

    <button class="retry-btn" @click="emit('retry')">
      Спробувати ще раз
    </button>
  </div>
</template>

<style scoped>
.error-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  padding: clamp(1.5rem, 5vw, 2.5rem);
  margin: auto;
  background-color: #161618;
  border-radius: 1rem;
  border: 0.0625rem solid #333;
  max-width: 25rem;
  width: 100%;
  box-shadow: 0 0.625rem 1.5625rem rgba(0, 0, 0, 0.5);
}

.icon-box {
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  color: #e74c3c;
}

.error-icon {
  width: 4rem;
  height: 4rem;
}

.error-title {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.error-message {
  color: #aaa;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  font-size: 1rem;
  line-height: 1.5;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background-color: #3390ec;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #287bbd;
}

@media (max-width: 37.5rem) { 
  .error-wrapper {
    width: calc(100% - 2rem); 
  }
}
</style>