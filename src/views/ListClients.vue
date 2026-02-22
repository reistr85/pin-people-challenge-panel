<template>
  <DynamicList :schema="clientsSchema" :can-create="canAccessAdmin" :can-delete="canAccessAdmin" />
</template>

<script setup lang="ts">
import DynamicList from '@/components/DynamicList.vue'
import { useAuth } from '@/composables/useAuth'
import type { DynamicListSchema } from '@/types/dynamicList'

defineOptions({
  name: 'ListClients',
})

const { canAccessAdmin } = useAuth()

const clientsSchema: DynamicListSchema = {
  domain: 'clients',
  routeBase: 'clientes',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'uuid', type: 'text' },
  ],
  titleField: 'name',
  subtitleField: 'email',
  avatar: 'initial',
  emptyIcon: 'mdi-account-group-outline',
  labels: {
    singular: 'cliente',
    plural: 'Clientes',
  },
}
</script>
