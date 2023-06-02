import {EditIcon as Icon} from '@sanity/icons'
import {definePlugin} from 'sanity'
import DiffTool from './DiffTool.js'

interface DraftReviewPluginConfig {
  /* nothing here yet */
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-draft-review-v3'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin()],
 * })
 * ```
 */
export const draftReviewPluginV3 = definePlugin<DraftReviewPluginConfig | void>((config = {}) => {
  // eslint-disable-next-line no-console
  console.log('hello from sanity-plugin-draft-review-v3')
  return {
    name: 'sanity-plugin-draft-review-v3',
    tools: [
      {
        title: 'Draft Review',
        component: DiffTool,
        name: 'draft-review',
        icon: Icon,
      },
    ],
  }
})
