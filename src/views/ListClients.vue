<template>
  <v-container>
    <v-row>
      <v-col cols="8" md="8" offset="2">
        <h1>Lista de Clientes</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" md="8" offset="2">
        <v-card
          v-for="client in clients"
          :key="client.id"
          class="w-100 my-2 elevation-0 border rounded-lg"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h6">{{ client.name }}</h1>
                <p class="text-body-2 text-grey-darken-1">{{ client.email }}</p>
              </div>
              <div>
                <v-btn icon="mdi-eye" variant="text" size="small" color="primary" :to="`/clients/${client.id}`"></v-btn>
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
  name: 'ListClients',
})

interface Client {
  id: string
  name: string
  email: string
}

const clients = ref<Client[]>([])

onMounted(() => {
  clients.value = [
    { id: '1', name: 'MGE Technology LTD', email: 'info@mge.technology' },
    { id: '2', name: 'Vera Health', email: 'info@vera.health' },
    { id: '3', name: 'Infração Digital', email: 'info@infracao.digital' },
  ]
})
</script>

<style scoped>

</style>