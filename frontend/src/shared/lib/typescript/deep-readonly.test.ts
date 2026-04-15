import { expectTypeOf, test } from 'vitest'

import type { DeepReadonly } from './deep-readonly'

test('DeepReadonly: primitives unchanged', () => {
  expectTypeOf<DeepReadonly<string>>().toEqualTypeOf<string>()
  expectTypeOf<DeepReadonly<number>>().toEqualTypeOf<number>()
  expectTypeOf<DeepReadonly<boolean>>().toEqualTypeOf<boolean>()
  expectTypeOf<DeepReadonly<undefined>>().toEqualTypeOf<undefined>()
  expectTypeOf<DeepReadonly<null>>().toEqualTypeOf<null>()
})

test('DeepReadonly: Date stays Date', () => {
  expectTypeOf<DeepReadonly<Date>>().toEqualTypeOf<Date>()
})

test('DeepReadonly: plain object is deeply readonly', () => {
  type In = { a: number; nested: { b: string } }
  type Out = DeepReadonly<In>
  expectTypeOf<Out>().toEqualTypeOf<{
    readonly a: number
    readonly nested: { readonly b: string }
  }>()
})

test('DeepReadonly: arrays become ReadonlyArray', () => {
  expectTypeOf<DeepReadonly<string[]>>().toEqualTypeOf<ReadonlyArray<string>>()
  expectTypeOf<DeepReadonly<Array<{ x: number }>>>().toEqualTypeOf<
    ReadonlyArray<{ readonly x: number }>
  >()
})

test('DeepReadonly: Map / Set', () => {
  expectTypeOf<DeepReadonly<Map<string, number>>>().toEqualTypeOf<
    ReadonlyMap<string, number>
  >()
  expectTypeOf<DeepReadonly<Set<number>>>().toEqualTypeOf<ReadonlySet<number>>()
})

test('DeepReadonly: function types pass through', () => {
  type Fn = (n: number) => string
  expectTypeOf<DeepReadonly<Fn>>().toEqualTypeOf<Fn>()
})
