<template>
  <v-snackbar v-model="snackbar" :timeout="infos.timeout" location="top" :color="infos.color">
    {{ infos.message }}

    <template v-slot:actions>
      <v-btn color="pink" variant="text" @click="closeSnackbar" :close-delay="0">
        <v-icon color="surface">mdi-close</v-icon></v-btn
      >
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  infos: {
    timeout: number
    color: string
    message: string
  }
  value: boolean
}>()

const snackbar = ref(false)

watch(
  () => props.value,
  (newVal) => {
    snackbar.value = newVal
  },
)

const closeSnackbar = () => {
  snackbar.value = false
}
</script>