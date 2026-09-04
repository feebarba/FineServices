import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'btfiysbs',
    dataset: 'production',
  },
  deployment: {
    appId: 'hzo9416cgc3ctiahml0ttk4j',
    /**
      * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
