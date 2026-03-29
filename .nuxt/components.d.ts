
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


export const ContentBriefingFeed: typeof import("../components/content/BriefingFeed.vue")['default']
export const ContentSection: typeof import("../components/content/Section.vue")['default']
export const ContentGithubRepoCard: typeof import("../components/content/github/RepoCard.vue")['default']
export const ContentGithubTrending: typeof import("../components/content/github/Trending.vue")['default']
export const ContentNewsBriefing: typeof import("../components/content/news/Briefing.vue")['default']
export const ContentNewsCard: typeof import("../components/content/news/Card.vue")['default']
export const LayoutAppHeader: typeof import("../components/layout/AppHeader.vue")['default']
export const LayoutAppSidebar: typeof import("../components/layout/AppSidebar.vue")['default']
export const LayoutSettingsModal: typeof import("../components/layout/SettingsModal.vue")['default']
export const TopicsTopicForm: typeof import("../components/topics/TopicForm.vue")['default']
export const TopicsTopicItem: typeof import("../components/topics/TopicItem.vue")['default']
export const TopicsTopicManagerModal: typeof import("../components/topics/TopicManagerModal.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyContentBriefingFeed: LazyComponent<typeof import("../components/content/BriefingFeed.vue")['default']>
export const LazyContentSection: LazyComponent<typeof import("../components/content/Section.vue")['default']>
export const LazyContentGithubRepoCard: LazyComponent<typeof import("../components/content/github/RepoCard.vue")['default']>
export const LazyContentGithubTrending: LazyComponent<typeof import("../components/content/github/Trending.vue")['default']>
export const LazyContentNewsBriefing: LazyComponent<typeof import("../components/content/news/Briefing.vue")['default']>
export const LazyContentNewsCard: LazyComponent<typeof import("../components/content/news/Card.vue")['default']>
export const LazyLayoutAppHeader: LazyComponent<typeof import("../components/layout/AppHeader.vue")['default']>
export const LazyLayoutAppSidebar: LazyComponent<typeof import("../components/layout/AppSidebar.vue")['default']>
export const LazyLayoutSettingsModal: LazyComponent<typeof import("../components/layout/SettingsModal.vue")['default']>
export const LazyTopicsTopicForm: LazyComponent<typeof import("../components/topics/TopicForm.vue")['default']>
export const LazyTopicsTopicItem: LazyComponent<typeof import("../components/topics/TopicItem.vue")['default']>
export const LazyTopicsTopicManagerModal: LazyComponent<typeof import("../components/topics/TopicManagerModal.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29.0_@babel+plugin-syntax-jsx@7.28.6_@babel+core@7.29.0__@parc_02b5ab5edb0dcb14d8eb002fae0b306d/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
