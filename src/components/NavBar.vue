<template>
  <v-app-bar :elevation="2" class="px-5">
    <template v-slot:prepend>
      <div class="d-flex align-center flex-grow-1">
        <v-img :src="logoSrc" width="150" alt="pinpeople" class="shrink-0 logo-img" />
        <nav v-if="!mobile" class="d-flex align-center gap-1 nav-desktop">
          <router-link to="/" class="nav-link mx-2" :class="{ 'nav-link--active': isDashboard }">
            <v-icon size="small" :icon="isDashboard ? 'mdi-view-dashboard' : 'mdi-view-dashboard-outline'" />
            <span>Dashboard</span>
          </router-link>
          <router-link v-if="canAccessClients" to="/clientes" class="nav-link mx-2" :class="{ 'nav-link--active': isClientes }">
            <v-icon size="small" :icon="isClientes ? 'mdi-account-group' : 'mdi-account-group-outline'" />
            <span>Clientes</span>
          </router-link>
          <router-link to="/colaboradores" class="nav-link mx-2" :class="{ 'nav-link--active': isColaboradores }">
            <v-icon size="small" :icon="isColaboradores ? 'mdi-account-hard-hat' : 'mdi-account-hard-hat-outline'" />
            <span>Colaboradores</span>
          </router-link>
          <router-link to="/enquetes" class="nav-link mx-2" :class="{ 'nav-link--active': isEnquetes }">
            <v-icon size="small" :icon="isEnquetes ? 'mdi-clipboard-text' : 'mdi-clipboard-text-outline'" />
            <span>Enquetes</span>
          </router-link>
          <router-link v-if="isAdmin" to="/importar" class="nav-link mx-2" :class="{ 'nav-link--active': isImportar }">
            <v-icon size="small" :icon="isImportar ? 'mdi-file-upload' : 'mdi-file-upload-outline'" />
            <span>Importar CSV</span>
          </router-link>
        </nav>
      </div>
    </template>

    <template v-slot:append>
      <div class="d-flex align-center gap-1 mr-1">
        <v-icon size="small" :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" />
        <v-switch
          :model-value="isDark"
          @update:model-value="toggleTheme"
          color="primary"
          hide-details
          density="compact"
          class="mt-0 ml-3"
        />
      </div>
      <v-btn v-if="!mobile" variant="text" color="primary" @click="handleLogout" class="logout-btn">
        <v-icon size="small" class="mr-1">mdi-logout</v-icon>
        <span class="d-none d-sm-inline">Sair</span>
      </v-btn>
      <v-btn
        v-if="mobile"
        icon="mdi-menu"
        variant="text"
        size="large"
        class="ml-2 mobile-menu-btn"
        aria-label="Abrir menu"
        @click="toggleDrawer"
      />
    </template>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="start"
    width="280"
    class="mobile-drawer"
    scrim="true"
  >
    <v-list class="mobile-nav-list mt-5" nav>
      <v-list-item
        to="/"
        :active="isDashboard"
        class="mobile-nav-item"
        rounded="lg"
        @click="drawer = false"
      >
        <template v-slot:prepend>
          <v-icon :icon="isDashboard ? 'mdi-view-dashboard' : 'mdi-view-dashboard-outline'" size="small" />
        </template>
        <v-list-item-title class="text-body-1">Dashboard</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="canAccessClients"
        to="/clientes"
        :active="isClientes"
        class="mobile-nav-item"
        rounded="lg"
        @click="drawer = false"
      >
        <template v-slot:prepend>
          <v-icon :icon="isClientes ? 'mdi-account-group' : 'mdi-account-group-outline'" size="small" />
        </template>
        <v-list-item-title class="text-body-1">Clientes</v-list-item-title>
      </v-list-item>
      <v-list-item
        to="/colaboradores"
        :active="isColaboradores"
        class="mobile-nav-item"
        rounded="lg"
        @click="drawer = false"
      >
        <template v-slot:prepend>
          <v-icon :icon="isColaboradores ? 'mdi-account-hard-hat' : 'mdi-account-hard-hat-outline'" size="small" />
        </template>
        <v-list-item-title class="text-body-1">Colaboradores</v-list-item-title>
      </v-list-item>
      <v-list-item
        to="/enquetes"
        :active="isEnquetes"
        class="mobile-nav-item"
        rounded="lg"
        @click="drawer = false"
      >
        <template v-slot:prepend>
          <v-icon :icon="isEnquetes ? 'mdi-clipboard-text' : 'mdi-clipboard-text-outline'" size="small" />
        </template>
        <v-list-item-title class="text-body-1">Enquetes</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="isAdmin"
        to="/importar"
        :active="isImportar"
        class="mobile-nav-item"
        rounded="lg"
        @click="drawer = false"
      >
        <template v-slot:prepend>
          <v-icon :icon="isImportar ? 'mdi-file-upload' : 'mdi-file-upload-outline'" size="small" />
        </template>
        <v-list-item-title class="text-body-1">Importar CSV</v-list-item-title>
      </v-list-item>
      <v-list-item
        @click="handleLogout"
        class="mobile-nav-item"
        rounded="lg"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-logout" size="small" />
        </template>
        <v-list-item-title class="text-body-1 text-red">Sair</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme, useDisplay } from 'vuetify'
import { useAuth } from '@/composables/useAuth'
import logoDark from '@/assets/logo-dark-transp.png'

const router = useRouter()
const { logout, canAccessClients, isAdmin } = useAuth()
const { mobile } = useDisplay()
const drawer = ref(false)

async function handleLogout() {
  await logout()
  router.replace('/login')
}

function toggleDrawer() {
  drawer.value = !drawer.value
}

defineOptions({
  name: 'NavBar',
})

const logoLight = 'https://cdn.prod.website-files.com/5fa09bc3928ec91d04260b62/622a1830fe8ba05e67a8c78a_Logo%20horizontal-p-500.png'

const route = useRoute()
const theme = useTheme()
const isDark = computed(() => theme.name.value === 'dark')
const logoSrc = computed(() => (isDark.value ? logoDark : logoLight))

const toggleTheme = (value: boolean | null) => {
  const name = value ? 'dark' : 'light'
  theme.change(name)
  localStorage.setItem('app-theme', name)
}

onMounted(() => {
  const saved = localStorage.getItem('app-theme')
  if (saved === 'dark' || saved === 'light') {
    theme.change(saved)
  }
})

const isDashboard = computed(() => route.path === '/')
const isClientes = computed(() => route.path.startsWith('/clientes'))
const isColaboradores = computed(() => route.path.startsWith('/colaboradores'))
const isEnquetes = computed(() => route.path.startsWith('/enquetes'))
const isImportar = computed(() => route.path === '/importar')
</script>

<style scoped>
.logo-img {
  min-width: 100px;
  max-width: 150px;
}

.nav-desktop {
  margin-left: 1.5rem;
}

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

@media (max-width: 600px) {
  .logo-img {
    max-width: 120px;
  }
}

.mobile-menu-btn {
  min-width: 48px;
  min-height: 48px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
}

.mobile-nav-list {
  padding: 8px;
}

.mobile-nav-item {
  min-height: 48px;
  padding: 12px 16px;
  margin-bottom: 4px;
}

.mobile-nav-item :deep(.v-list-item__prepend) {
  margin-inline-end: 16px;
}
</style>