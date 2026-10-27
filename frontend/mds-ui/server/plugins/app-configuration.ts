import { load } from '@azure/app-configuration-provider'
import { WorkloadIdentityCredential } from '@azure/identity'

// Reads the settings of mds-ui from Azure App Configuration at startup the keys "<APP_CONFIG_APP_NAME>:<NAME>" with the label
// <APP_CONFIG_APP_NAME> become the environment variables <NAME>, for example
// np-mds-ui-dev:NUXT_PUBLIC_IOP_CORE_URL -> NUXT_PUBLIC_IOP_CORE_URL. Off without APP_CONFIG_ENDPOINT (`nuxt dev`).
// An environment variable that is already set wins. Nitro builds the runtime config of each request from the
// environment (its default, with or without this plugin), so the values reach useRuntimeConfig(event) and the pages,
// not useRuntimeConfig() without an event (frozen at startup),shared-<environment> keys aren't loaded.

export default defineNitroPlugin((nitroApp) => {
  const endpoint = process.env.APP_CONFIG_ENDPOINT
  if (!endpoint) return

  const app = process.env.APP_CONFIG_APP_NAME
  const env = process.env.APP_CONFIG_ENVIRONMENT
  // Environment variable: [key, label]
  const settings = {
    NUXT_PUBLIC_LOGIN_URL: [`${app}:AdminUrl`, app],
    NUXT_PUBLIC_IOP_CORE_URL: [`shared-${env}:I14Y:IopCoreApiUrl`, `shared-${env}`],
    NUXT_PUBLIC_IRI_URL: [`ca-iop-core-${env}:I14Y:IriBaseUrl`, `ca-iop-core-${env}`],
  }

  const loaded = load(endpoint, new WorkloadIdentityCredential(), {
    selectors: Object.values(settings).map(([keyFilter, labelFilter]) => ({ keyFilter, labelFilter })),
  }).then((config) => {
    for (const [name, [key]] of Object.entries(settings)) {
      if (process.env[name] !== undefined) continue
      const value = config.get<string>(key!)
      if (!value) throw new Error(`Not in App Configuration: ${key}`)
      // The backend's iop-core URL ends with /api, the paths of the generated client start with /api.
      process.env[name] = value.replace(/\/api\/?$/, '')
    }
  })

  loaded.catch((error) => {
    console.error('Could not load the settings from Azure App Configuration:', error)
    process.exit(1)
  })
  // Requests wait for the settings.
  nitroApp.hooks.hook('request', () => loaded)
})
