<script setup lang="ts">
import { computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';

const props = defineProps<{
  firstName: string;
  lastName: string;
}>();

const emit = defineEmits(['update:firstName', 'update:lastName']);

const localFirstName = computed({
  get: () => props.firstName,
  set: (val) => emit('update:firstName', val)
});

const localLastName = computed({
  get: () => props.lastName,
  set: (val) => emit('update:lastName', val)
});

const rules = {
  localFirstName: { 
    required: helpers.withMessage("Ім'я обов'язкове", required), 
    minLength: helpers.withMessage('Мінімум 2 символи', minLength(2)) 
  },
  localLastName: { 
    required: helpers.withMessage("Прізвище обов'язкове", required) 
  }
};

const v$ = useVuelidate(rules, { localFirstName, localLastName });

defineExpose({ v$ });
</script>

<template>
  <div class="name-input">
    <div class="field-group">
      <label>Ім'я:</label>
      <input 
        type="text" 
        v-model="localFirstName" 
        @blur="v$.localFirstName.$touch" 
        :class="{ invalid: v$.localFirstName.$error }"
        placeholder="Введіть ім'я" 
      />
      <span v-if="v$.localFirstName.$error" class="error-msg">
        {{ v$.localFirstName.$errors[0]?.$message }}
      </span>
    </div>

    <div class="field-group">
      <label>Прізвище:</label>
      <input 
        type="text" 
        v-model="localLastName" 
        @blur="v$.localLastName.$touch"
        :class="{ invalid: v$.localLastName.$error }"
        placeholder="Введіть прізвище" 
      />
      <span v-if="v$.localLastName.$error" class="error-msg">
        {{ v$.localLastName.$errors[0]?.$message }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.name-input {
  display: flex;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  box-sizing: border-box;
  flex-direction: row; 
}

.field-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #ffffff;
  font-size: 0.9rem;
}

input {
  padding: clamp(0.75rem, 1vw, 1rem); 
  border: 0.0625rem solid #333; 
  background-color: #1a1a1a;
  color: white;
  border-radius: 0.75rem; 
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
}

input::placeholder {
  color: #555;
}

input:focus {
  border-color: #00A651;
  box-shadow: 0 0 0 0.1875rem rgba(0, 166, 81, 0.1); 
}

.invalid {
  border-color: #FF2424;
}

.error-msg {
  color: #FF2424;
  font-size: 0.75rem;
  margin-top: 0.25rem; 
}

@media (max-width: 37.5rem) { 
  .name-input {
    flex-direction: column;
    gap: 1rem; 
  }
}
</style>