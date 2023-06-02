import {SanityUser} from '@sanity/client'
import {Avatar} from '@sanity/ui'
import React, {useEffect, useState} from 'react'
import {useClient} from 'sanity'

export const UserHead = React.memo(UserHeadInner, (a, b) => a.id === b.id)

function UserHeadInner({id}: {id: string}) {
  const client = useClient({apiVersion: 'v2021-10-21'})

  const [data, setData] = useState<SanityUser | undefined>(undefined)

  useEffect(() => {
    client.users.getById(id).then((v) => setData(v))
  }, [id, setData, client])

  if (!data) {
    return <></>
  }
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        margin: '8px',
        flex: 1,
        alignItems: 'center',
      }}
    >
      <Avatar
        size={0}
        title={data.displayName}
        src={
          data.imageUrl ||
          'https://raw.githubusercontent.com/sanity-io/sanity-plugin-graph-view/main/assets/head-silhouette.jpg'
        }
      />
    </div>
  )
}
