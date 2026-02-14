<template>
  <v-container>
    <v-row>
      <v-col cols="8" md="8" offset="2" >
        <div class="d-flex justify-space-between align-center">
          <h1>Detalhes do Cliente</h1>
          <v-btn variant="text" size="small" color="primary" :to="'/clients'">
            <v-icon>mdi-arrow-left</v-icon>
            Voltar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" md="8" offset="2">
        <v-card
          class="w-100 my-2 elevation-0 border rounded-lg"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h6">{{ client?.name }}</h1>
                <p class="text-body-2 text-grey-darken-1">{{ client?.email ?? '-' }}</p>
              </div>
              <div>
                <v-btn icon="mdi-eye" variant="text" size="small" color="primary"></v-btn>
                <v-btn icon="mdi-pencil" variant="text" size="small" color="warning"></v-btn>
                <v-btn icon="mdi-delete" variant="text" size="small" color="error"></v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineOptions({
  name: 'ShowClient',
})

interface Client {
  id: string
  name: string
  email: string
}

const client = ref<Client>()

onMounted(() => {
  client.value = { id: '1', name: 'MGE Technology LTD', email: 'info@mge.technology' }
})
</script>

<style scoped>

</style>