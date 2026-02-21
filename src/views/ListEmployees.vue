<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="10" offset-md="1">
        <div class="list-header">
          <div>
            <h1 class="text-h4 font-weight-medium mb-1">Colaboradores</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ meta.total_count }} {{ meta.total_count === 1 ? 'colaborador' : 'colaboradores' }}
            </p>
          </div>
          <v-btn v-if="canManageEmployees" color="primary" :to="'/colaboradores/novo'" class="ml-4">
            <v-icon start>mdi-plus</v-icon>
            Novo Colaborador
          </v-btn>
        </div>

        <v-card v-if="clients.length > 0" class="filter-card mb-4 elevation-0 rounded-lg">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filterClient"
                  label="Filtrar por cliente"
                  :items="clientOptions"
                  density="compact"
                  hide-details
                  clearable
                  prepend-inner-icon="mdi-account-group-outline"
                  @update:model-value="onFilterChange"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filterName"
                  label="Filtrar por nome"
                  density="compact"
                  hide-details
                  clearable
                  prepend-inner-icon="mdi-account-outline"
                  @update:model-value="onFilterChange"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filterEmail"
                  label="Filtrar por email"
                  density="compact"
                  hide-details
                  clearable
                  prepend-inner-icon="mdi-email-outline"
                  @update:model-value="onFilterChange"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="10" offset-md="1">
        <div v-if="employees.length === 0" class="empty-state">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-hard-hat-outline</v-icon>
          <p class="text-h6 text-medium-emphasis mb-2">Nenhum colaborador encontrado</p>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ filterName || filterEmail || filterClient ? 'Tente ajustar os filtros ou adicione um novo colaborador.' : 'Adicione seu primeiro colaborador para começar.' }}
          </p>
          <v-btn v-if="canManageEmployees" color="primary" :to="'/colaboradores/novo'">
            <v-icon start>mdi-plus</v-icon>
            Novo Colaborador
          </v-btn>
        </div>

        <v-card
          v-for="employee in employees"
          :key="employee.uuid"
          class="employee-card"
          elevation="0"
          rounded="lg"
        >
          <v-card-text class="d-flex align-center py-4">
            <v-avatar color="primary" size="48" variant="tonal" class="me-4 flex-shrink-0">
              <span class="text-h6 text-primary">{{ (employee.name ?? '?').charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div class="flex-grow-1 min-w-0">
              <h2 class="text-subtitle-1 font-weight-medium mb-0 text-truncate">{{ employee.name }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0 mt-1 d-flex align-center">
                <v-icon size="small" class="me-1">mdi-email-outline</v-icon>
                <span class="text-truncate">{{ employee.personal_email || employee.corporation_email || '-' }}</span>
              </p>
            </div>
            <div class="employee-actions flex-shrink-0">
              <v-tooltip text="Ver detalhes" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye-outline"
                    variant="text"
                    size="small"
                    color="primary"
                    :to="`/colaboradores/${employee.uuid}`"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Editar" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    variant="text"
                    size="small"
                    color="primary"
                    :to="`/colaboradores/${employee.uuid}/editar`"
                  />
                </template>
              </v-tooltip>
              <v-tooltip v-if="canManageEmployees" text="Excluir" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete-outline"
                    variant="text"
                    size="small"
                    color="error"
                    @click="openDialog(employee)"
                  />
                </template>
              </v-tooltip>
            </div>
          </v-card-text>
        </v-card>

        <v-pagination
          v-if="meta.total_pages > 1"
          v-model="page"
          :length="meta.total_pages"
          :total-visible="7"
          class="mt-4"
          rounded="circle"
          size="small"
          color="primary"
          @update:model-value="onPageChange"
        />
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="me-2">mdi-alert-circle-outline</v-icon>
          Excluir colaborador
        </v-card-title>
        <v-card-text>
          <p class="mb-0">
            Tem certeza que deseja excluir <strong>{{ employeeSelected.name }}</strong>? Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="deleteEmployee">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { canManageEmployees } = useAuth()

defineOptions({
  name: 'ListEmployees',
})

interface Employee {
  uuid: string
  name: string
  personal_email: string | null
  corporation_email: string | null
  uf: string | null
  city: string | null
  tenure: string | null
  gender: string | null
}

interface Client {
  uuid: string
  name: string
}

const employees = ref<Employee[]>([])
const clients = ref<Client[]>([])
const page = ref(Math.max(1, parseInt(String(route.query.page), 10) || 1))
const filterName = ref(String(route.query.name ?? ''))
const filterEmail = ref(String(route.query.email ?? ''))
const filterClient = ref<string | null>((route.query.client as string) || null)
let filterTimeout: ReturnType<typeof setTimeout> | null = null
const meta = ref({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  per_page: 10,
})
const employeeSelected = ref<Employee>({
  uuid: '',
  name: '',
  personal_email: null,
  corporation_email: null,
  uf: null,
  city: null,
  tenure: null,
  gender: null,
})
const dialog = ref(false)
const notifyMessageSuccess = ref('Colaborador deletado com sucesso')
const notifyColorSuccess = ref('success')
const notifyMessageError = ref('Erro ao deletar colaborador, tente novamente!')
const notifyColorError = ref('error')
const snackbar = ref({
  value: false,
  message: notifyMessageSuccess.value,
  color: notifyColorSuccess.value,
  timeout: 2000,
})

const openDialog = (employee: Employee) => {
  dialog.value = true
  employeeSelected.value = employee
}

const deleteEmployee = async () => {
  try {
    await api.delete(`/employees/${employeeSelected.value.uuid}`)
    dialog.value = false
    snackbar.value.value = true
    getEmployees(page.value)
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

const clientOptions = computed(() =>
  clients.value.map((c) => ({
    title: c.name,
    value: c.uuid,
  }))
)

const getEmployees = async (pageNumber = 1) => {
  const params: Record<string, string | number> = {
    page: pageNumber,
    per_page: meta.value.per_page,
  }
  if ((filterName?.value ?? '').trim()) params.name = (filterName?.value ?? '').trim()
  if ((filterEmail?.value ?? '').trim()) params.email = (filterEmail?.value ?? '').trim()
  if (filterClient.value) params.client_uuid = filterClient.value

  const response = await api.get('/employees', { params })
  const data = response.data
  employees.value = data?.data ?? data ?? []
  
  if (data?.meta) {
    meta.value = {
      current_page: data.meta.current_page,
      total_pages: data.meta.total_pages,
      total_count: data.meta.total_count,
      per_page: data.meta.per_page ?? meta.value.per_page,
    }
  }
}

const buildFilterQuery = () => {
  const query: Record<string, string> = { page: '1' }
  const name = (filterName.value ?? '').toString().trim()
  const email = (filterEmail.value ?? '').toString().trim()
  const client = (filterClient.value ?? '').toString().trim()
  if (name) query.name = name
  if (email) query.email = email
  if (client) query.client = client
  return query
}

const onFilterChange = () => {
  if (filterTimeout) clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    router.replace({
      path: route.path,
      query: buildFilterQuery(),
    })

    getEmployees(1)
    filterTimeout = null
  }, 400)
}

const onPageChange = (newPage: number) => {
  router.replace({
    path: route.path,
    query: { ...route.query, page: String(newPage) },
  })
  getEmployees(newPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getClients = async () => {
  const response = await api.get('/clients')
  clients.value = response.data
}

onMounted(() => {
  getClients()
  const query: Record<string, string> = {
    page: String(route.query.page || page.value),
    ...(filterName.value && { name: filterName.value }),
    ...(filterEmail.value && { email: filterEmail.value }),
    ...(filterClient.value && { client: filterClient.value }),
  }
  if (JSON.stringify(route.query) !== JSON.stringify(query)) {
    router.replace({ path: route.path, query })
  }
  getEmployees(page.value)
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

.filter-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
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

.employee-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.employee-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.employee-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
