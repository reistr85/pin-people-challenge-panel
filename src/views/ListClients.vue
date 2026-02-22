<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="list-header">
          <div>
            <h1 class="text-h4 font-weight-medium mb-1">Clientes</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ clients.length }} {{ clients.length === 1 ? 'cliente' : 'clientes' }}
            </p>
          </div>
          <v-btn color="primary" :to="'/clientes/novo'" class="ml-4">
            <v-icon start>mdi-plus</v-icon>
            Novo Cliente
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <div v-if="clients.length === 0" class="empty-state">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
          <p class="text-h6 text-medium-emphasis mb-2">Nenhum cliente cadastrado</p>
          <p class="text-body-2 text-medium-emphasis mb-4">Adicione seu primeiro cliente para começar.</p>
          <v-btn color="primary" :to="'/clientes/novo'">
            <v-icon start>mdi-plus</v-icon>
            Novo Cliente
          </v-btn>
        </div>

        <v-card
          v-for="client in clients"
          :key="client.uuid"
          class="client-card"
          elevation="0"
          rounded="lg"
        >
          <v-card-text class="d-flex align-center py-4">
            <v-avatar color="primary" size="48" variant="tonal" class="me-4 flex-shrink-0">
              <span class="text-h6 text-primary">{{ (client.name ?? '?').charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div class="flex-grow-1 min-w-0">
              <h2 class="text-subtitle-1 font-weight-medium mb-0 text-truncate">{{ client.name }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0 mt-1 d-flex align-center">
                <v-icon size="small" class="me-1">mdi-email-outline</v-icon>
                <span class="text-truncate">{{ client.email }}</span>
              </p>
            </div>
            <div class="client-actions flex-shrink-0">
              <template v-if="!mobile">
                <v-tooltip text="Ver detalhes" location="top">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-eye-outline" variant="text" size="small" color="primary" :to="`/clientes/${client.uuid}`" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Editar" location="top">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" color="primary" :to="`/clientes/${client.uuid}/editar`" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Excluir" location="top">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-delete-outline" variant="text" size="small" color="error" @click="openDialog(client)" />
                  </template>
                </v-tooltip>
              </template>
              <v-menu
                v-else
                :model-value="openMenuId === client.uuid"
                :close-on-content-click="true"
                location="bottom end"
                origin="top end"
                transition="scale-transition"
                @update:model-value="(v) => (openMenuId = v ? client.uuid : null)"
              >
                <template #activator="{ props: menuProps }">
                  <v-btn v-bind="menuProps" aria-label="Ações" icon="mdi-dots-vertical" variant="text" size="small" color="primary" />
                </template>
                <v-list min-width="180">
                  <v-list-item :to="`/clientes/${client.uuid}`" @click="openMenuId = null">
                    <template #prepend><v-icon size="small">mdi-eye-outline</v-icon></template>
                    <v-list-item-title>Ver detalhes</v-list-item-title>
                  </v-list-item>
                  <v-list-item :to="`/clientes/${client.uuid}/editar`" @click="openMenuId = null">
                    <template #prepend><v-icon size="small">mdi-pencil-outline</v-icon></template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openDialog(client); openMenuId = null">
                    <template #prepend><v-icon size="small" color="error">mdi-delete-outline</v-icon></template>
                    <v-list-item-title class="text-error">Excluir</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="me-2">mdi-alert-circle-outline</v-icon>
          Excluir cliente
        </v-card-title>
        <v-card-text>
          <p class="mb-0">
            Tem certeza que deseja excluir <strong>{{ clientSelected.name }}</strong>? Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="deleteClient">
            <v-icon start>mdi-delete-outline</v-icon>
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
import { useDisplay } from 'vuetify'
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'

const { mobile } = useDisplay()
const openMenuId = ref<string | null>(null)

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
.list-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
}

.client-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.client-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.client-actions {
  display: flex;
  gap: 0.25rem;
}
</style>