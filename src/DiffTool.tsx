/* eslint-disable react/jsx-no-bind */
import {Button, Card, Flex, Grid, Text, ThemeProvider, studioTheme} from '@sanity/ui'
import {useCallback, useEffect, useState} from 'react'
import {debounceTime} from 'rxjs/operators'
import {EvaluationParams, MutationEvent, useClient, useDocumentOperation} from 'sanity'
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
  }, [])

  const onUpdate = useCallback((update: MutationEvent & EvaluationParams & {result: any}) => {
    const newUser = {[update.documentId]: update.identity!}

    setUsers((data) => ({...data, ...newUser}))
    fetchDrafts()
  }, [])

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
          <div key={i}>
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

  return <Card margin={3}>{renderDiffs(drafts)}</Card>
}

function Buttons({draft}: {draft: Draft}) {
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

  const onClick = useCallback(() => {
    router.navigateIntent('edit', {id: draft._id, documentType: draft._type})
  }, [router, draft])

  return (
    <>
      <Button onClick={onPublish} text="Publish" tone="positive" />
      <Button tone="critical" onClick={onDiscard} text="Discard" />
      <Button onClick={onClick} text="Edit" />
    </>
  )
}
