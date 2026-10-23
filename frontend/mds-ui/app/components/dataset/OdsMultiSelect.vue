<template>
  <OdsFormField
    :for="getUniqueId('multi-select')"
    :label="label"
    type="select"
    :required="required"
  >
    <div :class="selectWrapperClasses">
      <VSelect
        :id="getUniqueId('multi-select')"
        v-model="selected"
        :multiple="multiple"
        :placeholder="placeholder"
        :class="selectClasses"
        :disabled="disabled"
        :components="{ Deselect, OpenIndicator }"
        :options="options"
        :name="name"
        :taggable="taggable"
        :no-drop="taggable"
        label="title"
        :filterable="!!loadOptions"
        :close-on-select="closeOnSelect"
        @search="loadOptions!"
      >
        <template #no-options>
          <slot name="no-options" />
        </template>
        <!-- Workaround for required validation -->
        <template #search="{ attributes, events }">
          <input
            class="vs__search"
            :required="
              required && (!selected || selected.length === 0)
            "
            v-bind="attributes as any"
            @keydown="onSearchKeydown"
            v-on="events"
          >
        </template>
        <template #option="option">
          <slot
            name="option"
            v-bind="option"
          />
        </template>
        <template #selected-option="option">
          <slot
            name="selected-option"
            v-bind="option"
          />
        </template>
      </VSelect>
      <div class="select__icon">
        <svg
          role="presentation"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path
            d="m5.706 10.015 6.669 3.85 6.669-3.85.375.649-7.044 4.067-7.044-4.067z"
          />
        </svg>
      </div>
    </div>
    <div
      v-if="message"
      class="badge badge--sm"
      :class="`badge--${messageType}`"
    >
      {{ message }}
    </div>
  </OdsFormField>
</template>

<script setup lang="ts">
// @ts-expect-error vue-select 4 ships no type definitions (same setup as the Swiss design system's MultiSelect)
import VSelect from 'vue-select'
import { ref, computed, onMounted, h } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import OdsFormField from '~/components/OdsFormField.vue'

const selectId = ref('')
const selected = defineModel<unknown[]>({
  default: () => [],
})
const Deselect = { render: () => h('span', '×') }
const OpenIndicator = { render: () => h('span') }

interface Props {
  loadOptions?: (search: string, loading: (isLoading: boolean) => void) => void
  closeOnSelect?: boolean
  bare?: boolean
  variant?: 'outline' | 'negative'
  size?: 'sm' | 'base' | 'lg'
  disabled?: boolean
  hideLabel?: boolean
  required?: boolean
  label?: string
  name?: string
  message?: string
  messageType?: 'error' | 'warning' | 'success' | 'info'
  options?: unknown[]
  multiple?: boolean
  placeholder?: string
  excluded?: string[]
  selectLimit?: number
  taggable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadOptions: undefined,
  closeOnSelect: true,
  bare: false,
  variant: 'outline',
  size: 'base',
  disabled: false,
  hideLabel: false,
  required: false,
  label: undefined,
  name: undefined,
  message: undefined,
  messageType: undefined,
  options: () => [],
  multiple: true,
  placeholder: undefined,
  excluded: () => [],
  selectLimit: undefined,
  taggable: false,
})

const selectWrapperClasses = computed(() => {
  const classes = ['select', 'shadow-lg']
  if (props.bare) {
    classes.push('select--bare')
  }
  return classes.join(' ')
})

const selectClasses = computed(() => {
  const classes = []

  if (props.variant) {
    classes.push(`input--${props.variant}`)
  }
  if (props.size) {
    classes.push(`input--${props.size}`)
  }
  if (props.disabled) {
    classes.push('input--disabled')
  }
  if (props.messageType) {
    classes.push(`input--${props.messageType}`)
  }

  return classes.join(' ')
})

const getUniqueId = function (text = '') {
  return `${text}-${selectId.value}`
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    nextTick(() => {
      (event.target as HTMLInputElement).focus()
    })
  }
}

onMounted(() => {
  selectId.value = uuidv4()
})
</script>

<style scoped>
input.vs__selected {
  cursor: default;
}
</style>
