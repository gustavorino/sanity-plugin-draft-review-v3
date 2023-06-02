# sanity-plugin-draft-review-v3

> This is a **Sanity Studio v3** plugin.

[v2 version here](https://www.sanity.io/plugins/sanity-plugin-draft-review)

This plugin allows content editors to quickly view, approve and reject all the documents in **_draft_** mode.

![Screenshot](/assets/screenshot.png 'Screenshot')

## Installation

```sh
npm install sanity-plugin-draft-review-v3
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {draftReviewPluginV3} from 'sanity-plugin-draft-review-v3'

export default defineConfig({
  //...
  plugins: [draftReviewPluginV3({})],
})
```

## License

[MIT](LICENSE) © Gustavo Bremm

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
