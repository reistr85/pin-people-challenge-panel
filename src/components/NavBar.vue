<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-container>
        <div class="d-flex justify-start align-center px-16">
          <v-img src="https://cdn.prod.website-files.com/5fa09bc3928ec91d04260b62/622a1830fe8ba05e67a8c78a_Logo%20horizontal-p-500.png" width="150" />
          <nav class="d-flex justify-start align-center gap-2 ml-16">
            <router-link
              to="/"
              class="nav-link"
              :class="{ 'nav-link--active': isDashboard }"
            >
              <v-icon size="small" :icon="isDashboard ? 'mdi-view-dashboard' : 'mdi-view-dashboard-outline'" />
              <span>Dashboard</span>
            </router-link>
            <router-link
              to="/clientes"
              class="nav-link"
              :class="{ 'nav-link--active': isClientes }"
            >
              <v-icon size="small" :icon="isClientes ? 'mdi-account-group' : 'mdi-account-group-outline'" />
              <span>Clientes</span>
            </router-link>
            <router-link
              to="/colaboradores"
              class="nav-link"
              :class="{ 'nav-link--active': isColaboradores }"
            >
              <v-icon size="small" :icon="isColaboradores ? 'mdi-account-hard-hat' : 'mdi-account-hard-hat-outline'" />
              <span>Colaboradores</span>
            </router-link>
          </nav>
        </div>
      </v-container>
    </template>

    <template v-slot:append>
      <v-btn icon="mdi-dots-vertical"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'NavBar',
})

const route = useRoute()
const isDashboard = computed(() => route.path === '/')
const isClientes = computed(() => route.path.startsWith('/clientes'))
const isColaboradores = computed(() => route.path.startsWith('/colaboradores'))
</script>

<style scoped>
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: rgba(var(--v-theme-on-surface), 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.nav-link:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-on-surface));
}

.nav-link--active {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.nav-link--active:hover {
  background: rgba(var(--v-theme-primary), 0.18);
  color: rgb(var(--v-theme-primary));
}
</style>