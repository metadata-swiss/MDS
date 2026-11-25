import type {
  DehydratedState,
  VueQueryPluginOptions,
} from '@tanstack/vue-query'

import { defineNuxtPlugin, useState } from '#imports'
import {
  dehydrate,
  hydrate,
  QueryClient,
  VueQueryPlugin,
} from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = (error as { statusCode?: number }).statusCode
          return import.meta.client && failureCount < 1 && (status === undefined || status >= 500)
        },
      },
    },
  })

  const options: VueQueryPluginOptions = { queryClient }

  nuxtApp.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxtApp.hooks.hook('app:mounted', () => {
      if (vueQueryState.value) {
        hydrate(queryClient, vueQueryState.value)
      }
    })
  }
})
