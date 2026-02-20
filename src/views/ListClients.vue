<template>
  <v-container>
    <v-row>
      <v-col cols="8" md="8" offset="2" >
        <div class="d-flex justify-space-between align-center">
          <h1>Clientes</h1>
          <v-btn size="small" color="primary" :to="'/clientes/novo'">
            <v-icon>mdi-plus</v-icon>
            Novo Cliente
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" md="8" offset="2">
        <v-card
          v-for="client in clients"
          :key="client.uuid"
          class="w-100 my-2 elevation-0 border rounded-lg"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h6">{{ client.name }}</h1>
                <p class="text-body-2 text-grey-darken-1">{{ client.email }}</p>
              </div>
              <div>
                <v-btn icon="mdi-eye" variant="text" size="small" color="primary" :to="`/clientes/${client.uuid}`"></v-btn>
                <v-btn icon="mdi-pencil" variant="text" size="small" color="warning" :to="`/clientes/${client.uuid}/editar`"></v-btn>
                <v-btn icon="mdi-delete" variant="text" size="small" color="red" @click="openDialog(client)"></v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <h1 class="text-h6">Deletar Cliente: {{ clientSelected.name }}</h1>
        </v-card-title>
      
        <v-card-text>
          <p>Tem certeza que deseja deletar o cliente?</p>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="primary" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="red" variant="flat" @click="deleteClient">
            <v-icon>mdi-delete</v-icon>
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <NotifyInfo :infos="snackbar" :value="snackbar.value" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'

defineOptions({
  name: 'ListClients',
})

interface Client {
  uuid: string
  name: string
  email: string
}

const clients = ref<Client[]>([])
const clientSelected = ref<Client>({
  uuid: '',
  name: '',
  email: '',
})
const dialog = ref(false)
const notifyMessageSuccess = ref('Cliente deletado com sucesso')
const notifyColorSuccess = ref('success')
const notifyMessageError = ref('Erro ao deletar cliente, tente novamente!')
const notifyColorError = ref('error')
const snackbar = ref({
  value: false,
  message: notifyMessageSuccess.value,
  color: notifyColorSuccess.value,
  timeout: 2000,
})
const openDialog = (client: Client) => {
  dialog.value = true
  clientSelected.value = client
}

const deleteClient = async () => {
  try {
    await api.delete(`/clients/${clientSelected.value.uuid}`)
    dialog.value = false
    snackbar.value.value = true
    getClients()
  } catch (error) {
    snackbar.value.message = notifyMessageError.value
    snackbar.value.color = notifyColorError.value
    snackbar.value.value = true
  } finally {
    dialog.value = false
    resetSnackbar()
  }
}

function resetSnackbar() {
  setTimeout(() => {
    snackbar.value.value = false
    snackbar.value.message = notifyMessageSuccess.value
    snackbar.value.color = notifyColorSuccess.value
  }, 2000)
}

const getClients = async () => {
  const response = await api.get('/clients')
  clients.value = response.data
}

onMounted(() => {
  getClients()
})
</script>

<style scoped>

</style>