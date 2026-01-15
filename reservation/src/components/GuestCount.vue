<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue, maxValue, helpers } from '@vuelidate/validators';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const props = defineProps<{
  guests: number;
  isOpen: boolean;
}>();

const emit = defineEmits(['update:guests', 'toggle']);

const isManualInput = ref(false); 
const swiperRef = ref<any>(null);
const selectedIndex = ref(0);
const manualInputRef = ref<HTMLInputElement | null>(null);

const MAX_GUESTS = 40;
const guestOptions = Array.from({ length: MAX_GUESTS }, (_, i) => i + 1);

const localGuests = computed({
  get: () => props.guests,
  set: (val) => emit('update:guests', val)
});

const parseGuests = () => {
  const val = props.guests || 1;
  const index = Math.max(0, Math.min(val - 1, MAX_GUESTS - 1));
  selectedIndex.value = index;

  nextTick(() => {
    if (swiperRef.value && !swiperRef.value.destroyed) {
      swiperRef.value.slideToLoop(index, 0);
    }
  });
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isManualInput.value = false;
    parseGuests();
  }
});

watch(() => props.guests, parseGuests, { immediate: true });

const onSwiperInit = (swiper: any) => {
  swiperRef.value = swiper;
  swiper.slideToLoop(selectedIndex.value, 0);
};

const onSlideChange = (swiper: any) => {
  if (!props.isOpen || isManualInput.value) return;
  const newVal = guestOptions[swiper.realIndex] ?? 1;
  localGuests.value = newVal;
  v$.value.localGuests.$touch();
};

const togglePicker = () => {
  emit('toggle');
};

const enableManualEdit = async () => {
  isManualInput.value = true;
  await nextTick();
  if (manualInputRef.value) {
    manualInputRef.value.value = localGuests.value.toString();
    manualInputRef.value.focus();
    manualInputRef.value.select();
  }
};

const saveManualInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  let val = parseInt(input.value, 10);

  if (isNaN(val) || val < 1) {
    val = 1;
  } else if (val > MAX_GUESTS) {
    val = MAX_GUESTS;
  }

  localGuests.value = val;
  isManualInput.value = false; 
  
  parseGuests();
  v$.value.localGuests.$touch();
};

const onInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, '');
};

const handleEnter = (e: KeyboardEvent) => {
  (e.target as HTMLInputElement).blur();
};

const rules = {
  localGuests: { 
    required: helpers.withMessage('Вкажіть кількість', required), 
    minValue: helpers.withMessage('Мінімум 1', minValue(1)),
    maxValue: helpers.withMessage(`Максимум ${MAX_GUESTS}`, maxValue(MAX_GUESTS))
  }
};
const v$ = useVuelidate(rules, { localGuests });

defineExpose({ v$ });
</script>

<template>
  <div class="guest-input-row">
    <label class="guest-label">Кількість гостей:</label>

    <div class="input-wrapper">
      
      <div 
        class="guest-input-display"
        :class="{ invalid: v$.localGuests.$error, active: isOpen }"
        @click="togglePicker"
      >
        <span>{{ localGuests }}</span>
        <svg class="user-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <div v-show="isOpen" class="picker-dropdown">
        
        <div v-show="!isManualInput" class="swiper-wrapper-box">
          <div class="vizor" @dblclick="enableManualEdit" title="Подвійний клік для введення вручну"></div>
          
          <swiper
            direction="vertical"
            :slides-per-view="3"
            :centered-slides="true"
            :space-between="0"
            :loop="true" 
            :modules="[Mousewheel, FreeMode]"
            :initial-slide="selectedIndex"
            @swiper="onSwiperInit"
            @slideChange="onSlideChange"
            class="swiper-column"
            :speed="500" 
            :mousewheel="{ sensitivity: 0.8 }" 
            :free-mode="{ enabled: true, sticky: true, momentumRatio: 0.6, momentumVelocityRatio: 0.4 }"
          >
            <swiper-slide v-for="num in guestOptions" :key="num">
              {{ num }}
            </swiper-slide>
          </swiper>
        </div>

        <div v-show="isManualInput" class="manual-input-box">
          <span class="manual-hint">Введіть число (1-40)</span>
          <input 
            ref="manualInputRef"
            type="text" 
            class="manual-input"
            @blur="saveManualInput"
            @keydown.enter="handleEnter"
            @input="onInput"
            placeholder="1"
          />
        </div>

      </div>
      
      <span v-if="v$.localGuests.$error" class="error-msg">
        {{ v$.localGuests.$errors[0]?.$message }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.guest-input-row {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  margin-top: 1rem;
  position: relative;
  z-index: 5;
}

.guest-label {
  font-weight: 500;
  color: #ffffff;
  font-size: 0.9rem;
  white-space: nowrap;
  min-width: 3.75rem;
  margin-top: 0.75rem;
}

.input-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
}

.guest-input-display {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem clamp(0.75rem, 1.5vw, 1rem);
  background-color: #1a1a1a;
  border: 0.0625rem solid #333;
  border-radius: 0.75rem;
  color: white;
  font-size: 1.1rem;
  letter-spacing: 0.0625rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}

.guest-input-display:hover {
  background-color: #222;
}

.guest-input-display.active {
  border-color: #00A651;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.guest-input-display.invalid {
  border-color: #FF2424;
}

.user-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #666;
  position: absolute;
  right: 1rem;
}

.picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 9.375rem;
  background-color: #1a1a1a;
  border: 0.0625rem solid #00A651;
  border-top: none;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  overflow: hidden;
  z-index: 20;
  box-shadow: 0 0.625rem 1.25rem rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-wrapper-box {
  width: 100%;
  height: 100%;
  position: relative;
}

.swiper-column {
  width: 100%;
  height: 100%;
}

:deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #fff;
  opacity: 0.3;
  transition: opacity 0.3s;
  cursor: pointer;
  font-weight: 600;
}

:deep(.swiper-slide-active) {
  opacity: 1;
  color: #00A651;
  transform: scale(1.1);
}

.vizor {
  position: absolute;
  top: 50%;
  left: 1.25rem;
  right: 1.25rem;
  height: 2.5rem;
  transform: translateY(-50%);
  border-top: 0.0625rem solid #333;
  border-bottom: 0.0625rem solid #333;
  pointer-events: auto;
  cursor: pointer;
  z-index: 10;
}

.manual-input-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.manual-hint {
  color: #666;
  font-size: 0.8rem;
}

.manual-input {
  background: transparent;
  border: none;
  border-bottom: 0.125rem solid #00A651;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  width: 5rem;
  outline: none;
  padding-bottom: 0.25rem;
}

.error-msg {
  color: #FF2424;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 37.5rem) { 
  .guest-input-row {
    flex-direction: column; 
    gap: 0.5rem; 
    align-items: stretch; 
  }

  .guest-label {
    margin-top: 0; 
    margin-bottom: 0.25rem; 
    font-size: 1rem; 
  }
}
</style>