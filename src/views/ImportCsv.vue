<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-medium mb-1">Importar CSV</h1>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Envie um arquivo CSV para importar colaboradores e respostas da pesquisa de clima.
        </p>

        <v-card class="import-card" elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <v-form ref="formRef" @submit.prevent="submit">
              <v-file-input
                v-model="file"
                label="Arquivo CSV"
                accept=".csv"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-file-delimited-outline"
                :rules="[rules.required]"
                show-size
                class="mb-4"
                @update:model-value="error = ''"
              />

              <v-alert v-if="error" type="error" density="compact" class="mb-4" closable>
                {{ error }}
              </v-alert>
              <v-alert v-if="success" type="success" density="compact" class="mb-4" closable>
                {{ success }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="loading"
                :disabled="loading"
                class="text-none font-weight-medium"
              >
                <v-icon start>mdi-upload</v-icon>
                Enviar e importar
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-dialog v-model="dialogClearDatabase" max-width="500" persistent>
          <v-card rounded="lg">
            <v-card-title class="d-flex align-center text-warning">
              <v-icon color="warning" class="me-2">mdi-alert-circle-outline</v-icon>
              Atenção: todos os dados serão apagados
            </v-card-title>
            <v-card-text class="pt-4">
              <p class="text-body-1 mb-0">
                Ao confirmar, <strong>todos os dados do sistema serão excluídos permanentemente</strong>:
                clientes, colaboradores, enquetes, perguntas e respostas, cargos, áreas e funções.
              </p>
              <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
                Em seguida, os dados do arquivo CSV serão importados. Usuários e senhas de acesso não são afetados.
              </p>
              <p class="text-body-1 font-weight-medium mt-3 mb-0">Deseja continuar?</p>
            </v-card-text>
            <v-divider />
            <v-card-actions class="px-4 py-3">
              <v-spacer />
              <v-btn variant="text" @click="dialogClearDatabase = false" :disabled="loading">
                Cancelar
              </v-btn>
              <v-btn color="error" variant="flat" @click="confirmImport" :loading="loading">
                <v-icon start>mdi-delete-forever</v-icon>
                Sim, apagar tudo e importar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-card class="mt-6" elevation="0" rounded="lg" variant="tonal">
          <v-card-text class="pa-4">
            <p class="text-body-2 mb-0">
              <strong>Formato esperado:</strong> CSV com separador ponto e vírgula (;), encoding UTF-8.
              Colunas como nome, email, email_corporativo, cargo, area, funcao, e as colunas da pesquisa de clima.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <NotifyInfo :infos="snackbarInfos" :value="snackbarVisible" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'
import type { VForm } from 'vuetify/components'

defineOptions({
  name: 'ImportCsv',
})

interface Client {
  uuid: string
  name: string | null
  email: string | null
}

const formRef = ref<VForm | null>(null)
const file = ref<File[] | File | null>(null)
const clients = ref<Client[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')

const snackbarVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const snackbarTimeout = 4000
const snackbarInfos = computed(() => ({
  message: snackbarMessage.value,
  color: snackbarColor.value,
  timeout: snackbarTimeout,
}))

function getSelectedFile(v: File[] | File | null): File | null {
  if (!v) return null
  if (Array.isArray(v)) return v.length > 0 ? (v[0] ?? null) : null
  return v instanceof File ? v : null
}

const rules = {
  required: (v: File[] | File | null) => getSelectedFile(v) instanceof File || 'Selecione um arquivo CSV',
}

const clientOptions = computed(() => [
  { title: '— Nenhum (Cliente Importação) —', value: null },
  ...clients.value.map((c) => ({
    title: c.name || c.email || c.uuid,
    value: c.uuid,
  })),
])

async function loadClients() {
  try {
    const { data } = await api.get<Client[]>('/clients')
    clients.value = data || []
  } catch {
    clients.value = []
  }
}

const dialogClearDatabase = ref(false)
const pendingFile = ref<File | null>(null)

function submit() {
  error.value = ''
  success.value = ''
  formRef.value!.validate().then(({ valid }) => {
    if (!valid) return

    const f = getSelectedFile(file.value)
    if (!f) {
      error.value = 'Selecione um arquivo CSV.'
      return
    }
    if (!f.name.toLowerCase().endsWith('.csv')) {
      error.value = 'O arquivo deve ter extensão .csv'
      return
    }

    pendingFile.value = f
    dialogClearDatabase.value = true
  })
}

async function confirmImport() {
  const f = pendingFile.value
  if (!f) {
    dialogClearDatabase.value = false
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', f)
    formData.append('clear_database', 'true')

    const { data } = await api.post<{ job_id: string; status: string; message: string }>(
      '/imports/csv',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    success.value = data.message || 'Importação enfileirada. O processamento ocorre em background.'
    snackbarMessage.value = success.value
    snackbarColor.value = 'success'
    snackbarVisible.value = true
    file.value = null
    pendingFile.value = null
    dialogClearDatabase.value = false
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null
    error.value = msg || 'Falha ao enviar o arquivo. Tente novamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClients()
})
</script>

<style scoped>
.import-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
