<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="10" offset-md="1">
        <div class="list-header">
          <div>
            <h1 class="text-h4 font-weight-medium mb-1">Enquetes</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ surveys.length }} {{ surveys.length === 1 ? 'enquete' : 'enquetes' }}
            </p>
          </div>
          <v-btn v-if="canEditSurveys" color="primary" :to="'/enquetes/novo'" class="ml-4">
            <v-icon start>mdi-plus</v-icon>
            Nova Enquete
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="10" offset-md="1">
        <div v-if="surveys.length === 0" class="empty-state">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
          <p class="text-h6 text-medium-emphasis mb-2">Nenhuma enquete cadastrada</p>
          <p class="text-body-2 text-medium-emphasis mb-4">Adicione sua primeira enquete para começar.</p>
          <v-btn v-if="canEditSurveys" color="primary" :to="'/enquetes/novo'">
            <v-icon start>mdi-plus</v-icon>
            Nova Enquete
          </v-btn>
        </div>

        <v-card
          v-for="survey in surveys"
          :key="survey.uuid"
          class="survey-card"
          elevation="0"
          rounded="lg"
        >
          <v-card-text class="d-flex align-center py-4">
            <v-avatar color="primary" size="48" variant="tonal" class="me-4 flex-shrink-0">
              <v-icon color="primary">mdi-clipboard-text</v-icon>
            </v-avatar>
            <div class="flex-grow-1 min-w-0">
              <h2 class="text-subtitle-1 font-weight-medium mb-0 text-truncate">{{ survey.name || 'Sem nome' }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0 mt-1">
                <span v-if="survey.description" class="text-truncate d-block">{{ survey.description }}</span>
                <span v-else class="text-medium-emphasis">Sem descrição</span>
              </p>
            </div>
            <div class="survey-actions flex-shrink-0">
              <v-tooltip text="Ver detalhes" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye-outline"
                    variant="text"
                    size="small"
                    color="primary"
                    :to="`/enquetes/${survey.uuid}`"
                  />
                </template>
              </v-tooltip>
              <template v-if="canEditSurveys">
                <v-tooltip text="Editar" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil-outline"
                      variant="text"
                      size="small"
                      color="primary"
                      :to="`/enquetes/${survey.uuid}/editar`"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Excluir" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete-outline"
                      variant="text"
                      size="small"
                      color="error"
                      @click="openDialog(survey)"
                    />
                  </template>
                </v-tooltip>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="me-2">mdi-alert-circle-outline</v-icon>
          Excluir enquete
        </v-card-title>
        <v-card-text>
          <p class="mb-0">
            Tem certeza que deseja excluir <strong>{{ surveySelected.name || 'esta enquete' }}</strong>? Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="deleteSurvey">
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
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'
import { useAuth } from '@/composables/useAuth'

defineOptions({
  name: 'ListSurveys',
})

const { canEditSurveys } = useAuth()

interface Survey {
  uuid: string
  name: string | null
  description: string | null
}

const surveys = ref<Survey[]>([])
const surveySelected = ref<Survey>({
  uuid: '',
  name: null,
  description: null,
})
const dialog = ref(false)
const notifyMessageSuccess = ref('Enquete deletada com sucesso')
const notifyColorSuccess = ref('success')
const notifyMessageError = ref('Erro ao deletar enquete, tente novamente!')
const notifyColorError = ref('error')
const snackbar = ref({
  value: false,
  message: notifyMessageSuccess.value,
  color: notifyColorSuccess.value,
  timeout: 2000,
})

const openDialog = (survey: Survey) => {
  dialog.value = true
  surveySelected.value = survey
}

const deleteSurvey = async () => {
  try {
    await api.delete(`/surveys/${surveySelected.value.uuid}`)
    dialog.value = false
    snackbar.value.value = true
    getSurveys()
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

const getSurveys = async () => {
  const response = await api.get('/surveys')
  surveys.value = response.data
}

onMounted(() => {
  getSurveys()
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

.survey-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.survey-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.survey-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
