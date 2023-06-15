/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import * as jsdiff from 'diff'

export default function Diff({inputA, inputB}: any) {
  const diff = jsdiff.diffJson(inputA, inputB)
  const result = diff.map((part, index) => {
    if (!part.added && !part.removed) {
      return null
    }
    const spanStyle = {
      color: 'black',
      backgroundColor: part.added ? 'lightgreen' : part.removed ? 'salmon' : 'lightgrey',
    }

    if (part.value === '{}' || part.value === '{' || part.value === '}') {
      return null
    }
    return (
      <span key={index} style={spanStyle}>
        {part.value}
      </span>
    )
  })
  return <pre style={{whiteSpace: 'pre-wrap'}}>{result}</pre>
}
