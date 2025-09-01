<script setup lang="ts">
import parsePhoneNumberFromString from 'libphonenumber-js'
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
import isEqual from 'lodash/isEqual'

// Props
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  propPhone: '',
  placeholder: 'Enter your phone number',
  defaultCountry: 'IN',
})

// Constants
const defaultPhoneDataValues = {
  country: {
    dialCode: '',
    name: '',
    iso2: '',
  },
  countryCallingCode: '',
  countryCode: '',
  formatted: '',
  nationalNumber: '',
  number: '',
  valid: false,
}

interface Props {
  propPhone?: string
  disabled?: boolean
  placeholder?: string
  defaultCountry?: string
}

interface PhoneCountry {
  dialCode: string
  name: string
  iso2: string
}

interface PhoneNumber {
  country?: PhoneCountry
  countryCallingCode?: string
  countryCode?: string
  formatted?: string
  nationalNumber?: string
  number?: string
  valid?: boolean
}

/**
 * When try to access "phoneRef.value.phoneObject", the typescript throws an error-
 * "Property 'phoneObject' does not exist on type 'VueTelInputConstructor'"
 * To resolve this, augment the TypeScript type definition of the VueTelInput component
 */
declare module 'vue-tel-input' {
  interface VueTelInputConstructor {
    phoneObject: PhoneNumber
  }
}

// Local State
const phone = ref<string>('')
const phoneRef = ref<typeof VueTelInput>()
const phoneData = ref<PhoneNumber>(defaultPhoneDataValues)
const phoneErr = ref<boolean>(false)
const phoneErrMsg = ref<string>('')

// Watchers
watch(phoneData, (newVal) => {
  /**
   * This watcher will also get triggered When resetPhoneField function gets called,
   * which will again set the phoneErr and phoneErrMsg, so, to prevent this
   * call the watcher only when not triggered by resetPhoneField.
   */
  if (!isEqual(newVal, defaultPhoneDataValues)) handlePhoneValidation()
})

watch(
  () => props.propPhone,
  (newVal) => {
    /**
     * This watch will trigger when parent component passes phone number value
     */
    if (newVal) initializePhoneDataAndParseCountryCode()
  },
)

// Methods
let prevCursor = 0
let prevNumber: string = ''
function onPhoneInput(_phoneNumber: string, payload: PhoneNumber, input: HTMLInputElement) {
  if (_phoneNumber?.length < prevNumber.length) {
    nextTick(() => {
      input.setSelectionRange(input.selectionStart, --prevCursor)
    })
  } else {
    nextTick(() => {
      input.setSelectionRange(input.selectionStart, ++prevCursor)
    })
  }
  prevNumber = _phoneNumber

  return (phoneData.value = payload)
}

function onCountryChanged(payload: PhoneCountry) {
  /**
   * On country change, we need to reset the phone number but this function gets called
   * on mount too which will reset phone number on mount, so, reset the phone number
   * only if changed country does not matches with already selected phone's country code
   */
  if (phone.value && !phone.value?.includes(payload.dialCode)) resetPhoneField()

  // setTimeout(() => {
  //   document.querySelector<HTMLInputElement>('.custom-cursor input')?.focus()
  // }, 0)
}

function handlePhoneValidation() {
  if (!phone.value) {
    phoneErr.value = true
    phoneErrMsg.value = 'Phone number is required'

    return {
      status: false,
      message: 'Phone number is required',
    }
  }

  if (!phoneData.value?.valid) {
    phoneErr.value = true
    phoneErrMsg.value = 'Please enter valid Mobile Number'

    return {
      status: false,
      message: 'Please enter valid Mobile Number',
    }
  }

  phoneErr.value = false
  phoneErrMsg.value = ''

  return {
    status: true,
  }
}

function resetPhoneField() {
  phone.value = ''
  phoneErrMsg.value = ''
  phoneErr.value = false
  phoneData.value = defaultPhoneDataValues
}

function initializePhoneDataAndParseCountryCode() {
  if (props.propPhone) {
    phone.value = props.propPhone
    prevNumber = props.propPhone
  }

  nextTick(() => {
    if (!props.propPhone) return

    const parsed = parsePhoneNumberFromString(props.propPhone)

    if (parsed && parsed.isValid()) {
      const countryList = (phoneRef.value as any)?.allCountries || []
      const foundCountry = countryList.find((c: any) => c.iso2 === parsed.country)

      phoneData.value = {
        country: foundCountry
          ? {
              dialCode: foundCountry.dialCode,
              name: foundCountry.name,
              iso2: foundCountry.iso2,
            }
          : {
              dialCode: '',
              name: '',
              iso2: '',
            },
        countryCallingCode: parsed.countryCallingCode || '',
        countryCode: parsed.country || '',
        formatted: parsed.formatInternational(),
        nationalNumber: parsed.nationalNumber,
        number: parsed.number,
        valid: true,
      }

      phone.value = parsed.nationalNumber
    } else {
      phoneData.value = defaultPhoneDataValues
    }
  })
}

function getCursorPositionOnClick(event: Event) {
  prevCursor = (event.target as HTMLInputElement).selectionStart ?? 0
}
function modifyCursorPositionOnKeyup(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement
  prevCursor = input.selectionStart ?? 0
}

function modifyCursorPositionOnPaste(event: ClipboardEvent) {
  const pastedContent = event.clipboardData?.getData('Text') as string
  const contentLength = pastedContent.length > 0 ? pastedContent.length - 1 : 0
  prevCursor = prevCursor + contentLength
}

// Hooks
onMounted(() => {
  /*
   * trying to get all the input filed from the current screen
   * there might have multiple inputs in one screen
   * that's why querySelectorAll is used here
   * adding event listeners with the phone input field
   * */

  // VueTelInput does not have $refs to access input using phoneRef so using this method
  const phoneInputs = document.querySelectorAll('.custom-cursor')
  if (phoneInputs) {
    ;[...phoneInputs].forEach((phoneInput) => {
      ;(phoneInput as HTMLInputElement).addEventListener('click', getCursorPositionOnClick)
      ;(phoneInput as HTMLInputElement).addEventListener('keyup', modifyCursorPositionOnKeyup)
      ;(phoneInput as HTMLInputElement).addEventListener('paste', modifyCursorPositionOnPaste)
    })
  }

  /**
   * If phone number is already present (i.e edit user case),
   * 1. Manually initialize that phone's state from library object and set to the local state
   * 2. Parse the country code from the phone number
   */
  setTimeout(() => {
    initializePhoneDataAndParseCountryCode()
  }, 0)
})

defineExpose({
  phoneData,
  handlePhoneValidation,
  resetPhoneField,
})
</script>

<template>
  <div>
    <VueTelInput
      ref="phoneRef"
      v-model="phone"
      class="custom-cursor"
      mode="international"
      :default-country="props.defaultCountry"
      :auto-format="false"
      required
      enabled-flags
      :disabled="props.disabled"
      :valid-characters-only="true"
      :style-classes="{
        errorState: phoneErr,
      }"
      selected-country-code
      :dropdown-options="{
        showDialCodeInList: true,
        showDialCodeInSelection: true,
        showFlags: true,
        showSearchBox: true,
      }"
      :input-options="{
        showDialCode: true,
        placeholder: props.placeholder,
      }"
      @on-input="onPhoneInput"
      @blur="handlePhoneValidation()"
      @country-changed="onCountryChanged"
    />
    <!-- Validation error field -->
    <div v-if="phoneErr">
      <p class="mt-2 text-red-500 dark:text-red-400 text-sm">
        {{ phoneErrMsg }}
      </p>
    </div>
  </div>
</template>

<style slang="scss" scoped>
@import '~/assets/css/vue-tel-input.scss';

.errorState {
  border: 1px solid red !important;
}
</style>
