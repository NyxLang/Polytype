// Type definitions for Polytype 0.6.0-beta.1

declare namespace Polytype
{
    // Helpers /////////////////////////////////////////////////////////////////////////////////////

    type Enrich<T, U> = T & Omit<U, keyof T>;

    type EnrichTimes
    <
        T,
        U1 = never,
        U2 = never,
        U3 = never,
        U4 = never,
        U5 = never,
        U6 = never,
        U7 = never,
        U8 = never,
        U9 = never,
        U10 = never,
    >
    =
    Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<
    T,
    U1>, U2>, U3>, U4>, U5>, U6>, U7>, U8>, U9>, U10>;

    type IntersectionOf<T extends unknown[]> =
    UnboxedIntersectionOf<{ [key in keyof T]: [T[key]]; }> extends { 0: infer U; } ? U : never;

    type ProtoType<T> = T extends { prototype: infer U; } ? U : never;

    type ReadonlyConstructorParameters<T extends new (...args: unknown[]) => unknown> =
    Readonly<ConstructorParameters<T>>;

    type RequireNonEmpty<T> = T extends [] ? never : T;

    type UnboxedIntersectionOf<T extends unknown[]> =
    UnionOf<T> extends infer U ?
    (U extends unknown ? (arg: U) => unknown : never) extends (arg: infer V) => unknown ?
    V : never :
    never;

    type UnionOf<T extends unknown[]> = T[number];

    // Implementation related //////////////////////////////////////////////////////////////////////

    type AsSuperConstructor<T> = T extends SuperConstructor ? T : never;

    type ClusteredConstructor<T extends SuperConstructor[]> =
    {
        readonly prototype: ProtoType<IntersectionOf<T>>;

        new (...args: MapTupleTypesToOptionalReadonlyConstructorParameters<T>):
        ClusteredPrototype<T>;

        new (...args: UnionOf<MapTupleTypesToReadonlySuperConstructorInvokeInfo<T>>[]):
        ClusteredPrototype<T>;
    }
    &
    (
        T extends { 10: unknown; }
        ?
        Enrich<SuperConstructorSelector<UnionOf<T>>, IntersectionOf<T>>
        :
        EnrichTimes<
        SuperConstructorSelector<UnionOf<T>>,
        T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8], T[9]
        >
    );

    type ClusteredPrototype<T extends SuperConstructor[]> =
    SuperPrototypeSelector<UnionOf<T>> &
    IntersectionOf<{ [key in keyof T]: InstanceType<AsSuperConstructor<T[key]>>; }>;

    type MapTupleTypesToOptionalReadonlyConstructorParameters<T extends SuperConstructor[]> =
    { [key in keyof T]?: ReadonlyConstructorParameters<AsSuperConstructor<T[key]>>; };

    type MapTupleTypesToReadonlySuperConstructorInvokeInfo<T extends SuperConstructor[]> =
    { [key in keyof T]: Readonly<SuperConstructorInvokeInfo<AsSuperConstructor<T[key]>>>; };

    interface SuperConstructor
    {
        readonly prototype: object | null;
        new (...args: any): unknown;
    }

    class SuperConstructorSelector<T extends SuperConstructor>
    {
        /**
         * Allows accessing a property or calling a method in a specified base class, eliminating
         * ambiguity when multiple base classes share a property with the same key.
         *
         * @param type
         *
         * The referenced base class.
         */
        protected class<U extends T>(type: U): U;
    }

    class SuperPrototypeSelector<T extends SuperConstructor>
    {
        /**
         * Allows accessing a property or calling a method in a specified base class, eliminating
         * ambiguity when multiple base classes share a property with the same key.
         *
         * @param type
         *
         * The referenced base class.
         */
        protected class<U extends T>(type: U): InstanceType<U>;
    }
}

/** Specifies the arguments used to call a base class constructor. */
export interface SuperConstructorInvokeInfo<T extends Polytype.SuperConstructor>
{
    /** The base class being referenced. */
    super: T;

    /**
     * An array specifying the arguments with which the base class constructor should be called.
     * If undefined, the base class constructor will be called without any arguments.
     */
    arguments?: Polytype.ReadonlyConstructorParameters<T>;
}

/** Allows defining a derived class that inherits from multiple base classes. */
export function classes<T extends Polytype.SuperConstructor[]>
(...types: Polytype.RequireNonEmpty<T>):
Polytype.ClusteredConstructor<T>;

/**
 * Globally defines `classes` and `Object.getPrototypeListOf`.
 *
 * Calling this function allows using Polytype everywhere inside the current JavaScript realm
 * without imports.
 *
 * This function is only available in the module versions of Polytype.
 * For most purposes it is better to import the global version of Polytype directly rather than
 * calling this function.
 *
 * @returns
 *
 * `true` on success; `false` otherwise.
 */
export function defineGlobally(): boolean;

/**
 * Returns a list of prototypes of an object.
 * * For objects with a regular non‐null prototype, an array containing the prototype as its only
 * element is returned.
 * * For objects with a null prototype, an empty array is returned.
 * * For constructors and instance prototypes based on Polytype clustered objects, an array
 * containing all zero or more prototypes of the object is returned.
 *
 * @param o
 *
 * The object that references the prototypes.
 */
export function getPrototypeListOf(o: any): any[];
