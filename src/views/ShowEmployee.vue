<template>
  <v-container>
    <v-row>
      <v-col cols="8" md="8" offset="2" >
        <div class="d-flex justify-space-between align-center">
          <h1>Detalhes do Colaborador</h1>
          <v-btn variant="text" size="small" color="primary" :to="'/colaboradores'">
            <v-icon>mdi-arrow-left</v-icon>
            Voltar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" md="8" offset="2">
        <v-card class="w-100 my-2 elevation-0 border rounded-lg">
          <v-card-text>
            <div v-if="isEdit || isNew" class="w-100">
              <v-form v-model="valid" @submit.prevent="saveEmployee">
                <v-text-field v-model="employee.name" label="Nome" :rules="rules.name" />
                <v-text-field v-model="employee.personal_email" label="Email pessoal" :rules="rules.personal_email" />
                <v-text-field v-model="employee.corporation_email" label="Email corporativo" :rules="rules.corporation_email" />
                <v-text-field v-model="employee.uf" label="UF" :rules="rules.uf" maxlength="2" counter="2" />
                <v-text-field v-model="employee.city" label="Cidade" />
                <v-text-field v-model="employee.tenure" label="Tempo de casa" />
                <v-text-field v-model="employee.gender" label="Gênero" />

                <v-btn color="primary" type="submit" class="mt-4" :loading="loading">
                  <v-icon>mdi-content-save</v-icon>
                  Salvar
                </v-btn>
              </v-form>
            </div>
            <div v-else>
              <h1 class="text-h6">{{ employee?.name }}</h1>
              <p class="text-body-2 text-grey-darken-1">{{ employee?.personal_email ?? '-' }}</p>
              <p class="text-body-2 text-grey-darken-1">{{ employee?.corporation_email ?? '-' }}</p>
              <p class="text-body-2 text-grey-darken-1">{{ employee?.city ?? '-' }} {{ employee?.uf ? `- ${employee.uf}` : '' }}</p>
              <p class="text-body-2 text-grey-darken-1">Tempo de casa: {{ employee?.tenure ?? '-' }}</p>
              <p class="text-body-2 text-grey-darken-1">Gênero: {{ employee?.gender ?? '-' }}</p>
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

const route = useRoute()
const router = useRouter()
const valid = ref(false)
const loading = ref(false)
const employee = ref<Employee>({
  uuid: '',
  name: '',
  personal_email: null,
  corporation_email: null,
  uf: null,
  city: null,
  tenure: null,
  gender: null,
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
  uf: [
    (v: string) => !v?.trim() || (v?.trim().length === 2) || 'UF deve ter 2 caracteres',
  ],
}

const getEmployee = async () => {
  if (!uuid.value) return
  const response = await api.get(`/employees/${uuid.value}`)
  employee.value = response.data
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
        tenure: employee.value.tenure || null,
        gender: employee.value.gender || null,
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

onMounted(() => {
  if (!isNew.value) getEmployee()
})
</script>

<style scoped>

</style>
