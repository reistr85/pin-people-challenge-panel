<template>
  <div class="login-page">
    <div class="login-content">
      <div class="login-brand">
        <v-img
          :src="logoSrc"
          alt="Pin People"
          width="180"
          max-width="180"
          class="login-logo"
          eager
        />
        <p class="login-subtitle text-body-1 text-medium-emphasis mt-3 mb-0">
          Acesse sua conta
        </p>
      </div>

      <v-card class="login-card" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <v-form ref="formRef" @submit.prevent="submit">
            <v-text-field
              v-model="email"
              label="E-mail"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.email]"
              autocomplete="email"
              hide-details="auto"
              class="mb-4"
              prepend-inner-icon="mdi-email-outline"
              clearable
            />
            <v-text-field
              v-model="password"
              label="Senha"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              autocomplete="current-password"
              hide-details="auto"
              class="mb-4"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
            />
            <v-alert
              v-if="error"
              type="error"
              density="compact"
              class="mb-4"
              closable
              variant="tonal"
            >
              {{ error }}
            </v-alert>
            <v-btn
              type="submit"
              color="primary"
              block
              size="x-large"
              :loading="loading"
              :disabled="loading"
              class="login-btn text-none font-weight-medium"
              rounded="lg"
            >
              Entrar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuth } from '@/composables/useAuth'
import type { VForm } from 'vuetify/components'
import logoDark from '@/assets/logo-dark.png'

defineOptions({
  name: 'Login',
})

const logoLight = 'https://cdn.prod.website-files.com/5fa09bc3928ec91d04260b62/622a1830fe8ba05e67a8c78a_Logo%20horizontal-p-500.png'
const theme = useTheme()
const logoSrc = computed(() => (theme.name.value === 'dark' ? logoDark : logoLight))
const showPassword = ref(false)

const router = useRouter()
const { login } = useAuth()

const formRef = ref<VForm | null>(null)
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const rules = reactive({
  required: (v: string) => !!v?.trim() || 'Campo obrigatório',
  email: (v: string) => {
    if (!v) return true
    return /.+@.+\..+/.test(v) || 'E-mail inválido'
  },
})

async function submit() {
  error.value = ''
  const { valid } = await formRef.value!.validate()
  if (!valid) return
  loading.value = true
  try {
    await login(email.value.trim(), password.value)
    router.replace('/')
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
      : null
    error.value = msg || 'Falha ao entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.06) 0%,
    rgba(var(--v-theme-primary), 0.02) 50%,
    transparent 100%
  );
}

.login-content {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.login-brand {
  text-align: center;
}

.login-logo {
  margin: 0 auto;
}

.login-subtitle {
  letter-spacing: 0.02em;
}

.login-card {
  width: 100%;
}

.login-btn {
  letter-spacing: 0.02em;
}
</style>
