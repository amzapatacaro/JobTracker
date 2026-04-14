export type DeepReadonly<T> = T extends
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  ? T
  : T extends (...args: never[]) => unknown
    ? T
    : T extends Date
      ? T
      : T extends Map<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer V>
          ? ReadonlySet<DeepReadonly<V>>
          : T extends ReadonlyArray<infer U>
            ? ReadonlyArray<DeepReadonly<U>>
            : T extends object
              ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
              : T
