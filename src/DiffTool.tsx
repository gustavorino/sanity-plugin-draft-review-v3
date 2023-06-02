/* eslint-disable react/jsx-no-bind */
import {PublishIcon, TrashIcon} from '@sanity/icons'
import {Button, Card, Flex, Grid, Text, ThemeProvider, studioTheme} from '@sanity/ui'
import {useCallback, useEffect, useState} from 'react'
import {firstValueFrom} from 'rxjs'
import {debounceTime} from 'rxjs/operators'
import {
  EvaluationParams,
  MutationEvent,
  useClient,
  useDocumentOperation,
  useDocumentStore,
} from 'sanity'
import {useRouter} from 'sanity/router'
import Diff from './Diff'
import {UserHead} from './UserHead'
import {Draft} from './types'

const QUERY = `*[_id in path("drafts.**")]{
  ...,
  "__published": *[_id ==  string::split(^._id,'drafts.')[1]][0] 
}`

const clean = (obj: any) => {
  const {_id, _rev, _updatedAt, __published, _createdAt, _type, ...rest} = obj
  return rest
}

export default function DiffTool() {
  return (
    <ThemeProvider theme={studioTheme}>
      <InnerDiffTool />
    </ThemeProvider>
  )
}

function InnerDiffTool() {
  const client = useClient({apiVersion: 'v2021-10-21'})

  const [drafts, setDrafts] = useState<Draft[]>([])
  const [users, setUsers] = useState<Record<string, string>>({})

  const fetchDrafts = useCallback(() => {
    client.fetch(QUERY).then((data) => {
      setDrafts(data)
    })
  }, [client])

  const onUpdate = useCallback(
    (update: MutationEvent & EvaluationParams & {result: any}) => {
      const newUser = {[update.documentId]: update.identity!}

      setUsers((data) => ({...data, ...newUser}))
      fetchDrafts()
    },
    [fetchDrafts]
  )

  useEffect(() => {
    const sub = client
      .listen(QUERY, {})
      .pipe(debounceTime(1000))
      .subscribe((update) => onUpdate(update as any))

    return () => {
      sub.unsubscribe()
    }
  }, [client, onUpdate])

  useEffect(fetchDrafts, [fetchDrafts])

  const renderDiffs = useCallback(
    (data: Draft[] = []) => {
      return data.map((draft, i) => {
        const newDoc = {}
        const doc = draft.__published || newDoc
        const isNew = doc === newDoc

        return (
          <div key={draft._id}>
            <Flex marginY={4} align={'center'}>
              {isNew && (
                <Text size={4} weight="bold">
                  {draft._type}
                  <span style={{color: 'green', verticalAlign: 'middle', fontSize: '0.5em'}}>
                    {' '}
                    (new)
                  </span>
                </Text>
              )}
              {!isNew && (
                <Text size={4} weight="bold">
                  {draft._type}
                </Text>
              )}

              {users[draft._id] && <UserHead id={users[draft._id]} />}
            </Flex>

            <Diff inputA={clean(doc)} inputB={clean(draft)} type="json" />

            <Grid style={{maxWidth: '400px'}} gap={2} columns={3}>
              <Buttons draft={draft} />
            </Grid>
            <hr style={{marginTop: '1em'}} />
          </div>
        )
      })
    },
    [users]
  )

  if (drafts.length == 0) {
    return (
      <Card padding={3} margin={3} radius={2} shadow={1} tone="caution">
        <Text align="center" size={2}>
          No drafts to display
        </Text>
      </Card>
    )
  }

  return (
    <Card margin={4}>
      {renderDiffs(drafts)}
      <AllButtons drafts={drafts} />
    </Card>
  )
}
function AllButtons({drafts}: {drafts: Draft[]}) {
  const documentStore = useDocumentStore()

  const onPublishAll = useCallback(() => {
    drafts.map((draft) =>
      firstValueFrom(documentStore.pair.editOperations(getPublishedId(draft), draft._type)).then(
        ({publish}) => publish.execute()
      )
    )
  }, [documentStore, drafts])

  const onDiscardAll = useCallback(() => {
    drafts.map((draft) =>
      firstValueFrom(documentStore.pair.editOperations(getPublishedId(draft), draft._type)).then(
        ({discardChanges}) => discardChanges.execute()
      )
    )
  }, [documentStore, drafts])

  return (
    <Grid style={{maxWidth: '400px'}} gap={2} columns={2}>
      <Button onClick={onPublishAll} icon={PublishIcon} text="Publish ALL" tone="positive" />
      <Button onClick={onDiscardAll} icon={TrashIcon} text="Discard ALL" tone="critical" />
    </Grid>
  )
}

function Buttons({draft}: {draft: Draft}) {
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

function getPublishedId(draft: Draft) {
  return draft._id.replace('drafts.', '')
}
