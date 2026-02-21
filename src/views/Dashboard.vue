<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-medium mb-1">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mb-4">Visão geral do sistema</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total de Clientes</p>
                <h2 class="text-h4 font-weight-bold">{{ metrics.totalClients }}</h2>
              </div>
              <v-avatar color="primary" size="56" variant="tonal">
                <v-icon color="primary" size="large">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total de Colaboradores</p>
                <h2 class="text-h4 font-weight-bold">{{ metrics.totalEmployees }}</h2>
              </div>
              <v-avatar color="secondary" size="56" variant="tonal">
                <v-icon color="secondary" size="large">mdi-account-hard-hat</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total de Enquetes</p>
                <h2 class="text-h4 font-weight-bold">{{ metrics.totalSurveys }}</h2>
              </div>
              <v-avatar color="primary" size="56" variant="tonal">
                <v-icon color="primary" size="large">mdi-clipboard-text</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-card class="chart-card" elevation="0" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-bar</v-icon>
            Colaboradores por Cliente
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="employeesByClient.data.length === 0" class="text-center py-8 text-medium-emphasis">
              Nenhum dado disponível
            </div>
            <div v-else class="chart-container">
              <canvas ref="employeesChartRef" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="chart-card" elevation="0" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-pie</v-icon>
            Distribuição de Enquetes
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="surveysByClient.data.length === 0" class="text-center py-8 text-medium-emphasis">
              Nenhum dado disponível
            </div>
            <div v-else class="chart-container">
              <canvas ref="surveysChartRef" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-card class="chart-card" elevation="0" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            Crescimento Mensal
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="growthData.data.length === 0" class="text-center py-8 text-medium-emphasis">
              Nenhum dado disponível
            </div>
            <div v-else class="chart-container">
              <canvas ref="growthChartRef" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'

defineOptions({
  name: 'Dashboard',
})

const { isCollaborator } = useAuth()

interface Metrics {
  totalClients: number
  totalEmployees: number
  totalSurveys: number
}

interface ChartData {
  labels: string[]
  data: number[]
}

const metrics = ref<Metrics>({
  totalClients: 0,
  totalEmployees: 0,
  totalSurveys: 0,
})

const employeesByClient = ref<ChartData>({ labels: [], data: [] })
const surveysByClient = ref<ChartData>({ labels: [], data: [] })
const growthData = ref<ChartData>({ labels: [], data: [] })
const loading = ref(true)

const employeesChartRef = ref<HTMLCanvasElement | null>(null)
const surveysChartRef = ref<HTMLCanvasElement | null>(null)
const growthChartRef = ref<HTMLCanvasElement | null>(null)

let employeesChart: any = null
let surveysChart: any = null
let growthChart: any = null

const loadMetrics = async () => {
  try {
    loading.value = true
    const clientsPromise = isCollaborator.value ? Promise.resolve({ data: [] }) : api.get('/clients')
    const [clientsRes, employeesRes, surveysRes] = await Promise.all([
      clientsPromise,
      api.get('/employees?per_page=1000'),
      api.get('/surveys'),
    ])

    metrics.value = {
      totalClients: clientsRes.data?.length ?? 0,
      totalEmployees: employeesRes.data?.data?.length || employeesRes.data?.length || 0,
      totalSurveys: surveysRes.data?.length ?? 0,
    }

    const clients = clientsRes.data || []
    const employees = employeesRes.data?.data || employeesRes.data || []
    const surveys = surveysRes.data || []
    processEmployeesData(employees)
    processSurveysData(surveys)
    processGrowthData(clients, employees, surveys)
  } catch (error) {
    console.error('Erro ao carregar métricas:', error)
  } finally {
    loading.value = false
  }
}

const processEmployeesData = (employees: any[]) => {
  const clientMap: Record<string, number> = {}
  employees.forEach((emp: any) => {
    if (emp.client?.name) {
      clientMap[emp.client.name] = (clientMap[emp.client.name] || 0) + 1
    }
  })

  const labels: string[] = []
  const data: number[] = []
  Object.entries(clientMap).forEach(([name, count]) => {
    labels.push(`Cliente ${name}`)
    data.push(count)
  })

  employeesByClient.value = { labels, data }
}

const processSurveysData = (surveys: any[]) => {
  const clientMap: Record<string, number> = {}
  surveys.forEach((survey: any) => {
    if (survey.client?.uuid) {
      const clientName = survey.client.name || survey.client.uuid.slice(0, 8)
      clientMap[clientName] = (clientMap[clientName] || 0) + 1
    }
  })

  const labels: string[] = []
  const data: number[] = []
  Object.entries(clientMap).forEach(([name, count]) => {
    labels.push(name)
    data.push(count)
  })

  surveysByClient.value = { labels, data }
}

const processGrowthData = (clients: any[], employees: any[], surveys: any[]) => {
  const monthMap: Record<string, number> = {}
  
  const addToMonth = (dateStr: string) => {
    if (!dateStr) return
    const date = new Date(dateStr)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthMap[monthKey] = (monthMap[monthKey] || 0) + 1
  }

  clients.forEach((c: any) => addToMonth(c.created_at))
  employees.forEach((e: any) => addToMonth(e.created_at))
  surveys.forEach((s: any) => addToMonth(s.created_at))

  const sortedMonths = Object.keys(monthMap).sort()
  const labels = sortedMonths.map((m) => {
    const [year, month] = m.split('-')
    return `${month}/${year?.slice(2) || ''}`
  })
  const data = sortedMonths.map((m) => monthMap[m] || 0)

  growthData.value = { labels, data }
}

const initCharts = async () => {
  if (typeof window === 'undefined') return

  destroyCharts()

  try {
    const chartModule = await import('chart.js/auto')
    const Chart = chartModule.Chart || (chartModule as any).default
    if (Chart && Chart.register) {
      Chart.register(...(chartModule.registerables || []))
    }

    if (employeesChartRef.value && employeesByClient.value.labels.length > 0) {
      employeesChart = new Chart(employeesChartRef.value, {
        type: 'bar',
        data: {
          labels: employeesByClient.value.labels,
          datasets: [{
            label: 'Colaboradores',
            data: employeesByClient.value.data,
            backgroundColor: 'rgba(238, 76, 74, 0.6)',
            borderColor: '#ee4c4a',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    }

    if (surveysChartRef.value && surveysByClient.value.labels.length > 0) {
      surveysChart = new Chart(surveysChartRef.value, {
        type: 'doughnut',
        data: {
          labels: surveysByClient.value.labels,
          datasets: [{
            data: surveysByClient.value.data,
            backgroundColor: [
              'rgba(238, 76, 74, 0.8)',
              'rgba(0, 151, 167, 0.8)',
              'rgba(238, 76, 74, 0.6)',
              'rgba(0, 151, 167, 0.6)',
              'rgba(238, 76, 74, 0.4)',
              'rgba(0, 151, 167, 0.4)',
            ],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      })
    }

    if (growthChartRef.value && growthData.value.labels.length > 0) {
      growthChart = new Chart(growthChartRef.value, {
        type: 'line',
        data: {
          labels: growthData.value.labels,
          datasets: [
            {
              label: 'Novos registros',
              data: growthData.value.data,
              borderColor: '#ee4c4a',
              backgroundColor: 'rgba(238, 76, 74, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }
  } catch (error) {
    console.error('Erro ao inicializar gráficos:', error)
  }
}

const destroyCharts = () => {
  if (employeesChart) {
    employeesChart.destroy()
    employeesChart = null
  }
  if (surveysChart) {
    surveysChart.destroy()
    surveysChart = null
  }
  if (growthChart) {
    growthChart.destroy()
    growthChart = null
  }
}

const chartsInitialized = ref(false)

watch([employeesByClient, surveysByClient, growthData], () => {
  if (!loading.value && chartsInitialized.value) {
    nextTick(() => initCharts())
  }
}, { deep: true })

onMounted(async () => {
  await loadMetrics()
  await initCharts()
  chartsInitialized.value = true
})

onBeforeUnmount(() => {
  destroyCharts()
})
</script>

<style scoped>
.metric-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  min-height: 300px;
}

.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>
