
interface AnyMapping {
  [key: string]: string
}

export function styledBy<U, T>(property: string, mapping: T & AnyMapping) { 
  return (props: U ) => mapping[props[property]] || mapping['default']
}
