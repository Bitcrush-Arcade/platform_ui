export const flattenObject = ( o: Object, maxDepth: number ) => {
  return Object.assign( {}, ..._flattenObject( o, 0, maxDepth ))
}

const _flattenObject = ( o: Object, depth: number, maxDepth: number) => {
  const isMaxDepth = depth === maxDepth
  return [].concat( ...Object.keys(o).map(
    k => typeof( o[k] ) == "object" && !isMaxDepth
      ? _flattenObject( o[k], depth + 1, maxDepth ) 
      : ({[k]: o[k]})
  ))
}