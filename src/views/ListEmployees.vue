<template>
  <v-container>
    <v-row>
      <v-col cols="8" md="8" offset="2" >
        <div class="d-flex justify-space-between align-center">
          <h1>Colaboradores</h1>
          <v-btn size="small" color="primary" :to="'/colaboradores/novo'">
            <v-icon>mdi-plus</v-icon>
            Novo Colaborador
          </v-btn>
        </div>
        <p class="text-body-2 text-grey-darken-1 mt-1">
          {{ meta.total_count }} {{ meta.total_count === 1 ? 'colaborador' : 'colaboradores' }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" md="8" offset="2">
        <v-card
          v-for="employee in employees"
          :key="employee.uuid"
          class="w-100 my-2 elevation-0 border rounded-lg"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h6">{{ employee.name }}</h1>
                <p class="text-body-2 text-grey-darken-1">{{ employee.personal_email || employee.corporation_email || '-' }}</p>
              </div>
              <div>
                <v-btn icon="mdi-eye" variant="text" size="small" color="primary" :to="`/colaboradores/${employee.uuid}`"></v-btn>
                <v-btn icon="mdi-pencil" variant="text" size="small" color="warning" :to="`/colaboradores/${employee.uuid}/editar`"></v-btn>
                <v-btn icon="mdi-delete" variant="text" size="small" color="red" @click="openDialog(employee)"></v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-pagination
          v-if="meta.total_pages > 1"
          v-model="page"
          :length="meta.total_pages"
          :total-visible="7"
          class="mt-4"
          @update:model-value="onPageChange"
        />
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <h1 class="text-h6">Deletar Colaborador: {{ employeeSelected.name }}</h1>
        </v-card-title>

        <v-card-text>
          <p>Tem certeza que deseja deletar o colaborador?</p>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="primary" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="red" variant="flat" @click="deleteEmployee">
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
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'

const route = useRoute()
const router = useRouter()

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

const employees = ref<Employee[]>([])
const page = ref(Math.max(1, parseInt(String(route.query.page), 10) || 1))
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

const getEmployees = async (pageNumber = 1) => {
  const response = await api.get('/employees', {
    params: { page: pageNumber, per_page: meta.value.per_page },
  })
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

const onPageChange = (newPage: number) => {
  router.replace({
    path: route.path,
    query: { ...route.query, page: String(newPage) },
  })
  getEmployees(newPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (!route.query.page) {
    router.replace({
      path: route.path,
      query: { ...route.query, page: String(page.value) },
    })
  }
  getEmployees(page.value)
})
</script>

<style scoped>

</style>
