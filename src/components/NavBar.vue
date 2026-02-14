<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-container>
        <div class="d-flex justify-start align-center px-16">
          <v-img src="https://cdn.prod.website-files.com/5fa09bc3928ec91d04260b62/622a1830fe8ba05e67a8c78a_Logo%20horizontal-p-500.png" width="150" />
          <div class="d-flex justify-start align-center gap-4 ml-16">
            <router-link to="/" class="text-black text-decoration-none font-weight-medium">Dashboard</router-link>
            <router-link to="/clients" class="text-black text-decoration-none font-weight-medium ml-8">Clients</router-link>
          </div>
        </div>
      </v-container>
    </template>

    

    <template v-slot:append>
      <v-btn icon="mdi-dots-vertical"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">

defineOptions({
  name: 'NavBar',
})
</script>

<style scoped>

</style>