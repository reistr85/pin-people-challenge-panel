<template>
  <DynamicList
    :schema="employeesSchema"
    :can-create="canManageEmployees"
    :can-delete="canManageEmployees"
    empty-icon="mdi-account-hard-hat-outline"
  />
</template>

<script setup lang="ts">
import DynamicList from '@/components/DynamicList.vue'
import { useAuth } from '@/composables/useAuth'
import type { DynamicListFilter, DynamicListSchema } from '@/types/dynamicList'
import { computed } from 'vue'

defineOptions({
  name: 'ListEmployees',
})

const { canManageEmployees, isAdmin } = useAuth()

const employeesFilters = computed((): DynamicListFilter[] => {
  const items: DynamicListFilter[] = [
    { key: 'name', label: 'Filtrar por nome', type: 'text', param: 'name' },
    { key: 'email', label: 'Filtrar por email', type: 'text', param: 'email' },
  ]

  if (isAdmin.value) {
    items.push({
      key: 'client',
      label: 'Filtrar por cliente',
      type: 'select',
      param: 'client_uuid',
      optionsApi: { path: '/clients', labelKey: 'name', valueKey: 'uuid' },
    })
  }

  return items
})

const employeesSchema = computed((): DynamicListSchema => ({
  domain: 'employees',
  routeBase: 'colaboradores',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'personal_email', type: 'email' },
    { name: 'corporation_email', type: 'email' },
    { name: 'uuid', type: 'text' },
  ],
  titleField: 'name',
  subtitleField: ['corporation_email', 'personal_email'],
  avatar: 'initial',
  paginated: true,
  filters: employeesFilters.value,
  labels: {
    singular: 'colaborador',
    plural: 'Colaboradores',
    emptyStateVerb: 'encontrado',
  },
}))
</script>
