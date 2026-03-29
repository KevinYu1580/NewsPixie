
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  ContentBriefingFeed: typeof import("../../components/content/BriefingFeed.vue")['default']
  ContentSection: typeof import("../../components/content/Section.vue")['default']
  ContentGithubRepoCard: typeof import("../../components/content/github/RepoCard.vue")['default']
  ContentGithubTrending: typeof import("../../components/content/github/Trending.vue")['default']
  ContentNewsBriefing: typeof import("../../components/content/news/Briefing.vue")['default']
  ContentNewsCard: typeof import("../../components/content/news/Card.vue")['default']
  LayoutAppHeader: typeof import("../../components/layout/AppHeader.vue")['default']
  LayoutAppSidebar: typeof import("../../components/layout/AppSidebar.vue")['default']
  LayoutSettingsModal: typeof import("../../components/layout/SettingsModal.vue")['default']
  TopicsTopicForm: typeof import("../../components/topics/TopicForm.vue")['default']
  TopicsTopicItem: typeof import("../../components/topics/TopicItem.vue")['default']
  TopicsTopicManagerModal: typeof import("../../components/topics/TopicManagerModal.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyContentBriefingFeed: LazyComponent<typeof import("../../components/content/BriefingFeed.vue")['default']>
  LazyContentSection: LazyComponent<typeof import("../../components/content/Section.vue")['default']>
  LazyContentGithubRepoCard: LazyComponent<typeof import("../../components/content/github/RepoCard.vue")['default']>
  LazyContentGithubTrending: LazyComponent<typeof import("../../components/content/github/Trending.vue")['default']>
  LazyContentNewsBriefing: LazyComponent<typeof import("../../components/content/news/Briefing.vue")['default']>
  LazyContentNewsCard: LazyComponent<typeof import("../../components/content/news/Card.vue")['default']>
  LazyLayoutAppHeader: LazyComponent<typeof import("../../components/layout/AppHeader.vue")['default']>
  LazyLayoutAppSidebar: LazyComponent<typeof import("../../components/layout/AppSidebar.vue")['default']>
  LazyLayoutSettingsModal: LazyComponent<typeof import("../../components/layout/SettingsModal.vue")['default']>
  LazyTopicsTopicForm: LazyComponent<typeof import("../../components/topics/TopicForm.vue")['default']>
  LazyTopicsTopicItem: LazyComponent<typeof import("../../components/topics/TopicItem.vue")['default']>
  LazyTopicsTopicManagerModal: LazyComponent<typeof import("../../components/topics/TopicManagerModal.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
