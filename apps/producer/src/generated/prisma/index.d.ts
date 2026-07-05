
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Vacancy
 * 
 */
export type Vacancy = $Result.DefaultSelection<Prisma.$VacancyPayload>
/**
 * Model Competency
 * 
 */
export type Competency = $Result.DefaultSelection<Prisma.$CompetencyPayload>
/**
 * Model Candidate
 * 
 */
export type Candidate = $Result.DefaultSelection<Prisma.$CandidatePayload>
/**
 * Model Scorecard
 * 
 */
export type Scorecard = $Result.DefaultSelection<Prisma.$ScorecardPayload>
/**
 * Model Score
 * 
 */
export type Score = $Result.DefaultSelection<Prisma.$ScorePayload>
/**
 * Model Offer
 * 
 */
export type Offer = $Result.DefaultSelection<Prisma.$OfferPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Vacancies
 * const vacancies = await prisma.vacancy.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Vacancies
   * const vacancies = await prisma.vacancy.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.vacancy`: Exposes CRUD operations for the **Vacancy** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vacancies
    * const vacancies = await prisma.vacancy.findMany()
    * ```
    */
  get vacancy(): Prisma.VacancyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.competency`: Exposes CRUD operations for the **Competency** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Competencies
    * const competencies = await prisma.competency.findMany()
    * ```
    */
  get competency(): Prisma.CompetencyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.candidate`: Exposes CRUD operations for the **Candidate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Candidates
    * const candidates = await prisma.candidate.findMany()
    * ```
    */
  get candidate(): Prisma.CandidateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.scorecard`: Exposes CRUD operations for the **Scorecard** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Scorecards
    * const scorecards = await prisma.scorecard.findMany()
    * ```
    */
  get scorecard(): Prisma.ScorecardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.score`: Exposes CRUD operations for the **Score** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Scores
    * const scores = await prisma.score.findMany()
    * ```
    */
  get score(): Prisma.ScoreDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.offer`: Exposes CRUD operations for the **Offer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Offers
    * const offers = await prisma.offer.findMany()
    * ```
    */
  get offer(): Prisma.OfferDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Vacancy: 'Vacancy',
    Competency: 'Competency',
    Candidate: 'Candidate',
    Scorecard: 'Scorecard',
    Score: 'Score',
    Offer: 'Offer'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "vacancy" | "competency" | "candidate" | "scorecard" | "score" | "offer"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Vacancy: {
        payload: Prisma.$VacancyPayload<ExtArgs>
        fields: Prisma.VacancyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VacancyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VacancyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>
          }
          findFirst: {
            args: Prisma.VacancyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VacancyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>
          }
          findMany: {
            args: Prisma.VacancyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>[]
          }
          create: {
            args: Prisma.VacancyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>
          }
          createMany: {
            args: Prisma.VacancyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VacancyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>[]
          }
          delete: {
            args: Prisma.VacancyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>
          }
          update: {
            args: Prisma.VacancyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>
          }
          deleteMany: {
            args: Prisma.VacancyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VacancyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VacancyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>[]
          }
          upsert: {
            args: Prisma.VacancyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VacancyPayload>
          }
          aggregate: {
            args: Prisma.VacancyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVacancy>
          }
          groupBy: {
            args: Prisma.VacancyGroupByArgs<ExtArgs>
            result: $Utils.Optional<VacancyGroupByOutputType>[]
          }
          count: {
            args: Prisma.VacancyCountArgs<ExtArgs>
            result: $Utils.Optional<VacancyCountAggregateOutputType> | number
          }
        }
      }
      Competency: {
        payload: Prisma.$CompetencyPayload<ExtArgs>
        fields: Prisma.CompetencyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CompetencyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompetencyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>
          }
          findFirst: {
            args: Prisma.CompetencyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompetencyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>
          }
          findMany: {
            args: Prisma.CompetencyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>[]
          }
          create: {
            args: Prisma.CompetencyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>
          }
          createMany: {
            args: Prisma.CompetencyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CompetencyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>[]
          }
          delete: {
            args: Prisma.CompetencyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>
          }
          update: {
            args: Prisma.CompetencyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>
          }
          deleteMany: {
            args: Prisma.CompetencyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CompetencyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CompetencyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>[]
          }
          upsert: {
            args: Prisma.CompetencyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompetencyPayload>
          }
          aggregate: {
            args: Prisma.CompetencyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCompetency>
          }
          groupBy: {
            args: Prisma.CompetencyGroupByArgs<ExtArgs>
            result: $Utils.Optional<CompetencyGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompetencyCountArgs<ExtArgs>
            result: $Utils.Optional<CompetencyCountAggregateOutputType> | number
          }
        }
      }
      Candidate: {
        payload: Prisma.$CandidatePayload<ExtArgs>
        fields: Prisma.CandidateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CandidateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CandidateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          findFirst: {
            args: Prisma.CandidateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CandidateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          findMany: {
            args: Prisma.CandidateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          create: {
            args: Prisma.CandidateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          createMany: {
            args: Prisma.CandidateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CandidateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          delete: {
            args: Prisma.CandidateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          update: {
            args: Prisma.CandidateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          deleteMany: {
            args: Prisma.CandidateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CandidateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CandidateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          upsert: {
            args: Prisma.CandidateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          aggregate: {
            args: Prisma.CandidateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCandidate>
          }
          groupBy: {
            args: Prisma.CandidateGroupByArgs<ExtArgs>
            result: $Utils.Optional<CandidateGroupByOutputType>[]
          }
          count: {
            args: Prisma.CandidateCountArgs<ExtArgs>
            result: $Utils.Optional<CandidateCountAggregateOutputType> | number
          }
        }
      }
      Scorecard: {
        payload: Prisma.$ScorecardPayload<ExtArgs>
        fields: Prisma.ScorecardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScorecardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScorecardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>
          }
          findFirst: {
            args: Prisma.ScorecardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScorecardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>
          }
          findMany: {
            args: Prisma.ScorecardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>[]
          }
          create: {
            args: Prisma.ScorecardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>
          }
          createMany: {
            args: Prisma.ScorecardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScorecardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>[]
          }
          delete: {
            args: Prisma.ScorecardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>
          }
          update: {
            args: Prisma.ScorecardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>
          }
          deleteMany: {
            args: Prisma.ScorecardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScorecardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScorecardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>[]
          }
          upsert: {
            args: Prisma.ScorecardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorecardPayload>
          }
          aggregate: {
            args: Prisma.ScorecardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScorecard>
          }
          groupBy: {
            args: Prisma.ScorecardGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScorecardGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScorecardCountArgs<ExtArgs>
            result: $Utils.Optional<ScorecardCountAggregateOutputType> | number
          }
        }
      }
      Score: {
        payload: Prisma.$ScorePayload<ExtArgs>
        fields: Prisma.ScoreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScoreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScoreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>
          }
          findFirst: {
            args: Prisma.ScoreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScoreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>
          }
          findMany: {
            args: Prisma.ScoreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>[]
          }
          create: {
            args: Prisma.ScoreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>
          }
          createMany: {
            args: Prisma.ScoreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScoreCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>[]
          }
          delete: {
            args: Prisma.ScoreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>
          }
          update: {
            args: Prisma.ScoreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>
          }
          deleteMany: {
            args: Prisma.ScoreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScoreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScoreUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>[]
          }
          upsert: {
            args: Prisma.ScoreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScorePayload>
          }
          aggregate: {
            args: Prisma.ScoreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScore>
          }
          groupBy: {
            args: Prisma.ScoreGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScoreGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScoreCountArgs<ExtArgs>
            result: $Utils.Optional<ScoreCountAggregateOutputType> | number
          }
        }
      }
      Offer: {
        payload: Prisma.$OfferPayload<ExtArgs>
        fields: Prisma.OfferFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OfferFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OfferFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          findFirst: {
            args: Prisma.OfferFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OfferFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          findMany: {
            args: Prisma.OfferFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>[]
          }
          create: {
            args: Prisma.OfferCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          createMany: {
            args: Prisma.OfferCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OfferCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>[]
          }
          delete: {
            args: Prisma.OfferDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          update: {
            args: Prisma.OfferUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          deleteMany: {
            args: Prisma.OfferDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OfferUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OfferUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>[]
          }
          upsert: {
            args: Prisma.OfferUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          aggregate: {
            args: Prisma.OfferAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOffer>
          }
          groupBy: {
            args: Prisma.OfferGroupByArgs<ExtArgs>
            result: $Utils.Optional<OfferGroupByOutputType>[]
          }
          count: {
            args: Prisma.OfferCountArgs<ExtArgs>
            result: $Utils.Optional<OfferCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    vacancy?: VacancyOmit
    competency?: CompetencyOmit
    candidate?: CandidateOmit
    scorecard?: ScorecardOmit
    score?: ScoreOmit
    offer?: OfferOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type VacancyCountOutputType
   */

  export type VacancyCountOutputType = {
    competencies: number
    candidates: number
  }

  export type VacancyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    competencies?: boolean | VacancyCountOutputTypeCountCompetenciesArgs
    candidates?: boolean | VacancyCountOutputTypeCountCandidatesArgs
  }

  // Custom InputTypes
  /**
   * VacancyCountOutputType without action
   */
  export type VacancyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VacancyCountOutputType
     */
    select?: VacancyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VacancyCountOutputType without action
   */
  export type VacancyCountOutputTypeCountCompetenciesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompetencyWhereInput
  }

  /**
   * VacancyCountOutputType without action
   */
  export type VacancyCountOutputTypeCountCandidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateWhereInput
  }


  /**
   * Count Type CompetencyCountOutputType
   */

  export type CompetencyCountOutputType = {
    scores: number
  }

  export type CompetencyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scores?: boolean | CompetencyCountOutputTypeCountScoresArgs
  }

  // Custom InputTypes
  /**
   * CompetencyCountOutputType without action
   */
  export type CompetencyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetencyCountOutputType
     */
    select?: CompetencyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CompetencyCountOutputType without action
   */
  export type CompetencyCountOutputTypeCountScoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScoreWhereInput
  }


  /**
   * Count Type CandidateCountOutputType
   */

  export type CandidateCountOutputType = {
    scorecards: number
  }

  export type CandidateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scorecards?: boolean | CandidateCountOutputTypeCountScorecardsArgs
  }

  // Custom InputTypes
  /**
   * CandidateCountOutputType without action
   */
  export type CandidateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateCountOutputType
     */
    select?: CandidateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CandidateCountOutputType without action
   */
  export type CandidateCountOutputTypeCountScorecardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScorecardWhereInput
  }


  /**
   * Count Type ScorecardCountOutputType
   */

  export type ScorecardCountOutputType = {
    scores: number
  }

  export type ScorecardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scores?: boolean | ScorecardCountOutputTypeCountScoresArgs
  }

  // Custom InputTypes
  /**
   * ScorecardCountOutputType without action
   */
  export type ScorecardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScorecardCountOutputType
     */
    select?: ScorecardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ScorecardCountOutputType without action
   */
  export type ScorecardCountOutputTypeCountScoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScoreWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Vacancy
   */

  export type AggregateVacancy = {
    _count: VacancyCountAggregateOutputType | null
    _avg: VacancyAvgAggregateOutputType | null
    _sum: VacancySumAggregateOutputType | null
    _min: VacancyMinAggregateOutputType | null
    _max: VacancyMaxAggregateOutputType | null
  }

  export type VacancyAvgAggregateOutputType = {
    salaryBudgetMin: number | null
    salaryBudgetMax: number | null
    acceptanceScore: number | null
  }

  export type VacancySumAggregateOutputType = {
    salaryBudgetMin: number | null
    salaryBudgetMax: number | null
    acceptanceScore: number | null
  }

  export type VacancyMinAggregateOutputType = {
    id: string | null
    title: string | null
    department: string | null
    location: string | null
    salaryBudgetMin: number | null
    salaryBudgetMax: number | null
    acceptanceScore: number | null
    jobPostingHtml: string | null
    rawBlueprint: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VacancyMaxAggregateOutputType = {
    id: string | null
    title: string | null
    department: string | null
    location: string | null
    salaryBudgetMin: number | null
    salaryBudgetMax: number | null
    acceptanceScore: number | null
    jobPostingHtml: string | null
    rawBlueprint: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VacancyCountAggregateOutputType = {
    id: number
    title: number
    department: number
    location: number
    salaryBudgetMin: number
    salaryBudgetMax: number
    acceptanceScore: number
    jobPostingHtml: number
    rawBlueprint: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VacancyAvgAggregateInputType = {
    salaryBudgetMin?: true
    salaryBudgetMax?: true
    acceptanceScore?: true
  }

  export type VacancySumAggregateInputType = {
    salaryBudgetMin?: true
    salaryBudgetMax?: true
    acceptanceScore?: true
  }

  export type VacancyMinAggregateInputType = {
    id?: true
    title?: true
    department?: true
    location?: true
    salaryBudgetMin?: true
    salaryBudgetMax?: true
    acceptanceScore?: true
    jobPostingHtml?: true
    rawBlueprint?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VacancyMaxAggregateInputType = {
    id?: true
    title?: true
    department?: true
    location?: true
    salaryBudgetMin?: true
    salaryBudgetMax?: true
    acceptanceScore?: true
    jobPostingHtml?: true
    rawBlueprint?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VacancyCountAggregateInputType = {
    id?: true
    title?: true
    department?: true
    location?: true
    salaryBudgetMin?: true
    salaryBudgetMax?: true
    acceptanceScore?: true
    jobPostingHtml?: true
    rawBlueprint?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VacancyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vacancy to aggregate.
     */
    where?: VacancyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vacancies to fetch.
     */
    orderBy?: VacancyOrderByWithRelationInput | VacancyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VacancyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vacancies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vacancies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vacancies
    **/
    _count?: true | VacancyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VacancyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VacancySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VacancyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VacancyMaxAggregateInputType
  }

  export type GetVacancyAggregateType<T extends VacancyAggregateArgs> = {
        [P in keyof T & keyof AggregateVacancy]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVacancy[P]>
      : GetScalarType<T[P], AggregateVacancy[P]>
  }




  export type VacancyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VacancyWhereInput
    orderBy?: VacancyOrderByWithAggregationInput | VacancyOrderByWithAggregationInput[]
    by: VacancyScalarFieldEnum[] | VacancyScalarFieldEnum
    having?: VacancyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VacancyCountAggregateInputType | true
    _avg?: VacancyAvgAggregateInputType
    _sum?: VacancySumAggregateInputType
    _min?: VacancyMinAggregateInputType
    _max?: VacancyMaxAggregateInputType
  }

  export type VacancyGroupByOutputType = {
    id: string
    title: string
    department: string | null
    location: string | null
    salaryBudgetMin: number | null
    salaryBudgetMax: number | null
    acceptanceScore: number
    jobPostingHtml: string
    rawBlueprint: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: VacancyCountAggregateOutputType | null
    _avg: VacancyAvgAggregateOutputType | null
    _sum: VacancySumAggregateOutputType | null
    _min: VacancyMinAggregateOutputType | null
    _max: VacancyMaxAggregateOutputType | null
  }

  type GetVacancyGroupByPayload<T extends VacancyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VacancyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VacancyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VacancyGroupByOutputType[P]>
            : GetScalarType<T[P], VacancyGroupByOutputType[P]>
        }
      >
    >


  export type VacancySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    salaryBudgetMin?: boolean
    salaryBudgetMax?: boolean
    acceptanceScore?: boolean
    jobPostingHtml?: boolean
    rawBlueprint?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    competencies?: boolean | Vacancy$competenciesArgs<ExtArgs>
    candidates?: boolean | Vacancy$candidatesArgs<ExtArgs>
    _count?: boolean | VacancyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vacancy"]>

  export type VacancySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    salaryBudgetMin?: boolean
    salaryBudgetMax?: boolean
    acceptanceScore?: boolean
    jobPostingHtml?: boolean
    rawBlueprint?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vacancy"]>

  export type VacancySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    salaryBudgetMin?: boolean
    salaryBudgetMax?: boolean
    acceptanceScore?: boolean
    jobPostingHtml?: boolean
    rawBlueprint?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vacancy"]>

  export type VacancySelectScalar = {
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    salaryBudgetMin?: boolean
    salaryBudgetMax?: boolean
    acceptanceScore?: boolean
    jobPostingHtml?: boolean
    rawBlueprint?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VacancyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "department" | "location" | "salaryBudgetMin" | "salaryBudgetMax" | "acceptanceScore" | "jobPostingHtml" | "rawBlueprint" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["vacancy"]>
  export type VacancyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    competencies?: boolean | Vacancy$competenciesArgs<ExtArgs>
    candidates?: boolean | Vacancy$candidatesArgs<ExtArgs>
    _count?: boolean | VacancyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VacancyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type VacancyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $VacancyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vacancy"
    objects: {
      competencies: Prisma.$CompetencyPayload<ExtArgs>[]
      candidates: Prisma.$CandidatePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      department: string | null
      location: string | null
      salaryBudgetMin: number | null
      salaryBudgetMax: number | null
      acceptanceScore: number
      jobPostingHtml: string
      rawBlueprint: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["vacancy"]>
    composites: {}
  }

  type VacancyGetPayload<S extends boolean | null | undefined | VacancyDefaultArgs> = $Result.GetResult<Prisma.$VacancyPayload, S>

  type VacancyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VacancyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VacancyCountAggregateInputType | true
    }

  export interface VacancyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vacancy'], meta: { name: 'Vacancy' } }
    /**
     * Find zero or one Vacancy that matches the filter.
     * @param {VacancyFindUniqueArgs} args - Arguments to find a Vacancy
     * @example
     * // Get one Vacancy
     * const vacancy = await prisma.vacancy.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VacancyFindUniqueArgs>(args: SelectSubset<T, VacancyFindUniqueArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Vacancy that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VacancyFindUniqueOrThrowArgs} args - Arguments to find a Vacancy
     * @example
     * // Get one Vacancy
     * const vacancy = await prisma.vacancy.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VacancyFindUniqueOrThrowArgs>(args: SelectSubset<T, VacancyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vacancy that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyFindFirstArgs} args - Arguments to find a Vacancy
     * @example
     * // Get one Vacancy
     * const vacancy = await prisma.vacancy.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VacancyFindFirstArgs>(args?: SelectSubset<T, VacancyFindFirstArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vacancy that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyFindFirstOrThrowArgs} args - Arguments to find a Vacancy
     * @example
     * // Get one Vacancy
     * const vacancy = await prisma.vacancy.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VacancyFindFirstOrThrowArgs>(args?: SelectSubset<T, VacancyFindFirstOrThrowArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Vacancies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vacancies
     * const vacancies = await prisma.vacancy.findMany()
     * 
     * // Get first 10 Vacancies
     * const vacancies = await prisma.vacancy.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vacancyWithIdOnly = await prisma.vacancy.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VacancyFindManyArgs>(args?: SelectSubset<T, VacancyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Vacancy.
     * @param {VacancyCreateArgs} args - Arguments to create a Vacancy.
     * @example
     * // Create one Vacancy
     * const Vacancy = await prisma.vacancy.create({
     *   data: {
     *     // ... data to create a Vacancy
     *   }
     * })
     * 
     */
    create<T extends VacancyCreateArgs>(args: SelectSubset<T, VacancyCreateArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Vacancies.
     * @param {VacancyCreateManyArgs} args - Arguments to create many Vacancies.
     * @example
     * // Create many Vacancies
     * const vacancy = await prisma.vacancy.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VacancyCreateManyArgs>(args?: SelectSubset<T, VacancyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vacancies and returns the data saved in the database.
     * @param {VacancyCreateManyAndReturnArgs} args - Arguments to create many Vacancies.
     * @example
     * // Create many Vacancies
     * const vacancy = await prisma.vacancy.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vacancies and only return the `id`
     * const vacancyWithIdOnly = await prisma.vacancy.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VacancyCreateManyAndReturnArgs>(args?: SelectSubset<T, VacancyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Vacancy.
     * @param {VacancyDeleteArgs} args - Arguments to delete one Vacancy.
     * @example
     * // Delete one Vacancy
     * const Vacancy = await prisma.vacancy.delete({
     *   where: {
     *     // ... filter to delete one Vacancy
     *   }
     * })
     * 
     */
    delete<T extends VacancyDeleteArgs>(args: SelectSubset<T, VacancyDeleteArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Vacancy.
     * @param {VacancyUpdateArgs} args - Arguments to update one Vacancy.
     * @example
     * // Update one Vacancy
     * const vacancy = await prisma.vacancy.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VacancyUpdateArgs>(args: SelectSubset<T, VacancyUpdateArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Vacancies.
     * @param {VacancyDeleteManyArgs} args - Arguments to filter Vacancies to delete.
     * @example
     * // Delete a few Vacancies
     * const { count } = await prisma.vacancy.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VacancyDeleteManyArgs>(args?: SelectSubset<T, VacancyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vacancies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vacancies
     * const vacancy = await prisma.vacancy.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VacancyUpdateManyArgs>(args: SelectSubset<T, VacancyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vacancies and returns the data updated in the database.
     * @param {VacancyUpdateManyAndReturnArgs} args - Arguments to update many Vacancies.
     * @example
     * // Update many Vacancies
     * const vacancy = await prisma.vacancy.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Vacancies and only return the `id`
     * const vacancyWithIdOnly = await prisma.vacancy.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VacancyUpdateManyAndReturnArgs>(args: SelectSubset<T, VacancyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Vacancy.
     * @param {VacancyUpsertArgs} args - Arguments to update or create a Vacancy.
     * @example
     * // Update or create a Vacancy
     * const vacancy = await prisma.vacancy.upsert({
     *   create: {
     *     // ... data to create a Vacancy
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vacancy we want to update
     *   }
     * })
     */
    upsert<T extends VacancyUpsertArgs>(args: SelectSubset<T, VacancyUpsertArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Vacancies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyCountArgs} args - Arguments to filter Vacancies to count.
     * @example
     * // Count the number of Vacancies
     * const count = await prisma.vacancy.count({
     *   where: {
     *     // ... the filter for the Vacancies we want to count
     *   }
     * })
    **/
    count<T extends VacancyCountArgs>(
      args?: Subset<T, VacancyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VacancyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vacancy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VacancyAggregateArgs>(args: Subset<T, VacancyAggregateArgs>): Prisma.PrismaPromise<GetVacancyAggregateType<T>>

    /**
     * Group by Vacancy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VacancyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VacancyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VacancyGroupByArgs['orderBy'] }
        : { orderBy?: VacancyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VacancyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVacancyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vacancy model
   */
  readonly fields: VacancyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vacancy.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VacancyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    competencies<T extends Vacancy$competenciesArgs<ExtArgs> = {}>(args?: Subset<T, Vacancy$competenciesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    candidates<T extends Vacancy$candidatesArgs<ExtArgs> = {}>(args?: Subset<T, Vacancy$candidatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Vacancy model
   */
  interface VacancyFieldRefs {
    readonly id: FieldRef<"Vacancy", 'String'>
    readonly title: FieldRef<"Vacancy", 'String'>
    readonly department: FieldRef<"Vacancy", 'String'>
    readonly location: FieldRef<"Vacancy", 'String'>
    readonly salaryBudgetMin: FieldRef<"Vacancy", 'Float'>
    readonly salaryBudgetMax: FieldRef<"Vacancy", 'Float'>
    readonly acceptanceScore: FieldRef<"Vacancy", 'Float'>
    readonly jobPostingHtml: FieldRef<"Vacancy", 'String'>
    readonly rawBlueprint: FieldRef<"Vacancy", 'String'>
    readonly status: FieldRef<"Vacancy", 'String'>
    readonly createdAt: FieldRef<"Vacancy", 'DateTime'>
    readonly updatedAt: FieldRef<"Vacancy", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Vacancy findUnique
   */
  export type VacancyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * Filter, which Vacancy to fetch.
     */
    where: VacancyWhereUniqueInput
  }

  /**
   * Vacancy findUniqueOrThrow
   */
  export type VacancyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * Filter, which Vacancy to fetch.
     */
    where: VacancyWhereUniqueInput
  }

  /**
   * Vacancy findFirst
   */
  export type VacancyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * Filter, which Vacancy to fetch.
     */
    where?: VacancyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vacancies to fetch.
     */
    orderBy?: VacancyOrderByWithRelationInput | VacancyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vacancies.
     */
    cursor?: VacancyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vacancies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vacancies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vacancies.
     */
    distinct?: VacancyScalarFieldEnum | VacancyScalarFieldEnum[]
  }

  /**
   * Vacancy findFirstOrThrow
   */
  export type VacancyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * Filter, which Vacancy to fetch.
     */
    where?: VacancyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vacancies to fetch.
     */
    orderBy?: VacancyOrderByWithRelationInput | VacancyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vacancies.
     */
    cursor?: VacancyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vacancies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vacancies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vacancies.
     */
    distinct?: VacancyScalarFieldEnum | VacancyScalarFieldEnum[]
  }

  /**
   * Vacancy findMany
   */
  export type VacancyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * Filter, which Vacancies to fetch.
     */
    where?: VacancyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vacancies to fetch.
     */
    orderBy?: VacancyOrderByWithRelationInput | VacancyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vacancies.
     */
    cursor?: VacancyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vacancies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vacancies.
     */
    skip?: number
    distinct?: VacancyScalarFieldEnum | VacancyScalarFieldEnum[]
  }

  /**
   * Vacancy create
   */
  export type VacancyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * The data needed to create a Vacancy.
     */
    data: XOR<VacancyCreateInput, VacancyUncheckedCreateInput>
  }

  /**
   * Vacancy createMany
   */
  export type VacancyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vacancies.
     */
    data: VacancyCreateManyInput | VacancyCreateManyInput[]
  }

  /**
   * Vacancy createManyAndReturn
   */
  export type VacancyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * The data used to create many Vacancies.
     */
    data: VacancyCreateManyInput | VacancyCreateManyInput[]
  }

  /**
   * Vacancy update
   */
  export type VacancyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * The data needed to update a Vacancy.
     */
    data: XOR<VacancyUpdateInput, VacancyUncheckedUpdateInput>
    /**
     * Choose, which Vacancy to update.
     */
    where: VacancyWhereUniqueInput
  }

  /**
   * Vacancy updateMany
   */
  export type VacancyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vacancies.
     */
    data: XOR<VacancyUpdateManyMutationInput, VacancyUncheckedUpdateManyInput>
    /**
     * Filter which Vacancies to update
     */
    where?: VacancyWhereInput
    /**
     * Limit how many Vacancies to update.
     */
    limit?: number
  }

  /**
   * Vacancy updateManyAndReturn
   */
  export type VacancyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * The data used to update Vacancies.
     */
    data: XOR<VacancyUpdateManyMutationInput, VacancyUncheckedUpdateManyInput>
    /**
     * Filter which Vacancies to update
     */
    where?: VacancyWhereInput
    /**
     * Limit how many Vacancies to update.
     */
    limit?: number
  }

  /**
   * Vacancy upsert
   */
  export type VacancyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * The filter to search for the Vacancy to update in case it exists.
     */
    where: VacancyWhereUniqueInput
    /**
     * In case the Vacancy found by the `where` argument doesn't exist, create a new Vacancy with this data.
     */
    create: XOR<VacancyCreateInput, VacancyUncheckedCreateInput>
    /**
     * In case the Vacancy was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VacancyUpdateInput, VacancyUncheckedUpdateInput>
  }

  /**
   * Vacancy delete
   */
  export type VacancyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
    /**
     * Filter which Vacancy to delete.
     */
    where: VacancyWhereUniqueInput
  }

  /**
   * Vacancy deleteMany
   */
  export type VacancyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vacancies to delete
     */
    where?: VacancyWhereInput
    /**
     * Limit how many Vacancies to delete.
     */
    limit?: number
  }

  /**
   * Vacancy.competencies
   */
  export type Vacancy$competenciesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    where?: CompetencyWhereInput
    orderBy?: CompetencyOrderByWithRelationInput | CompetencyOrderByWithRelationInput[]
    cursor?: CompetencyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CompetencyScalarFieldEnum | CompetencyScalarFieldEnum[]
  }

  /**
   * Vacancy.candidates
   */
  export type Vacancy$candidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    where?: CandidateWhereInput
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    cursor?: CandidateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Vacancy without action
   */
  export type VacancyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vacancy
     */
    select?: VacancySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vacancy
     */
    omit?: VacancyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VacancyInclude<ExtArgs> | null
  }


  /**
   * Model Competency
   */

  export type AggregateCompetency = {
    _count: CompetencyCountAggregateOutputType | null
    _avg: CompetencyAvgAggregateOutputType | null
    _sum: CompetencySumAggregateOutputType | null
    _min: CompetencyMinAggregateOutputType | null
    _max: CompetencyMaxAggregateOutputType | null
  }

  export type CompetencyAvgAggregateOutputType = {
    weight: number | null
    order: number | null
  }

  export type CompetencySumAggregateOutputType = {
    weight: number | null
    order: number | null
  }

  export type CompetencyMinAggregateOutputType = {
    id: string | null
    vacancyId: string | null
    name: string | null
    category: string | null
    weight: number | null
    order: number | null
  }

  export type CompetencyMaxAggregateOutputType = {
    id: string | null
    vacancyId: string | null
    name: string | null
    category: string | null
    weight: number | null
    order: number | null
  }

  export type CompetencyCountAggregateOutputType = {
    id: number
    vacancyId: number
    name: number
    category: number
    weight: number
    order: number
    _all: number
  }


  export type CompetencyAvgAggregateInputType = {
    weight?: true
    order?: true
  }

  export type CompetencySumAggregateInputType = {
    weight?: true
    order?: true
  }

  export type CompetencyMinAggregateInputType = {
    id?: true
    vacancyId?: true
    name?: true
    category?: true
    weight?: true
    order?: true
  }

  export type CompetencyMaxAggregateInputType = {
    id?: true
    vacancyId?: true
    name?: true
    category?: true
    weight?: true
    order?: true
  }

  export type CompetencyCountAggregateInputType = {
    id?: true
    vacancyId?: true
    name?: true
    category?: true
    weight?: true
    order?: true
    _all?: true
  }

  export type CompetencyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Competency to aggregate.
     */
    where?: CompetencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Competencies to fetch.
     */
    orderBy?: CompetencyOrderByWithRelationInput | CompetencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompetencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Competencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Competencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Competencies
    **/
    _count?: true | CompetencyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CompetencyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CompetencySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompetencyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompetencyMaxAggregateInputType
  }

  export type GetCompetencyAggregateType<T extends CompetencyAggregateArgs> = {
        [P in keyof T & keyof AggregateCompetency]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompetency[P]>
      : GetScalarType<T[P], AggregateCompetency[P]>
  }




  export type CompetencyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompetencyWhereInput
    orderBy?: CompetencyOrderByWithAggregationInput | CompetencyOrderByWithAggregationInput[]
    by: CompetencyScalarFieldEnum[] | CompetencyScalarFieldEnum
    having?: CompetencyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompetencyCountAggregateInputType | true
    _avg?: CompetencyAvgAggregateInputType
    _sum?: CompetencySumAggregateInputType
    _min?: CompetencyMinAggregateInputType
    _max?: CompetencyMaxAggregateInputType
  }

  export type CompetencyGroupByOutputType = {
    id: string
    vacancyId: string
    name: string
    category: string
    weight: number
    order: number
    _count: CompetencyCountAggregateOutputType | null
    _avg: CompetencyAvgAggregateOutputType | null
    _sum: CompetencySumAggregateOutputType | null
    _min: CompetencyMinAggregateOutputType | null
    _max: CompetencyMaxAggregateOutputType | null
  }

  type GetCompetencyGroupByPayload<T extends CompetencyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CompetencyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompetencyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompetencyGroupByOutputType[P]>
            : GetScalarType<T[P], CompetencyGroupByOutputType[P]>
        }
      >
    >


  export type CompetencySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    category?: boolean
    weight?: boolean
    order?: boolean
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
    scores?: boolean | Competency$scoresArgs<ExtArgs>
    _count?: boolean | CompetencyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["competency"]>

  export type CompetencySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    category?: boolean
    weight?: boolean
    order?: boolean
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["competency"]>

  export type CompetencySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    category?: boolean
    weight?: boolean
    order?: boolean
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["competency"]>

  export type CompetencySelectScalar = {
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    category?: boolean
    weight?: boolean
    order?: boolean
  }

  export type CompetencyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vacancyId" | "name" | "category" | "weight" | "order", ExtArgs["result"]["competency"]>
  export type CompetencyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
    scores?: boolean | Competency$scoresArgs<ExtArgs>
    _count?: boolean | CompetencyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CompetencyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }
  export type CompetencyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }

  export type $CompetencyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Competency"
    objects: {
      vacancy: Prisma.$VacancyPayload<ExtArgs>
      scores: Prisma.$ScorePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vacancyId: string
      name: string
      category: string
      weight: number
      order: number
    }, ExtArgs["result"]["competency"]>
    composites: {}
  }

  type CompetencyGetPayload<S extends boolean | null | undefined | CompetencyDefaultArgs> = $Result.GetResult<Prisma.$CompetencyPayload, S>

  type CompetencyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CompetencyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CompetencyCountAggregateInputType | true
    }

  export interface CompetencyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Competency'], meta: { name: 'Competency' } }
    /**
     * Find zero or one Competency that matches the filter.
     * @param {CompetencyFindUniqueArgs} args - Arguments to find a Competency
     * @example
     * // Get one Competency
     * const competency = await prisma.competency.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CompetencyFindUniqueArgs>(args: SelectSubset<T, CompetencyFindUniqueArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Competency that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CompetencyFindUniqueOrThrowArgs} args - Arguments to find a Competency
     * @example
     * // Get one Competency
     * const competency = await prisma.competency.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CompetencyFindUniqueOrThrowArgs>(args: SelectSubset<T, CompetencyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Competency that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyFindFirstArgs} args - Arguments to find a Competency
     * @example
     * // Get one Competency
     * const competency = await prisma.competency.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CompetencyFindFirstArgs>(args?: SelectSubset<T, CompetencyFindFirstArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Competency that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyFindFirstOrThrowArgs} args - Arguments to find a Competency
     * @example
     * // Get one Competency
     * const competency = await prisma.competency.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CompetencyFindFirstOrThrowArgs>(args?: SelectSubset<T, CompetencyFindFirstOrThrowArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Competencies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Competencies
     * const competencies = await prisma.competency.findMany()
     * 
     * // Get first 10 Competencies
     * const competencies = await prisma.competency.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const competencyWithIdOnly = await prisma.competency.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CompetencyFindManyArgs>(args?: SelectSubset<T, CompetencyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Competency.
     * @param {CompetencyCreateArgs} args - Arguments to create a Competency.
     * @example
     * // Create one Competency
     * const Competency = await prisma.competency.create({
     *   data: {
     *     // ... data to create a Competency
     *   }
     * })
     * 
     */
    create<T extends CompetencyCreateArgs>(args: SelectSubset<T, CompetencyCreateArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Competencies.
     * @param {CompetencyCreateManyArgs} args - Arguments to create many Competencies.
     * @example
     * // Create many Competencies
     * const competency = await prisma.competency.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CompetencyCreateManyArgs>(args?: SelectSubset<T, CompetencyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Competencies and returns the data saved in the database.
     * @param {CompetencyCreateManyAndReturnArgs} args - Arguments to create many Competencies.
     * @example
     * // Create many Competencies
     * const competency = await prisma.competency.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Competencies and only return the `id`
     * const competencyWithIdOnly = await prisma.competency.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CompetencyCreateManyAndReturnArgs>(args?: SelectSubset<T, CompetencyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Competency.
     * @param {CompetencyDeleteArgs} args - Arguments to delete one Competency.
     * @example
     * // Delete one Competency
     * const Competency = await prisma.competency.delete({
     *   where: {
     *     // ... filter to delete one Competency
     *   }
     * })
     * 
     */
    delete<T extends CompetencyDeleteArgs>(args: SelectSubset<T, CompetencyDeleteArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Competency.
     * @param {CompetencyUpdateArgs} args - Arguments to update one Competency.
     * @example
     * // Update one Competency
     * const competency = await prisma.competency.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CompetencyUpdateArgs>(args: SelectSubset<T, CompetencyUpdateArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Competencies.
     * @param {CompetencyDeleteManyArgs} args - Arguments to filter Competencies to delete.
     * @example
     * // Delete a few Competencies
     * const { count } = await prisma.competency.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CompetencyDeleteManyArgs>(args?: SelectSubset<T, CompetencyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Competencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Competencies
     * const competency = await prisma.competency.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CompetencyUpdateManyArgs>(args: SelectSubset<T, CompetencyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Competencies and returns the data updated in the database.
     * @param {CompetencyUpdateManyAndReturnArgs} args - Arguments to update many Competencies.
     * @example
     * // Update many Competencies
     * const competency = await prisma.competency.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Competencies and only return the `id`
     * const competencyWithIdOnly = await prisma.competency.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CompetencyUpdateManyAndReturnArgs>(args: SelectSubset<T, CompetencyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Competency.
     * @param {CompetencyUpsertArgs} args - Arguments to update or create a Competency.
     * @example
     * // Update or create a Competency
     * const competency = await prisma.competency.upsert({
     *   create: {
     *     // ... data to create a Competency
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Competency we want to update
     *   }
     * })
     */
    upsert<T extends CompetencyUpsertArgs>(args: SelectSubset<T, CompetencyUpsertArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Competencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyCountArgs} args - Arguments to filter Competencies to count.
     * @example
     * // Count the number of Competencies
     * const count = await prisma.competency.count({
     *   where: {
     *     // ... the filter for the Competencies we want to count
     *   }
     * })
    **/
    count<T extends CompetencyCountArgs>(
      args?: Subset<T, CompetencyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompetencyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Competency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompetencyAggregateArgs>(args: Subset<T, CompetencyAggregateArgs>): Prisma.PrismaPromise<GetCompetencyAggregateType<T>>

    /**
     * Group by Competency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetencyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompetencyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompetencyGroupByArgs['orderBy'] }
        : { orderBy?: CompetencyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompetencyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompetencyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Competency model
   */
  readonly fields: CompetencyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Competency.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CompetencyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    vacancy<T extends VacancyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VacancyDefaultArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    scores<T extends Competency$scoresArgs<ExtArgs> = {}>(args?: Subset<T, Competency$scoresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Competency model
   */
  interface CompetencyFieldRefs {
    readonly id: FieldRef<"Competency", 'String'>
    readonly vacancyId: FieldRef<"Competency", 'String'>
    readonly name: FieldRef<"Competency", 'String'>
    readonly category: FieldRef<"Competency", 'String'>
    readonly weight: FieldRef<"Competency", 'Float'>
    readonly order: FieldRef<"Competency", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Competency findUnique
   */
  export type CompetencyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * Filter, which Competency to fetch.
     */
    where: CompetencyWhereUniqueInput
  }

  /**
   * Competency findUniqueOrThrow
   */
  export type CompetencyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * Filter, which Competency to fetch.
     */
    where: CompetencyWhereUniqueInput
  }

  /**
   * Competency findFirst
   */
  export type CompetencyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * Filter, which Competency to fetch.
     */
    where?: CompetencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Competencies to fetch.
     */
    orderBy?: CompetencyOrderByWithRelationInput | CompetencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Competencies.
     */
    cursor?: CompetencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Competencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Competencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Competencies.
     */
    distinct?: CompetencyScalarFieldEnum | CompetencyScalarFieldEnum[]
  }

  /**
   * Competency findFirstOrThrow
   */
  export type CompetencyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * Filter, which Competency to fetch.
     */
    where?: CompetencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Competencies to fetch.
     */
    orderBy?: CompetencyOrderByWithRelationInput | CompetencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Competencies.
     */
    cursor?: CompetencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Competencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Competencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Competencies.
     */
    distinct?: CompetencyScalarFieldEnum | CompetencyScalarFieldEnum[]
  }

  /**
   * Competency findMany
   */
  export type CompetencyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * Filter, which Competencies to fetch.
     */
    where?: CompetencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Competencies to fetch.
     */
    orderBy?: CompetencyOrderByWithRelationInput | CompetencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Competencies.
     */
    cursor?: CompetencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Competencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Competencies.
     */
    skip?: number
    distinct?: CompetencyScalarFieldEnum | CompetencyScalarFieldEnum[]
  }

  /**
   * Competency create
   */
  export type CompetencyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * The data needed to create a Competency.
     */
    data: XOR<CompetencyCreateInput, CompetencyUncheckedCreateInput>
  }

  /**
   * Competency createMany
   */
  export type CompetencyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Competencies.
     */
    data: CompetencyCreateManyInput | CompetencyCreateManyInput[]
  }

  /**
   * Competency createManyAndReturn
   */
  export type CompetencyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * The data used to create many Competencies.
     */
    data: CompetencyCreateManyInput | CompetencyCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Competency update
   */
  export type CompetencyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * The data needed to update a Competency.
     */
    data: XOR<CompetencyUpdateInput, CompetencyUncheckedUpdateInput>
    /**
     * Choose, which Competency to update.
     */
    where: CompetencyWhereUniqueInput
  }

  /**
   * Competency updateMany
   */
  export type CompetencyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Competencies.
     */
    data: XOR<CompetencyUpdateManyMutationInput, CompetencyUncheckedUpdateManyInput>
    /**
     * Filter which Competencies to update
     */
    where?: CompetencyWhereInput
    /**
     * Limit how many Competencies to update.
     */
    limit?: number
  }

  /**
   * Competency updateManyAndReturn
   */
  export type CompetencyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * The data used to update Competencies.
     */
    data: XOR<CompetencyUpdateManyMutationInput, CompetencyUncheckedUpdateManyInput>
    /**
     * Filter which Competencies to update
     */
    where?: CompetencyWhereInput
    /**
     * Limit how many Competencies to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Competency upsert
   */
  export type CompetencyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * The filter to search for the Competency to update in case it exists.
     */
    where: CompetencyWhereUniqueInput
    /**
     * In case the Competency found by the `where` argument doesn't exist, create a new Competency with this data.
     */
    create: XOR<CompetencyCreateInput, CompetencyUncheckedCreateInput>
    /**
     * In case the Competency was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompetencyUpdateInput, CompetencyUncheckedUpdateInput>
  }

  /**
   * Competency delete
   */
  export type CompetencyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
    /**
     * Filter which Competency to delete.
     */
    where: CompetencyWhereUniqueInput
  }

  /**
   * Competency deleteMany
   */
  export type CompetencyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Competencies to delete
     */
    where?: CompetencyWhereInput
    /**
     * Limit how many Competencies to delete.
     */
    limit?: number
  }

  /**
   * Competency.scores
   */
  export type Competency$scoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    where?: ScoreWhereInput
    orderBy?: ScoreOrderByWithRelationInput | ScoreOrderByWithRelationInput[]
    cursor?: ScoreWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScoreScalarFieldEnum | ScoreScalarFieldEnum[]
  }

  /**
   * Competency without action
   */
  export type CompetencyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Competency
     */
    select?: CompetencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Competency
     */
    omit?: CompetencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompetencyInclude<ExtArgs> | null
  }


  /**
   * Model Candidate
   */

  export type AggregateCandidate = {
    _count: CandidateCountAggregateOutputType | null
    _avg: CandidateAvgAggregateOutputType | null
    _sum: CandidateSumAggregateOutputType | null
    _min: CandidateMinAggregateOutputType | null
    _max: CandidateMaxAggregateOutputType | null
  }

  export type CandidateAvgAggregateOutputType = {
    yearsExperience: number | null
    expectedSalary: number | null
    compositeScore: number | null
  }

  export type CandidateSumAggregateOutputType = {
    yearsExperience: number | null
    expectedSalary: number | null
    compositeScore: number | null
  }

  export type CandidateMinAggregateOutputType = {
    id: string | null
    vacancyId: string | null
    name: string | null
    email: string | null
    phone: string | null
    yearsExperience: number | null
    expectedSalary: number | null
    rawCv: string | null
    portfolioUrl: string | null
    portfolioTitle: string | null
    portfolioImage: string | null
    portfolioDesc: string | null
    compositeScore: number | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateMaxAggregateOutputType = {
    id: string | null
    vacancyId: string | null
    name: string | null
    email: string | null
    phone: string | null
    yearsExperience: number | null
    expectedSalary: number | null
    rawCv: string | null
    portfolioUrl: string | null
    portfolioTitle: string | null
    portfolioImage: string | null
    portfolioDesc: string | null
    compositeScore: number | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateCountAggregateOutputType = {
    id: number
    vacancyId: number
    name: number
    email: number
    phone: number
    yearsExperience: number
    expectedSalary: number
    rawCv: number
    portfolioUrl: number
    portfolioTitle: number
    portfolioImage: number
    portfolioDesc: number
    compositeScore: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CandidateAvgAggregateInputType = {
    yearsExperience?: true
    expectedSalary?: true
    compositeScore?: true
  }

  export type CandidateSumAggregateInputType = {
    yearsExperience?: true
    expectedSalary?: true
    compositeScore?: true
  }

  export type CandidateMinAggregateInputType = {
    id?: true
    vacancyId?: true
    name?: true
    email?: true
    phone?: true
    yearsExperience?: true
    expectedSalary?: true
    rawCv?: true
    portfolioUrl?: true
    portfolioTitle?: true
    portfolioImage?: true
    portfolioDesc?: true
    compositeScore?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateMaxAggregateInputType = {
    id?: true
    vacancyId?: true
    name?: true
    email?: true
    phone?: true
    yearsExperience?: true
    expectedSalary?: true
    rawCv?: true
    portfolioUrl?: true
    portfolioTitle?: true
    portfolioImage?: true
    portfolioDesc?: true
    compositeScore?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateCountAggregateInputType = {
    id?: true
    vacancyId?: true
    name?: true
    email?: true
    phone?: true
    yearsExperience?: true
    expectedSalary?: true
    rawCv?: true
    portfolioUrl?: true
    portfolioTitle?: true
    portfolioImage?: true
    portfolioDesc?: true
    compositeScore?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CandidateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Candidate to aggregate.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Candidates
    **/
    _count?: true | CandidateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CandidateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CandidateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CandidateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CandidateMaxAggregateInputType
  }

  export type GetCandidateAggregateType<T extends CandidateAggregateArgs> = {
        [P in keyof T & keyof AggregateCandidate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCandidate[P]>
      : GetScalarType<T[P], AggregateCandidate[P]>
  }




  export type CandidateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateWhereInput
    orderBy?: CandidateOrderByWithAggregationInput | CandidateOrderByWithAggregationInput[]
    by: CandidateScalarFieldEnum[] | CandidateScalarFieldEnum
    having?: CandidateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CandidateCountAggregateInputType | true
    _avg?: CandidateAvgAggregateInputType
    _sum?: CandidateSumAggregateInputType
    _min?: CandidateMinAggregateInputType
    _max?: CandidateMaxAggregateInputType
  }

  export type CandidateGroupByOutputType = {
    id: string
    vacancyId: string
    name: string
    email: string
    phone: string | null
    yearsExperience: number | null
    expectedSalary: number | null
    rawCv: string
    portfolioUrl: string | null
    portfolioTitle: string | null
    portfolioImage: string | null
    portfolioDesc: string | null
    compositeScore: number | null
    status: string
    createdAt: Date
    updatedAt: Date
    _count: CandidateCountAggregateOutputType | null
    _avg: CandidateAvgAggregateOutputType | null
    _sum: CandidateSumAggregateOutputType | null
    _min: CandidateMinAggregateOutputType | null
    _max: CandidateMaxAggregateOutputType | null
  }

  type GetCandidateGroupByPayload<T extends CandidateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CandidateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CandidateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CandidateGroupByOutputType[P]>
            : GetScalarType<T[P], CandidateGroupByOutputType[P]>
        }
      >
    >


  export type CandidateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    yearsExperience?: boolean
    expectedSalary?: boolean
    rawCv?: boolean
    portfolioUrl?: boolean
    portfolioTitle?: boolean
    portfolioImage?: boolean
    portfolioDesc?: boolean
    compositeScore?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
    scorecards?: boolean | Candidate$scorecardsArgs<ExtArgs>
    offer?: boolean | Candidate$offerArgs<ExtArgs>
    _count?: boolean | CandidateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    yearsExperience?: boolean
    expectedSalary?: boolean
    rawCv?: boolean
    portfolioUrl?: boolean
    portfolioTitle?: boolean
    portfolioImage?: boolean
    portfolioDesc?: boolean
    compositeScore?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    yearsExperience?: boolean
    expectedSalary?: boolean
    rawCv?: boolean
    portfolioUrl?: boolean
    portfolioTitle?: boolean
    portfolioImage?: boolean
    portfolioDesc?: boolean
    compositeScore?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectScalar = {
    id?: boolean
    vacancyId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    yearsExperience?: boolean
    expectedSalary?: boolean
    rawCv?: boolean
    portfolioUrl?: boolean
    portfolioTitle?: boolean
    portfolioImage?: boolean
    portfolioDesc?: boolean
    compositeScore?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CandidateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vacancyId" | "name" | "email" | "phone" | "yearsExperience" | "expectedSalary" | "rawCv" | "portfolioUrl" | "portfolioTitle" | "portfolioImage" | "portfolioDesc" | "compositeScore" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["candidate"]>
  export type CandidateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
    scorecards?: boolean | Candidate$scorecardsArgs<ExtArgs>
    offer?: boolean | Candidate$offerArgs<ExtArgs>
    _count?: boolean | CandidateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CandidateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }
  export type CandidateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vacancy?: boolean | VacancyDefaultArgs<ExtArgs>
  }

  export type $CandidatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Candidate"
    objects: {
      vacancy: Prisma.$VacancyPayload<ExtArgs>
      scorecards: Prisma.$ScorecardPayload<ExtArgs>[]
      offer: Prisma.$OfferPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vacancyId: string
      name: string
      email: string
      phone: string | null
      yearsExperience: number | null
      expectedSalary: number | null
      rawCv: string
      portfolioUrl: string | null
      portfolioTitle: string | null
      portfolioImage: string | null
      portfolioDesc: string | null
      compositeScore: number | null
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["candidate"]>
    composites: {}
  }

  type CandidateGetPayload<S extends boolean | null | undefined | CandidateDefaultArgs> = $Result.GetResult<Prisma.$CandidatePayload, S>

  type CandidateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CandidateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CandidateCountAggregateInputType | true
    }

  export interface CandidateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Candidate'], meta: { name: 'Candidate' } }
    /**
     * Find zero or one Candidate that matches the filter.
     * @param {CandidateFindUniqueArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CandidateFindUniqueArgs>(args: SelectSubset<T, CandidateFindUniqueArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Candidate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CandidateFindUniqueOrThrowArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CandidateFindUniqueOrThrowArgs>(args: SelectSubset<T, CandidateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Candidate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindFirstArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CandidateFindFirstArgs>(args?: SelectSubset<T, CandidateFindFirstArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Candidate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindFirstOrThrowArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CandidateFindFirstOrThrowArgs>(args?: SelectSubset<T, CandidateFindFirstOrThrowArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Candidates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Candidates
     * const candidates = await prisma.candidate.findMany()
     * 
     * // Get first 10 Candidates
     * const candidates = await prisma.candidate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const candidateWithIdOnly = await prisma.candidate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CandidateFindManyArgs>(args?: SelectSubset<T, CandidateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Candidate.
     * @param {CandidateCreateArgs} args - Arguments to create a Candidate.
     * @example
     * // Create one Candidate
     * const Candidate = await prisma.candidate.create({
     *   data: {
     *     // ... data to create a Candidate
     *   }
     * })
     * 
     */
    create<T extends CandidateCreateArgs>(args: SelectSubset<T, CandidateCreateArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Candidates.
     * @param {CandidateCreateManyArgs} args - Arguments to create many Candidates.
     * @example
     * // Create many Candidates
     * const candidate = await prisma.candidate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CandidateCreateManyArgs>(args?: SelectSubset<T, CandidateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Candidates and returns the data saved in the database.
     * @param {CandidateCreateManyAndReturnArgs} args - Arguments to create many Candidates.
     * @example
     * // Create many Candidates
     * const candidate = await prisma.candidate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Candidates and only return the `id`
     * const candidateWithIdOnly = await prisma.candidate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CandidateCreateManyAndReturnArgs>(args?: SelectSubset<T, CandidateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Candidate.
     * @param {CandidateDeleteArgs} args - Arguments to delete one Candidate.
     * @example
     * // Delete one Candidate
     * const Candidate = await prisma.candidate.delete({
     *   where: {
     *     // ... filter to delete one Candidate
     *   }
     * })
     * 
     */
    delete<T extends CandidateDeleteArgs>(args: SelectSubset<T, CandidateDeleteArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Candidate.
     * @param {CandidateUpdateArgs} args - Arguments to update one Candidate.
     * @example
     * // Update one Candidate
     * const candidate = await prisma.candidate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CandidateUpdateArgs>(args: SelectSubset<T, CandidateUpdateArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Candidates.
     * @param {CandidateDeleteManyArgs} args - Arguments to filter Candidates to delete.
     * @example
     * // Delete a few Candidates
     * const { count } = await prisma.candidate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CandidateDeleteManyArgs>(args?: SelectSubset<T, CandidateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Candidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Candidates
     * const candidate = await prisma.candidate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CandidateUpdateManyArgs>(args: SelectSubset<T, CandidateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Candidates and returns the data updated in the database.
     * @param {CandidateUpdateManyAndReturnArgs} args - Arguments to update many Candidates.
     * @example
     * // Update many Candidates
     * const candidate = await prisma.candidate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Candidates and only return the `id`
     * const candidateWithIdOnly = await prisma.candidate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CandidateUpdateManyAndReturnArgs>(args: SelectSubset<T, CandidateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Candidate.
     * @param {CandidateUpsertArgs} args - Arguments to update or create a Candidate.
     * @example
     * // Update or create a Candidate
     * const candidate = await prisma.candidate.upsert({
     *   create: {
     *     // ... data to create a Candidate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Candidate we want to update
     *   }
     * })
     */
    upsert<T extends CandidateUpsertArgs>(args: SelectSubset<T, CandidateUpsertArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Candidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateCountArgs} args - Arguments to filter Candidates to count.
     * @example
     * // Count the number of Candidates
     * const count = await prisma.candidate.count({
     *   where: {
     *     // ... the filter for the Candidates we want to count
     *   }
     * })
    **/
    count<T extends CandidateCountArgs>(
      args?: Subset<T, CandidateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CandidateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Candidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CandidateAggregateArgs>(args: Subset<T, CandidateAggregateArgs>): Prisma.PrismaPromise<GetCandidateAggregateType<T>>

    /**
     * Group by Candidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CandidateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CandidateGroupByArgs['orderBy'] }
        : { orderBy?: CandidateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CandidateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCandidateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Candidate model
   */
  readonly fields: CandidateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Candidate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CandidateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    vacancy<T extends VacancyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VacancyDefaultArgs<ExtArgs>>): Prisma__VacancyClient<$Result.GetResult<Prisma.$VacancyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    scorecards<T extends Candidate$scorecardsArgs<ExtArgs> = {}>(args?: Subset<T, Candidate$scorecardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    offer<T extends Candidate$offerArgs<ExtArgs> = {}>(args?: Subset<T, Candidate$offerArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Candidate model
   */
  interface CandidateFieldRefs {
    readonly id: FieldRef<"Candidate", 'String'>
    readonly vacancyId: FieldRef<"Candidate", 'String'>
    readonly name: FieldRef<"Candidate", 'String'>
    readonly email: FieldRef<"Candidate", 'String'>
    readonly phone: FieldRef<"Candidate", 'String'>
    readonly yearsExperience: FieldRef<"Candidate", 'Float'>
    readonly expectedSalary: FieldRef<"Candidate", 'Float'>
    readonly rawCv: FieldRef<"Candidate", 'String'>
    readonly portfolioUrl: FieldRef<"Candidate", 'String'>
    readonly portfolioTitle: FieldRef<"Candidate", 'String'>
    readonly portfolioImage: FieldRef<"Candidate", 'String'>
    readonly portfolioDesc: FieldRef<"Candidate", 'String'>
    readonly compositeScore: FieldRef<"Candidate", 'Float'>
    readonly status: FieldRef<"Candidate", 'String'>
    readonly createdAt: FieldRef<"Candidate", 'DateTime'>
    readonly updatedAt: FieldRef<"Candidate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Candidate findUnique
   */
  export type CandidateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate findUniqueOrThrow
   */
  export type CandidateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate findFirst
   */
  export type CandidateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Candidates.
     */
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate findFirstOrThrow
   */
  export type CandidateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Candidates.
     */
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate findMany
   */
  export type CandidateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidates to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate create
   */
  export type CandidateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The data needed to create a Candidate.
     */
    data: XOR<CandidateCreateInput, CandidateUncheckedCreateInput>
  }

  /**
   * Candidate createMany
   */
  export type CandidateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Candidates.
     */
    data: CandidateCreateManyInput | CandidateCreateManyInput[]
  }

  /**
   * Candidate createManyAndReturn
   */
  export type CandidateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * The data used to create many Candidates.
     */
    data: CandidateCreateManyInput | CandidateCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Candidate update
   */
  export type CandidateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The data needed to update a Candidate.
     */
    data: XOR<CandidateUpdateInput, CandidateUncheckedUpdateInput>
    /**
     * Choose, which Candidate to update.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate updateMany
   */
  export type CandidateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Candidates.
     */
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyInput>
    /**
     * Filter which Candidates to update
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to update.
     */
    limit?: number
  }

  /**
   * Candidate updateManyAndReturn
   */
  export type CandidateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * The data used to update Candidates.
     */
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyInput>
    /**
     * Filter which Candidates to update
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Candidate upsert
   */
  export type CandidateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The filter to search for the Candidate to update in case it exists.
     */
    where: CandidateWhereUniqueInput
    /**
     * In case the Candidate found by the `where` argument doesn't exist, create a new Candidate with this data.
     */
    create: XOR<CandidateCreateInput, CandidateUncheckedCreateInput>
    /**
     * In case the Candidate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CandidateUpdateInput, CandidateUncheckedUpdateInput>
  }

  /**
   * Candidate delete
   */
  export type CandidateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter which Candidate to delete.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate deleteMany
   */
  export type CandidateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Candidates to delete
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to delete.
     */
    limit?: number
  }

  /**
   * Candidate.scorecards
   */
  export type Candidate$scorecardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    where?: ScorecardWhereInput
    orderBy?: ScorecardOrderByWithRelationInput | ScorecardOrderByWithRelationInput[]
    cursor?: ScorecardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScorecardScalarFieldEnum | ScorecardScalarFieldEnum[]
  }

  /**
   * Candidate.offer
   */
  export type Candidate$offerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    where?: OfferWhereInput
  }

  /**
   * Candidate without action
   */
  export type CandidateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
  }


  /**
   * Model Scorecard
   */

  export type AggregateScorecard = {
    _count: ScorecardCountAggregateOutputType | null
    _min: ScorecardMinAggregateOutputType | null
    _max: ScorecardMaxAggregateOutputType | null
  }

  export type ScorecardMinAggregateOutputType = {
    id: string | null
    candidateId: string | null
    managerName: string | null
    submittedAt: Date | null
  }

  export type ScorecardMaxAggregateOutputType = {
    id: string | null
    candidateId: string | null
    managerName: string | null
    submittedAt: Date | null
  }

  export type ScorecardCountAggregateOutputType = {
    id: number
    candidateId: number
    managerName: number
    submittedAt: number
    _all: number
  }


  export type ScorecardMinAggregateInputType = {
    id?: true
    candidateId?: true
    managerName?: true
    submittedAt?: true
  }

  export type ScorecardMaxAggregateInputType = {
    id?: true
    candidateId?: true
    managerName?: true
    submittedAt?: true
  }

  export type ScorecardCountAggregateInputType = {
    id?: true
    candidateId?: true
    managerName?: true
    submittedAt?: true
    _all?: true
  }

  export type ScorecardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Scorecard to aggregate.
     */
    where?: ScorecardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scorecards to fetch.
     */
    orderBy?: ScorecardOrderByWithRelationInput | ScorecardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScorecardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scorecards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scorecards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Scorecards
    **/
    _count?: true | ScorecardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScorecardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScorecardMaxAggregateInputType
  }

  export type GetScorecardAggregateType<T extends ScorecardAggregateArgs> = {
        [P in keyof T & keyof AggregateScorecard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScorecard[P]>
      : GetScalarType<T[P], AggregateScorecard[P]>
  }




  export type ScorecardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScorecardWhereInput
    orderBy?: ScorecardOrderByWithAggregationInput | ScorecardOrderByWithAggregationInput[]
    by: ScorecardScalarFieldEnum[] | ScorecardScalarFieldEnum
    having?: ScorecardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScorecardCountAggregateInputType | true
    _min?: ScorecardMinAggregateInputType
    _max?: ScorecardMaxAggregateInputType
  }

  export type ScorecardGroupByOutputType = {
    id: string
    candidateId: string
    managerName: string
    submittedAt: Date
    _count: ScorecardCountAggregateOutputType | null
    _min: ScorecardMinAggregateOutputType | null
    _max: ScorecardMaxAggregateOutputType | null
  }

  type GetScorecardGroupByPayload<T extends ScorecardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScorecardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScorecardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScorecardGroupByOutputType[P]>
            : GetScalarType<T[P], ScorecardGroupByOutputType[P]>
        }
      >
    >


  export type ScorecardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateId?: boolean
    managerName?: boolean
    submittedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
    scores?: boolean | Scorecard$scoresArgs<ExtArgs>
    _count?: boolean | ScorecardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["scorecard"]>

  export type ScorecardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateId?: boolean
    managerName?: boolean
    submittedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["scorecard"]>

  export type ScorecardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateId?: boolean
    managerName?: boolean
    submittedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["scorecard"]>

  export type ScorecardSelectScalar = {
    id?: boolean
    candidateId?: boolean
    managerName?: boolean
    submittedAt?: boolean
  }

  export type ScorecardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "candidateId" | "managerName" | "submittedAt", ExtArgs["result"]["scorecard"]>
  export type ScorecardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
    scores?: boolean | Scorecard$scoresArgs<ExtArgs>
    _count?: boolean | ScorecardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ScorecardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }
  export type ScorecardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }

  export type $ScorecardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Scorecard"
    objects: {
      candidate: Prisma.$CandidatePayload<ExtArgs>
      scores: Prisma.$ScorePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      candidateId: string
      managerName: string
      submittedAt: Date
    }, ExtArgs["result"]["scorecard"]>
    composites: {}
  }

  type ScorecardGetPayload<S extends boolean | null | undefined | ScorecardDefaultArgs> = $Result.GetResult<Prisma.$ScorecardPayload, S>

  type ScorecardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScorecardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScorecardCountAggregateInputType | true
    }

  export interface ScorecardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Scorecard'], meta: { name: 'Scorecard' } }
    /**
     * Find zero or one Scorecard that matches the filter.
     * @param {ScorecardFindUniqueArgs} args - Arguments to find a Scorecard
     * @example
     * // Get one Scorecard
     * const scorecard = await prisma.scorecard.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScorecardFindUniqueArgs>(args: SelectSubset<T, ScorecardFindUniqueArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Scorecard that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScorecardFindUniqueOrThrowArgs} args - Arguments to find a Scorecard
     * @example
     * // Get one Scorecard
     * const scorecard = await prisma.scorecard.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScorecardFindUniqueOrThrowArgs>(args: SelectSubset<T, ScorecardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Scorecard that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardFindFirstArgs} args - Arguments to find a Scorecard
     * @example
     * // Get one Scorecard
     * const scorecard = await prisma.scorecard.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScorecardFindFirstArgs>(args?: SelectSubset<T, ScorecardFindFirstArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Scorecard that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardFindFirstOrThrowArgs} args - Arguments to find a Scorecard
     * @example
     * // Get one Scorecard
     * const scorecard = await prisma.scorecard.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScorecardFindFirstOrThrowArgs>(args?: SelectSubset<T, ScorecardFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Scorecards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Scorecards
     * const scorecards = await prisma.scorecard.findMany()
     * 
     * // Get first 10 Scorecards
     * const scorecards = await prisma.scorecard.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scorecardWithIdOnly = await prisma.scorecard.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScorecardFindManyArgs>(args?: SelectSubset<T, ScorecardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Scorecard.
     * @param {ScorecardCreateArgs} args - Arguments to create a Scorecard.
     * @example
     * // Create one Scorecard
     * const Scorecard = await prisma.scorecard.create({
     *   data: {
     *     // ... data to create a Scorecard
     *   }
     * })
     * 
     */
    create<T extends ScorecardCreateArgs>(args: SelectSubset<T, ScorecardCreateArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Scorecards.
     * @param {ScorecardCreateManyArgs} args - Arguments to create many Scorecards.
     * @example
     * // Create many Scorecards
     * const scorecard = await prisma.scorecard.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScorecardCreateManyArgs>(args?: SelectSubset<T, ScorecardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Scorecards and returns the data saved in the database.
     * @param {ScorecardCreateManyAndReturnArgs} args - Arguments to create many Scorecards.
     * @example
     * // Create many Scorecards
     * const scorecard = await prisma.scorecard.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Scorecards and only return the `id`
     * const scorecardWithIdOnly = await prisma.scorecard.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScorecardCreateManyAndReturnArgs>(args?: SelectSubset<T, ScorecardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Scorecard.
     * @param {ScorecardDeleteArgs} args - Arguments to delete one Scorecard.
     * @example
     * // Delete one Scorecard
     * const Scorecard = await prisma.scorecard.delete({
     *   where: {
     *     // ... filter to delete one Scorecard
     *   }
     * })
     * 
     */
    delete<T extends ScorecardDeleteArgs>(args: SelectSubset<T, ScorecardDeleteArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Scorecard.
     * @param {ScorecardUpdateArgs} args - Arguments to update one Scorecard.
     * @example
     * // Update one Scorecard
     * const scorecard = await prisma.scorecard.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScorecardUpdateArgs>(args: SelectSubset<T, ScorecardUpdateArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Scorecards.
     * @param {ScorecardDeleteManyArgs} args - Arguments to filter Scorecards to delete.
     * @example
     * // Delete a few Scorecards
     * const { count } = await prisma.scorecard.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScorecardDeleteManyArgs>(args?: SelectSubset<T, ScorecardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Scorecards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Scorecards
     * const scorecard = await prisma.scorecard.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScorecardUpdateManyArgs>(args: SelectSubset<T, ScorecardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Scorecards and returns the data updated in the database.
     * @param {ScorecardUpdateManyAndReturnArgs} args - Arguments to update many Scorecards.
     * @example
     * // Update many Scorecards
     * const scorecard = await prisma.scorecard.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Scorecards and only return the `id`
     * const scorecardWithIdOnly = await prisma.scorecard.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScorecardUpdateManyAndReturnArgs>(args: SelectSubset<T, ScorecardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Scorecard.
     * @param {ScorecardUpsertArgs} args - Arguments to update or create a Scorecard.
     * @example
     * // Update or create a Scorecard
     * const scorecard = await prisma.scorecard.upsert({
     *   create: {
     *     // ... data to create a Scorecard
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Scorecard we want to update
     *   }
     * })
     */
    upsert<T extends ScorecardUpsertArgs>(args: SelectSubset<T, ScorecardUpsertArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Scorecards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardCountArgs} args - Arguments to filter Scorecards to count.
     * @example
     * // Count the number of Scorecards
     * const count = await prisma.scorecard.count({
     *   where: {
     *     // ... the filter for the Scorecards we want to count
     *   }
     * })
    **/
    count<T extends ScorecardCountArgs>(
      args?: Subset<T, ScorecardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScorecardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Scorecard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScorecardAggregateArgs>(args: Subset<T, ScorecardAggregateArgs>): Prisma.PrismaPromise<GetScorecardAggregateType<T>>

    /**
     * Group by Scorecard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScorecardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScorecardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScorecardGroupByArgs['orderBy'] }
        : { orderBy?: ScorecardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScorecardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScorecardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Scorecard model
   */
  readonly fields: ScorecardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Scorecard.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScorecardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    candidate<T extends CandidateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CandidateDefaultArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    scores<T extends Scorecard$scoresArgs<ExtArgs> = {}>(args?: Subset<T, Scorecard$scoresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Scorecard model
   */
  interface ScorecardFieldRefs {
    readonly id: FieldRef<"Scorecard", 'String'>
    readonly candidateId: FieldRef<"Scorecard", 'String'>
    readonly managerName: FieldRef<"Scorecard", 'String'>
    readonly submittedAt: FieldRef<"Scorecard", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Scorecard findUnique
   */
  export type ScorecardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * Filter, which Scorecard to fetch.
     */
    where: ScorecardWhereUniqueInput
  }

  /**
   * Scorecard findUniqueOrThrow
   */
  export type ScorecardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * Filter, which Scorecard to fetch.
     */
    where: ScorecardWhereUniqueInput
  }

  /**
   * Scorecard findFirst
   */
  export type ScorecardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * Filter, which Scorecard to fetch.
     */
    where?: ScorecardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scorecards to fetch.
     */
    orderBy?: ScorecardOrderByWithRelationInput | ScorecardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Scorecards.
     */
    cursor?: ScorecardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scorecards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scorecards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Scorecards.
     */
    distinct?: ScorecardScalarFieldEnum | ScorecardScalarFieldEnum[]
  }

  /**
   * Scorecard findFirstOrThrow
   */
  export type ScorecardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * Filter, which Scorecard to fetch.
     */
    where?: ScorecardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scorecards to fetch.
     */
    orderBy?: ScorecardOrderByWithRelationInput | ScorecardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Scorecards.
     */
    cursor?: ScorecardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scorecards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scorecards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Scorecards.
     */
    distinct?: ScorecardScalarFieldEnum | ScorecardScalarFieldEnum[]
  }

  /**
   * Scorecard findMany
   */
  export type ScorecardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * Filter, which Scorecards to fetch.
     */
    where?: ScorecardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scorecards to fetch.
     */
    orderBy?: ScorecardOrderByWithRelationInput | ScorecardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Scorecards.
     */
    cursor?: ScorecardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scorecards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scorecards.
     */
    skip?: number
    distinct?: ScorecardScalarFieldEnum | ScorecardScalarFieldEnum[]
  }

  /**
   * Scorecard create
   */
  export type ScorecardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * The data needed to create a Scorecard.
     */
    data: XOR<ScorecardCreateInput, ScorecardUncheckedCreateInput>
  }

  /**
   * Scorecard createMany
   */
  export type ScorecardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Scorecards.
     */
    data: ScorecardCreateManyInput | ScorecardCreateManyInput[]
  }

  /**
   * Scorecard createManyAndReturn
   */
  export type ScorecardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * The data used to create many Scorecards.
     */
    data: ScorecardCreateManyInput | ScorecardCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Scorecard update
   */
  export type ScorecardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * The data needed to update a Scorecard.
     */
    data: XOR<ScorecardUpdateInput, ScorecardUncheckedUpdateInput>
    /**
     * Choose, which Scorecard to update.
     */
    where: ScorecardWhereUniqueInput
  }

  /**
   * Scorecard updateMany
   */
  export type ScorecardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Scorecards.
     */
    data: XOR<ScorecardUpdateManyMutationInput, ScorecardUncheckedUpdateManyInput>
    /**
     * Filter which Scorecards to update
     */
    where?: ScorecardWhereInput
    /**
     * Limit how many Scorecards to update.
     */
    limit?: number
  }

  /**
   * Scorecard updateManyAndReturn
   */
  export type ScorecardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * The data used to update Scorecards.
     */
    data: XOR<ScorecardUpdateManyMutationInput, ScorecardUncheckedUpdateManyInput>
    /**
     * Filter which Scorecards to update
     */
    where?: ScorecardWhereInput
    /**
     * Limit how many Scorecards to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Scorecard upsert
   */
  export type ScorecardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * The filter to search for the Scorecard to update in case it exists.
     */
    where: ScorecardWhereUniqueInput
    /**
     * In case the Scorecard found by the `where` argument doesn't exist, create a new Scorecard with this data.
     */
    create: XOR<ScorecardCreateInput, ScorecardUncheckedCreateInput>
    /**
     * In case the Scorecard was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScorecardUpdateInput, ScorecardUncheckedUpdateInput>
  }

  /**
   * Scorecard delete
   */
  export type ScorecardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
    /**
     * Filter which Scorecard to delete.
     */
    where: ScorecardWhereUniqueInput
  }

  /**
   * Scorecard deleteMany
   */
  export type ScorecardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Scorecards to delete
     */
    where?: ScorecardWhereInput
    /**
     * Limit how many Scorecards to delete.
     */
    limit?: number
  }

  /**
   * Scorecard.scores
   */
  export type Scorecard$scoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    where?: ScoreWhereInput
    orderBy?: ScoreOrderByWithRelationInput | ScoreOrderByWithRelationInput[]
    cursor?: ScoreWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScoreScalarFieldEnum | ScoreScalarFieldEnum[]
  }

  /**
   * Scorecard without action
   */
  export type ScorecardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scorecard
     */
    select?: ScorecardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scorecard
     */
    omit?: ScorecardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScorecardInclude<ExtArgs> | null
  }


  /**
   * Model Score
   */

  export type AggregateScore = {
    _count: ScoreCountAggregateOutputType | null
    _avg: ScoreAvgAggregateOutputType | null
    _sum: ScoreSumAggregateOutputType | null
    _min: ScoreMinAggregateOutputType | null
    _max: ScoreMaxAggregateOutputType | null
  }

  export type ScoreAvgAggregateOutputType = {
    value: number | null
  }

  export type ScoreSumAggregateOutputType = {
    value: number | null
  }

  export type ScoreMinAggregateOutputType = {
    id: string | null
    scorecardId: string | null
    competencyId: string | null
    value: number | null
    notes: string | null
  }

  export type ScoreMaxAggregateOutputType = {
    id: string | null
    scorecardId: string | null
    competencyId: string | null
    value: number | null
    notes: string | null
  }

  export type ScoreCountAggregateOutputType = {
    id: number
    scorecardId: number
    competencyId: number
    value: number
    notes: number
    _all: number
  }


  export type ScoreAvgAggregateInputType = {
    value?: true
  }

  export type ScoreSumAggregateInputType = {
    value?: true
  }

  export type ScoreMinAggregateInputType = {
    id?: true
    scorecardId?: true
    competencyId?: true
    value?: true
    notes?: true
  }

  export type ScoreMaxAggregateInputType = {
    id?: true
    scorecardId?: true
    competencyId?: true
    value?: true
    notes?: true
  }

  export type ScoreCountAggregateInputType = {
    id?: true
    scorecardId?: true
    competencyId?: true
    value?: true
    notes?: true
    _all?: true
  }

  export type ScoreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Score to aggregate.
     */
    where?: ScoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scores to fetch.
     */
    orderBy?: ScoreOrderByWithRelationInput | ScoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Scores
    **/
    _count?: true | ScoreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ScoreAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ScoreSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScoreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScoreMaxAggregateInputType
  }

  export type GetScoreAggregateType<T extends ScoreAggregateArgs> = {
        [P in keyof T & keyof AggregateScore]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScore[P]>
      : GetScalarType<T[P], AggregateScore[P]>
  }




  export type ScoreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScoreWhereInput
    orderBy?: ScoreOrderByWithAggregationInput | ScoreOrderByWithAggregationInput[]
    by: ScoreScalarFieldEnum[] | ScoreScalarFieldEnum
    having?: ScoreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScoreCountAggregateInputType | true
    _avg?: ScoreAvgAggregateInputType
    _sum?: ScoreSumAggregateInputType
    _min?: ScoreMinAggregateInputType
    _max?: ScoreMaxAggregateInputType
  }

  export type ScoreGroupByOutputType = {
    id: string
    scorecardId: string
    competencyId: string
    value: number
    notes: string | null
    _count: ScoreCountAggregateOutputType | null
    _avg: ScoreAvgAggregateOutputType | null
    _sum: ScoreSumAggregateOutputType | null
    _min: ScoreMinAggregateOutputType | null
    _max: ScoreMaxAggregateOutputType | null
  }

  type GetScoreGroupByPayload<T extends ScoreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScoreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScoreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScoreGroupByOutputType[P]>
            : GetScalarType<T[P], ScoreGroupByOutputType[P]>
        }
      >
    >


  export type ScoreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scorecardId?: boolean
    competencyId?: boolean
    value?: boolean
    notes?: boolean
    scorecard?: boolean | ScorecardDefaultArgs<ExtArgs>
    competency?: boolean | CompetencyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["score"]>

  export type ScoreSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scorecardId?: boolean
    competencyId?: boolean
    value?: boolean
    notes?: boolean
    scorecard?: boolean | ScorecardDefaultArgs<ExtArgs>
    competency?: boolean | CompetencyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["score"]>

  export type ScoreSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scorecardId?: boolean
    competencyId?: boolean
    value?: boolean
    notes?: boolean
    scorecard?: boolean | ScorecardDefaultArgs<ExtArgs>
    competency?: boolean | CompetencyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["score"]>

  export type ScoreSelectScalar = {
    id?: boolean
    scorecardId?: boolean
    competencyId?: boolean
    value?: boolean
    notes?: boolean
  }

  export type ScoreOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "scorecardId" | "competencyId" | "value" | "notes", ExtArgs["result"]["score"]>
  export type ScoreInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scorecard?: boolean | ScorecardDefaultArgs<ExtArgs>
    competency?: boolean | CompetencyDefaultArgs<ExtArgs>
  }
  export type ScoreIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scorecard?: boolean | ScorecardDefaultArgs<ExtArgs>
    competency?: boolean | CompetencyDefaultArgs<ExtArgs>
  }
  export type ScoreIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scorecard?: boolean | ScorecardDefaultArgs<ExtArgs>
    competency?: boolean | CompetencyDefaultArgs<ExtArgs>
  }

  export type $ScorePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Score"
    objects: {
      scorecard: Prisma.$ScorecardPayload<ExtArgs>
      competency: Prisma.$CompetencyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      scorecardId: string
      competencyId: string
      value: number
      notes: string | null
    }, ExtArgs["result"]["score"]>
    composites: {}
  }

  type ScoreGetPayload<S extends boolean | null | undefined | ScoreDefaultArgs> = $Result.GetResult<Prisma.$ScorePayload, S>

  type ScoreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScoreFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScoreCountAggregateInputType | true
    }

  export interface ScoreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Score'], meta: { name: 'Score' } }
    /**
     * Find zero or one Score that matches the filter.
     * @param {ScoreFindUniqueArgs} args - Arguments to find a Score
     * @example
     * // Get one Score
     * const score = await prisma.score.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScoreFindUniqueArgs>(args: SelectSubset<T, ScoreFindUniqueArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Score that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScoreFindUniqueOrThrowArgs} args - Arguments to find a Score
     * @example
     * // Get one Score
     * const score = await prisma.score.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScoreFindUniqueOrThrowArgs>(args: SelectSubset<T, ScoreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Score that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreFindFirstArgs} args - Arguments to find a Score
     * @example
     * // Get one Score
     * const score = await prisma.score.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScoreFindFirstArgs>(args?: SelectSubset<T, ScoreFindFirstArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Score that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreFindFirstOrThrowArgs} args - Arguments to find a Score
     * @example
     * // Get one Score
     * const score = await prisma.score.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScoreFindFirstOrThrowArgs>(args?: SelectSubset<T, ScoreFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Scores that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Scores
     * const scores = await prisma.score.findMany()
     * 
     * // Get first 10 Scores
     * const scores = await prisma.score.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scoreWithIdOnly = await prisma.score.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScoreFindManyArgs>(args?: SelectSubset<T, ScoreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Score.
     * @param {ScoreCreateArgs} args - Arguments to create a Score.
     * @example
     * // Create one Score
     * const Score = await prisma.score.create({
     *   data: {
     *     // ... data to create a Score
     *   }
     * })
     * 
     */
    create<T extends ScoreCreateArgs>(args: SelectSubset<T, ScoreCreateArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Scores.
     * @param {ScoreCreateManyArgs} args - Arguments to create many Scores.
     * @example
     * // Create many Scores
     * const score = await prisma.score.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScoreCreateManyArgs>(args?: SelectSubset<T, ScoreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Scores and returns the data saved in the database.
     * @param {ScoreCreateManyAndReturnArgs} args - Arguments to create many Scores.
     * @example
     * // Create many Scores
     * const score = await prisma.score.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Scores and only return the `id`
     * const scoreWithIdOnly = await prisma.score.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScoreCreateManyAndReturnArgs>(args?: SelectSubset<T, ScoreCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Score.
     * @param {ScoreDeleteArgs} args - Arguments to delete one Score.
     * @example
     * // Delete one Score
     * const Score = await prisma.score.delete({
     *   where: {
     *     // ... filter to delete one Score
     *   }
     * })
     * 
     */
    delete<T extends ScoreDeleteArgs>(args: SelectSubset<T, ScoreDeleteArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Score.
     * @param {ScoreUpdateArgs} args - Arguments to update one Score.
     * @example
     * // Update one Score
     * const score = await prisma.score.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScoreUpdateArgs>(args: SelectSubset<T, ScoreUpdateArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Scores.
     * @param {ScoreDeleteManyArgs} args - Arguments to filter Scores to delete.
     * @example
     * // Delete a few Scores
     * const { count } = await prisma.score.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScoreDeleteManyArgs>(args?: SelectSubset<T, ScoreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Scores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Scores
     * const score = await prisma.score.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScoreUpdateManyArgs>(args: SelectSubset<T, ScoreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Scores and returns the data updated in the database.
     * @param {ScoreUpdateManyAndReturnArgs} args - Arguments to update many Scores.
     * @example
     * // Update many Scores
     * const score = await prisma.score.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Scores and only return the `id`
     * const scoreWithIdOnly = await prisma.score.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScoreUpdateManyAndReturnArgs>(args: SelectSubset<T, ScoreUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Score.
     * @param {ScoreUpsertArgs} args - Arguments to update or create a Score.
     * @example
     * // Update or create a Score
     * const score = await prisma.score.upsert({
     *   create: {
     *     // ... data to create a Score
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Score we want to update
     *   }
     * })
     */
    upsert<T extends ScoreUpsertArgs>(args: SelectSubset<T, ScoreUpsertArgs<ExtArgs>>): Prisma__ScoreClient<$Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Scores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreCountArgs} args - Arguments to filter Scores to count.
     * @example
     * // Count the number of Scores
     * const count = await prisma.score.count({
     *   where: {
     *     // ... the filter for the Scores we want to count
     *   }
     * })
    **/
    count<T extends ScoreCountArgs>(
      args?: Subset<T, ScoreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScoreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Score.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScoreAggregateArgs>(args: Subset<T, ScoreAggregateArgs>): Prisma.PrismaPromise<GetScoreAggregateType<T>>

    /**
     * Group by Score.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScoreGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScoreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScoreGroupByArgs['orderBy'] }
        : { orderBy?: ScoreGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScoreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScoreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Score model
   */
  readonly fields: ScoreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Score.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScoreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    scorecard<T extends ScorecardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ScorecardDefaultArgs<ExtArgs>>): Prisma__ScorecardClient<$Result.GetResult<Prisma.$ScorecardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    competency<T extends CompetencyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompetencyDefaultArgs<ExtArgs>>): Prisma__CompetencyClient<$Result.GetResult<Prisma.$CompetencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Score model
   */
  interface ScoreFieldRefs {
    readonly id: FieldRef<"Score", 'String'>
    readonly scorecardId: FieldRef<"Score", 'String'>
    readonly competencyId: FieldRef<"Score", 'String'>
    readonly value: FieldRef<"Score", 'Int'>
    readonly notes: FieldRef<"Score", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Score findUnique
   */
  export type ScoreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * Filter, which Score to fetch.
     */
    where: ScoreWhereUniqueInput
  }

  /**
   * Score findUniqueOrThrow
   */
  export type ScoreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * Filter, which Score to fetch.
     */
    where: ScoreWhereUniqueInput
  }

  /**
   * Score findFirst
   */
  export type ScoreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * Filter, which Score to fetch.
     */
    where?: ScoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scores to fetch.
     */
    orderBy?: ScoreOrderByWithRelationInput | ScoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Scores.
     */
    cursor?: ScoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Scores.
     */
    distinct?: ScoreScalarFieldEnum | ScoreScalarFieldEnum[]
  }

  /**
   * Score findFirstOrThrow
   */
  export type ScoreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * Filter, which Score to fetch.
     */
    where?: ScoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scores to fetch.
     */
    orderBy?: ScoreOrderByWithRelationInput | ScoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Scores.
     */
    cursor?: ScoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Scores.
     */
    distinct?: ScoreScalarFieldEnum | ScoreScalarFieldEnum[]
  }

  /**
   * Score findMany
   */
  export type ScoreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * Filter, which Scores to fetch.
     */
    where?: ScoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scores to fetch.
     */
    orderBy?: ScoreOrderByWithRelationInput | ScoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Scores.
     */
    cursor?: ScoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scores.
     */
    skip?: number
    distinct?: ScoreScalarFieldEnum | ScoreScalarFieldEnum[]
  }

  /**
   * Score create
   */
  export type ScoreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * The data needed to create a Score.
     */
    data: XOR<ScoreCreateInput, ScoreUncheckedCreateInput>
  }

  /**
   * Score createMany
   */
  export type ScoreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Scores.
     */
    data: ScoreCreateManyInput | ScoreCreateManyInput[]
  }

  /**
   * Score createManyAndReturn
   */
  export type ScoreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * The data used to create many Scores.
     */
    data: ScoreCreateManyInput | ScoreCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Score update
   */
  export type ScoreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * The data needed to update a Score.
     */
    data: XOR<ScoreUpdateInput, ScoreUncheckedUpdateInput>
    /**
     * Choose, which Score to update.
     */
    where: ScoreWhereUniqueInput
  }

  /**
   * Score updateMany
   */
  export type ScoreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Scores.
     */
    data: XOR<ScoreUpdateManyMutationInput, ScoreUncheckedUpdateManyInput>
    /**
     * Filter which Scores to update
     */
    where?: ScoreWhereInput
    /**
     * Limit how many Scores to update.
     */
    limit?: number
  }

  /**
   * Score updateManyAndReturn
   */
  export type ScoreUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * The data used to update Scores.
     */
    data: XOR<ScoreUpdateManyMutationInput, ScoreUncheckedUpdateManyInput>
    /**
     * Filter which Scores to update
     */
    where?: ScoreWhereInput
    /**
     * Limit how many Scores to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Score upsert
   */
  export type ScoreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * The filter to search for the Score to update in case it exists.
     */
    where: ScoreWhereUniqueInput
    /**
     * In case the Score found by the `where` argument doesn't exist, create a new Score with this data.
     */
    create: XOR<ScoreCreateInput, ScoreUncheckedCreateInput>
    /**
     * In case the Score was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScoreUpdateInput, ScoreUncheckedUpdateInput>
  }

  /**
   * Score delete
   */
  export type ScoreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
    /**
     * Filter which Score to delete.
     */
    where: ScoreWhereUniqueInput
  }

  /**
   * Score deleteMany
   */
  export type ScoreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Scores to delete
     */
    where?: ScoreWhereInput
    /**
     * Limit how many Scores to delete.
     */
    limit?: number
  }

  /**
   * Score without action
   */
  export type ScoreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: ScoreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Score
     */
    omit?: ScoreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScoreInclude<ExtArgs> | null
  }


  /**
   * Model Offer
   */

  export type AggregateOffer = {
    _count: OfferCountAggregateOutputType | null
    _avg: OfferAvgAggregateOutputType | null
    _sum: OfferSumAggregateOutputType | null
    _min: OfferMinAggregateOutputType | null
    _max: OfferMaxAggregateOutputType | null
  }

  export type OfferAvgAggregateOutputType = {
    offeredSalary: number | null
  }

  export type OfferSumAggregateOutputType = {
    offeredSalary: number | null
  }

  export type OfferMinAggregateOutputType = {
    id: string | null
    candidateId: string | null
    offeredSalary: number | null
    firstWorkingDate: string | null
    contractType: string | null
    itEquipment: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OfferMaxAggregateOutputType = {
    id: string | null
    candidateId: string | null
    offeredSalary: number | null
    firstWorkingDate: string | null
    contractType: string | null
    itEquipment: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OfferCountAggregateOutputType = {
    id: number
    candidateId: number
    offeredSalary: number
    firstWorkingDate: number
    contractType: number
    itEquipment: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OfferAvgAggregateInputType = {
    offeredSalary?: true
  }

  export type OfferSumAggregateInputType = {
    offeredSalary?: true
  }

  export type OfferMinAggregateInputType = {
    id?: true
    candidateId?: true
    offeredSalary?: true
    firstWorkingDate?: true
    contractType?: true
    itEquipment?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OfferMaxAggregateInputType = {
    id?: true
    candidateId?: true
    offeredSalary?: true
    firstWorkingDate?: true
    contractType?: true
    itEquipment?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OfferCountAggregateInputType = {
    id?: true
    candidateId?: true
    offeredSalary?: true
    firstWorkingDate?: true
    contractType?: true
    itEquipment?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OfferAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Offer to aggregate.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Offers
    **/
    _count?: true | OfferCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OfferAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OfferSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OfferMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OfferMaxAggregateInputType
  }

  export type GetOfferAggregateType<T extends OfferAggregateArgs> = {
        [P in keyof T & keyof AggregateOffer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOffer[P]>
      : GetScalarType<T[P], AggregateOffer[P]>
  }




  export type OfferGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OfferWhereInput
    orderBy?: OfferOrderByWithAggregationInput | OfferOrderByWithAggregationInput[]
    by: OfferScalarFieldEnum[] | OfferScalarFieldEnum
    having?: OfferScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OfferCountAggregateInputType | true
    _avg?: OfferAvgAggregateInputType
    _sum?: OfferSumAggregateInputType
    _min?: OfferMinAggregateInputType
    _max?: OfferMaxAggregateInputType
  }

  export type OfferGroupByOutputType = {
    id: string
    candidateId: string
    offeredSalary: number
    firstWorkingDate: string
    contractType: string
    itEquipment: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    _count: OfferCountAggregateOutputType | null
    _avg: OfferAvgAggregateOutputType | null
    _sum: OfferSumAggregateOutputType | null
    _min: OfferMinAggregateOutputType | null
    _max: OfferMaxAggregateOutputType | null
  }

  type GetOfferGroupByPayload<T extends OfferGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OfferGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OfferGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OfferGroupByOutputType[P]>
            : GetScalarType<T[P], OfferGroupByOutputType[P]>
        }
      >
    >


  export type OfferSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateId?: boolean
    offeredSalary?: boolean
    firstWorkingDate?: boolean
    contractType?: boolean
    itEquipment?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["offer"]>

  export type OfferSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateId?: boolean
    offeredSalary?: boolean
    firstWorkingDate?: boolean
    contractType?: boolean
    itEquipment?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["offer"]>

  export type OfferSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateId?: boolean
    offeredSalary?: boolean
    firstWorkingDate?: boolean
    contractType?: boolean
    itEquipment?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["offer"]>

  export type OfferSelectScalar = {
    id?: boolean
    candidateId?: boolean
    offeredSalary?: boolean
    firstWorkingDate?: boolean
    contractType?: boolean
    itEquipment?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OfferOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "candidateId" | "offeredSalary" | "firstWorkingDate" | "contractType" | "itEquipment" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["offer"]>
  export type OfferInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }
  export type OfferIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }
  export type OfferIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }

  export type $OfferPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Offer"
    objects: {
      candidate: Prisma.$CandidatePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      candidateId: string
      offeredSalary: number
      firstWorkingDate: string
      contractType: string
      itEquipment: string | null
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["offer"]>
    composites: {}
  }

  type OfferGetPayload<S extends boolean | null | undefined | OfferDefaultArgs> = $Result.GetResult<Prisma.$OfferPayload, S>

  type OfferCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OfferFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OfferCountAggregateInputType | true
    }

  export interface OfferDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Offer'], meta: { name: 'Offer' } }
    /**
     * Find zero or one Offer that matches the filter.
     * @param {OfferFindUniqueArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OfferFindUniqueArgs>(args: SelectSubset<T, OfferFindUniqueArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Offer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OfferFindUniqueOrThrowArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OfferFindUniqueOrThrowArgs>(args: SelectSubset<T, OfferFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Offer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferFindFirstArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OfferFindFirstArgs>(args?: SelectSubset<T, OfferFindFirstArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Offer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferFindFirstOrThrowArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OfferFindFirstOrThrowArgs>(args?: SelectSubset<T, OfferFindFirstOrThrowArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Offers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Offers
     * const offers = await prisma.offer.findMany()
     * 
     * // Get first 10 Offers
     * const offers = await prisma.offer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const offerWithIdOnly = await prisma.offer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OfferFindManyArgs>(args?: SelectSubset<T, OfferFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Offer.
     * @param {OfferCreateArgs} args - Arguments to create a Offer.
     * @example
     * // Create one Offer
     * const Offer = await prisma.offer.create({
     *   data: {
     *     // ... data to create a Offer
     *   }
     * })
     * 
     */
    create<T extends OfferCreateArgs>(args: SelectSubset<T, OfferCreateArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Offers.
     * @param {OfferCreateManyArgs} args - Arguments to create many Offers.
     * @example
     * // Create many Offers
     * const offer = await prisma.offer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OfferCreateManyArgs>(args?: SelectSubset<T, OfferCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Offers and returns the data saved in the database.
     * @param {OfferCreateManyAndReturnArgs} args - Arguments to create many Offers.
     * @example
     * // Create many Offers
     * const offer = await prisma.offer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Offers and only return the `id`
     * const offerWithIdOnly = await prisma.offer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OfferCreateManyAndReturnArgs>(args?: SelectSubset<T, OfferCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Offer.
     * @param {OfferDeleteArgs} args - Arguments to delete one Offer.
     * @example
     * // Delete one Offer
     * const Offer = await prisma.offer.delete({
     *   where: {
     *     // ... filter to delete one Offer
     *   }
     * })
     * 
     */
    delete<T extends OfferDeleteArgs>(args: SelectSubset<T, OfferDeleteArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Offer.
     * @param {OfferUpdateArgs} args - Arguments to update one Offer.
     * @example
     * // Update one Offer
     * const offer = await prisma.offer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OfferUpdateArgs>(args: SelectSubset<T, OfferUpdateArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Offers.
     * @param {OfferDeleteManyArgs} args - Arguments to filter Offers to delete.
     * @example
     * // Delete a few Offers
     * const { count } = await prisma.offer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OfferDeleteManyArgs>(args?: SelectSubset<T, OfferDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Offers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Offers
     * const offer = await prisma.offer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OfferUpdateManyArgs>(args: SelectSubset<T, OfferUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Offers and returns the data updated in the database.
     * @param {OfferUpdateManyAndReturnArgs} args - Arguments to update many Offers.
     * @example
     * // Update many Offers
     * const offer = await prisma.offer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Offers and only return the `id`
     * const offerWithIdOnly = await prisma.offer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OfferUpdateManyAndReturnArgs>(args: SelectSubset<T, OfferUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Offer.
     * @param {OfferUpsertArgs} args - Arguments to update or create a Offer.
     * @example
     * // Update or create a Offer
     * const offer = await prisma.offer.upsert({
     *   create: {
     *     // ... data to create a Offer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Offer we want to update
     *   }
     * })
     */
    upsert<T extends OfferUpsertArgs>(args: SelectSubset<T, OfferUpsertArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Offers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferCountArgs} args - Arguments to filter Offers to count.
     * @example
     * // Count the number of Offers
     * const count = await prisma.offer.count({
     *   where: {
     *     // ... the filter for the Offers we want to count
     *   }
     * })
    **/
    count<T extends OfferCountArgs>(
      args?: Subset<T, OfferCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OfferCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Offer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OfferAggregateArgs>(args: Subset<T, OfferAggregateArgs>): Prisma.PrismaPromise<GetOfferAggregateType<T>>

    /**
     * Group by Offer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OfferGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OfferGroupByArgs['orderBy'] }
        : { orderBy?: OfferGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OfferGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOfferGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Offer model
   */
  readonly fields: OfferFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Offer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OfferClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    candidate<T extends CandidateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CandidateDefaultArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Offer model
   */
  interface OfferFieldRefs {
    readonly id: FieldRef<"Offer", 'String'>
    readonly candidateId: FieldRef<"Offer", 'String'>
    readonly offeredSalary: FieldRef<"Offer", 'Float'>
    readonly firstWorkingDate: FieldRef<"Offer", 'String'>
    readonly contractType: FieldRef<"Offer", 'String'>
    readonly itEquipment: FieldRef<"Offer", 'String'>
    readonly status: FieldRef<"Offer", 'String'>
    readonly createdAt: FieldRef<"Offer", 'DateTime'>
    readonly updatedAt: FieldRef<"Offer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Offer findUnique
   */
  export type OfferFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer findUniqueOrThrow
   */
  export type OfferFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer findFirst
   */
  export type OfferFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Offers.
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Offers.
     */
    distinct?: OfferScalarFieldEnum | OfferScalarFieldEnum[]
  }

  /**
   * Offer findFirstOrThrow
   */
  export type OfferFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Offers.
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Offers.
     */
    distinct?: OfferScalarFieldEnum | OfferScalarFieldEnum[]
  }

  /**
   * Offer findMany
   */
  export type OfferFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * Filter, which Offers to fetch.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Offers.
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    distinct?: OfferScalarFieldEnum | OfferScalarFieldEnum[]
  }

  /**
   * Offer create
   */
  export type OfferCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * The data needed to create a Offer.
     */
    data: XOR<OfferCreateInput, OfferUncheckedCreateInput>
  }

  /**
   * Offer createMany
   */
  export type OfferCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Offers.
     */
    data: OfferCreateManyInput | OfferCreateManyInput[]
  }

  /**
   * Offer createManyAndReturn
   */
  export type OfferCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The data used to create many Offers.
     */
    data: OfferCreateManyInput | OfferCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Offer update
   */
  export type OfferUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * The data needed to update a Offer.
     */
    data: XOR<OfferUpdateInput, OfferUncheckedUpdateInput>
    /**
     * Choose, which Offer to update.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer updateMany
   */
  export type OfferUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Offers.
     */
    data: XOR<OfferUpdateManyMutationInput, OfferUncheckedUpdateManyInput>
    /**
     * Filter which Offers to update
     */
    where?: OfferWhereInput
    /**
     * Limit how many Offers to update.
     */
    limit?: number
  }

  /**
   * Offer updateManyAndReturn
   */
  export type OfferUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The data used to update Offers.
     */
    data: XOR<OfferUpdateManyMutationInput, OfferUncheckedUpdateManyInput>
    /**
     * Filter which Offers to update
     */
    where?: OfferWhereInput
    /**
     * Limit how many Offers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Offer upsert
   */
  export type OfferUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * The filter to search for the Offer to update in case it exists.
     */
    where: OfferWhereUniqueInput
    /**
     * In case the Offer found by the `where` argument doesn't exist, create a new Offer with this data.
     */
    create: XOR<OfferCreateInput, OfferUncheckedCreateInput>
    /**
     * In case the Offer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OfferUpdateInput, OfferUncheckedUpdateInput>
  }

  /**
   * Offer delete
   */
  export type OfferDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
    /**
     * Filter which Offer to delete.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer deleteMany
   */
  export type OfferDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Offers to delete
     */
    where?: OfferWhereInput
    /**
     * Limit how many Offers to delete.
     */
    limit?: number
  }

  /**
   * Offer without action
   */
  export type OfferDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfferInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const VacancyScalarFieldEnum: {
    id: 'id',
    title: 'title',
    department: 'department',
    location: 'location',
    salaryBudgetMin: 'salaryBudgetMin',
    salaryBudgetMax: 'salaryBudgetMax',
    acceptanceScore: 'acceptanceScore',
    jobPostingHtml: 'jobPostingHtml',
    rawBlueprint: 'rawBlueprint',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VacancyScalarFieldEnum = (typeof VacancyScalarFieldEnum)[keyof typeof VacancyScalarFieldEnum]


  export const CompetencyScalarFieldEnum: {
    id: 'id',
    vacancyId: 'vacancyId',
    name: 'name',
    category: 'category',
    weight: 'weight',
    order: 'order'
  };

  export type CompetencyScalarFieldEnum = (typeof CompetencyScalarFieldEnum)[keyof typeof CompetencyScalarFieldEnum]


  export const CandidateScalarFieldEnum: {
    id: 'id',
    vacancyId: 'vacancyId',
    name: 'name',
    email: 'email',
    phone: 'phone',
    yearsExperience: 'yearsExperience',
    expectedSalary: 'expectedSalary',
    rawCv: 'rawCv',
    portfolioUrl: 'portfolioUrl',
    portfolioTitle: 'portfolioTitle',
    portfolioImage: 'portfolioImage',
    portfolioDesc: 'portfolioDesc',
    compositeScore: 'compositeScore',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CandidateScalarFieldEnum = (typeof CandidateScalarFieldEnum)[keyof typeof CandidateScalarFieldEnum]


  export const ScorecardScalarFieldEnum: {
    id: 'id',
    candidateId: 'candidateId',
    managerName: 'managerName',
    submittedAt: 'submittedAt'
  };

  export type ScorecardScalarFieldEnum = (typeof ScorecardScalarFieldEnum)[keyof typeof ScorecardScalarFieldEnum]


  export const ScoreScalarFieldEnum: {
    id: 'id',
    scorecardId: 'scorecardId',
    competencyId: 'competencyId',
    value: 'value',
    notes: 'notes'
  };

  export type ScoreScalarFieldEnum = (typeof ScoreScalarFieldEnum)[keyof typeof ScoreScalarFieldEnum]


  export const OfferScalarFieldEnum: {
    id: 'id',
    candidateId: 'candidateId',
    offeredSalary: 'offeredSalary',
    firstWorkingDate: 'firstWorkingDate',
    contractType: 'contractType',
    itEquipment: 'itEquipment',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OfferScalarFieldEnum = (typeof OfferScalarFieldEnum)[keyof typeof OfferScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type VacancyWhereInput = {
    AND?: VacancyWhereInput | VacancyWhereInput[]
    OR?: VacancyWhereInput[]
    NOT?: VacancyWhereInput | VacancyWhereInput[]
    id?: StringFilter<"Vacancy"> | string
    title?: StringFilter<"Vacancy"> | string
    department?: StringNullableFilter<"Vacancy"> | string | null
    location?: StringNullableFilter<"Vacancy"> | string | null
    salaryBudgetMin?: FloatNullableFilter<"Vacancy"> | number | null
    salaryBudgetMax?: FloatNullableFilter<"Vacancy"> | number | null
    acceptanceScore?: FloatFilter<"Vacancy"> | number
    jobPostingHtml?: StringFilter<"Vacancy"> | string
    rawBlueprint?: StringFilter<"Vacancy"> | string
    status?: StringFilter<"Vacancy"> | string
    createdAt?: DateTimeFilter<"Vacancy"> | Date | string
    updatedAt?: DateTimeFilter<"Vacancy"> | Date | string
    competencies?: CompetencyListRelationFilter
    candidates?: CandidateListRelationFilter
  }

  export type VacancyOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    salaryBudgetMin?: SortOrderInput | SortOrder
    salaryBudgetMax?: SortOrderInput | SortOrder
    acceptanceScore?: SortOrder
    jobPostingHtml?: SortOrder
    rawBlueprint?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    competencies?: CompetencyOrderByRelationAggregateInput
    candidates?: CandidateOrderByRelationAggregateInput
  }

  export type VacancyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VacancyWhereInput | VacancyWhereInput[]
    OR?: VacancyWhereInput[]
    NOT?: VacancyWhereInput | VacancyWhereInput[]
    title?: StringFilter<"Vacancy"> | string
    department?: StringNullableFilter<"Vacancy"> | string | null
    location?: StringNullableFilter<"Vacancy"> | string | null
    salaryBudgetMin?: FloatNullableFilter<"Vacancy"> | number | null
    salaryBudgetMax?: FloatNullableFilter<"Vacancy"> | number | null
    acceptanceScore?: FloatFilter<"Vacancy"> | number
    jobPostingHtml?: StringFilter<"Vacancy"> | string
    rawBlueprint?: StringFilter<"Vacancy"> | string
    status?: StringFilter<"Vacancy"> | string
    createdAt?: DateTimeFilter<"Vacancy"> | Date | string
    updatedAt?: DateTimeFilter<"Vacancy"> | Date | string
    competencies?: CompetencyListRelationFilter
    candidates?: CandidateListRelationFilter
  }, "id">

  export type VacancyOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    salaryBudgetMin?: SortOrderInput | SortOrder
    salaryBudgetMax?: SortOrderInput | SortOrder
    acceptanceScore?: SortOrder
    jobPostingHtml?: SortOrder
    rawBlueprint?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VacancyCountOrderByAggregateInput
    _avg?: VacancyAvgOrderByAggregateInput
    _max?: VacancyMaxOrderByAggregateInput
    _min?: VacancyMinOrderByAggregateInput
    _sum?: VacancySumOrderByAggregateInput
  }

  export type VacancyScalarWhereWithAggregatesInput = {
    AND?: VacancyScalarWhereWithAggregatesInput | VacancyScalarWhereWithAggregatesInput[]
    OR?: VacancyScalarWhereWithAggregatesInput[]
    NOT?: VacancyScalarWhereWithAggregatesInput | VacancyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Vacancy"> | string
    title?: StringWithAggregatesFilter<"Vacancy"> | string
    department?: StringNullableWithAggregatesFilter<"Vacancy"> | string | null
    location?: StringNullableWithAggregatesFilter<"Vacancy"> | string | null
    salaryBudgetMin?: FloatNullableWithAggregatesFilter<"Vacancy"> | number | null
    salaryBudgetMax?: FloatNullableWithAggregatesFilter<"Vacancy"> | number | null
    acceptanceScore?: FloatWithAggregatesFilter<"Vacancy"> | number
    jobPostingHtml?: StringWithAggregatesFilter<"Vacancy"> | string
    rawBlueprint?: StringWithAggregatesFilter<"Vacancy"> | string
    status?: StringWithAggregatesFilter<"Vacancy"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Vacancy"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Vacancy"> | Date | string
  }

  export type CompetencyWhereInput = {
    AND?: CompetencyWhereInput | CompetencyWhereInput[]
    OR?: CompetencyWhereInput[]
    NOT?: CompetencyWhereInput | CompetencyWhereInput[]
    id?: StringFilter<"Competency"> | string
    vacancyId?: StringFilter<"Competency"> | string
    name?: StringFilter<"Competency"> | string
    category?: StringFilter<"Competency"> | string
    weight?: FloatFilter<"Competency"> | number
    order?: IntFilter<"Competency"> | number
    vacancy?: XOR<VacancyScalarRelationFilter, VacancyWhereInput>
    scores?: ScoreListRelationFilter
  }

  export type CompetencyOrderByWithRelationInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    weight?: SortOrder
    order?: SortOrder
    vacancy?: VacancyOrderByWithRelationInput
    scores?: ScoreOrderByRelationAggregateInput
  }

  export type CompetencyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CompetencyWhereInput | CompetencyWhereInput[]
    OR?: CompetencyWhereInput[]
    NOT?: CompetencyWhereInput | CompetencyWhereInput[]
    vacancyId?: StringFilter<"Competency"> | string
    name?: StringFilter<"Competency"> | string
    category?: StringFilter<"Competency"> | string
    weight?: FloatFilter<"Competency"> | number
    order?: IntFilter<"Competency"> | number
    vacancy?: XOR<VacancyScalarRelationFilter, VacancyWhereInput>
    scores?: ScoreListRelationFilter
  }, "id">

  export type CompetencyOrderByWithAggregationInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    weight?: SortOrder
    order?: SortOrder
    _count?: CompetencyCountOrderByAggregateInput
    _avg?: CompetencyAvgOrderByAggregateInput
    _max?: CompetencyMaxOrderByAggregateInput
    _min?: CompetencyMinOrderByAggregateInput
    _sum?: CompetencySumOrderByAggregateInput
  }

  export type CompetencyScalarWhereWithAggregatesInput = {
    AND?: CompetencyScalarWhereWithAggregatesInput | CompetencyScalarWhereWithAggregatesInput[]
    OR?: CompetencyScalarWhereWithAggregatesInput[]
    NOT?: CompetencyScalarWhereWithAggregatesInput | CompetencyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Competency"> | string
    vacancyId?: StringWithAggregatesFilter<"Competency"> | string
    name?: StringWithAggregatesFilter<"Competency"> | string
    category?: StringWithAggregatesFilter<"Competency"> | string
    weight?: FloatWithAggregatesFilter<"Competency"> | number
    order?: IntWithAggregatesFilter<"Competency"> | number
  }

  export type CandidateWhereInput = {
    AND?: CandidateWhereInput | CandidateWhereInput[]
    OR?: CandidateWhereInput[]
    NOT?: CandidateWhereInput | CandidateWhereInput[]
    id?: StringFilter<"Candidate"> | string
    vacancyId?: StringFilter<"Candidate"> | string
    name?: StringFilter<"Candidate"> | string
    email?: StringFilter<"Candidate"> | string
    phone?: StringNullableFilter<"Candidate"> | string | null
    yearsExperience?: FloatNullableFilter<"Candidate"> | number | null
    expectedSalary?: FloatNullableFilter<"Candidate"> | number | null
    rawCv?: StringFilter<"Candidate"> | string
    portfolioUrl?: StringNullableFilter<"Candidate"> | string | null
    portfolioTitle?: StringNullableFilter<"Candidate"> | string | null
    portfolioImage?: StringNullableFilter<"Candidate"> | string | null
    portfolioDesc?: StringNullableFilter<"Candidate"> | string | null
    compositeScore?: FloatNullableFilter<"Candidate"> | number | null
    status?: StringFilter<"Candidate"> | string
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
    vacancy?: XOR<VacancyScalarRelationFilter, VacancyWhereInput>
    scorecards?: ScorecardListRelationFilter
    offer?: XOR<OfferNullableScalarRelationFilter, OfferWhereInput> | null
  }

  export type CandidateOrderByWithRelationInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    yearsExperience?: SortOrderInput | SortOrder
    expectedSalary?: SortOrderInput | SortOrder
    rawCv?: SortOrder
    portfolioUrl?: SortOrderInput | SortOrder
    portfolioTitle?: SortOrderInput | SortOrder
    portfolioImage?: SortOrderInput | SortOrder
    portfolioDesc?: SortOrderInput | SortOrder
    compositeScore?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    vacancy?: VacancyOrderByWithRelationInput
    scorecards?: ScorecardOrderByRelationAggregateInput
    offer?: OfferOrderByWithRelationInput
  }

  export type CandidateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CandidateWhereInput | CandidateWhereInput[]
    OR?: CandidateWhereInput[]
    NOT?: CandidateWhereInput | CandidateWhereInput[]
    vacancyId?: StringFilter<"Candidate"> | string
    name?: StringFilter<"Candidate"> | string
    email?: StringFilter<"Candidate"> | string
    phone?: StringNullableFilter<"Candidate"> | string | null
    yearsExperience?: FloatNullableFilter<"Candidate"> | number | null
    expectedSalary?: FloatNullableFilter<"Candidate"> | number | null
    rawCv?: StringFilter<"Candidate"> | string
    portfolioUrl?: StringNullableFilter<"Candidate"> | string | null
    portfolioTitle?: StringNullableFilter<"Candidate"> | string | null
    portfolioImage?: StringNullableFilter<"Candidate"> | string | null
    portfolioDesc?: StringNullableFilter<"Candidate"> | string | null
    compositeScore?: FloatNullableFilter<"Candidate"> | number | null
    status?: StringFilter<"Candidate"> | string
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
    vacancy?: XOR<VacancyScalarRelationFilter, VacancyWhereInput>
    scorecards?: ScorecardListRelationFilter
    offer?: XOR<OfferNullableScalarRelationFilter, OfferWhereInput> | null
  }, "id">

  export type CandidateOrderByWithAggregationInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    yearsExperience?: SortOrderInput | SortOrder
    expectedSalary?: SortOrderInput | SortOrder
    rawCv?: SortOrder
    portfolioUrl?: SortOrderInput | SortOrder
    portfolioTitle?: SortOrderInput | SortOrder
    portfolioImage?: SortOrderInput | SortOrder
    portfolioDesc?: SortOrderInput | SortOrder
    compositeScore?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CandidateCountOrderByAggregateInput
    _avg?: CandidateAvgOrderByAggregateInput
    _max?: CandidateMaxOrderByAggregateInput
    _min?: CandidateMinOrderByAggregateInput
    _sum?: CandidateSumOrderByAggregateInput
  }

  export type CandidateScalarWhereWithAggregatesInput = {
    AND?: CandidateScalarWhereWithAggregatesInput | CandidateScalarWhereWithAggregatesInput[]
    OR?: CandidateScalarWhereWithAggregatesInput[]
    NOT?: CandidateScalarWhereWithAggregatesInput | CandidateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Candidate"> | string
    vacancyId?: StringWithAggregatesFilter<"Candidate"> | string
    name?: StringWithAggregatesFilter<"Candidate"> | string
    email?: StringWithAggregatesFilter<"Candidate"> | string
    phone?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    yearsExperience?: FloatNullableWithAggregatesFilter<"Candidate"> | number | null
    expectedSalary?: FloatNullableWithAggregatesFilter<"Candidate"> | number | null
    rawCv?: StringWithAggregatesFilter<"Candidate"> | string
    portfolioUrl?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    portfolioTitle?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    portfolioImage?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    portfolioDesc?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    compositeScore?: FloatNullableWithAggregatesFilter<"Candidate"> | number | null
    status?: StringWithAggregatesFilter<"Candidate"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Candidate"> | Date | string
  }

  export type ScorecardWhereInput = {
    AND?: ScorecardWhereInput | ScorecardWhereInput[]
    OR?: ScorecardWhereInput[]
    NOT?: ScorecardWhereInput | ScorecardWhereInput[]
    id?: StringFilter<"Scorecard"> | string
    candidateId?: StringFilter<"Scorecard"> | string
    managerName?: StringFilter<"Scorecard"> | string
    submittedAt?: DateTimeFilter<"Scorecard"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
    scores?: ScoreListRelationFilter
  }

  export type ScorecardOrderByWithRelationInput = {
    id?: SortOrder
    candidateId?: SortOrder
    managerName?: SortOrder
    submittedAt?: SortOrder
    candidate?: CandidateOrderByWithRelationInput
    scores?: ScoreOrderByRelationAggregateInput
  }

  export type ScorecardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScorecardWhereInput | ScorecardWhereInput[]
    OR?: ScorecardWhereInput[]
    NOT?: ScorecardWhereInput | ScorecardWhereInput[]
    candidateId?: StringFilter<"Scorecard"> | string
    managerName?: StringFilter<"Scorecard"> | string
    submittedAt?: DateTimeFilter<"Scorecard"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
    scores?: ScoreListRelationFilter
  }, "id">

  export type ScorecardOrderByWithAggregationInput = {
    id?: SortOrder
    candidateId?: SortOrder
    managerName?: SortOrder
    submittedAt?: SortOrder
    _count?: ScorecardCountOrderByAggregateInput
    _max?: ScorecardMaxOrderByAggregateInput
    _min?: ScorecardMinOrderByAggregateInput
  }

  export type ScorecardScalarWhereWithAggregatesInput = {
    AND?: ScorecardScalarWhereWithAggregatesInput | ScorecardScalarWhereWithAggregatesInput[]
    OR?: ScorecardScalarWhereWithAggregatesInput[]
    NOT?: ScorecardScalarWhereWithAggregatesInput | ScorecardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Scorecard"> | string
    candidateId?: StringWithAggregatesFilter<"Scorecard"> | string
    managerName?: StringWithAggregatesFilter<"Scorecard"> | string
    submittedAt?: DateTimeWithAggregatesFilter<"Scorecard"> | Date | string
  }

  export type ScoreWhereInput = {
    AND?: ScoreWhereInput | ScoreWhereInput[]
    OR?: ScoreWhereInput[]
    NOT?: ScoreWhereInput | ScoreWhereInput[]
    id?: StringFilter<"Score"> | string
    scorecardId?: StringFilter<"Score"> | string
    competencyId?: StringFilter<"Score"> | string
    value?: IntFilter<"Score"> | number
    notes?: StringNullableFilter<"Score"> | string | null
    scorecard?: XOR<ScorecardScalarRelationFilter, ScorecardWhereInput>
    competency?: XOR<CompetencyScalarRelationFilter, CompetencyWhereInput>
  }

  export type ScoreOrderByWithRelationInput = {
    id?: SortOrder
    scorecardId?: SortOrder
    competencyId?: SortOrder
    value?: SortOrder
    notes?: SortOrderInput | SortOrder
    scorecard?: ScorecardOrderByWithRelationInput
    competency?: CompetencyOrderByWithRelationInput
  }

  export type ScoreWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    scorecardId_competencyId?: ScoreScorecardIdCompetencyIdCompoundUniqueInput
    AND?: ScoreWhereInput | ScoreWhereInput[]
    OR?: ScoreWhereInput[]
    NOT?: ScoreWhereInput | ScoreWhereInput[]
    scorecardId?: StringFilter<"Score"> | string
    competencyId?: StringFilter<"Score"> | string
    value?: IntFilter<"Score"> | number
    notes?: StringNullableFilter<"Score"> | string | null
    scorecard?: XOR<ScorecardScalarRelationFilter, ScorecardWhereInput>
    competency?: XOR<CompetencyScalarRelationFilter, CompetencyWhereInput>
  }, "id" | "scorecardId_competencyId">

  export type ScoreOrderByWithAggregationInput = {
    id?: SortOrder
    scorecardId?: SortOrder
    competencyId?: SortOrder
    value?: SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: ScoreCountOrderByAggregateInput
    _avg?: ScoreAvgOrderByAggregateInput
    _max?: ScoreMaxOrderByAggregateInput
    _min?: ScoreMinOrderByAggregateInput
    _sum?: ScoreSumOrderByAggregateInput
  }

  export type ScoreScalarWhereWithAggregatesInput = {
    AND?: ScoreScalarWhereWithAggregatesInput | ScoreScalarWhereWithAggregatesInput[]
    OR?: ScoreScalarWhereWithAggregatesInput[]
    NOT?: ScoreScalarWhereWithAggregatesInput | ScoreScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Score"> | string
    scorecardId?: StringWithAggregatesFilter<"Score"> | string
    competencyId?: StringWithAggregatesFilter<"Score"> | string
    value?: IntWithAggregatesFilter<"Score"> | number
    notes?: StringNullableWithAggregatesFilter<"Score"> | string | null
  }

  export type OfferWhereInput = {
    AND?: OfferWhereInput | OfferWhereInput[]
    OR?: OfferWhereInput[]
    NOT?: OfferWhereInput | OfferWhereInput[]
    id?: StringFilter<"Offer"> | string
    candidateId?: StringFilter<"Offer"> | string
    offeredSalary?: FloatFilter<"Offer"> | number
    firstWorkingDate?: StringFilter<"Offer"> | string
    contractType?: StringFilter<"Offer"> | string
    itEquipment?: StringNullableFilter<"Offer"> | string | null
    status?: StringFilter<"Offer"> | string
    createdAt?: DateTimeFilter<"Offer"> | Date | string
    updatedAt?: DateTimeFilter<"Offer"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
  }

  export type OfferOrderByWithRelationInput = {
    id?: SortOrder
    candidateId?: SortOrder
    offeredSalary?: SortOrder
    firstWorkingDate?: SortOrder
    contractType?: SortOrder
    itEquipment?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    candidate?: CandidateOrderByWithRelationInput
  }

  export type OfferWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    candidateId?: string
    AND?: OfferWhereInput | OfferWhereInput[]
    OR?: OfferWhereInput[]
    NOT?: OfferWhereInput | OfferWhereInput[]
    offeredSalary?: FloatFilter<"Offer"> | number
    firstWorkingDate?: StringFilter<"Offer"> | string
    contractType?: StringFilter<"Offer"> | string
    itEquipment?: StringNullableFilter<"Offer"> | string | null
    status?: StringFilter<"Offer"> | string
    createdAt?: DateTimeFilter<"Offer"> | Date | string
    updatedAt?: DateTimeFilter<"Offer"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
  }, "id" | "candidateId">

  export type OfferOrderByWithAggregationInput = {
    id?: SortOrder
    candidateId?: SortOrder
    offeredSalary?: SortOrder
    firstWorkingDate?: SortOrder
    contractType?: SortOrder
    itEquipment?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OfferCountOrderByAggregateInput
    _avg?: OfferAvgOrderByAggregateInput
    _max?: OfferMaxOrderByAggregateInput
    _min?: OfferMinOrderByAggregateInput
    _sum?: OfferSumOrderByAggregateInput
  }

  export type OfferScalarWhereWithAggregatesInput = {
    AND?: OfferScalarWhereWithAggregatesInput | OfferScalarWhereWithAggregatesInput[]
    OR?: OfferScalarWhereWithAggregatesInput[]
    NOT?: OfferScalarWhereWithAggregatesInput | OfferScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Offer"> | string
    candidateId?: StringWithAggregatesFilter<"Offer"> | string
    offeredSalary?: FloatWithAggregatesFilter<"Offer"> | number
    firstWorkingDate?: StringWithAggregatesFilter<"Offer"> | string
    contractType?: StringWithAggregatesFilter<"Offer"> | string
    itEquipment?: StringNullableWithAggregatesFilter<"Offer"> | string | null
    status?: StringWithAggregatesFilter<"Offer"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Offer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Offer"> | Date | string
  }

  export type VacancyCreateInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competencies?: CompetencyCreateNestedManyWithoutVacancyInput
    candidates?: CandidateCreateNestedManyWithoutVacancyInput
  }

  export type VacancyUncheckedCreateInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competencies?: CompetencyUncheckedCreateNestedManyWithoutVacancyInput
    candidates?: CandidateUncheckedCreateNestedManyWithoutVacancyInput
  }

  export type VacancyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competencies?: CompetencyUpdateManyWithoutVacancyNestedInput
    candidates?: CandidateUpdateManyWithoutVacancyNestedInput
  }

  export type VacancyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competencies?: CompetencyUncheckedUpdateManyWithoutVacancyNestedInput
    candidates?: CandidateUncheckedUpdateManyWithoutVacancyNestedInput
  }

  export type VacancyCreateManyInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VacancyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VacancyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompetencyCreateInput = {
    id?: string
    name: string
    category: string
    weight: number
    order: number
    vacancy: VacancyCreateNestedOneWithoutCompetenciesInput
    scores?: ScoreCreateNestedManyWithoutCompetencyInput
  }

  export type CompetencyUncheckedCreateInput = {
    id?: string
    vacancyId: string
    name: string
    category: string
    weight: number
    order: number
    scores?: ScoreUncheckedCreateNestedManyWithoutCompetencyInput
  }

  export type CompetencyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    vacancy?: VacancyUpdateOneRequiredWithoutCompetenciesNestedInput
    scores?: ScoreUpdateManyWithoutCompetencyNestedInput
  }

  export type CompetencyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    scores?: ScoreUncheckedUpdateManyWithoutCompetencyNestedInput
  }

  export type CompetencyCreateManyInput = {
    id?: string
    vacancyId: string
    name: string
    category: string
    weight: number
    order: number
  }

  export type CompetencyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
  }

  export type CompetencyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
  }

  export type CandidateCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    vacancy: VacancyCreateNestedOneWithoutCandidatesInput
    scorecards?: ScorecardCreateNestedManyWithoutCandidateInput
    offer?: OfferCreateNestedOneWithoutCandidateInput
  }

  export type CandidateUncheckedCreateInput = {
    id?: string
    vacancyId: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    scorecards?: ScorecardUncheckedCreateNestedManyWithoutCandidateInput
    offer?: OfferUncheckedCreateNestedOneWithoutCandidateInput
  }

  export type CandidateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vacancy?: VacancyUpdateOneRequiredWithoutCandidatesNestedInput
    scorecards?: ScorecardUpdateManyWithoutCandidateNestedInput
    offer?: OfferUpdateOneWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scorecards?: ScorecardUncheckedUpdateManyWithoutCandidateNestedInput
    offer?: OfferUncheckedUpdateOneWithoutCandidateNestedInput
  }

  export type CandidateCreateManyInput = {
    id?: string
    vacancyId: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScorecardCreateInput = {
    id?: string
    managerName: string
    submittedAt?: Date | string
    candidate: CandidateCreateNestedOneWithoutScorecardsInput
    scores?: ScoreCreateNestedManyWithoutScorecardInput
  }

  export type ScorecardUncheckedCreateInput = {
    id?: string
    candidateId: string
    managerName: string
    submittedAt?: Date | string
    scores?: ScoreUncheckedCreateNestedManyWithoutScorecardInput
  }

  export type ScorecardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidate?: CandidateUpdateOneRequiredWithoutScorecardsNestedInput
    scores?: ScoreUpdateManyWithoutScorecardNestedInput
  }

  export type ScorecardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scores?: ScoreUncheckedUpdateManyWithoutScorecardNestedInput
  }

  export type ScorecardCreateManyInput = {
    id?: string
    candidateId: string
    managerName: string
    submittedAt?: Date | string
  }

  export type ScorecardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScorecardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoreCreateInput = {
    id?: string
    value: number
    notes?: string | null
    scorecard: ScorecardCreateNestedOneWithoutScoresInput
    competency: CompetencyCreateNestedOneWithoutScoresInput
  }

  export type ScoreUncheckedCreateInput = {
    id?: string
    scorecardId: string
    competencyId: string
    value: number
    notes?: string | null
  }

  export type ScoreUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    scorecard?: ScorecardUpdateOneRequiredWithoutScoresNestedInput
    competency?: CompetencyUpdateOneRequiredWithoutScoresNestedInput
  }

  export type ScoreUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scorecardId?: StringFieldUpdateOperationsInput | string
    competencyId?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScoreCreateManyInput = {
    id?: string
    scorecardId: string
    competencyId: string
    value: number
    notes?: string | null
  }

  export type ScoreUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScoreUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    scorecardId?: StringFieldUpdateOperationsInput | string
    competencyId?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OfferCreateInput = {
    id?: string
    offeredSalary: number
    firstWorkingDate: string
    contractType: string
    itEquipment?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    candidate: CandidateCreateNestedOneWithoutOfferInput
  }

  export type OfferUncheckedCreateInput = {
    id?: string
    candidateId: string
    offeredSalary: number
    firstWorkingDate: string
    contractType: string
    itEquipment?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    offeredSalary?: FloatFieldUpdateOperationsInput | number
    firstWorkingDate?: StringFieldUpdateOperationsInput | string
    contractType?: StringFieldUpdateOperationsInput | string
    itEquipment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidate?: CandidateUpdateOneRequiredWithoutOfferNestedInput
  }

  export type OfferUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    offeredSalary?: FloatFieldUpdateOperationsInput | number
    firstWorkingDate?: StringFieldUpdateOperationsInput | string
    contractType?: StringFieldUpdateOperationsInput | string
    itEquipment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferCreateManyInput = {
    id?: string
    candidateId: string
    offeredSalary: number
    firstWorkingDate: string
    contractType: string
    itEquipment?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    offeredSalary?: FloatFieldUpdateOperationsInput | number
    firstWorkingDate?: StringFieldUpdateOperationsInput | string
    contractType?: StringFieldUpdateOperationsInput | string
    itEquipment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    offeredSalary?: FloatFieldUpdateOperationsInput | number
    firstWorkingDate?: StringFieldUpdateOperationsInput | string
    contractType?: StringFieldUpdateOperationsInput | string
    itEquipment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CompetencyListRelationFilter = {
    every?: CompetencyWhereInput
    some?: CompetencyWhereInput
    none?: CompetencyWhereInput
  }

  export type CandidateListRelationFilter = {
    every?: CandidateWhereInput
    some?: CandidateWhereInput
    none?: CandidateWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CompetencyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CandidateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VacancyCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    salaryBudgetMin?: SortOrder
    salaryBudgetMax?: SortOrder
    acceptanceScore?: SortOrder
    jobPostingHtml?: SortOrder
    rawBlueprint?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VacancyAvgOrderByAggregateInput = {
    salaryBudgetMin?: SortOrder
    salaryBudgetMax?: SortOrder
    acceptanceScore?: SortOrder
  }

  export type VacancyMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    salaryBudgetMin?: SortOrder
    salaryBudgetMax?: SortOrder
    acceptanceScore?: SortOrder
    jobPostingHtml?: SortOrder
    rawBlueprint?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VacancyMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    salaryBudgetMin?: SortOrder
    salaryBudgetMax?: SortOrder
    acceptanceScore?: SortOrder
    jobPostingHtml?: SortOrder
    rawBlueprint?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VacancySumOrderByAggregateInput = {
    salaryBudgetMin?: SortOrder
    salaryBudgetMax?: SortOrder
    acceptanceScore?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type VacancyScalarRelationFilter = {
    is?: VacancyWhereInput
    isNot?: VacancyWhereInput
  }

  export type ScoreListRelationFilter = {
    every?: ScoreWhereInput
    some?: ScoreWhereInput
    none?: ScoreWhereInput
  }

  export type ScoreOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompetencyCountOrderByAggregateInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    weight?: SortOrder
    order?: SortOrder
  }

  export type CompetencyAvgOrderByAggregateInput = {
    weight?: SortOrder
    order?: SortOrder
  }

  export type CompetencyMaxOrderByAggregateInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    weight?: SortOrder
    order?: SortOrder
  }

  export type CompetencyMinOrderByAggregateInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    weight?: SortOrder
    order?: SortOrder
  }

  export type CompetencySumOrderByAggregateInput = {
    weight?: SortOrder
    order?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type ScorecardListRelationFilter = {
    every?: ScorecardWhereInput
    some?: ScorecardWhereInput
    none?: ScorecardWhereInput
  }

  export type OfferNullableScalarRelationFilter = {
    is?: OfferWhereInput | null
    isNot?: OfferWhereInput | null
  }

  export type ScorecardOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CandidateCountOrderByAggregateInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    yearsExperience?: SortOrder
    expectedSalary?: SortOrder
    rawCv?: SortOrder
    portfolioUrl?: SortOrder
    portfolioTitle?: SortOrder
    portfolioImage?: SortOrder
    portfolioDesc?: SortOrder
    compositeScore?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateAvgOrderByAggregateInput = {
    yearsExperience?: SortOrder
    expectedSalary?: SortOrder
    compositeScore?: SortOrder
  }

  export type CandidateMaxOrderByAggregateInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    yearsExperience?: SortOrder
    expectedSalary?: SortOrder
    rawCv?: SortOrder
    portfolioUrl?: SortOrder
    portfolioTitle?: SortOrder
    portfolioImage?: SortOrder
    portfolioDesc?: SortOrder
    compositeScore?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateMinOrderByAggregateInput = {
    id?: SortOrder
    vacancyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    yearsExperience?: SortOrder
    expectedSalary?: SortOrder
    rawCv?: SortOrder
    portfolioUrl?: SortOrder
    portfolioTitle?: SortOrder
    portfolioImage?: SortOrder
    portfolioDesc?: SortOrder
    compositeScore?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateSumOrderByAggregateInput = {
    yearsExperience?: SortOrder
    expectedSalary?: SortOrder
    compositeScore?: SortOrder
  }

  export type CandidateScalarRelationFilter = {
    is?: CandidateWhereInput
    isNot?: CandidateWhereInput
  }

  export type ScorecardCountOrderByAggregateInput = {
    id?: SortOrder
    candidateId?: SortOrder
    managerName?: SortOrder
    submittedAt?: SortOrder
  }

  export type ScorecardMaxOrderByAggregateInput = {
    id?: SortOrder
    candidateId?: SortOrder
    managerName?: SortOrder
    submittedAt?: SortOrder
  }

  export type ScorecardMinOrderByAggregateInput = {
    id?: SortOrder
    candidateId?: SortOrder
    managerName?: SortOrder
    submittedAt?: SortOrder
  }

  export type ScorecardScalarRelationFilter = {
    is?: ScorecardWhereInput
    isNot?: ScorecardWhereInput
  }

  export type CompetencyScalarRelationFilter = {
    is?: CompetencyWhereInput
    isNot?: CompetencyWhereInput
  }

  export type ScoreScorecardIdCompetencyIdCompoundUniqueInput = {
    scorecardId: string
    competencyId: string
  }

  export type ScoreCountOrderByAggregateInput = {
    id?: SortOrder
    scorecardId?: SortOrder
    competencyId?: SortOrder
    value?: SortOrder
    notes?: SortOrder
  }

  export type ScoreAvgOrderByAggregateInput = {
    value?: SortOrder
  }

  export type ScoreMaxOrderByAggregateInput = {
    id?: SortOrder
    scorecardId?: SortOrder
    competencyId?: SortOrder
    value?: SortOrder
    notes?: SortOrder
  }

  export type ScoreMinOrderByAggregateInput = {
    id?: SortOrder
    scorecardId?: SortOrder
    competencyId?: SortOrder
    value?: SortOrder
    notes?: SortOrder
  }

  export type ScoreSumOrderByAggregateInput = {
    value?: SortOrder
  }

  export type OfferCountOrderByAggregateInput = {
    id?: SortOrder
    candidateId?: SortOrder
    offeredSalary?: SortOrder
    firstWorkingDate?: SortOrder
    contractType?: SortOrder
    itEquipment?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferAvgOrderByAggregateInput = {
    offeredSalary?: SortOrder
  }

  export type OfferMaxOrderByAggregateInput = {
    id?: SortOrder
    candidateId?: SortOrder
    offeredSalary?: SortOrder
    firstWorkingDate?: SortOrder
    contractType?: SortOrder
    itEquipment?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferMinOrderByAggregateInput = {
    id?: SortOrder
    candidateId?: SortOrder
    offeredSalary?: SortOrder
    firstWorkingDate?: SortOrder
    contractType?: SortOrder
    itEquipment?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferSumOrderByAggregateInput = {
    offeredSalary?: SortOrder
  }

  export type CompetencyCreateNestedManyWithoutVacancyInput = {
    create?: XOR<CompetencyCreateWithoutVacancyInput, CompetencyUncheckedCreateWithoutVacancyInput> | CompetencyCreateWithoutVacancyInput[] | CompetencyUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CompetencyCreateOrConnectWithoutVacancyInput | CompetencyCreateOrConnectWithoutVacancyInput[]
    createMany?: CompetencyCreateManyVacancyInputEnvelope
    connect?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
  }

  export type CandidateCreateNestedManyWithoutVacancyInput = {
    create?: XOR<CandidateCreateWithoutVacancyInput, CandidateUncheckedCreateWithoutVacancyInput> | CandidateCreateWithoutVacancyInput[] | CandidateUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutVacancyInput | CandidateCreateOrConnectWithoutVacancyInput[]
    createMany?: CandidateCreateManyVacancyInputEnvelope
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
  }

  export type CompetencyUncheckedCreateNestedManyWithoutVacancyInput = {
    create?: XOR<CompetencyCreateWithoutVacancyInput, CompetencyUncheckedCreateWithoutVacancyInput> | CompetencyCreateWithoutVacancyInput[] | CompetencyUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CompetencyCreateOrConnectWithoutVacancyInput | CompetencyCreateOrConnectWithoutVacancyInput[]
    createMany?: CompetencyCreateManyVacancyInputEnvelope
    connect?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
  }

  export type CandidateUncheckedCreateNestedManyWithoutVacancyInput = {
    create?: XOR<CandidateCreateWithoutVacancyInput, CandidateUncheckedCreateWithoutVacancyInput> | CandidateCreateWithoutVacancyInput[] | CandidateUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutVacancyInput | CandidateCreateOrConnectWithoutVacancyInput[]
    createMany?: CandidateCreateManyVacancyInputEnvelope
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CompetencyUpdateManyWithoutVacancyNestedInput = {
    create?: XOR<CompetencyCreateWithoutVacancyInput, CompetencyUncheckedCreateWithoutVacancyInput> | CompetencyCreateWithoutVacancyInput[] | CompetencyUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CompetencyCreateOrConnectWithoutVacancyInput | CompetencyCreateOrConnectWithoutVacancyInput[]
    upsert?: CompetencyUpsertWithWhereUniqueWithoutVacancyInput | CompetencyUpsertWithWhereUniqueWithoutVacancyInput[]
    createMany?: CompetencyCreateManyVacancyInputEnvelope
    set?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    disconnect?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    delete?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    connect?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    update?: CompetencyUpdateWithWhereUniqueWithoutVacancyInput | CompetencyUpdateWithWhereUniqueWithoutVacancyInput[]
    updateMany?: CompetencyUpdateManyWithWhereWithoutVacancyInput | CompetencyUpdateManyWithWhereWithoutVacancyInput[]
    deleteMany?: CompetencyScalarWhereInput | CompetencyScalarWhereInput[]
  }

  export type CandidateUpdateManyWithoutVacancyNestedInput = {
    create?: XOR<CandidateCreateWithoutVacancyInput, CandidateUncheckedCreateWithoutVacancyInput> | CandidateCreateWithoutVacancyInput[] | CandidateUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutVacancyInput | CandidateCreateOrConnectWithoutVacancyInput[]
    upsert?: CandidateUpsertWithWhereUniqueWithoutVacancyInput | CandidateUpsertWithWhereUniqueWithoutVacancyInput[]
    createMany?: CandidateCreateManyVacancyInputEnvelope
    set?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    disconnect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    delete?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    update?: CandidateUpdateWithWhereUniqueWithoutVacancyInput | CandidateUpdateWithWhereUniqueWithoutVacancyInput[]
    updateMany?: CandidateUpdateManyWithWhereWithoutVacancyInput | CandidateUpdateManyWithWhereWithoutVacancyInput[]
    deleteMany?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
  }

  export type CompetencyUncheckedUpdateManyWithoutVacancyNestedInput = {
    create?: XOR<CompetencyCreateWithoutVacancyInput, CompetencyUncheckedCreateWithoutVacancyInput> | CompetencyCreateWithoutVacancyInput[] | CompetencyUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CompetencyCreateOrConnectWithoutVacancyInput | CompetencyCreateOrConnectWithoutVacancyInput[]
    upsert?: CompetencyUpsertWithWhereUniqueWithoutVacancyInput | CompetencyUpsertWithWhereUniqueWithoutVacancyInput[]
    createMany?: CompetencyCreateManyVacancyInputEnvelope
    set?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    disconnect?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    delete?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    connect?: CompetencyWhereUniqueInput | CompetencyWhereUniqueInput[]
    update?: CompetencyUpdateWithWhereUniqueWithoutVacancyInput | CompetencyUpdateWithWhereUniqueWithoutVacancyInput[]
    updateMany?: CompetencyUpdateManyWithWhereWithoutVacancyInput | CompetencyUpdateManyWithWhereWithoutVacancyInput[]
    deleteMany?: CompetencyScalarWhereInput | CompetencyScalarWhereInput[]
  }

  export type CandidateUncheckedUpdateManyWithoutVacancyNestedInput = {
    create?: XOR<CandidateCreateWithoutVacancyInput, CandidateUncheckedCreateWithoutVacancyInput> | CandidateCreateWithoutVacancyInput[] | CandidateUncheckedCreateWithoutVacancyInput[]
    connectOrCreate?: CandidateCreateOrConnectWithoutVacancyInput | CandidateCreateOrConnectWithoutVacancyInput[]
    upsert?: CandidateUpsertWithWhereUniqueWithoutVacancyInput | CandidateUpsertWithWhereUniqueWithoutVacancyInput[]
    createMany?: CandidateCreateManyVacancyInputEnvelope
    set?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    disconnect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    delete?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    connect?: CandidateWhereUniqueInput | CandidateWhereUniqueInput[]
    update?: CandidateUpdateWithWhereUniqueWithoutVacancyInput | CandidateUpdateWithWhereUniqueWithoutVacancyInput[]
    updateMany?: CandidateUpdateManyWithWhereWithoutVacancyInput | CandidateUpdateManyWithWhereWithoutVacancyInput[]
    deleteMany?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
  }

  export type VacancyCreateNestedOneWithoutCompetenciesInput = {
    create?: XOR<VacancyCreateWithoutCompetenciesInput, VacancyUncheckedCreateWithoutCompetenciesInput>
    connectOrCreate?: VacancyCreateOrConnectWithoutCompetenciesInput
    connect?: VacancyWhereUniqueInput
  }

  export type ScoreCreateNestedManyWithoutCompetencyInput = {
    create?: XOR<ScoreCreateWithoutCompetencyInput, ScoreUncheckedCreateWithoutCompetencyInput> | ScoreCreateWithoutCompetencyInput[] | ScoreUncheckedCreateWithoutCompetencyInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutCompetencyInput | ScoreCreateOrConnectWithoutCompetencyInput[]
    createMany?: ScoreCreateManyCompetencyInputEnvelope
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
  }

  export type ScoreUncheckedCreateNestedManyWithoutCompetencyInput = {
    create?: XOR<ScoreCreateWithoutCompetencyInput, ScoreUncheckedCreateWithoutCompetencyInput> | ScoreCreateWithoutCompetencyInput[] | ScoreUncheckedCreateWithoutCompetencyInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutCompetencyInput | ScoreCreateOrConnectWithoutCompetencyInput[]
    createMany?: ScoreCreateManyCompetencyInputEnvelope
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type VacancyUpdateOneRequiredWithoutCompetenciesNestedInput = {
    create?: XOR<VacancyCreateWithoutCompetenciesInput, VacancyUncheckedCreateWithoutCompetenciesInput>
    connectOrCreate?: VacancyCreateOrConnectWithoutCompetenciesInput
    upsert?: VacancyUpsertWithoutCompetenciesInput
    connect?: VacancyWhereUniqueInput
    update?: XOR<XOR<VacancyUpdateToOneWithWhereWithoutCompetenciesInput, VacancyUpdateWithoutCompetenciesInput>, VacancyUncheckedUpdateWithoutCompetenciesInput>
  }

  export type ScoreUpdateManyWithoutCompetencyNestedInput = {
    create?: XOR<ScoreCreateWithoutCompetencyInput, ScoreUncheckedCreateWithoutCompetencyInput> | ScoreCreateWithoutCompetencyInput[] | ScoreUncheckedCreateWithoutCompetencyInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutCompetencyInput | ScoreCreateOrConnectWithoutCompetencyInput[]
    upsert?: ScoreUpsertWithWhereUniqueWithoutCompetencyInput | ScoreUpsertWithWhereUniqueWithoutCompetencyInput[]
    createMany?: ScoreCreateManyCompetencyInputEnvelope
    set?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    disconnect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    delete?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    update?: ScoreUpdateWithWhereUniqueWithoutCompetencyInput | ScoreUpdateWithWhereUniqueWithoutCompetencyInput[]
    updateMany?: ScoreUpdateManyWithWhereWithoutCompetencyInput | ScoreUpdateManyWithWhereWithoutCompetencyInput[]
    deleteMany?: ScoreScalarWhereInput | ScoreScalarWhereInput[]
  }

  export type ScoreUncheckedUpdateManyWithoutCompetencyNestedInput = {
    create?: XOR<ScoreCreateWithoutCompetencyInput, ScoreUncheckedCreateWithoutCompetencyInput> | ScoreCreateWithoutCompetencyInput[] | ScoreUncheckedCreateWithoutCompetencyInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutCompetencyInput | ScoreCreateOrConnectWithoutCompetencyInput[]
    upsert?: ScoreUpsertWithWhereUniqueWithoutCompetencyInput | ScoreUpsertWithWhereUniqueWithoutCompetencyInput[]
    createMany?: ScoreCreateManyCompetencyInputEnvelope
    set?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    disconnect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    delete?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    update?: ScoreUpdateWithWhereUniqueWithoutCompetencyInput | ScoreUpdateWithWhereUniqueWithoutCompetencyInput[]
    updateMany?: ScoreUpdateManyWithWhereWithoutCompetencyInput | ScoreUpdateManyWithWhereWithoutCompetencyInput[]
    deleteMany?: ScoreScalarWhereInput | ScoreScalarWhereInput[]
  }

  export type VacancyCreateNestedOneWithoutCandidatesInput = {
    create?: XOR<VacancyCreateWithoutCandidatesInput, VacancyUncheckedCreateWithoutCandidatesInput>
    connectOrCreate?: VacancyCreateOrConnectWithoutCandidatesInput
    connect?: VacancyWhereUniqueInput
  }

  export type ScorecardCreateNestedManyWithoutCandidateInput = {
    create?: XOR<ScorecardCreateWithoutCandidateInput, ScorecardUncheckedCreateWithoutCandidateInput> | ScorecardCreateWithoutCandidateInput[] | ScorecardUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ScorecardCreateOrConnectWithoutCandidateInput | ScorecardCreateOrConnectWithoutCandidateInput[]
    createMany?: ScorecardCreateManyCandidateInputEnvelope
    connect?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
  }

  export type OfferCreateNestedOneWithoutCandidateInput = {
    create?: XOR<OfferCreateWithoutCandidateInput, OfferUncheckedCreateWithoutCandidateInput>
    connectOrCreate?: OfferCreateOrConnectWithoutCandidateInput
    connect?: OfferWhereUniqueInput
  }

  export type ScorecardUncheckedCreateNestedManyWithoutCandidateInput = {
    create?: XOR<ScorecardCreateWithoutCandidateInput, ScorecardUncheckedCreateWithoutCandidateInput> | ScorecardCreateWithoutCandidateInput[] | ScorecardUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ScorecardCreateOrConnectWithoutCandidateInput | ScorecardCreateOrConnectWithoutCandidateInput[]
    createMany?: ScorecardCreateManyCandidateInputEnvelope
    connect?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
  }

  export type OfferUncheckedCreateNestedOneWithoutCandidateInput = {
    create?: XOR<OfferCreateWithoutCandidateInput, OfferUncheckedCreateWithoutCandidateInput>
    connectOrCreate?: OfferCreateOrConnectWithoutCandidateInput
    connect?: OfferWhereUniqueInput
  }

  export type VacancyUpdateOneRequiredWithoutCandidatesNestedInput = {
    create?: XOR<VacancyCreateWithoutCandidatesInput, VacancyUncheckedCreateWithoutCandidatesInput>
    connectOrCreate?: VacancyCreateOrConnectWithoutCandidatesInput
    upsert?: VacancyUpsertWithoutCandidatesInput
    connect?: VacancyWhereUniqueInput
    update?: XOR<XOR<VacancyUpdateToOneWithWhereWithoutCandidatesInput, VacancyUpdateWithoutCandidatesInput>, VacancyUncheckedUpdateWithoutCandidatesInput>
  }

  export type ScorecardUpdateManyWithoutCandidateNestedInput = {
    create?: XOR<ScorecardCreateWithoutCandidateInput, ScorecardUncheckedCreateWithoutCandidateInput> | ScorecardCreateWithoutCandidateInput[] | ScorecardUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ScorecardCreateOrConnectWithoutCandidateInput | ScorecardCreateOrConnectWithoutCandidateInput[]
    upsert?: ScorecardUpsertWithWhereUniqueWithoutCandidateInput | ScorecardUpsertWithWhereUniqueWithoutCandidateInput[]
    createMany?: ScorecardCreateManyCandidateInputEnvelope
    set?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    disconnect?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    delete?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    connect?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    update?: ScorecardUpdateWithWhereUniqueWithoutCandidateInput | ScorecardUpdateWithWhereUniqueWithoutCandidateInput[]
    updateMany?: ScorecardUpdateManyWithWhereWithoutCandidateInput | ScorecardUpdateManyWithWhereWithoutCandidateInput[]
    deleteMany?: ScorecardScalarWhereInput | ScorecardScalarWhereInput[]
  }

  export type OfferUpdateOneWithoutCandidateNestedInput = {
    create?: XOR<OfferCreateWithoutCandidateInput, OfferUncheckedCreateWithoutCandidateInput>
    connectOrCreate?: OfferCreateOrConnectWithoutCandidateInput
    upsert?: OfferUpsertWithoutCandidateInput
    disconnect?: OfferWhereInput | boolean
    delete?: OfferWhereInput | boolean
    connect?: OfferWhereUniqueInput
    update?: XOR<XOR<OfferUpdateToOneWithWhereWithoutCandidateInput, OfferUpdateWithoutCandidateInput>, OfferUncheckedUpdateWithoutCandidateInput>
  }

  export type ScorecardUncheckedUpdateManyWithoutCandidateNestedInput = {
    create?: XOR<ScorecardCreateWithoutCandidateInput, ScorecardUncheckedCreateWithoutCandidateInput> | ScorecardCreateWithoutCandidateInput[] | ScorecardUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ScorecardCreateOrConnectWithoutCandidateInput | ScorecardCreateOrConnectWithoutCandidateInput[]
    upsert?: ScorecardUpsertWithWhereUniqueWithoutCandidateInput | ScorecardUpsertWithWhereUniqueWithoutCandidateInput[]
    createMany?: ScorecardCreateManyCandidateInputEnvelope
    set?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    disconnect?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    delete?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    connect?: ScorecardWhereUniqueInput | ScorecardWhereUniqueInput[]
    update?: ScorecardUpdateWithWhereUniqueWithoutCandidateInput | ScorecardUpdateWithWhereUniqueWithoutCandidateInput[]
    updateMany?: ScorecardUpdateManyWithWhereWithoutCandidateInput | ScorecardUpdateManyWithWhereWithoutCandidateInput[]
    deleteMany?: ScorecardScalarWhereInput | ScorecardScalarWhereInput[]
  }

  export type OfferUncheckedUpdateOneWithoutCandidateNestedInput = {
    create?: XOR<OfferCreateWithoutCandidateInput, OfferUncheckedCreateWithoutCandidateInput>
    connectOrCreate?: OfferCreateOrConnectWithoutCandidateInput
    upsert?: OfferUpsertWithoutCandidateInput
    disconnect?: OfferWhereInput | boolean
    delete?: OfferWhereInput | boolean
    connect?: OfferWhereUniqueInput
    update?: XOR<XOR<OfferUpdateToOneWithWhereWithoutCandidateInput, OfferUpdateWithoutCandidateInput>, OfferUncheckedUpdateWithoutCandidateInput>
  }

  export type CandidateCreateNestedOneWithoutScorecardsInput = {
    create?: XOR<CandidateCreateWithoutScorecardsInput, CandidateUncheckedCreateWithoutScorecardsInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutScorecardsInput
    connect?: CandidateWhereUniqueInput
  }

  export type ScoreCreateNestedManyWithoutScorecardInput = {
    create?: XOR<ScoreCreateWithoutScorecardInput, ScoreUncheckedCreateWithoutScorecardInput> | ScoreCreateWithoutScorecardInput[] | ScoreUncheckedCreateWithoutScorecardInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutScorecardInput | ScoreCreateOrConnectWithoutScorecardInput[]
    createMany?: ScoreCreateManyScorecardInputEnvelope
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
  }

  export type ScoreUncheckedCreateNestedManyWithoutScorecardInput = {
    create?: XOR<ScoreCreateWithoutScorecardInput, ScoreUncheckedCreateWithoutScorecardInput> | ScoreCreateWithoutScorecardInput[] | ScoreUncheckedCreateWithoutScorecardInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutScorecardInput | ScoreCreateOrConnectWithoutScorecardInput[]
    createMany?: ScoreCreateManyScorecardInputEnvelope
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
  }

  export type CandidateUpdateOneRequiredWithoutScorecardsNestedInput = {
    create?: XOR<CandidateCreateWithoutScorecardsInput, CandidateUncheckedCreateWithoutScorecardsInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutScorecardsInput
    upsert?: CandidateUpsertWithoutScorecardsInput
    connect?: CandidateWhereUniqueInput
    update?: XOR<XOR<CandidateUpdateToOneWithWhereWithoutScorecardsInput, CandidateUpdateWithoutScorecardsInput>, CandidateUncheckedUpdateWithoutScorecardsInput>
  }

  export type ScoreUpdateManyWithoutScorecardNestedInput = {
    create?: XOR<ScoreCreateWithoutScorecardInput, ScoreUncheckedCreateWithoutScorecardInput> | ScoreCreateWithoutScorecardInput[] | ScoreUncheckedCreateWithoutScorecardInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutScorecardInput | ScoreCreateOrConnectWithoutScorecardInput[]
    upsert?: ScoreUpsertWithWhereUniqueWithoutScorecardInput | ScoreUpsertWithWhereUniqueWithoutScorecardInput[]
    createMany?: ScoreCreateManyScorecardInputEnvelope
    set?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    disconnect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    delete?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    update?: ScoreUpdateWithWhereUniqueWithoutScorecardInput | ScoreUpdateWithWhereUniqueWithoutScorecardInput[]
    updateMany?: ScoreUpdateManyWithWhereWithoutScorecardInput | ScoreUpdateManyWithWhereWithoutScorecardInput[]
    deleteMany?: ScoreScalarWhereInput | ScoreScalarWhereInput[]
  }

  export type ScoreUncheckedUpdateManyWithoutScorecardNestedInput = {
    create?: XOR<ScoreCreateWithoutScorecardInput, ScoreUncheckedCreateWithoutScorecardInput> | ScoreCreateWithoutScorecardInput[] | ScoreUncheckedCreateWithoutScorecardInput[]
    connectOrCreate?: ScoreCreateOrConnectWithoutScorecardInput | ScoreCreateOrConnectWithoutScorecardInput[]
    upsert?: ScoreUpsertWithWhereUniqueWithoutScorecardInput | ScoreUpsertWithWhereUniqueWithoutScorecardInput[]
    createMany?: ScoreCreateManyScorecardInputEnvelope
    set?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    disconnect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    delete?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    connect?: ScoreWhereUniqueInput | ScoreWhereUniqueInput[]
    update?: ScoreUpdateWithWhereUniqueWithoutScorecardInput | ScoreUpdateWithWhereUniqueWithoutScorecardInput[]
    updateMany?: ScoreUpdateManyWithWhereWithoutScorecardInput | ScoreUpdateManyWithWhereWithoutScorecardInput[]
    deleteMany?: ScoreScalarWhereInput | ScoreScalarWhereInput[]
  }

  export type ScorecardCreateNestedOneWithoutScoresInput = {
    create?: XOR<ScorecardCreateWithoutScoresInput, ScorecardUncheckedCreateWithoutScoresInput>
    connectOrCreate?: ScorecardCreateOrConnectWithoutScoresInput
    connect?: ScorecardWhereUniqueInput
  }

  export type CompetencyCreateNestedOneWithoutScoresInput = {
    create?: XOR<CompetencyCreateWithoutScoresInput, CompetencyUncheckedCreateWithoutScoresInput>
    connectOrCreate?: CompetencyCreateOrConnectWithoutScoresInput
    connect?: CompetencyWhereUniqueInput
  }

  export type ScorecardUpdateOneRequiredWithoutScoresNestedInput = {
    create?: XOR<ScorecardCreateWithoutScoresInput, ScorecardUncheckedCreateWithoutScoresInput>
    connectOrCreate?: ScorecardCreateOrConnectWithoutScoresInput
    upsert?: ScorecardUpsertWithoutScoresInput
    connect?: ScorecardWhereUniqueInput
    update?: XOR<XOR<ScorecardUpdateToOneWithWhereWithoutScoresInput, ScorecardUpdateWithoutScoresInput>, ScorecardUncheckedUpdateWithoutScoresInput>
  }

  export type CompetencyUpdateOneRequiredWithoutScoresNestedInput = {
    create?: XOR<CompetencyCreateWithoutScoresInput, CompetencyUncheckedCreateWithoutScoresInput>
    connectOrCreate?: CompetencyCreateOrConnectWithoutScoresInput
    upsert?: CompetencyUpsertWithoutScoresInput
    connect?: CompetencyWhereUniqueInput
    update?: XOR<XOR<CompetencyUpdateToOneWithWhereWithoutScoresInput, CompetencyUpdateWithoutScoresInput>, CompetencyUncheckedUpdateWithoutScoresInput>
  }

  export type CandidateCreateNestedOneWithoutOfferInput = {
    create?: XOR<CandidateCreateWithoutOfferInput, CandidateUncheckedCreateWithoutOfferInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutOfferInput
    connect?: CandidateWhereUniqueInput
  }

  export type CandidateUpdateOneRequiredWithoutOfferNestedInput = {
    create?: XOR<CandidateCreateWithoutOfferInput, CandidateUncheckedCreateWithoutOfferInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutOfferInput
    upsert?: CandidateUpsertWithoutOfferInput
    connect?: CandidateWhereUniqueInput
    update?: XOR<XOR<CandidateUpdateToOneWithWhereWithoutOfferInput, CandidateUpdateWithoutOfferInput>, CandidateUncheckedUpdateWithoutOfferInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type CompetencyCreateWithoutVacancyInput = {
    id?: string
    name: string
    category: string
    weight: number
    order: number
    scores?: ScoreCreateNestedManyWithoutCompetencyInput
  }

  export type CompetencyUncheckedCreateWithoutVacancyInput = {
    id?: string
    name: string
    category: string
    weight: number
    order: number
    scores?: ScoreUncheckedCreateNestedManyWithoutCompetencyInput
  }

  export type CompetencyCreateOrConnectWithoutVacancyInput = {
    where: CompetencyWhereUniqueInput
    create: XOR<CompetencyCreateWithoutVacancyInput, CompetencyUncheckedCreateWithoutVacancyInput>
  }

  export type CompetencyCreateManyVacancyInputEnvelope = {
    data: CompetencyCreateManyVacancyInput | CompetencyCreateManyVacancyInput[]
  }

  export type CandidateCreateWithoutVacancyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    scorecards?: ScorecardCreateNestedManyWithoutCandidateInput
    offer?: OfferCreateNestedOneWithoutCandidateInput
  }

  export type CandidateUncheckedCreateWithoutVacancyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    scorecards?: ScorecardUncheckedCreateNestedManyWithoutCandidateInput
    offer?: OfferUncheckedCreateNestedOneWithoutCandidateInput
  }

  export type CandidateCreateOrConnectWithoutVacancyInput = {
    where: CandidateWhereUniqueInput
    create: XOR<CandidateCreateWithoutVacancyInput, CandidateUncheckedCreateWithoutVacancyInput>
  }

  export type CandidateCreateManyVacancyInputEnvelope = {
    data: CandidateCreateManyVacancyInput | CandidateCreateManyVacancyInput[]
  }

  export type CompetencyUpsertWithWhereUniqueWithoutVacancyInput = {
    where: CompetencyWhereUniqueInput
    update: XOR<CompetencyUpdateWithoutVacancyInput, CompetencyUncheckedUpdateWithoutVacancyInput>
    create: XOR<CompetencyCreateWithoutVacancyInput, CompetencyUncheckedCreateWithoutVacancyInput>
  }

  export type CompetencyUpdateWithWhereUniqueWithoutVacancyInput = {
    where: CompetencyWhereUniqueInput
    data: XOR<CompetencyUpdateWithoutVacancyInput, CompetencyUncheckedUpdateWithoutVacancyInput>
  }

  export type CompetencyUpdateManyWithWhereWithoutVacancyInput = {
    where: CompetencyScalarWhereInput
    data: XOR<CompetencyUpdateManyMutationInput, CompetencyUncheckedUpdateManyWithoutVacancyInput>
  }

  export type CompetencyScalarWhereInput = {
    AND?: CompetencyScalarWhereInput | CompetencyScalarWhereInput[]
    OR?: CompetencyScalarWhereInput[]
    NOT?: CompetencyScalarWhereInput | CompetencyScalarWhereInput[]
    id?: StringFilter<"Competency"> | string
    vacancyId?: StringFilter<"Competency"> | string
    name?: StringFilter<"Competency"> | string
    category?: StringFilter<"Competency"> | string
    weight?: FloatFilter<"Competency"> | number
    order?: IntFilter<"Competency"> | number
  }

  export type CandidateUpsertWithWhereUniqueWithoutVacancyInput = {
    where: CandidateWhereUniqueInput
    update: XOR<CandidateUpdateWithoutVacancyInput, CandidateUncheckedUpdateWithoutVacancyInput>
    create: XOR<CandidateCreateWithoutVacancyInput, CandidateUncheckedCreateWithoutVacancyInput>
  }

  export type CandidateUpdateWithWhereUniqueWithoutVacancyInput = {
    where: CandidateWhereUniqueInput
    data: XOR<CandidateUpdateWithoutVacancyInput, CandidateUncheckedUpdateWithoutVacancyInput>
  }

  export type CandidateUpdateManyWithWhereWithoutVacancyInput = {
    where: CandidateScalarWhereInput
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyWithoutVacancyInput>
  }

  export type CandidateScalarWhereInput = {
    AND?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
    OR?: CandidateScalarWhereInput[]
    NOT?: CandidateScalarWhereInput | CandidateScalarWhereInput[]
    id?: StringFilter<"Candidate"> | string
    vacancyId?: StringFilter<"Candidate"> | string
    name?: StringFilter<"Candidate"> | string
    email?: StringFilter<"Candidate"> | string
    phone?: StringNullableFilter<"Candidate"> | string | null
    yearsExperience?: FloatNullableFilter<"Candidate"> | number | null
    expectedSalary?: FloatNullableFilter<"Candidate"> | number | null
    rawCv?: StringFilter<"Candidate"> | string
    portfolioUrl?: StringNullableFilter<"Candidate"> | string | null
    portfolioTitle?: StringNullableFilter<"Candidate"> | string | null
    portfolioImage?: StringNullableFilter<"Candidate"> | string | null
    portfolioDesc?: StringNullableFilter<"Candidate"> | string | null
    compositeScore?: FloatNullableFilter<"Candidate"> | number | null
    status?: StringFilter<"Candidate"> | string
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
  }

  export type VacancyCreateWithoutCompetenciesInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    candidates?: CandidateCreateNestedManyWithoutVacancyInput
  }

  export type VacancyUncheckedCreateWithoutCompetenciesInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    candidates?: CandidateUncheckedCreateNestedManyWithoutVacancyInput
  }

  export type VacancyCreateOrConnectWithoutCompetenciesInput = {
    where: VacancyWhereUniqueInput
    create: XOR<VacancyCreateWithoutCompetenciesInput, VacancyUncheckedCreateWithoutCompetenciesInput>
  }

  export type ScoreCreateWithoutCompetencyInput = {
    id?: string
    value: number
    notes?: string | null
    scorecard: ScorecardCreateNestedOneWithoutScoresInput
  }

  export type ScoreUncheckedCreateWithoutCompetencyInput = {
    id?: string
    scorecardId: string
    value: number
    notes?: string | null
  }

  export type ScoreCreateOrConnectWithoutCompetencyInput = {
    where: ScoreWhereUniqueInput
    create: XOR<ScoreCreateWithoutCompetencyInput, ScoreUncheckedCreateWithoutCompetencyInput>
  }

  export type ScoreCreateManyCompetencyInputEnvelope = {
    data: ScoreCreateManyCompetencyInput | ScoreCreateManyCompetencyInput[]
  }

  export type VacancyUpsertWithoutCompetenciesInput = {
    update: XOR<VacancyUpdateWithoutCompetenciesInput, VacancyUncheckedUpdateWithoutCompetenciesInput>
    create: XOR<VacancyCreateWithoutCompetenciesInput, VacancyUncheckedCreateWithoutCompetenciesInput>
    where?: VacancyWhereInput
  }

  export type VacancyUpdateToOneWithWhereWithoutCompetenciesInput = {
    where?: VacancyWhereInput
    data: XOR<VacancyUpdateWithoutCompetenciesInput, VacancyUncheckedUpdateWithoutCompetenciesInput>
  }

  export type VacancyUpdateWithoutCompetenciesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidates?: CandidateUpdateManyWithoutVacancyNestedInput
  }

  export type VacancyUncheckedUpdateWithoutCompetenciesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidates?: CandidateUncheckedUpdateManyWithoutVacancyNestedInput
  }

  export type ScoreUpsertWithWhereUniqueWithoutCompetencyInput = {
    where: ScoreWhereUniqueInput
    update: XOR<ScoreUpdateWithoutCompetencyInput, ScoreUncheckedUpdateWithoutCompetencyInput>
    create: XOR<ScoreCreateWithoutCompetencyInput, ScoreUncheckedCreateWithoutCompetencyInput>
  }

  export type ScoreUpdateWithWhereUniqueWithoutCompetencyInput = {
    where: ScoreWhereUniqueInput
    data: XOR<ScoreUpdateWithoutCompetencyInput, ScoreUncheckedUpdateWithoutCompetencyInput>
  }

  export type ScoreUpdateManyWithWhereWithoutCompetencyInput = {
    where: ScoreScalarWhereInput
    data: XOR<ScoreUpdateManyMutationInput, ScoreUncheckedUpdateManyWithoutCompetencyInput>
  }

  export type ScoreScalarWhereInput = {
    AND?: ScoreScalarWhereInput | ScoreScalarWhereInput[]
    OR?: ScoreScalarWhereInput[]
    NOT?: ScoreScalarWhereInput | ScoreScalarWhereInput[]
    id?: StringFilter<"Score"> | string
    scorecardId?: StringFilter<"Score"> | string
    competencyId?: StringFilter<"Score"> | string
    value?: IntFilter<"Score"> | number
    notes?: StringNullableFilter<"Score"> | string | null
  }

  export type VacancyCreateWithoutCandidatesInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competencies?: CompetencyCreateNestedManyWithoutVacancyInput
  }

  export type VacancyUncheckedCreateWithoutCandidatesInput = {
    id?: string
    title: string
    department?: string | null
    location?: string | null
    salaryBudgetMin?: number | null
    salaryBudgetMax?: number | null
    acceptanceScore?: number
    jobPostingHtml: string
    rawBlueprint: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competencies?: CompetencyUncheckedCreateNestedManyWithoutVacancyInput
  }

  export type VacancyCreateOrConnectWithoutCandidatesInput = {
    where: VacancyWhereUniqueInput
    create: XOR<VacancyCreateWithoutCandidatesInput, VacancyUncheckedCreateWithoutCandidatesInput>
  }

  export type ScorecardCreateWithoutCandidateInput = {
    id?: string
    managerName: string
    submittedAt?: Date | string
    scores?: ScoreCreateNestedManyWithoutScorecardInput
  }

  export type ScorecardUncheckedCreateWithoutCandidateInput = {
    id?: string
    managerName: string
    submittedAt?: Date | string
    scores?: ScoreUncheckedCreateNestedManyWithoutScorecardInput
  }

  export type ScorecardCreateOrConnectWithoutCandidateInput = {
    where: ScorecardWhereUniqueInput
    create: XOR<ScorecardCreateWithoutCandidateInput, ScorecardUncheckedCreateWithoutCandidateInput>
  }

  export type ScorecardCreateManyCandidateInputEnvelope = {
    data: ScorecardCreateManyCandidateInput | ScorecardCreateManyCandidateInput[]
  }

  export type OfferCreateWithoutCandidateInput = {
    id?: string
    offeredSalary: number
    firstWorkingDate: string
    contractType: string
    itEquipment?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferUncheckedCreateWithoutCandidateInput = {
    id?: string
    offeredSalary: number
    firstWorkingDate: string
    contractType: string
    itEquipment?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferCreateOrConnectWithoutCandidateInput = {
    where: OfferWhereUniqueInput
    create: XOR<OfferCreateWithoutCandidateInput, OfferUncheckedCreateWithoutCandidateInput>
  }

  export type VacancyUpsertWithoutCandidatesInput = {
    update: XOR<VacancyUpdateWithoutCandidatesInput, VacancyUncheckedUpdateWithoutCandidatesInput>
    create: XOR<VacancyCreateWithoutCandidatesInput, VacancyUncheckedCreateWithoutCandidatesInput>
    where?: VacancyWhereInput
  }

  export type VacancyUpdateToOneWithWhereWithoutCandidatesInput = {
    where?: VacancyWhereInput
    data: XOR<VacancyUpdateWithoutCandidatesInput, VacancyUncheckedUpdateWithoutCandidatesInput>
  }

  export type VacancyUpdateWithoutCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competencies?: CompetencyUpdateManyWithoutVacancyNestedInput
  }

  export type VacancyUncheckedUpdateWithoutCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBudgetMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryBudgetMax?: NullableFloatFieldUpdateOperationsInput | number | null
    acceptanceScore?: FloatFieldUpdateOperationsInput | number
    jobPostingHtml?: StringFieldUpdateOperationsInput | string
    rawBlueprint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competencies?: CompetencyUncheckedUpdateManyWithoutVacancyNestedInput
  }

  export type ScorecardUpsertWithWhereUniqueWithoutCandidateInput = {
    where: ScorecardWhereUniqueInput
    update: XOR<ScorecardUpdateWithoutCandidateInput, ScorecardUncheckedUpdateWithoutCandidateInput>
    create: XOR<ScorecardCreateWithoutCandidateInput, ScorecardUncheckedCreateWithoutCandidateInput>
  }

  export type ScorecardUpdateWithWhereUniqueWithoutCandidateInput = {
    where: ScorecardWhereUniqueInput
    data: XOR<ScorecardUpdateWithoutCandidateInput, ScorecardUncheckedUpdateWithoutCandidateInput>
  }

  export type ScorecardUpdateManyWithWhereWithoutCandidateInput = {
    where: ScorecardScalarWhereInput
    data: XOR<ScorecardUpdateManyMutationInput, ScorecardUncheckedUpdateManyWithoutCandidateInput>
  }

  export type ScorecardScalarWhereInput = {
    AND?: ScorecardScalarWhereInput | ScorecardScalarWhereInput[]
    OR?: ScorecardScalarWhereInput[]
    NOT?: ScorecardScalarWhereInput | ScorecardScalarWhereInput[]
    id?: StringFilter<"Scorecard"> | string
    candidateId?: StringFilter<"Scorecard"> | string
    managerName?: StringFilter<"Scorecard"> | string
    submittedAt?: DateTimeFilter<"Scorecard"> | Date | string
  }

  export type OfferUpsertWithoutCandidateInput = {
    update: XOR<OfferUpdateWithoutCandidateInput, OfferUncheckedUpdateWithoutCandidateInput>
    create: XOR<OfferCreateWithoutCandidateInput, OfferUncheckedCreateWithoutCandidateInput>
    where?: OfferWhereInput
  }

  export type OfferUpdateToOneWithWhereWithoutCandidateInput = {
    where?: OfferWhereInput
    data: XOR<OfferUpdateWithoutCandidateInput, OfferUncheckedUpdateWithoutCandidateInput>
  }

  export type OfferUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    offeredSalary?: FloatFieldUpdateOperationsInput | number
    firstWorkingDate?: StringFieldUpdateOperationsInput | string
    contractType?: StringFieldUpdateOperationsInput | string
    itEquipment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferUncheckedUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    offeredSalary?: FloatFieldUpdateOperationsInput | number
    firstWorkingDate?: StringFieldUpdateOperationsInput | string
    contractType?: StringFieldUpdateOperationsInput | string
    itEquipment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateCreateWithoutScorecardsInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    vacancy: VacancyCreateNestedOneWithoutCandidatesInput
    offer?: OfferCreateNestedOneWithoutCandidateInput
  }

  export type CandidateUncheckedCreateWithoutScorecardsInput = {
    id?: string
    vacancyId: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    offer?: OfferUncheckedCreateNestedOneWithoutCandidateInput
  }

  export type CandidateCreateOrConnectWithoutScorecardsInput = {
    where: CandidateWhereUniqueInput
    create: XOR<CandidateCreateWithoutScorecardsInput, CandidateUncheckedCreateWithoutScorecardsInput>
  }

  export type ScoreCreateWithoutScorecardInput = {
    id?: string
    value: number
    notes?: string | null
    competency: CompetencyCreateNestedOneWithoutScoresInput
  }

  export type ScoreUncheckedCreateWithoutScorecardInput = {
    id?: string
    competencyId: string
    value: number
    notes?: string | null
  }

  export type ScoreCreateOrConnectWithoutScorecardInput = {
    where: ScoreWhereUniqueInput
    create: XOR<ScoreCreateWithoutScorecardInput, ScoreUncheckedCreateWithoutScorecardInput>
  }

  export type ScoreCreateManyScorecardInputEnvelope = {
    data: ScoreCreateManyScorecardInput | ScoreCreateManyScorecardInput[]
  }

  export type CandidateUpsertWithoutScorecardsInput = {
    update: XOR<CandidateUpdateWithoutScorecardsInput, CandidateUncheckedUpdateWithoutScorecardsInput>
    create: XOR<CandidateCreateWithoutScorecardsInput, CandidateUncheckedCreateWithoutScorecardsInput>
    where?: CandidateWhereInput
  }

  export type CandidateUpdateToOneWithWhereWithoutScorecardsInput = {
    where?: CandidateWhereInput
    data: XOR<CandidateUpdateWithoutScorecardsInput, CandidateUncheckedUpdateWithoutScorecardsInput>
  }

  export type CandidateUpdateWithoutScorecardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vacancy?: VacancyUpdateOneRequiredWithoutCandidatesNestedInput
    offer?: OfferUpdateOneWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateWithoutScorecardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    offer?: OfferUncheckedUpdateOneWithoutCandidateNestedInput
  }

  export type ScoreUpsertWithWhereUniqueWithoutScorecardInput = {
    where: ScoreWhereUniqueInput
    update: XOR<ScoreUpdateWithoutScorecardInput, ScoreUncheckedUpdateWithoutScorecardInput>
    create: XOR<ScoreCreateWithoutScorecardInput, ScoreUncheckedCreateWithoutScorecardInput>
  }

  export type ScoreUpdateWithWhereUniqueWithoutScorecardInput = {
    where: ScoreWhereUniqueInput
    data: XOR<ScoreUpdateWithoutScorecardInput, ScoreUncheckedUpdateWithoutScorecardInput>
  }

  export type ScoreUpdateManyWithWhereWithoutScorecardInput = {
    where: ScoreScalarWhereInput
    data: XOR<ScoreUpdateManyMutationInput, ScoreUncheckedUpdateManyWithoutScorecardInput>
  }

  export type ScorecardCreateWithoutScoresInput = {
    id?: string
    managerName: string
    submittedAt?: Date | string
    candidate: CandidateCreateNestedOneWithoutScorecardsInput
  }

  export type ScorecardUncheckedCreateWithoutScoresInput = {
    id?: string
    candidateId: string
    managerName: string
    submittedAt?: Date | string
  }

  export type ScorecardCreateOrConnectWithoutScoresInput = {
    where: ScorecardWhereUniqueInput
    create: XOR<ScorecardCreateWithoutScoresInput, ScorecardUncheckedCreateWithoutScoresInput>
  }

  export type CompetencyCreateWithoutScoresInput = {
    id?: string
    name: string
    category: string
    weight: number
    order: number
    vacancy: VacancyCreateNestedOneWithoutCompetenciesInput
  }

  export type CompetencyUncheckedCreateWithoutScoresInput = {
    id?: string
    vacancyId: string
    name: string
    category: string
    weight: number
    order: number
  }

  export type CompetencyCreateOrConnectWithoutScoresInput = {
    where: CompetencyWhereUniqueInput
    create: XOR<CompetencyCreateWithoutScoresInput, CompetencyUncheckedCreateWithoutScoresInput>
  }

  export type ScorecardUpsertWithoutScoresInput = {
    update: XOR<ScorecardUpdateWithoutScoresInput, ScorecardUncheckedUpdateWithoutScoresInput>
    create: XOR<ScorecardCreateWithoutScoresInput, ScorecardUncheckedCreateWithoutScoresInput>
    where?: ScorecardWhereInput
  }

  export type ScorecardUpdateToOneWithWhereWithoutScoresInput = {
    where?: ScorecardWhereInput
    data: XOR<ScorecardUpdateWithoutScoresInput, ScorecardUncheckedUpdateWithoutScoresInput>
  }

  export type ScorecardUpdateWithoutScoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidate?: CandidateUpdateOneRequiredWithoutScorecardsNestedInput
  }

  export type ScorecardUncheckedUpdateWithoutScoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompetencyUpsertWithoutScoresInput = {
    update: XOR<CompetencyUpdateWithoutScoresInput, CompetencyUncheckedUpdateWithoutScoresInput>
    create: XOR<CompetencyCreateWithoutScoresInput, CompetencyUncheckedCreateWithoutScoresInput>
    where?: CompetencyWhereInput
  }

  export type CompetencyUpdateToOneWithWhereWithoutScoresInput = {
    where?: CompetencyWhereInput
    data: XOR<CompetencyUpdateWithoutScoresInput, CompetencyUncheckedUpdateWithoutScoresInput>
  }

  export type CompetencyUpdateWithoutScoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    vacancy?: VacancyUpdateOneRequiredWithoutCompetenciesNestedInput
  }

  export type CompetencyUncheckedUpdateWithoutScoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
  }

  export type CandidateCreateWithoutOfferInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    vacancy: VacancyCreateNestedOneWithoutCandidatesInput
    scorecards?: ScorecardCreateNestedManyWithoutCandidateInput
  }

  export type CandidateUncheckedCreateWithoutOfferInput = {
    id?: string
    vacancyId: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    scorecards?: ScorecardUncheckedCreateNestedManyWithoutCandidateInput
  }

  export type CandidateCreateOrConnectWithoutOfferInput = {
    where: CandidateWhereUniqueInput
    create: XOR<CandidateCreateWithoutOfferInput, CandidateUncheckedCreateWithoutOfferInput>
  }

  export type CandidateUpsertWithoutOfferInput = {
    update: XOR<CandidateUpdateWithoutOfferInput, CandidateUncheckedUpdateWithoutOfferInput>
    create: XOR<CandidateCreateWithoutOfferInput, CandidateUncheckedCreateWithoutOfferInput>
    where?: CandidateWhereInput
  }

  export type CandidateUpdateToOneWithWhereWithoutOfferInput = {
    where?: CandidateWhereInput
    data: XOR<CandidateUpdateWithoutOfferInput, CandidateUncheckedUpdateWithoutOfferInput>
  }

  export type CandidateUpdateWithoutOfferInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vacancy?: VacancyUpdateOneRequiredWithoutCandidatesNestedInput
    scorecards?: ScorecardUpdateManyWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateWithoutOfferInput = {
    id?: StringFieldUpdateOperationsInput | string
    vacancyId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scorecards?: ScorecardUncheckedUpdateManyWithoutCandidateNestedInput
  }

  export type CompetencyCreateManyVacancyInput = {
    id?: string
    name: string
    category: string
    weight: number
    order: number
  }

  export type CandidateCreateManyVacancyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    yearsExperience?: number | null
    expectedSalary?: number | null
    rawCv: string
    portfolioUrl?: string | null
    portfolioTitle?: string | null
    portfolioImage?: string | null
    portfolioDesc?: string | null
    compositeScore?: number | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CompetencyUpdateWithoutVacancyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    scores?: ScoreUpdateManyWithoutCompetencyNestedInput
  }

  export type CompetencyUncheckedUpdateWithoutVacancyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    scores?: ScoreUncheckedUpdateManyWithoutCompetencyNestedInput
  }

  export type CompetencyUncheckedUpdateManyWithoutVacancyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    weight?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
  }

  export type CandidateUpdateWithoutVacancyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scorecards?: ScorecardUpdateManyWithoutCandidateNestedInput
    offer?: OfferUpdateOneWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateWithoutVacancyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scorecards?: ScorecardUncheckedUpdateManyWithoutCandidateNestedInput
    offer?: OfferUncheckedUpdateOneWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateManyWithoutVacancyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    yearsExperience?: NullableFloatFieldUpdateOperationsInput | number | null
    expectedSalary?: NullableFloatFieldUpdateOperationsInput | number | null
    rawCv?: StringFieldUpdateOperationsInput | string
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioTitle?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioImage?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioDesc?: NullableStringFieldUpdateOperationsInput | string | null
    compositeScore?: NullableFloatFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoreCreateManyCompetencyInput = {
    id?: string
    scorecardId: string
    value: number
    notes?: string | null
  }

  export type ScoreUpdateWithoutCompetencyInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    scorecard?: ScorecardUpdateOneRequiredWithoutScoresNestedInput
  }

  export type ScoreUncheckedUpdateWithoutCompetencyInput = {
    id?: StringFieldUpdateOperationsInput | string
    scorecardId?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScoreUncheckedUpdateManyWithoutCompetencyInput = {
    id?: StringFieldUpdateOperationsInput | string
    scorecardId?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScorecardCreateManyCandidateInput = {
    id?: string
    managerName: string
    submittedAt?: Date | string
  }

  export type ScorecardUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scores?: ScoreUpdateManyWithoutScorecardNestedInput
  }

  export type ScorecardUncheckedUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scores?: ScoreUncheckedUpdateManyWithoutScorecardNestedInput
  }

  export type ScorecardUncheckedUpdateManyWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerName?: StringFieldUpdateOperationsInput | string
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScoreCreateManyScorecardInput = {
    id?: string
    competencyId: string
    value: number
    notes?: string | null
  }

  export type ScoreUpdateWithoutScorecardInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    competency?: CompetencyUpdateOneRequiredWithoutScoresNestedInput
  }

  export type ScoreUncheckedUpdateWithoutScorecardInput = {
    id?: StringFieldUpdateOperationsInput | string
    competencyId?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScoreUncheckedUpdateManyWithoutScorecardInput = {
    id?: StringFieldUpdateOperationsInput | string
    competencyId?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}