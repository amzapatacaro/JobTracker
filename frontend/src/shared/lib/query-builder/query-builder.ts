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
  TPick extends Pick<TSchema, keyof TPick & keyof TSchema>,
  TQ extends string,
  TTable extends string,
> {
  private constructor(
    private readonly tableName: TTable,
    private readonly keys: readonly string[],
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
          select<const Keys extends readonly (keyof TSchema & string)[]>(
            ...keys: Keys
          ): QueryBuilder<
            TSchema,
            Pick<TSchema, Keys[number]>,
            `SELECT ${StringJoin<Keys>} FROM ${Table}`,
            Table
          > {
            return new QueryBuilder<
              TSchema,
              Pick<TSchema, Keys[number]>,
              `SELECT ${StringJoin<Keys>} FROM ${Table}`,
              Table
            >(table, [...keys], [], undefined, undefined, undefined)
          },
        }
      },
    }
  }

  where<K extends keyof TPick & string>(
    field: K,
    _op: 'eq',
    value: TPick[K]
  ): QueryBuilder<TSchema, TPick, `${TQ} WHERE ${K} = ?`, TTable> {
    return new QueryBuilder<TSchema, TPick, `${TQ} WHERE ${K} = ?`, TTable>(
      this.tableName,
      this.keys,
      [...this.params, value],
      { field, value },
      this.orderArg,
      this.limitArg
    )
  }

  orderBy<K extends keyof TPick & string, const D extends 'asc' | 'desc'>(
    field: K,
    direction: D
  ): QueryBuilder<TSchema, TPick, `${TQ} ORDER BY ${K} ${DirSql<D>}`, TTable> {
    return new QueryBuilder<
      TSchema,
      TPick,
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
  ): QueryBuilder<TSchema, TPick, `${TQ} LIMIT ${N}`, TTable> {
    return new QueryBuilder<TSchema, TPick, `${TQ} LIMIT ${N}`, TTable>(
      this.tableName,
      this.keys,
      this.params,
      this.whereArg,
      this.orderArg,
      n
    )
  }

  /**
   * Runtime SQL string; typed as accumulated template literal {@link TQ}.
   */
  build(): { query: TQ; params: unknown[] } {
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
    return { query: sql as TQ, params }
  }
}
