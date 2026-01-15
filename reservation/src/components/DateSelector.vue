<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';

const props = defineProps<{
  date: string;
}>();

const emit = defineEmits(['update:date']);

const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'];
const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

const CLOSE_HOUR = 21;
const CLOSE_MINUTE = 30;

const maxAllowedDate = new Date();
maxAllowedDate.setFullYear(maxAllowedDate.getFullYear() + 2); 
maxAllowedDate.setHours(23, 59, 59, 999);

const viewDate = ref(new Date()); 
const inputValue = ref('');       
const isInputFocused = ref(false); 
const inputFormatError = ref(''); 

const notPastDate = (value: string) => {
  if (!value) return true; 
  const d = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  return d >= today;
};

const notTooFuture = (value: string) => {
  if (!value) return true;
  const d = new Date(value);
  return d <= maxAllowedDate;
};

const checkIsTooLate = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  return h > CLOSE_HOUR || (h === CLOSE_HOUR && m >= CLOSE_MINUTE);
};

const localDate = computed({
  get: () => props.date,
  set: (val) => emit('update:date', val)
});

const rules = {
  localDate: { 
    required: helpers.withMessage('Оберіть дату', required),
    notPast: helpers.withMessage('Ця дата вже минула', notPastDate),
    notTooFuture: helpers.withMessage('Бронювання відкрите лише на 2 роки вперед', notTooFuture)
  }
};
const v$ = useVuelidate(rules, { localDate });

const formatToHuman = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

const formatToDigital = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

watch(() => props.date, (newVal) => {
  if (newVal) {
    inputFormatError.value = '';
    if (!isInputFocused.value) {
      inputValue.value = formatToHuman(newVal);
    }
    viewDate.value = new Date(newVal);
  }
}, { immediate: true });

const onFocus = () => {
  isInputFocused.value = true;
  if (props.date) {
    inputValue.value = formatToDigital(props.date);
  }
};

const forceUpdateDate = () => {
  const text = inputValue.value;
  const regex = /^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})$/;
  const match = text.match(regex);

  if (match) {
    const day = parseInt(match[1]!, 10);
    const month = parseInt(match[2]!, 10) - 1; 
    const year = parseInt(match[3]!, 10);

    const newDate = new Date(year, month, day);

    if (
      newDate.getFullYear() === year &&
      newDate.getMonth() === month &&
      newDate.getDate() === day
    ) {
      viewDate.value = new Date(year, month, 1);
      
      const mStr = (month + 1).toString().padStart(2, '0');
      const dStr = day.toString().padStart(2, '0');
      
      localDate.value = `${year}-${mStr}-${dStr}`;
      v$.value.localDate.$touch();
      inputFormatError.value = '';
    } else {
       inputFormatError.value = 'Такої дати не існує';
    }
  } 
};

const onBlur = () => {
  forceUpdateDate();
  isInputFocused.value = false;
  if (!inputFormatError.value && props.date) {
    inputValue.value = formatToHuman(props.date);
  }
};

const onEnter = (e: KeyboardEvent) => {
  (e.target as HTMLInputElement).blur();
};

const onInput = (e: Event) => {
  const inputEl = e.target as HTMLInputElement;
  const eventType = (e as InputEvent).inputType;
  
  let text = inputEl.value;
  text = text.replace(/[/]/g, '.').replace(/[^\d.]/g, '');

  if (eventType !== 'deleteContentBackward') {
     if (text.length === 2 && !text.includes('.')) text += '.';
     if (text.length === 5 && text.indexOf('.') === 2 && text.split('.').length === 2) text += '.';
  }

  if (text.length > 10) text = text.slice(0, 10);

  inputValue.value = text;
  if (inputEl.value !== text) inputEl.value = text;

  inputFormatError.value = '';
};

onMounted(() => {
  if (props.date) {
    viewDate.value = new Date(props.date);
    inputValue.value = formatToHuman(props.date);
  } else {
    let targetDate = new Date();
    
    if (checkIsTooLate()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const y = targetDate.getFullYear();
    const m = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const d = targetDate.getDate().toString().padStart(2, '0');
    
    localDate.value = `${y}-${m}-${d}`;
    viewDate.value = new Date(targetDate);
  }
});

const isPrevDisabled = computed(() => {
  const today = new Date();
  const currentView = viewDate.value;
  return (
    currentView.getFullYear() < today.getFullYear() || 
    (currentView.getFullYear() === today.getFullYear() && currentView.getMonth() <= today.getMonth())
  );
});

const isNextDisabled = computed(() => {
  const currentView = viewDate.value;
  return (
    currentView.getFullYear() > maxAllowedDate.getFullYear() ||
    (currentView.getFullYear() === maxAllowedDate.getFullYear() && currentView.getMonth() >= maxAllowedDate.getMonth())
  );
});

const changeMonth = (step: number) => {
  const newDate = new Date(viewDate.value);
  newDate.setMonth(newDate.getMonth() + step);
  viewDate.value = newDate;
};

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let startDay = new Date(year, month, 1).getDay();
  if (startDay === 0) startDay = 7;
  startDay -= 1;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
});

const isDateDisabled = (day: number | null, checkMonth?: number, checkYear?: number) => {
  if (!day) return false;
  
  const year = checkYear ?? viewDate.value.getFullYear();
  const month = checkMonth ?? viewDate.value.getMonth();
  
  const cellDate = new Date(year, month, day);
  cellDate.setHours(0, 0, 0, 0); 
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  if (cellDate < today) return true;

  if (cellDate.getTime() === today.getTime() && checkIsTooLate()) {
    return true;
  }

  if (cellDate > maxAllowedDate) return true;

  return false;
};

const selectDay = (day: number | null) => {
  if (!day || isDateDisabled(day)) return; 
  const year = viewDate.value.getFullYear();
  const month = (viewDate.value.getMonth() + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  localDate.value = `${year}-${month}-${d}`;
  v$.value.localDate.$touch(); 
};

const isSelected = (day: number | null) => {
  if (!day || !localDate.value) return false;
  const [y, m, d] = localDate.value.split('-').map(Number);
  return (
    y === viewDate.value.getFullYear() &&
    m === (viewDate.value.getMonth() + 1) &&
    d === day
  );
};

defineExpose({ v$ });
</script>

<template>
  <div class="date-selector">
    <label class="main-label">Дата відвідування:</label>
    
    <div class="validation-wrapper">
      <span v-if="inputFormatError" class="error-msg">
        {{ inputFormatError }}
      </span>
      <span v-else-if="v$.localDate.$error" class="error-msg">
        {{ v$.localDate.$errors[0]?.$message }}
      </span>
    </div>
    
    <div class="calendar-card" :class="{ error: v$.localDate.$error || inputFormatError }">
      
      <div class="manual-input-wrapper">
        <input 
          type="text" 
          :value="inputValue"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.enter="onEnter"
          placeholder="DD.MM.YYYY"
          class="date-text-input"
        />
        <svg class="calendar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <div class="calendar-header">
        <span class="month-title">
          {{ months[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}
        </span>
        
        <div class="nav-buttons">
          <button 
            v-if="!isPrevDisabled" 
            @click.prevent="changeMonth(-1)" 
            class="nav-btn"
            title="Попередній місяць"
          >
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <div v-else class="nav-btn-placeholder"></div>

          <button 
            v-if="!isNextDisabled"
            @click.prevent="changeMonth(1)" 
            class="nav-btn"
            title="Наступний місяць"
          >
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-else class="nav-btn-placeholder"></div>
        </div>
      </div>

      <div class="weekdays-grid">
        <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
      </div>

      <div class="days-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="day-cell"
          :class="{ 
            'selected': isSelected(day), 
            'empty': !day,
            'disabled': isDateDisabled(day)
          }"
          @click="selectDay(day)"
        >
          {{ day }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-selector {
  width: 100%;
  transition: width 0.3s ease, margin-left 0.3s ease;
}

.main-label {
  display: block;
  font-weight: 500;
  color: #ffffff;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.validation-wrapper {
  min-height: 1.25rem;
  margin-bottom: 0.375rem;
}

.error-msg {
  color: #FF2424;
  font-size: 0.8rem;
  display: block;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-0.3125rem); }
  to { opacity: 1; transform: translateY(0); }
}

.calendar-card {
  background-color: #1a1a1a;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 0.0625rem solid #333;
  user-select: none;
  transition: border-color 0.2s, padding 0.3s ease;
}

.calendar-card.error {
  border-color: #FF2424;
}

.manual-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
  border-bottom: 0.0625rem solid #333;
  padding-bottom: 0.5rem;
}

.date-text-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.25rem 1.875rem 0.25rem 0.25rem;
  outline: none;
  font-family: inherit;
  transition: color 0.2s;
}

.date-text-input::placeholder {
  color: #555;
  font-weight: 400;
  font-size: 1rem;
}

.calendar-icon {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #666;
  pointer-events: none;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: white;
}

.month-title {
  font-size: 1rem;
  font-weight: 500;
  color: #fff; 
  text-transform: capitalize; 
}

.nav-buttons {
  display: flex;
  gap: 0.5rem; 
}

.nav-btn {
  width: 1.75rem; 
  height: 1.75rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.05); 
  border: none;
  color: #00A651; 
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn-placeholder {
  width: 1.75rem;
  height: 1.75rem;
}

.nav-btn:hover {
  background-color: rgba(0, 166, 81, 0.2);
  transform: scale(1.05);
}

.nav-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.weekdays-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  color: #888;
  font-weight: 600;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: clamp(0.125rem, 1vw, 0.25rem);
}

.day-cell {
  width: 100%; 
  aspect-ratio: 1; 
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  font-size: 1rem;
  color: white;
  transition: background-color 0.2s;
  max-width: 2.25rem; 
}

.day-cell.empty {
  cursor: default;
}

.day-cell:not(.empty):not(.disabled):hover {
  background-color: #2c2c2e;
}

.day-cell.selected {
  background-color: #00A651; 
  color: white;
  font-weight: 600;
  box-shadow: 0 0 0.625rem rgba(0, 166, 81, 0.4);
}

.day-cell.disabled {
  color: #333; 
  cursor: not-allowed; 
  background: none; 
  pointer-events: none; 
  opacity: 0.4; 
}

@media (max-width: 28.125rem) { 
  .date-selector {
    width: calc(100% + 1.5rem);
    margin-left: -0.75rem;
  }

  .calendar-card {
    padding: 0.75rem;
  }
  
  .days-grid {
    gap: 0.125rem;
  }
  
  .day-cell {
    max-width: none;
    font-size: 0.95rem; 
  }
}
</style>