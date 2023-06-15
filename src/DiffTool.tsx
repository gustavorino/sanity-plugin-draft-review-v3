/* eslint-disable react/jsx-no-bind */
import {PublishIcon, TrashIcon} from '@sanity/icons'
import {Button, Card, Grid, Text, Flex, ThemeProvider, studioTheme, Stack} from '@sanity/ui'
import {useCallback, useEffect, useState} from 'react'
import {firstValueFrom} from 'rxjs'
import {debounceTime} from 'rxjs/operators'
import {EvaluationParams, MutationEvent, useClient, useDocumentStore} from 'sanity'
import {Item} from './Item'
import {Draft} from './types'
import {getPublishedId} from './utils'

const QUERY = `*[_id in path("drafts.**")]{
  ...,
  "__published": *[_id ==  string::split(^._id,'drafts.')[1]][0] 
}`

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

  const fetchDrafts = useCallback(() => {
    client.fetch(QUERY).then((data) => {
      setDrafts(data)
    })
  }, [client])

  const onUpdate = useCallback(
    (update: MutationEvent & EvaluationParams & {result: any}) => {
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

  const renderDiffs = useCallback((data: Draft[] = []) => {
    return data.map((draft, i) => {
      const newDoc = {}
      const doc = draft.__published || newDoc
      const isNew = doc === newDoc

      return <Item key={draft._id || i} isNew={isNew} doc={doc} draft={draft} />
    })
  }, [])

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
    <Card margin={0}>
      <Stack padding={4} space={[3]}>
        <Grid columns={[1, 1, 2, 3]} gap={[4]} padding={0}>
          {renderDiffs(drafts)}
        </Grid>
        <Flex justify={'flex-end'}>
          <AllButtons drafts={drafts} />
        </Flex>
      </Stack>
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
    <Grid style={{maxWidth: '400px'}} gap={4} columns={2}>
      <Button onClick={onPublishAll} icon={PublishIcon} text="Publish ALL" tone="positive" />
      <Button onClick={onDiscardAll} icon={TrashIcon} text="Discard ALL" tone="critical" />
    </Grid>
  )
}
