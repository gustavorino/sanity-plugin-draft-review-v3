import {Draft} from './types'

export function getPublishedId(draft: Draft): string {
  return draft._id.replace('drafts.', '')
}
