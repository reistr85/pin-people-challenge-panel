<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <h1>Colaborador</h1>
          <v-btn variant="text" size="small" color="primary" :to="'/colaboradores'">
            <v-icon>mdi-arrow-left</v-icon>
            Voltar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="w-100 my-2 elevation-0 border rounded-lg">
          <v-card-text>
            <div v-if="isEdit || isNew" class="w-100">
              <v-form v-model="valid" @submit.prevent="saveEmployee">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.client_uuid"
                      label="Cliente"
                      :items="clientOptions"
                      clearable
                      hide-details
                      prepend-inner-icon="mdi-account-group-outline"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.name"
                      label="Nome"
                      :rules="rules.name"
                      prepend-inner-icon="mdi-account-outline"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.personal_email"
                      label="Email pessoal"
                      :rules="rules.personal_email"
                      prepend-inner-icon="mdi-email-outline"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.corporation_email"
                      label="Email corporativo"
                      :rules="rules.corporation_email"
                      prepend-inner-icon="mdi-briefcase-outline"
                    />
                  </v-col>
                  <v-col cols="12" md="5">
                    <v-text-field
                      v-model="employee.city"
                      label="Cidade"
                      prepend-inner-icon="mdi-map-marker-outline"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="employee.uf"
                      label="UF"
                      :items="ufOptions"
                      clearable
                      hide-details
                      prepend-inner-icon="mdi-map-marker"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="employee.gender"
                      label="Gênero"
                      :items="genderOptions"
                      clearable
                      hide-details
                      prepend-inner-icon="mdi-gender-male-female"
                    />
                  </v-col>
                  <v-col cols="12" class="pt-4">
                    <v-btn color="primary" type="submit" :loading="loading">
                      <v-icon>mdi-content-save</v-icon>
                      Salvar
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </div>

            <div v-else class="employee-detail">
              <div class="d-flex align-center gap-3 mb-6 w-100">
                <v-avatar color="primary" size="56" variant="tonal">
                  <span class="text-h5 text-primary">{{ (employee?.name ?? '?').charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <div class="flex-grow-1 w-100 ml-5">
                  <h2 class="text-h5 font-weight-medium mb-0">{{ employee?.name ?? '-' }}</h2>
                  <p v-if="employee?.corporation_email || employee?.personal_email" class="text-body-2 text-medium-emphasis mb-0 mt-1">
                    {{ employee?.corporation_email || employee?.personal_email }}
                  </p>
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="detail-grid">
                <div v-if="employee?.client" class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-account-group-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Cliente</span>
                    <span class="text-body-2">{{ employee?.client?.name ?? '-' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-email-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Email pessoal</span>
                    <span class="text-body-2">{{ employee?.personal_email ?? '-' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-briefcase-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Email corporativo</span>
                    <span class="text-body-2">{{ employee?.corporation_email ?? '-' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-map-marker-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Localização</span>
                    <span class="text-body-2">
                      {{ [employee?.city, employee?.uf].filter(Boolean).join(' — ') || '-' }}
                    </span>
                  </div>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-clock-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Tempo de casa</span>
                    <span class="text-body-2">{{ formatTenure(employee?.created_at) }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-account-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Gênero</span>
                    <span class="text-body-2">{{ employee?.gender ?? '-' }}</span>
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
  name: 'ShowEmployee',
})

interface RouteParams {
  uuid: string
}

interface Client {
  uuid: string
  name: string
}

interface Employee {
  uuid: string
  name: string
  personal_email: string | null
  corporation_email: string | null
  uf: string | null
  city: string | null
  tenure: string | null
  gender: string | null
  client_uuid?: string | null
  client?: Client | null
  created_at?: string | null
}

const ufOptions = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']

const genderOptions = [
  { title: 'Masculino', value: 'Masculino' },
  { title: 'Feminino', value: 'Feminino' },
  { title: 'Outro', value: 'Outro' },
  { title: 'Prefiro não informar', value: 'Prefiro não informar' },
]

const clientOptions = computed(() =>
  clients.value.map((c) => ({
    title: c.name,
    value: c.uuid,
  }))
)

const route = useRoute()
const router = useRouter()
const valid = ref(false)
const loading = ref(false)
const clients = ref<Client[]>([])
const employee = ref<Employee>({
  uuid: '',
  name: '',
  personal_email: null,
  corporation_email: null,
  uf: null,
  city: null,
  tenure: null,
  gender: null,
  client_uuid: null,
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
  personal_email: [
    (v: string) => !v?.trim() || emailRegex.test(v.trim()) || 'Informe um email válido',
  ],
  corporation_email: [
    (v: string) => !v?.trim() || emailRegex.test(v.trim()) || 'Informe um email válido',
  ],
}

const getClients = async () => {
  const response = await api.get('/clients')
  clients.value = response.data
}

const getEmployee = async () => {
  if (!uuid.value) return
  const response = await api.get(`/employees/${uuid.value}`)
  employee.value = response.data
  if (response.data.client) {
    employee.value.client_uuid = response.data.client.uuid
  }
}

const saveEmployee = async () => {
  if (!valid.value) {
    snackbar.value.value = true
    resetSnackbar()
    return
  }

  try {
    loading.value = true
    snackbar.value.value = false
    const payload = {
      employee: {
        name: employee.value.name,
        personal_email: employee.value.personal_email || null,
        corporation_email: employee.value.corporation_email || null,
        uf: employee.value.uf || null,
        city: employee.value.city || null,
        gender: employee.value.gender || null,
        client_uuid: employee.value.client_uuid || null,
      },
    }
    if (isEdit.value) {
      await api.put(`/employees/${uuid.value}`, payload)
    } else {
      await api.post('/employees', payload)
    }
    router.push('/colaboradores')
  } catch (error) {
    snackbar.value = {
      value: true,
      message: 'Erro ao salvar colaborador',
      color: 'error',
      timeout: 2000,
    }
    resetSnackbar()
  } finally {
    loading.value = false
  }
}

function resetSnackbar() {
  setTimeout(() => {
    snackbar.value.value = false
    snackbar.value.message = 'Preencha os campos corretamente'
  }, 2000)
}

function formatTenure(createdAt: string | null | undefined): string {
  if (!createdAt) return '-'
  const start = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return '-'
  if (diffDays < 30) return diffDays <= 1 ? 'Menos de 1 mês' : `${diffDays} dias`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return diffMonths === 1 ? '1 mês' : `${diffMonths} meses`
  const years = Math.floor(diffMonths / 12)
  const months = diffMonths % 12
  if (months === 0) return years === 1 ? '1 ano' : `${years} anos`
  const yearLabel = years === 1 ? '1 ano' : `${years} anos`
  const monthLabel = months === 1 ? '1 mês' : `${months} meses`
  return `${yearLabel} e ${monthLabel}`
}

onMounted(() => {
  getClients()
  if (!isNew.value) getEmployee()
})
</script>

<style scoped>
.employee-detail {
  max-width: 100%;
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
