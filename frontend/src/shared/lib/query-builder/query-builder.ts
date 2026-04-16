type StringJoin<Keys extends readonly string[]> = Keys extends readonly [
  infer First extends string,
  ...infer Rest extends readonly string[],
]
  ? Rest['length'] extends 0
    ? First
    : `${First}, ${StringJoin<Rest>}`
  : never

type DirSql<D extends 'asc' | 'desc'> = D extends 'asc' ? 'ASC' : 'DESC'

export class QueryBuilder<
  TSchema,
  TKeys extends keyof TSchema & string,
  TQ extends string,
  TTable extends string,
> {
  private constructor(
    private readonly tableName: TTable,
    private readonly keys: readonly TKeys[],
    private readonly params: unknown[],
    private readonly whereArg: { field: string; value: unknown } | undefined,
    private readonly orderArg:
      | { field: string; dir: 'asc' | 'desc' }
      | undefined,
    private readonly limitArg: number | undefined
  ) {}

  /**
   * Example: `QueryBuilder.create<Job>().from('jobs').select('id', ...)` — pass
   * the schema type once, then a table literal so `FROM ${Table}` stays precise.
   */
  static create<TSchema>() {
    return {
      from<const Table extends string>(table: Table) {
        return {
          select<const K extends readonly (keyof TSchema & string)[]>(
            ...keys: K
          ): QueryBuilder<
            TSchema,
            K[number],
            `SELECT ${StringJoin<K>} FROM ${Table}`,
            Table
          > {
            return new QueryBuilder<
              TSchema,
              K[number],
              `SELECT ${StringJoin<K>} FROM ${Table}`,
              Table
            >(table, keys, [], undefined, undefined, undefined)
          },
        }
      },
    }
  }

  where<K extends TKeys>(
    field: K,
    _op: 'eq',
    value: TSchema[K]
  ): QueryBuilder<TSchema, TKeys, `${TQ} WHERE ${K} = ?`, TTable> {
    return new QueryBuilder<TSchema, TKeys, `${TQ} WHERE ${K} = ?`, TTable>(
      this.tableName,
      this.keys,
      [...this.params, value],
      { field, value },
      this.orderArg,
      this.limitArg
    )
  }

  orderBy<K extends TKeys, const D extends 'asc' | 'desc'>(
    field: K,
    direction: D
  ): QueryBuilder<TSchema, TKeys, `${TQ} ORDER BY ${K} ${DirSql<D>}`, TTable> {
    return new QueryBuilder<
      TSchema,
      TKeys,
      `${TQ} ORDER BY ${K} ${DirSql<D>}`,
      TTable
    >(
      this.tableName,
      this.keys,
      this.params,
      this.whereArg,
      { field, dir: direction },
      this.limitArg
    )
  }

  limit<const N extends number>(
    n: N
  ): QueryBuilder<TSchema, TKeys, `${TQ} LIMIT ${N}`, TTable> {
    return new QueryBuilder<TSchema, TKeys, `${TQ} LIMIT ${N}`, TTable>(
      this.tableName,
      this.keys,
      this.params,
      this.whereArg,
      this.orderArg,
      n
    )
  }

  /**
   * Runtime SQL string. The type-level query shape is tracked on the class as {@link TQ};
   * the built value is a `string` so we do not need unsound assertions.
   */
  build(): { query: string; params: unknown[] } {
    const cols = this.keys.join(', ')
    let sql = `SELECT ${cols} FROM ${this.tableName}`
    const params = [...this.params]
    if (this.whereArg) {
      sql += ` WHERE ${this.whereArg.field} = ?`
    }
    if (this.orderArg) {
      sql += ` ORDER BY ${this.orderArg.field} ${this.orderArg.dir === 'asc' ? 'ASC' : 'DESC'}`
    }
    if (this.limitArg !== undefined) {
      sql += ` LIMIT ${this.limitArg}`
    }
    return { query: sql, params }
  }
}
