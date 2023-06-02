/* eslint-disable react/jsx-no-bind */
import {Button} from '@sanity/ui'
import {useCallback} from 'react'
import {useDocumentOperation} from 'sanity'
import {useRouter} from 'sanity/router'
import {Draft} from './types'

export function Buttons({draft}: {draft: Draft}) {
  const {publish, discardChanges} = useDocumentOperation(
    draft._id.replace('drafts.', ''),
    draft._type
  )
  const onPublish = useCallback(() => {
    publish.execute()
  }, [publish])
  const onDiscard = useCallback(() => {
    discardChanges.execute()
  }, [discardChanges])
  const router = useRouter()
  const onClick = () => {
    router.navigateIntent('edit', {id: draft._id, documentType: draft._type})
  }
  return (
    <>
      <Button onClick={onPublish} text="Publish" tone="positive" />
      <Button tone="critical" onClick={onDiscard} text="Discard" />
      <Button onClick={onClick} text="Edit" />
    </>
  )
}
