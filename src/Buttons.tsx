/* eslint-disable react/jsx-no-bind */
import {Button} from '@sanity/ui'
import {useCallback, useState} from 'react'
import {useDocumentOperation} from 'sanity'
import {useRouter} from 'sanity/router'
import {Draft} from './types'
import {getPublishedId} from './utils'

export function Buttons({draft}: {draft: Draft}) {
  const [action, setAction] = useState<undefined | 'published' | 'discarded'>(undefined)

  const {publish, discardChanges} = useDocumentOperation(getPublishedId(draft), draft._type)
  const onPublish = useCallback(() => {
    setAction('published')
    publish.execute()
  }, [publish, setAction])

  const onDiscard = useCallback(() => {
    discardChanges.execute()
    setAction('discarded')
  }, [discardChanges, setAction])
  const router = useRouter()

  const onClick = useCallback(() => {
    router.navigateIntent('edit', {id: draft._id, documentType: draft._type})
  }, [router, draft])

  return (
    <>
      <Button disabled={!!action} onClick={onPublish} text="Publish" tone="positive" />
      <Button disabled={!!action} tone="critical" onClick={onDiscard} text="Discard" />
      <Button onClick={onClick} text="Edit" />
    </>
  )
}
