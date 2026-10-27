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

  const appName = process.env.APP_CONFIG_APP_NAME
  if (!appName) throw new Error('APP_CONFIG_APP_NAME is required with APP_CONFIG_ENDPOINT')

  // AKS workload identity sets AZURE_CLIENT_ID, AZURE_TENANT_ID and AZURE_FEDERATED_TOKEN_FILE in the pod.
  const credential = new WorkloadIdentityCredential()
  const loaded = load(endpoint, credential, {
    selectors: [{ keyFilter: `${appName}:*`, labelFilter: appName }],
    trimKeyPrefixes: [`${appName}:`],
    keyVaultOptions: { credential },
  }).then((settings) => {
    for (const [name, value] of settings) {
      if (process.env[name] === undefined) process.env[name] = typeof value === 'string' ? value : JSON.stringify(value)
    }
  })

  // Without its settings mds-ui would call the wrong services: stop, and Kubernetes restarts the pod.
  loaded.catch((error) => {
    console.error('Could not load the settings from Azure App Configuration:', error)
    process.exit(1)
  })

  // Nitro doesn't wait for plugins: the requests, the probes included, wait for the settings.
  nitroApp.hooks.hook('request', () => loaded)
})
