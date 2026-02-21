<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="10" offset-md="1">
        <div class="d-flex justify-space-between align-center">
          <h1>Detalhes da Enquete</h1>
          <v-btn variant="text" size="small" color="primary" :to="'/enquetes'">
            <v-icon>mdi-arrow-left</v-icon>
            Voltar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="10" offset-md="1">
        <v-card class="w-100 my-2 elevation-0 border rounded-lg">
          <v-card-text>
            <div v-if="(isEdit || isNew) && canEditSurveys" class="w-100">
              <v-form v-model="valid" @submit.prevent="saveSurvey">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="survey.name"
                      label="Nome da enquete"
                      :rules="rules.name"
                      prepend-inner-icon="mdi-clipboard-text-outline"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="survey.client_uuid"
                      label="Cliente"
                      :items="clientOptions"
                      clearable
                      prepend-inner-icon="mdi-account-group-outline"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="survey.description"
                      label="Descrição"
                      rows="3"
                      prepend-inner-icon="mdi-text"
                      hide-details
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-4" />

                <h3 class="text-h6 mb-4">Perguntas</h3>

                <div v-if="questions.length === 0" class="empty-questions mb-4">
                  <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-help-circle-outline</v-icon>
                  <p class="text-body-2 text-medium-emphasis mb-3">Nenhuma pergunta adicionada</p>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="addQuestion"
                  >
                    <v-icon start>mdi-plus</v-icon>
                    Adicionar Pergunta
                  </v-btn>
                </div>

                <v-card
                  v-for="(question, index) in questions"
                  :key="question.tempId"
                  class="question-card mb-3"
                  elevation="0"
                  rounded="lg"
                >
                  <v-card-text>
                    <div class="d-flex align-start gap-2">
                      <v-text-field
                        v-model="question.question"
                        :label="`Pergunta ${index + 1}`"
                        :rules="rules.question"
                        prepend-inner-icon="mdi-help-circle-outline"
                        class="flex-grow-1"
                      />
                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        color="error"
                        size="small"
                        class="mt-2"
                        @click="removeQuestion(index)"
                      />
                    </div>
                  </v-card-text>
                </v-card>

                <v-btn
                  v-if="questions.length > 0"
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="mb-4 d-block"
                  @click="addQuestion"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Adicionar Pergunta
                </v-btn>

                <v-btn color="primary" type="submit" class="mt-4" :loading="loading">
                  <v-icon>mdi-content-save</v-icon>
                  Salvar
                </v-btn>
              </v-form>
            </div>
            
            <div v-else class="survey-detail">
              <div class="d-flex align-center gap-3 mb-6 w-100">
                <v-avatar color="primary" size="56" variant="tonal">
                  <v-icon color="primary" size="large">mdi-clipboard-text</v-icon>
                </v-avatar>
                <div class="flex-grow-1 w-100 ml-5">
                  <h2 class="text-h5 font-weight-medium mb-0">{{ survey?.name || 'Sem nome' }}</h2>
                  <p v-if="survey?.description" class="text-body-2 text-medium-emphasis mb-0 mt-1">
                    {{ survey.description }}
                  </p>
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="detail-grid">
                <div v-if="survey?.client" class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-account-group-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Cliente</span>
                    <span class="text-body-2">{{ survey.client.name || '-' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="primary" class="me-2">mdi-help-circle-outline</v-icon>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">Perguntas</span>
                    <span class="text-body-2">{{ surveyQuestions.length }} {{ surveyQuestions.length === 1 ? 'pergunta' : 'perguntas' }}</span>
                  </div>
                </div>
              </div>

              <v-divider class="my-4" />

              <div v-if="surveyQuestions.length > 0" class="questions-list">
                <h3 class="text-h6 mb-3">Perguntas da enquete</h3>
                <v-card
                  v-for="(question, index) in surveyQuestions"
                  :key="question.uuid"
                  class="question-item mb-2"
                  elevation="0"
                  rounded="lg"
                >
                  <v-card-text>
                    <div class="d-flex align-center gap-2">
                      <v-icon size="small" color="primary" class="me-2">{{ index + 1 }}.</v-icon>
                      <span class="text-body-1">{{ question.question }}</span>
                    </div>
                  </v-card-text>
                </v-card>
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
import { ref, computed, onMounted, watch } from 'vue'
import NotifyInfo from '@/components/NotifyInfo.vue'
import api from '@/api'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

defineOptions({
  name: 'ShowSurvey',
})

const { canEditSurveys } = useAuth()

interface RouteParams {
  uuid: string
}

interface Client {
  uuid: string
  name: string
}

interface SurveyQuestion {
  uuid?: string
  question: string
  tempId?: number
}

interface Survey {
  uuid: string
  name: string | null
  description: string | null
  client_uuid?: string | null
  client?: Client | null
  survey_questions?: SurveyQuestion[]
}

const route = useRoute()
const router = useRouter()
const valid = ref(false)
const loading = ref(false)
const survey = ref<Survey>({
  uuid: '',
  name: null,
  description: null,
  client_uuid: null,
})
const questions = ref<SurveyQuestion[]>([])
const clients = ref<Client[]>([])
let questionTempIdCounter = 0

const snackbar = ref({
  value: false,
  message: 'Preencha os campos corretamente',
  color: 'error',
  timeout: 2000,
})
const uuid = computed(() => (route.params as RouteParams).uuid)
const isEdit = computed(() => route.path.includes('/editar'))
const isNew = computed(() => route.path.includes('/novo'))
const surveyQuestions = computed(() => survey.value.survey_questions || [])

// Collaborator: only view; redirect from novo/editar
watch(
  () => [route.path, canEditSurveys.value],
  () => {
    if (!canEditSurveys.value && (isNew.value || isEdit.value)) {
      if (uuid.value) router.replace(`/enquetes/${uuid.value}`)
      else router.replace('/enquetes')
    }
  },
  { immediate: true }
)

const clientOptions = computed(() =>
  clients.value.map((c) => ({
    title: c.name,
    value: c.uuid,
  }))
)

const rules = {
  name: [
    (v: string | null) => !!v?.trim() || 'Nome da enquete é obrigatório',
  ],
  question: [
    (v: string) => !!v?.trim() || 'A pergunta é obrigatória',
  ],
}

const addQuestion = () => {
  questions.value.push({
    question: '',
    tempId: questionTempIdCounter++,
  })
}

const removeQuestion = (index: number) => {
  questions.value.splice(index, 1)
}

const getClients = async () => {
  const response = await api.get('/clients')
  clients.value = response.data
}

const getSurvey = async () => {
  if (!uuid.value) return
  const response = await api.get(`/surveys/${uuid.value}`)
  survey.value = response.data
  if (response.data.survey_questions) {
    questions.value = response.data.survey_questions.map((q: SurveyQuestion) => ({
      ...q,
      tempId: questionTempIdCounter++,
    }))
  }
  if (response.data.client) {
    survey.value.client_uuid = response.data.client.uuid
  }
}

const saveSurvey = async () => {
  if (!valid.value) {
    snackbar.value.value = true
    resetSnackbar()
    return
  }

  if (questions.value.length === 0) {
    snackbar.value = {
      value: true,
      message: 'Adicione pelo menos uma pergunta',
      color: 'error',
      timeout: 2000,
    }
    resetSnackbar()
    return
  }

  try {
    loading.value = true
    snackbar.value.value = false
    const payload = {
      survey: {
        name: survey.value.name,
        description: survey.value.description || null,
        client_uuid: survey.value.client_uuid || null,
        survey_questions_attributes: questions.value.map((q) => ({
          uuid: q.uuid || null,
          question: q.question,
          _destroy: false,
        })),
      },
    }
    if (isEdit.value) {
      await api.put(`/surveys/${uuid.value}`, payload)
    } else {
      await api.post('/surveys', payload)
    }
    router.push('/enquetes')
  } catch (error) {
    snackbar.value = {
      value: true,
      message: 'Erro ao salvar enquete',
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
  getClients()
  if (!isNew.value) getSurvey()
})
</script>

<style scoped>
.survey-detail {
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

.empty-questions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 8px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
}

.question-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.question-item {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-on-surface), 0.02);
}
</style>
