<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settingsStore = useSettingsStore()
</script>

<template>
  <v-app>
    <NuxtPage />
    <v-snackbar
      :model-value="settingsStore.legacyKeyDetected"
      timeout="-1"
      location="top"
      color="warning"
      @update:model-value="(v: boolean) => !v && settingsStore.dismissLegacyKeyHint()"
    >
      {{ t('settings.legacyKeyMigrated') }}
      <template #actions>
        <v-btn variant="text" @click="settingsStore.dismissLegacyKeyHint()">
          {{ t('settings.dismiss') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
