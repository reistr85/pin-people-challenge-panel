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
              <div v-if="isEdit" class="w-100">
                <v-form v-model="valid" @submit.prevent="saveClient">
                  <v-text-field v-model="client.name" label="Nome" :rules="rules.name" />
                  <v-text-field v-model="client.email" label="Email" :rules="rules.email" />
                  
                    <v-btn color="primary" type="submit" class="mt-4" :loading="loading">
                    <v-icon>mdi-content-save</v-icon>
                    Salvar
                  </v-btn>
                </v-form>
              </div>
              <div v-else>
                <h1 class="text-h6">{{ client?.name }}</h1>
                <p class="text-body-2 text-grey-darken-1">{{ client?.email ?? '-' }}</p>
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
    const response = await api.put(`/clients/${uuid.value}`, {
      name: client.value.name,
      email: client.value.email,
    })

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

</style>