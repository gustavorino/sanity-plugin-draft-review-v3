import {Card, Grid, Inline, Label, Flex} from '@sanity/ui'
import {useMemo} from 'react'
import {DocumentPreviewPresence, Preview, useDocumentPresence, useSchema} from 'sanity'
import {Buttons} from './Buttons'
import Diff from './Diff'

type ItemProps = {
  draft: any
  isNew: boolean
  doc: any
}

export function Item(props: ItemProps) {
  const {draft, isNew, doc} = props

  const schema = useSchema()

  const presence = useDocumentPresence(doc._id)

  const schemaType = schema.get(draft._type)

  const status = useMemo(() => {
    return (
      <Inline space={3}>
        {presence && presence.length > 0 && <DocumentPreviewPresence presence={presence} />}
        <Label size={0} muted textOverflow="ellipsis">
          {schemaType?.title || draft._type}
        </Label>
        {isNew && (
          <Label size={0} textOverflow="ellipsis">
            NEW!
          </Label>
        )}
      </Inline>
    )
  }, [schemaType?.title, presence, draft._type, isNew])

  // NOTE: this emits sync so can never be null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

  return (
    <Card key={draft._id} padding={4} radius={2} shadow={isNew ? 2 : 1}>
      <Flex height="fill" direction="column">
        <Preview layout="default" status={status} schemaType={schemaType!} value={draft} />

        <div style={{flex: '1'}}>
          <Diff inputA={clean(doc)} inputB={clean(draft)} type="json" />
        </div>

        <Grid gap={2} columns={3}>
          <Buttons draft={draft} />
        </Grid>
      </Flex>
    </Card>
  )
}

function clean(obj: any) {
  const {_id, _rev, _updatedAt, __published, _createdAt, _type, ...rest} = obj
  return rest
}
