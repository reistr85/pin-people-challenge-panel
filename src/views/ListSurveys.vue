<template>
  <DynamicList
    :schema="surveysSchema"
    :can-create="canEditSurveys"
    :can-delete="canEditSurveys"
    empty-icon="mdi-clipboard-text-outline"
  />
</template>

<script setup lang="ts">
import DynamicList from '@/components/DynamicList.vue'
import { useAuth } from '@/composables/useAuth'
import type { DynamicListSchema } from '@/types/dynamicList'

defineOptions({
  name: 'ListSurveys',
})

const { canEditSurveys } = useAuth()

const surveysSchema: DynamicListSchema = {
  domain: 'surveys',
  routeBase: 'enquetes',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'uuid', type: 'text' },
  ],
  titleField: 'name',
  subtitleField: 'description',
  avatar: 'icon',
  avatarIcon: 'mdi-clipboard-text',
  labels: {
    singular: 'enquete',
    plural: 'Enquetes',
    gender: 'f',
  },
}
</script>
