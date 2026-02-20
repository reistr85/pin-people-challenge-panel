<template>
  <v-container>
    <v-row>
      <v-col cols="8" md="8" offset="2" >
        <div class="d-flex justify-space-between align-center">
          <h1>Detalhes do Cliente</h1>
          <v-btn variant="text" size="small" color="primary" :to="'/clientes'">
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
              <div v-if="isEdit || isNew" class="w-100">
                <v-form v-model="valid" @submit.prevent="saveClient">
                  <v-text-field
                    v-model="client.name"
                    label="Nome"
                    :rules="rules.name"
                    prepend-inner-icon="mdi-account-outline"
                  />
                  <v-text-field
                    v-model="client.email"
                    label="Email"
                    :rules="rules.email"
                    prepend-inner-icon="mdi-email-outline"
                  />

                  <v-btn color="primary" type="submit" class="mt-4" :loading="loading">
                    <v-icon>mdi-content-save</v-icon>
                    Salvar
                  </v-btn>
                </v-form>
              </div>
              
              <div v-else class="client-detail">
                <div class="d-flex align-center gap-3 mb-6 w-100">
                  <v-avatar color="primary" size="56" variant="tonal">
                    <span class="text-h5 text-primary">{{ (client?.name ?? '?').charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div class="flex-grow-1 w-100 ml-5">
                    <h2 class="text-h5 font-weight-medium mb-0">{{ client?.name ?? '-' }}</h2>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="detail-grid">
                  <div class="detail-item">
                    <v-icon size="small" color="primary" class="me-2">mdi-email-outline</v-icon>
                    <div>
                      <span class="text-caption text-medium-emphasis d-block">Email</span>
                      <span class="text-body-2">{{ client?.email ?? '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <NotifyInfo :infos="snackbar" :value="snackbar.value" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NotifyInfo from '@/components/NotifyInfo.vue'
import api from '@/api'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'ShowClient',
})

interface RouteParams {
  uuid: string
}

interface Client {
  uuid: string
  name: string
  email: string
}
const route = useRoute()
const router = useRouter()
const valid = ref(false)
const loading = ref(false)
const client = ref<Client>({
  uuid: '',
  name: '',
  email: '',
})
const snackbar = ref({
  value: false,
  message: 'Preencha os campos corretamente',
  color: 'error',
  timeout: 2000,
})
const uuid = computed(() => (route.params as RouteParams).uuid)
const isEdit = computed(() => route.path.includes('/editar'))
const isNew = computed(() => route.path.includes('/novo'))
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const rules = {
  name: [
    (v: string) => !!v?.trim() || 'Nome é obrigatório',
    (v: string) => (v?.trim().split(/\s+/).filter(Boolean).length >= 2) || 'Informe nome e sobrenome',
  ],
  email: [
    (v: string) => !!v?.trim() || 'Email é obrigatório',
    (v: string) => !v?.trim() || emailRegex.test(v.trim()) || 'Informe um email válido',
  ],
}

const getClient = async () => {
  const response = await api.get(`/clients/${uuid.value}`)
  client.value = response.data
}

const saveClient = async () => {
  if (!valid.value) {
    snackbar.value.value = true
    resetSnackbar()

    return
  }

  try {
    loading.value = true
    snackbar.value.value = false
    const payload = {
      name: client.value.name,
      email: client.value.email,
    }
    if (isEdit.value) {
      await api.put(`/clients/${uuid.value}`, payload)
    } else {
      await api.post('/clients', payload)
    }

    router.push(`/clientes`)
  } catch (error) {
    snackbar.value = {
      value: true,
      message: 'Erro ao salvar cliente',
      color: 'error',
      timeout: 2000,
    }
    loading.value = false
    resetSnackbar()
  }
}

function resetSnackbar() {
  setTimeout(() => {
    snackbar.value.value = false
    snackbar.value.message = 'Preencha os campos corretamente'
  }, 2000)
}

onMounted(() => {
  getClient()
})
</script>

<style scoped>
.client-detail {
  width: 100%;
}

.detail-grid {
  display: grid;
  gap: 1rem 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 3px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-on-surface), 0.03);
}
</style>