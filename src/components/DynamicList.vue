<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="list-header">
          <div>
            <h1 class="text-h4 font-weight-medium mb-1">{{ schema.labels.plural }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ totalCount }} {{ totalCount === 1 ? schema.labels.singular : schema.labels.plural }}
            </p>
          </div>
          <v-btn v-if="canCreate" color="primary" :to="`/${schema.routeBase}/novo`" class="ml-4">
            <v-icon start>mdi-plus</v-icon>
            {{ derivedLabels.newButton }}
          </v-btn>
        </div>

        <v-card v-if="hasFilters && filterOptionsLoaded" class="filter-card mb-4 elevation-0 rounded-lg">
          <v-card-text>
            <v-row dense>
              <v-col v-for="f in schema.filters" :key="f.key" cols="12" md="4">
                <v-select
                  v-if="f.type === 'select' && f.optionsApi"
                  v-model="filterValues[f.key]"
                  :label="f.label"
                  :items="filterOptions[f.key] ?? []"
                  density="compact"
                  hide-details
                  clearable
                  :prepend-inner-icon="filterPrependIcon(f.key)"
                  @update:model-value="onFilterChange"
                />
                <v-text-field
                  v-else
                  v-model="filterValues[f.key]"
                  :label="f.label"
                  density="compact"
                  hide-details
                  clearable
                  :prepend-inner-icon="filterPrependIcon(f.key)"
                  @update:model-value="onFilterChange"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <div v-if="items.length === 0" class="empty-state">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">{{ effectiveEmptyIcon }}</v-icon>
          <p class="text-h6 text-medium-emphasis mb-2">{{ derivedLabels.emptyTitle }}</p>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ effectiveEmptyMessage }}</p>
          <v-btn v-if="canCreate" color="primary" :to="`/${schema.routeBase}/novo`">
            <v-icon start>mdi-plus</v-icon>
            {{ derivedLabels.newButton }}
          </v-btn>
        </div>

        <v-card
          v-for="item in items"
          :key="String(item[schema.idField ?? 'uuid'])"
          class="list-card"
          elevation="0"
          rounded="lg"
        >
          <v-card-text class="d-flex align-center py-4">
            <v-avatar color="primary" size="48" variant="tonal" class="me-4 flex-shrink-0">
              <span v-if="schema.avatar === 'initial'" class="text-h6 text-primary">{{ avatarInitial(item) }}</span>
              <v-icon v-else-if="schema.avatar === 'icon' && schema.avatarIcon" color="primary">{{ schema.avatarIcon }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1 min-w-0">
              <h2 class="text-subtitle-1 font-weight-medium mb-0 text-truncate">{{ getTitle(item) }}</h2>
              <p v-if="getSubtitle(item) !== undefined" class="text-body-2 text-medium-emphasis mb-0 mt-1 d-flex align-center">
                <v-icon v-if="subtitleIcon" size="small" class="me-1">{{ subtitleIcon }}</v-icon>
                <span class="text-truncate">{{ getSubtitle(item) }}</span>
              </p>
            </div>
            <div class="list-actions flex-shrink-0">
              <template v-if="!mobile">
                <v-tooltip text="Ver detalhes" location="top">
                  <template #activator="{ props: p }">
                    <v-btn v-bind="p" icon="mdi-eye-outline" variant="text" size="small" color="primary" :to="itemRoute(item, '')" />
                  </template>
                </v-tooltip>
                <v-tooltip v-if="canCreate" text="Editar" location="top">
                  <template #activator="{ props: p }">
                    <v-btn v-bind="p" icon="mdi-pencil-outline" variant="text" size="small" color="primary" :to="itemRoute(item, '/editar')" />
                  </template>
                </v-tooltip>
                <v-tooltip v-if="canDelete" text="Excluir" location="top">
                  <template #activator="{ props: p }">
                    <v-btn v-bind="p" icon="mdi-delete-outline" variant="text" size="small" color="error" @click="openDialog(item)" />
                  </template>
                </v-tooltip>
              </template>
              <v-menu
                v-else
                :model-value="openMenuId === item[schema.idField ?? 'uuid']"
                :close-on-content-click="true"
                location="bottom end"
                origin="top end"
                transition="scale-transition"
                @update:model-value="(v) => (openMenuId = v ? String(item[schema.idField ?? 'uuid']) : null)"
              >
                <template #activator="{ props: menuProps }">
                  <v-btn v-bind="menuProps" aria-label="Ações" icon="mdi-dots-vertical" variant="text" size="small" color="primary" />
                </template>
                <v-list min-width="180">
                  <v-list-item :to="itemRoute(item, '')" @click="openMenuId = null">
                    <template #prepend><v-icon size="small">mdi-eye-outline</v-icon></template>
                    <v-list-item-title>Ver detalhes</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="canCreate" :to="itemRoute(item, '/editar')" @click="openMenuId = null">
                    <template #prepend><v-icon size="small">mdi-pencil-outline</v-icon></template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="canDelete" @click="openDialog(item); openMenuId = null">
                    <template #prepend><v-icon size="small" color="error">mdi-delete-outline</v-icon></template>
                    <v-list-item-title class="text-error">Excluir</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>

        <v-pagination
          v-if="schema.paginated && meta.total_pages > 1"
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
          {{ derivedLabels.deleteTitle }}
        </v-card-title>
        <v-card-text>
          <p class="mb-0">
            Tem certeza que deseja excluir <strong>{{ selectedItem ? getTitle(selectedItem) : 'este registro' }}</strong>? Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import api from '@/api'
import NotifyInfo from '@/components/NotifyInfo.vue'
import type { DynamicListSchema, DynamicListMeta, DynamicListRecord } from '@/types/dynamicList'

const props = withDefaults(
  defineProps<{
    schema: DynamicListSchema
    canCreate?: boolean
    canDelete?: boolean
    emptyIcon?: string
    emptyMessage?: string
    successMessage?: string
    errorMessage?: string
    /** Mensagem no empty state quando há filtros ativos (ex: "Tente ajustar os filtros...") */
    emptyMessageWhenFiltered?: string
  }>(),
  {
    canCreate: true,
    canDelete: true,
    emptyIcon: 'mdi-format-list-bulleted',
    emptyMessage: 'Adicione seu primeiro registro para começar.',
    successMessage: 'Registro excluído com sucesso.',
    errorMessage: 'Erro ao excluir, tente novamente!',
  }
)

const route = useRoute()
const router = useRouter()
const { mobile } = useDisplay()

const schema = computed(() => props.schema)
const idField = computed(() => schema.value.idField ?? 'uuid')

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const derivedLabels = computed(() => {
  const s = schema.value.labels.singular
  const p = schema.value.labels.plural
  const gender = schema.value.labels.gender ?? 'm'
  const verb = schema.value.labels.emptyStateVerb ?? 'cadastrado'
  const verbF = verb === 'cadastrado' ? 'cadastrada' : 'encontrada'
  const singularCap = capitalize(s)
  const nenhum = gender === 'f' ? 'Nenhuma' : 'Nenhum'
  const verbM = verb === 'cadastrado' ? 'cadastrado' : 'encontrado'
  return {
    emptyTitle: `${nenhum} ${s} ${gender === 'f' ? verbF : verbM}`,
    emptyMessage: gender === 'f'
      ? `Adicione sua primeira ${s} para começar.`
      : `Adicione seu primeiro ${s} para começar.`,
    emptyMessageWhenFiltered: gender === 'f'
      ? `Tente ajustar os filtros ou adicione uma nova ${s}.`
      : `Tente ajustar os filtros ou adicione um novo ${s}.`,
    deleteTitle: `Excluir ${s}`,
    newButton: gender === 'f' ? `Nova ${singularCap}` : `Novo ${singularCap}`,
    successMessage: `${singularCap} ${gender === 'f' ? 'deletada' : 'deletado'} com sucesso`,
    errorMessage: `Erro ao deletar ${s}, tente novamente!`,
  }
})

const items = ref<DynamicListRecord[]>([])
const meta = ref<DynamicListMeta>({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  per_page: 10,
})
const page = ref(1)
const filterValues = ref<Record<string, string | null>>({})
const filterOptions = ref<Record<string, { title: string; value: string }[]>>({})
const filterOptionsLoaded = ref(true)
const openMenuId = ref<string | null>(null)
const selectedItem = ref<DynamicListRecord | null>(null)
const dialog = ref(false)
const snackbar = ref({
  value: false,
  message: '',
  color: 'success',
  timeout: 2000,
})

const hasFilters = computed(() => (schema.value.filters?.length ?? 0) > 0)

const totalCount = computed(() => {
  if (schema.value.paginated) return meta.value.total_count
  return items.value.length
})

const hasActiveFilters = computed(() => {
  const filters = schema.value.filters ?? []
  return filters.some((f) => {
    const v = filterValues.value[f.key]
    return v != null && String(v).trim() !== ''
  })
})

const effectiveEmptyIcon = computed(
  () => schema.value.emptyIcon ?? props.emptyIcon
)
const effectiveEmptyMessage = computed(() => {
  if (hasActiveFilters.value) return props.emptyMessageWhenFiltered ?? derivedLabels.value.emptyMessageWhenFiltered
  return derivedLabels.value.emptyMessage
})
const effectiveSuccessMessage = computed(() => derivedLabels.value.successMessage)
const effectiveErrorMessage = computed(() => derivedLabels.value.errorMessage)

const subtitleIcon = computed(() => {
  const sub = schema.value.subtitleField
  if (!sub) return ''
  const first = Array.isArray(sub) ? sub[0] : sub
  return first === 'email' || first?.includes('email') ? 'mdi-email-outline' : 'mdi-account-outline'
})

function getTitle(item: DynamicListRecord): string {
  const v = item[schema.value.titleField]
  return v != null ? String(v) : 'Sem nome'
}

function getSubtitle(item: DynamicListRecord): string | undefined {
  const sub = schema.value.subtitleField
  if (!sub) return undefined
  const keys = Array.isArray(sub) ? sub : [sub]
  for (const k of keys) {
    const v = item[k]
    if (v != null && String(v).trim() !== '') return String(v)
  }
  return '-'
}

function avatarInitial(item: DynamicListRecord): string {
  const t = getTitle(item)
  return (t ?? '?').charAt(0).toUpperCase()
}

function itemRoute(item: DynamicListRecord, suffix: string): string {
  const id = item[idField.value]
  return `/${schema.value.routeBase}/${id}${suffix}`
}

function filterPrependIcon(key: string): string {
  if (key === 'client') return 'mdi-account-group-outline'
  if (key === 'name') return 'mdi-account-outline'
  if (key === 'email') return 'mdi-email-outline'
  return 'mdi-filter-outline'
}

async function loadFilterOptions() {
  const filters = schema.value.filters ?? []
  for (const f of filters) {
    if (f.type === 'select' && f.optionsApi) {
      filterOptionsLoaded.value = false
      try {
        const res = await api.get(f.optionsApi.path)
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data ?? [])
        filterOptions.value[f.key] = (raw as DynamicListRecord[]).map((x: DynamicListRecord) => ({
          title: String(x[f.optionsApi!.labelKey] ?? ''),
          value: String(x[f.optionsApi!.valueKey] ?? ''),
        }))
      } finally {
        filterOptionsLoaded.value = true
      }
    }
  }
}

function buildParams(pageNumber: number): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (schema.value.paginated) {
    params.page = pageNumber
    params.per_page = meta.value.per_page
  }
  const filters = schema.value.filters ?? []
  for (const f of filters) {
    const v = filterValues.value[f.key]
    if (v == null || String(v).trim() === '') continue
    const paramKey = f.param ?? f.key
    ;(params as Record<string, string | number>)[paramKey] = String(v).trim()
  }
  return params
}

async function fetchList(pageNumber = 1) {
  console.log('schema', schema)
  const path = `/${schema.value.domain}`
  const params = buildParams(pageNumber)
  const hasParams = Object.keys(params).length > 0
  const response = await api.get(path, hasParams ? { params } : {})

  if (schema.value.paginated && response.data?.data !== undefined) {
    items.value = (response.data.data ?? []) as DynamicListRecord[]
    if (response.data.meta) {
      meta.value = {
        current_page: response.data.meta.current_page ?? meta.value.current_page,
        total_pages: response.data.meta.total_pages ?? 1,
        total_count: response.data.meta.total_count ?? 0,
        per_page: response.data.meta.per_page ?? meta.value.per_page,
      }
    }
  } else {
    const data = response.data
    items.value = (Array.isArray(data) ? data : data?.data ?? []) as DynamicListRecord[]
  }
}

function buildFilterQuery(): Record<string, string> {
  const query: Record<string, string> = {}
  if (schema.value.paginated) query.page = String(page.value)
  const filters = schema.value.filters ?? []
  for (const f of filters) {
    const v = filterValues.value[f.key]
    if (v != null && String(v).trim() !== '') query[f.key] = String(v).trim()
  }
  return query
}

let filterTimeout: ReturnType<typeof setTimeout> | null = null
function onFilterChange() {
  if (filterTimeout) clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    router.replace({ path: route.path, query: buildFilterQuery() })
    fetchList(1)
    filterTimeout = null
  }, 400)
}

function onPageChange(newPage: number) {
  router.replace({ path: route.path, query: { ...route.query, page: String(newPage) } })
  fetchList(newPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openDialog(item: DynamicListRecord) {
  selectedItem.value = item
  dialog.value = true
}

function resetSnackbar() {
  setTimeout(() => {
    snackbar.value.value = false
    snackbar.value.message = effectiveSuccessMessage.value
    snackbar.value.color = 'success'
  }, 2000)
}

async function confirmDelete() {
  if (!selectedItem.value) return
  const id = selectedItem.value[idField.value]
  try {
    await api.delete(`/${schema.value.domain}/${id}`)
    dialog.value = false
    snackbar.value.value = true
    snackbar.value.message = effectiveSuccessMessage.value
    snackbar.value.color = 'success'
    if (schema.value.paginated) await fetchList(page.value)
    else await fetchList()
  } catch {
    snackbar.value.message = effectiveErrorMessage.value
    snackbar.value.color = 'error'
    snackbar.value.value = true
  } finally {
    dialog.value = false
    resetSnackbar()
  }
}

watch(
  () => props.schema.domain,
  () => {
    items.value = []
    meta.value = { current_page: 1, total_pages: 1, total_count: 0, per_page: 10 }
  }
)

onMounted(async () => {
  if (hasFilters.value) {
    const filters = schema.value.filters ?? []
    for (const f of filters) {
      const q = route.query[f.key]
      filterValues.value[f.key] = q != null ? String(q) : null
    }
    await loadFilterOptions()
  }
  if (schema.value.paginated) {
    const qPage = route.query.page
    page.value = Math.max(1, parseInt(String(qPage), 10) || 1)
    const query = buildFilterQuery()
    if (JSON.stringify(route.query) !== JSON.stringify(query)) {
      router.replace({ path: route.path, query: { page: String(page.value), ...route.query } })
    }
  }
  await fetchList(page.value)
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

.list-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.list-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.list-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
