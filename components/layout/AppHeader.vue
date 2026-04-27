<script setup lang="ts">
import { useTheme } from 'vuetify'
import { formatBriefingDate } from '@/utils/utils'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

onMounted(() => {
  theme.change(settingsStore.themeName)
})

function toggleTheme() {
  const nextTheme = isDark.value ? 'light' : 'dark'
  settingsStore.setThemeName(nextTheme)
  theme.change(nextTheme)
}

const { t, locale, setLocale } = useI18n()

const briefingDate = formatBriefingDate()
</script>

<template>
  <v-app-bar>
    <template #prepend>
      <v-btn
        icon="mdi-menu"
        variant="text"
        size="small"
        class="d-flex"
        :aria-label="t('header.openMenu')"
        @click="settingsStore.setMobileDrawer(true)"
      />
      <div class="d-flex align-center ga-2 pl-4">
        <v-icon
          icon="mdi-shimmer"
          color="np-accent"
          size="small"
        />
        <span class="font-mono-label text-sm font-weight-bold tracking-widest">NEWSPIXIE</span>
      </div>
    </template>

    <div class="d-none d-sm-flex align-center">
      <span class="font-mono-label text-caption text-medium-emphasis">
        BRIEFING&nbsp;&nbsp;//&nbsp;&nbsp;{{ briefingDate }}
      </span>
    </div>

    <template #append>
      <v-btn-toggle
        :model-value="locale"
        mandatory
        density="compact"
        variant="outlined"
        color="np-accent"
        class="mr-2"
        @update:model-value="setLocale"
      >
        <v-btn value="zh-TW" size="small">繁中</v-btn>
        <v-btn value="en" size="small">EN</v-btn>
      </v-btn-toggle>
      <LayoutSettingsModal />
      <v-btn
        :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        size="small"
        :aria-label="isDark ? t('header.switchLight') : t('header.switchDark')"
        @click="toggleTheme"
      />
    </template>
  </v-app-bar>
</template>
