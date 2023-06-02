export type Draft = {
  _id: string
  _type: string
  _updatedAt: string
  _createdAt: string
  _rev: string
  __published?: Omit<Draft, '__published'>
  [key: string]: any
}
