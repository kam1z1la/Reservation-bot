<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const props = defineProps<{
  time: string;
  isOpen: boolean;
}>();

const emit = defineEmits(['update:time', 'toggle']);

const MIN_HOUR = 10;
const MAX_HOUR = 21;
const MAX_MINUTE_AT_END = 30;

const isManualInput = ref(false);
const manualInputRef = ref<HTMLInputElement | null>(null);

const hours = Array.from(
  { length: MAX_HOUR - MIN_HOUR + 1 }, 
  (_, i) => (i + MIN_HOUR).toString().padStart(2, '0')
);

const selectedHourIndex = ref(0);
const selectedMinuteIndex = ref(0);
const hourSwiper = ref<any>(null);
const minuteSwiper = ref<any>(null);

const localTime = computed({
  get: () => props.time,
  set: (val) => emit('update:time', val)
});

const minutes = computed(() => {
  const currentHourStr = hours[selectedHourIndex.value] ?? '00';
  const maxM = (parseInt(currentHourStr, 10) === MAX_HOUR) ? MAX_MINUTE_AT_END : 59;
  return Array.from({ length: maxM + 1 }, (_, i) => i.toString().padStart(2, '0'));
});

onMounted(() => {
  if (!props.time) {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();

    const isTooLate = h > MAX_HOUR || (h === MAX_HOUR && m >= MAX_MINUTE_AT_END);

    if (isTooLate) {
      h = MIN_HOUR;
      m = 0;
    } 
    else if (h < MIN_HOUR) {
      h = MIN_HOUR;
      m = 0;
    } 

    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    localTime.value = `${hStr}:${mStr}`;
  }
});

const parseTime = () => {
  let h = 12;
  let m = 0;

  if (props.time) {
    const parts = props.time.split(':');
    const parsedH = parseInt(parts[0]!, 10);
    const parsedM = parseInt(parts[1]!, 10);
    if (!isNaN(parsedH)) h = parsedH;
    if (!isNaN(parsedM)) m = parsedM;
  }

  if (h < MIN_HOUR) h = MIN_HOUR;
  if (h > MAX_HOUR) h = MAX_HOUR;
  if (m < 0) m = 0;
  if (h === MAX_HOUR && m > MAX_MINUTE_AT_END) m = MAX_MINUTE_AT_END;
  if (m > 59) m = 59;

  selectedHourIndex.value = h - MIN_HOUR;
  selectedMinuteIndex.value = Math.min(m, minutes.value.length - 1);

  nextTick(() => {
    if (hourSwiper.value && !hourSwiper.value.destroyed) {
      hourSwiper.value.slideToLoop(selectedHourIndex.value, 0);
    }
    if (minuteSwiper.value && !minuteSwiper.value.destroyed) {
      minuteSwiper.value.slideToLoop(selectedMinuteIndex.value, 0);
    }
  });
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isManualInput.value = false;
    parseTime();
  }
});

watch(() => props.time, parseTime, { immediate: true });

const onSwiperInitHours = (swiper: any) => { 
  hourSwiper.value = swiper; 
  swiper.slideToLoop(selectedHourIndex.value, 0); 
};
const onSwiperInitMinutes = (swiper: any) => { 
  minuteSwiper.value = swiper; 
  swiper.slideToLoop(selectedMinuteIndex.value, 0); 
};

const onHourChange = (swiper: any) => {
  if (isManualInput.value || !props.isOpen) return;
  selectedHourIndex.value = swiper.realIndex;

  if (selectedMinuteIndex.value >= minutes.value.length) {
    selectedMinuteIndex.value = minutes.value.length - 1;
    nextTick(() => {
      minuteSwiper.value?.slideToLoop(selectedMinuteIndex.value, 200);
    });
  }
  updateTimeFromIndexes();
};

const onMinuteChange = (swiper: any) => {
  if (isManualInput.value || !props.isOpen) return;
  selectedMinuteIndex.value = swiper.realIndex;
  updateTimeFromIndexes();
};

const updateTimeFromIndexes = () => {
  const h = hours[selectedHourIndex.value];
  const m = minutes.value[selectedMinuteIndex.value] || '00';
  localTime.value = `${h}:${m}`;
  v$.value.localTime.$touch(); 
};

const enableManualEdit = async () => {
  isManualInput.value = true;
  await nextTick();
  if (manualInputRef.value) {
    manualInputRef.value.focus();
    manualInputRef.value.select();
  }
};

const saveManualInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  let val = input.value.trim();
  
  if (val.length === 4 && !val.includes(':') && !isNaN(Number(val))) {
    val = val.substring(0, 2) + ':' + val.substring(2);
  }

  const timeRegex = /^([0-9]{1,2}):([0-9]{2})$/;
  
  if (timeRegex.test(val)) {
    let [hStr, mStr] = val.split(':');
    let h = parseInt(hStr!, 10);
    let m = parseInt(mStr!, 10);

    if (h < MIN_HOUR) h = MIN_HOUR;
    if (h > MAX_HOUR) h = MAX_HOUR;
    if (m > 59) m = 59;
    if (h === MAX_HOUR && m > MAX_MINUTE_AT_END) m = MAX_MINUTE_AT_END;

    localTime.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    parseTime(); 
  } else {
    input.value = localTime.value || '';
  }
  isManualInput.value = false;
};

const handleEnter = (e: KeyboardEvent) => { (e.target as HTMLInputElement).blur(); };

const togglePicker = () => {
  emit('toggle');
};

const rules = { localTime: { required: helpers.withMessage('Оберіть час', required) } };
const v$ = useVuelidate(rules, { localTime });

defineExpose({ v$ });
</script>

<template>
  <div class="time-selector-row">
    <label class="time-label">Час:</label>

    <div class="input-wrapper">
      <div 
        class="time-input-display"
        :class="{ invalid: v$.localTime.$error, active: isOpen }" 
        @click="togglePicker"
      >
        <span v-if="localTime">{{ localTime }}</span>
        <span v-else class="placeholder">-- : --</span>
        <svg class="clock-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div v-show="isOpen" class="picker-dropdown">
        
        <div v-show="!isManualInput" class="drum-container">
          <div class="vizor" @dblclick="enableManualEdit" title="Подвійний клік для введення вручну"></div>
          
          <swiper
            direction="vertical"
            :slides-per-view="3"
            :centered-slides="true"
            :space-between="0"
            :loop="false" 
            :modules="[Mousewheel, FreeMode]"
            :initial-slide="selectedHourIndex"
            @swiper="onSwiperInitHours"
            @slideChange="onHourChange"
            class="swiper-column"
            :speed="500" 
            :mousewheel="{ sensitivity: 0.8 }" 
            :free-mode="{ enabled: true, sticky: true, momentumRatio: 0.6, momentumVelocityRatio: 0.4 }"
          >
            <swiper-slide v-for="h in hours" :key="h">{{ h }}</swiper-slide>
          </swiper>

          <div class="colon">:</div>

          <swiper
            :key="selectedHourIndex"
            direction="vertical"
            :slides-per-view="3"
            :centered-slides="true"
            :space-between="0"
            :loop="false"
            :modules="[Mousewheel, FreeMode]"
            :initial-slide="selectedMinuteIndex"
            @swiper="onSwiperInitMinutes"
            @slideChange="onMinuteChange"
            class="swiper-column"
            :speed="500"
            :mousewheel="{ sensitivity: 0.8 }"
            :free-mode="{ enabled: true, sticky: true, momentumRatio: 0.6, momentumVelocityRatio: 0.4 }"
          >
            <swiper-slide v-for="m in minutes" :key="m">{{ m }}</swiper-slide>
          </swiper>
        </div>

        <div v-show="isManualInput" class="manual-container">
          <span class="manual-label">Введіть час (10:00 - 21:30):</span>
          <input
            ref="manualInputRef"
            type="text"
            :value="localTime"
            class="manual-input-field"
            @blur="saveManualInput"
            @keydown.enter="handleEnter"
            placeholder="HH:MM"
          />
        </div>

      </div>
      <span v-if="v$.localTime.$error" class="error-msg">
        {{ v$.localTime.$errors[0]?.$message }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.time-selector-row {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  margin-top: 1rem;
  position: relative;
  z-index: 10;
}

.time-label {
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

.time-input-display {
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

.clock-icon {
  position: absolute;
  right: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #666;
}

.time-input-display:hover {
  background-color: #222;
}

.time-input-display.active {
  border-color: #00A651;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.time-input-display.invalid {
  border-color: #FF2424;
}

.placeholder { color: #666; }

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
  flex-direction: column;
}

.drum-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.manual-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.625rem;
}

.manual-label { color: #ccc; font-size: 0.8rem; }

.manual-input-field {
  background: transparent;
  border: none;
  border-bottom: 0.125rem solid #00A651;
  color: white;
  font-size: 2rem;
  text-align: center;
  width: 7.5rem;
  outline: none;
  font-family: inherit;
  padding-bottom: 0.3125rem;
}

.swiper-column {
  width: 5rem;
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

.colon {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin: 0 0.625rem;
  padding-bottom: 0.25rem;
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

.error-msg {
  color: #FF2424;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 37.5rem) { 
  .time-selector-row {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch; 
  }

  .time-label {
    margin-top: 0;
    margin-bottom: 0.25rem;
  }
}
</style>