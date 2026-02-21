<template>
  <v-app>
    <v-main>
      <template v-if="isLogin">
        <router-view />
      </template>
      <template v-else>
        <NavBar />
        <v-container class="px-16 py-8">
          <router-view />
        </v-container>
      </template>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLogin = computed(() => route.path === '/login')
</script>
