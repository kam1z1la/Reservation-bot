<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import NameInput from './components/NameInput.vue';
import DateSelector from './components/DateSelector.vue';
import TimeSelector from './components/TimeSelector.vue';
import PhoneInput from './components/PhoneInput.vue';
import GuestCount from './components/GuestCount.vue';
import ErrorState from './components/ErrorState.vue';
import SuccessState from './components/SuccessState.vue';
import SubmissionError from './components/SubmissionError.vue';
import ReservationService from './services/ReservationService';
import type { Reservation } from './types/Reservation';

const nameInputRef = ref();
const dateSelectorRef = ref();
const timeSelectorRef = ref();
const phoneInputRef = ref();
const guestCountRef = ref();

const isLoading = ref(true);
const isError = ref(false);
const isSubmitting = ref(false);
const isSuccess = ref(false);
const isSubmissionError = ref(false);

const activeDropdown = ref<string | null>(null);

const handleToggle = (id: string) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
  }
};

const form = reactive<Reservation>({
  clientId: 0,
  firstName: '',
  lastName: '',
  phoneNumber: '',
  seatId: 0,
  date: '',
  time: '',
  numberOfPeople: 1,
  messageId: 0,
  reminder: false
});

const initAppData = async () => {
  isLoading.value = true;
  isError.value = false;
  try {
    const initialData = await ReservationService.getInitialDraft();
    if (!initialData || !initialData.clientId) {
      throw new Error('Client ID is missing');
    }
    Object.assign(form, initialData);
  } catch (error) {
    console.error('Critical Error:', error);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  initAppData();
});

const closeApp = () => {
    // @ts-ignore
  if (window.Telegram?.WebApp) {
    // @ts-ignore
    window.Telegram.WebApp.close();
  } else {
    window.close();
  }
};

async function submitReservation() {
  activeDropdown.value = null;
  isSubmissionError.value = false;

  const isNameValid = await nameInputRef.value.v$.$validate();
  const isDateValid = await dateSelectorRef.value.v$.$validate();
  const isTimeValid = await timeSelectorRef.value.v$.$validate();
  const isPhoneValid = await phoneInputRef.value.v$.$validate();
  const isGuestValid = await guestCountRef.value.v$.$validate();

  if (!isNameValid || !isDateValid || !isTimeValid || !isPhoneValid || !isGuestValid) {
    return;
  }

  const reservationDTO: Reservation = {
    ...form,
    numberOfPeople: form.numberOfPeople
  };

  isSubmitting.value = true;

  try {
    const response = await ReservationService.create(reservationDTO);
    console.log('Success:', response);
    
    isSubmitting.value = false;
    isSuccess.value = true;

    setTimeout(() => {
      closeApp();
    }, 2500);

  } catch (error) {
    console.error('Submission Error:', error);
    isSubmitting.value = false;
    isSubmissionError.value = true;
  }
}
</script>

<template>
  <div class="container">
    <SubmissionError 
      v-if="isSubmissionError" 
      @close="isSubmissionError = false" 
    />

    <div v-if="isLoading" class="state-container">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <p class="loading-text">Завантаження даних...</p>
    </div>

    <ErrorState 
      v-else-if="isError"
      title="Помилка авторизації"
      @retry="initAppData"
    />

    <div v-else-if="isSubmitting" class="state-container">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <p class="loading-text">Створюємо бронювання...</p>
    </div>

    <SuccessState 
      v-else-if="isSuccess"
      message="Бронювання успішно створено!"
    />

    <div v-else class="content-wrapper">
      <h1>Бронювання столика</h1>
      
      <div class="form-wrapper">
        <NameInput 
          ref="nameInputRef"
          v-model:firstName="form.firstName"
          v-model:lastName="form.lastName"
        />
        
        <DateSelector 
          ref="dateSelectorRef"
          v-model:date="form.date"
          :is-open="activeDropdown === 'date'"
          @toggle="handleToggle('date')"
        />
        
        <TimeSelector 
          ref="timeSelectorRef"
          v-model:time="form.time"
          :is-open="activeDropdown === 'time'"
          @toggle="handleToggle('time')"
        />
        
        <PhoneInput 
          ref="phoneInputRef"
          v-model:phone="form.phoneNumber"
        />
        
        <GuestCount 
          ref="guestCountRef"
          v-model:guests="form.numberOfPeople"
          :is-open="activeDropdown === 'guests'"
          @toggle="handleToggle('guests')"
        />
        
        <button 
          class="submit-btn" 
          @click="submitReservation"
        >
          Забронювати
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --brand-green: #00A651; 
  --brand-red: #FF2424;
  --bg-dark: #1a1a1a;
}

.container {
  min-height: 100vh;
  min-width: 22.5rem; 
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: clamp(1rem, 3vw, 2rem);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #000000; 
  color: white;
}

.content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-wrapper {
  width: 100%;
  max-width: 28.125rem; 
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(1.5rem, 5vw, 3rem);
  background-color: #111111; 
  border-radius: 1rem;
  box-shadow: 0 0.625rem 1.5625rem rgba(255, 255, 255, 0.05);
  border: 0.0625rem solid #333;
}

h1 {
  text-align: center;
  color: #fff;
  margin-bottom: 2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
}

.submit-btn {
  margin-top: 3rem; 
  padding: 0.875rem;
  background-color: var(--brand-green, #00A651); 
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03125rem;
  text-transform: uppercase;
  box-shadow: 0 0.25rem 0.9375rem rgba(0, 166, 81, 0.3);
  transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.submit-btn:hover {
  background-color: #008f45;
  transform: translateY(-0.125rem);
  box-shadow: 0 0.375rem 1.25rem rgba(0, 166, 81, 0.5);
}

.submit-btn:active {
  transform: translateY(0);
}

.state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex: 1; 
  width: 100%;
  animation: fadeIn 0.3s ease;
}

.loading-text {
  margin-top: 1.25rem;
  color: #aaa;
  font-size: 1.1rem;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 3.75rem;
  height: 3.75rem;
}

.spinner .path {
  stroke: var(--brand-green, #00A651); 
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate { 100% { transform: rotate(360deg); } }
@keyframes dash { 
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } 
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 37.5rem) { 
  .container {
    padding: 0; 
    background-color: #111111;
    justify-content: flex-start; 
    min-width: 100%; 
  }

  .form-wrapper {
    max-width: 100%;
    min-height: 100vh;
    border: none;
    box-shadow: none;
    border-radius: 0;
    padding: 1.5rem; 
    background-color: #111111; 
  }

  h1 {
    margin-top: 1.5rem;
    font-size: 1.5rem;
  }

  .submit-btn {
    margin-bottom: 2rem;
  }
}
</style>