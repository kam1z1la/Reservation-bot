<script setup lang="ts">
import { computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, numeric, minLength, maxLength, helpers } from '@vuelidate/validators';

const props = defineProps<{
  phone: string;
}>();

const emit = defineEmits(['update:phone']);

const VALID_OPERATOR_CODES = [
  '39', 
  '50', '66', '95', '99', 
  '67', '68', '96', '97', '98', 
  '77', 
  '63', '73', '93', 
  '91', 
  '92', 
  '94', 
  '75'  
];

const localPhone = computed({
  get: () => props.phone,
  set: (val) => emit('update:phone', val)
});

const validOperator = (value: string) => {
  if (!value || value.length < 2) return true;
  const code = value.substring(0, 2);
  return VALID_OPERATOR_CODES.includes(code);
};

const rules = {
  localPhone: { 
    required: helpers.withMessage('Введіть номер', required),
    numeric: helpers.withMessage('Тільки цифри', numeric),
    minLength: helpers.withMessage('Не вистачає цифр', minLength(9)),
    maxLength: helpers.withMessage('Забагато цифр', maxLength(9)),
    validCode: helpers.withMessage('Невідомий код оператора', validOperator)
  }
};

const v$ = useVuelidate(rules, { localPhone });

defineExpose({ v$ });
</script>

<template>
  <div class="phone-input-row">
    <label class="phone-label">Телефон:</label>
    
    <div class="input-group-wrapper">
      
      <div class="joined-input" :class="{ invalid: v$.localPhone.$error }">
        
        <div class="phone-prefix">
          <svg class="flag-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
            <g fill-rule="evenodd" stroke-width="1pt">
              <path fill="#ffd700" d="M0 240h640v240H0z"/>
              <path fill="#0057b8" d="M0 0h640v240H0z"/>
            </g>
          </svg>
          <span class="prefix-text">+380</span>
        </div>

        <input 
          type="tel" 
          v-model="localPhone" 
          @blur="v$.localPhone.$touch"
          @input="v$.localPhone.$touch" 
          class="phone-field"
          placeholder="XX XXX XX XX"
          maxlength="9" 
        />
      </div>
      
      <span v-if="v$.localPhone.$error" class="error-msg">
        {{ v$.localPhone.$errors[0]?.$message }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.phone-input-row {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  margin-top: 1rem;
}

.phone-label {
  font-weight: 500;
  color: #ffffff;
  font-size: 0.9rem;
  white-space: nowrap;
  min-width: 4.375rem;
  margin-top: 0.875rem;
}

.input-group-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.joined-input {
  display: flex;
  align-items: center;
  width: 100%;
  border: 0.0625rem solid #333;
  border-radius: 0.75rem;
  background-color: #1a1a1a;
  transition: all 0.2s ease;
}

.joined-input.invalid {
  border-color: #FF2424;
}

.joined-input:focus-within {
  border-color: #00A651;
  box-shadow: 0 0 0 0.1875rem rgba(0, 166, 81, 0.1);
}

.phone-prefix {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.75rem 0.75rem clamp(0.75rem, 1.5vw, 1rem);
  background-color: #222;
  border-right: 0.0625rem solid #333;
  border-top-left-radius: 0.6875rem;
  border-bottom-left-radius: 0.6875rem;
  user-select: none;
}

.flag-icon {
  width: 1.25rem;
  height: 0.9375rem;
  margin-right: 0.5rem;
  border-radius: 0.125rem;
}

.prefix-text {
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
}

.phone-field {
  flex: 1;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 1.1rem;
  padding: 0.75rem clamp(0.75rem, 1.5vw, 1rem);
  outline: none;
  font-family: inherit;
  width: 100%;
}

.phone-field::placeholder {
  color: #555;
  font-size: 1rem;
}

.error-msg {
  color: #FF2424;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 37.5rem) { 
  .phone-input-row {
    flex-direction: column; 
    gap: 0.5rem; 
    align-items: stretch; 
  }

  .phone-label {
    margin-top: 0; 
    margin-bottom: 0.25rem; 
    font-size: 1rem; 
  }
}
</style>