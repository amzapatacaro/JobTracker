type LeafValue<V> = V extends
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  ? true
  : V extends Date
    ? true
    : V extends readonly unknown[]
      ? true
      : V extends (...args: never[]) => unknown
        ? true
        : false

type Join<K extends string, P extends string> = `${K}.${P}`

export type PathKeys<T> = T extends object
  ? {
      [K in keyof T & string]: LeafValue<T[K]> extends true
        ? K
        : Join<K, PathKeys<T[K]>>
    }[keyof T & string]
  : never
