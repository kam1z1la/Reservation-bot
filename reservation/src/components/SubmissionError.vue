<script setup lang="ts">
const emit = defineEmits(['close']);
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="icon-box">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="error-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 class="modal-title">Ой, щось пішло не так</h3>
      <p class="modal-text">
        Не вдалося надіслати дані. Можливо, проблема з інтернетом або сервером.
      </p>

      <button class="close-btn" @click="emit('close')">
        Закрити та спробувати ще раз
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(0.25rem);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
  box-sizing: border-box;
  padding: clamp(1rem, 5vw, 2rem);
}

.modal-card {
  background-color: #1c1c1e;
  border: 0.0625rem solid #333;
  border-radius: 1rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  box-sizing: border-box;
  width: 100%;
  max-width: 25rem; 
  text-align: center;
  box-shadow: 0 1.25rem 2.5rem rgba(0,0,0,0.6);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-box {
  color: #e74c3c;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

.error-icon {
  width: 4rem;
  height: 4rem;
}

.modal-title {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.modal-text {
  color: #aaa;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  font-size: 0.95rem;
  line-height: 1.4;
}

.close-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background-color: #444;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(1.25rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 37.5rem) { 
  .modal-overlay {
      padding: 1rem; 
  }

  .modal-card {
    width: 100%; 
    max-width: 20rem; 
    padding: 1.5rem; 
  }

  .modal-title {
    font-size: 1.1rem;
  }
}
</style>