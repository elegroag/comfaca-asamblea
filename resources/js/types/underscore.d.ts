// Tipos específicos para Underscore.js

declare global {
    namespace Underscore {
        // Template
        interface TemplateSettings {
            evaluate?: RegExp;
            interpolate?: RegExp;
            escape?: RegExp;
        }

        type TemplateFunction = (data?: any) => string;

        // Iterator functions
        type ListIterator<T, TResult> = (value: T, index: number, list: T[]) => TResult;
        type ObjectIterator<T, TResult> = (value: T, key: string, object: T) => TResult;
        type MemoIterator<T, TResult> = (memo: TResult, value: T, index: number, list: T[]) => TResult;
        type Predicate<T> = (value: T) => boolean;
        type CompareFunction<T> = (a: T, b: T) => number;

        // Collection functions
        function each<T>(list: T[], iterator: ListIterator<T, any>, context?: any): void;
        function each<T>(list: { [key: string]: T }, iterator: ObjectIterator<T, any>, context?: any): void;
        function forEach<T>(list: T[], iterator: ListIterator<T, any>, context?: any): void;
        function forEach<T>(list: { [key: string]: T }, iterator: ObjectIterator<T, any>, context?: any): void;
        
        function map<T, TResult>(list: T[], iterator: ListIterator<T, TResult>, context?: any): TResult[];
        function map<T, TResult>(list: { [key: string]: T }, iterator: ObjectIterator<T, TResult>, context?: any): TResult[];
        function collect<T, TResult>(list: T[], iterator: ListIterator<T, TResult>, context?: any): TResult[];
        
        function reduce<T, TResult>(list: T[], iterator: MemoIterator<T, TResult>, memo: TResult, context?: any): TResult;
        function reduce<T, TResult>(list: T[], iterator: MemoIterator<T, TResult>, context?: any): TResult;
        function foldl<T, TResult>(list: T[], iterator: MemoIterator<T, TResult>, memo: TResult, context?: any): TResult;
        function inject<T, TResult>(list: T[], iterator: MemoIterator<T, TResult>, memo: TResult, context?: any): TResult;
        
        function reduceRight<T, TResult>(list: T[], iterator: MemoIterator<T, TResult>, memo: TResult, context?: any): TResult;
        function foldr<T, TResult>(list: T[], iterator: MemoIterator<T, TResult>, memo: TResult, context?: any): TResult;
        
        function find<T>(list: T[], predicate: Predicate<T>, context?: any): T | undefined;
        function detect<T>(list: T[], predicate: Predicate<T>, context?: any): T | undefined;
        
        function filter<T>(list: T[], predicate: Predicate<T>, context?: any): T[];
        function select<T>(list: T[], predicate: Predicate<T>, context?: any): T[];
        
        function where<T>(list: T[], properties: any): T[];
        function findWhere<T>(list: T[], properties: any): T | undefined;
        
        function reject<T>(list: T[], predicate: Predicate<T>, context?: any): T[];
        
        function every<T>(list: T[], predicate?: Predicate<T>, context?: any): boolean;
        function all<T>(list: T[], predicate?: Predicate<T>, context?: any): boolean;
        
        function some<T>(list: T[], predicate?: Predicate<T>, context?: any): boolean;
        function any<T>(list: T[], predicate?: Predicate<T>, context?: any): boolean;
        
        function contains<T>(list: T[], value: T, fromIndex?: number): boolean;
        function includes<T>(list: T[], value: T, fromIndex?: number): boolean;
        
        function invoke<T>(list: T[], methodName: string, ...args: any[]): any[];
        function pluck<T>(list: T[], propertyName: string): any[];
        
        function max<T>(list: T[], iterator?: ListIterator<T, any>, context?: any): T;
        function min<T>(list: T[], iterator?: ListIterator<T, any>, context?: any): T;
        
        function sortBy<T>(list: T[], iterator?: ListIterator<T, any>, context?: any): T[];
        
        function groupBy<T>(list: T[], iterator: ListIterator<T, any>, context?: any): { [key: string]: T[] };
        function indexBy<T>(list: T[], iterator: ListIterator<T, any>, context?: any): { [key: string]: T };
        function countBy<T>(list: T[], iterator: ListIterator<T, any>, context?: any): { [key: string]: number };
        
        function shuffle<T>(list: T[]): T[];
        function sample<T>(list: T[], n?: number): T | T[];
        
        function toArray<T>(list: T[]): T[];
        function size<T>(list: T[]): number;
        
        function partition<T>(list: T[], predicate: Predicate<T>, context?: any): [T[], T[]];

        // Array functions
        function first<T>(array: T[], n?: number): T | T[];
        function head<T>(array: T[], n?: number): T | T[];
        function take<T>(array: T[], n?: number): T | T[];
        
        function initial<T>(array: T[], n?: number): T[];
        
        function last<T>(array: T[], n?: number): T | T[];
        
        function rest<T>(array: T[], n?: number): T[];
        function tail<T>(array: T[], n?: number): T[];
        function drop<T>(array: T[], n?: number): T[];
        
        function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[];
        
        function flatten(array: any[], shallow?: boolean): any[];
        
        function without<T>(array: T[], ...values: T[]): T[];
        
        function union<T>(...arrays: T[][]): T[];
        
        function intersection<T>(...arrays: T[][]): T[];
        
        function difference<T>(array: T[], ...others: T[][]): T[];
        
        function uniq<T>(array: T[], isSorted?: boolean, iterator?: ListIterator<T, any>, context?: any): T[];
        function unique<T>(array: T[], isSorted?: boolean, iterator?: ListIterator<T, any>, context?: any): T[];
        
        function zip<T>(...arrays: T[][]): T[][];
        
        function unzip<T>(array: T[][]): T[][];
        
        function object<T>(list: string[], values?: T[]): { [key: string]: T };
        function object(list: any[]): { [key: string]: any };
        
        function indexOf<T>(array: T[], value: T, isSorted?: boolean): number;
        
        function lastIndexOf<T>(array: T[], value: T, fromIndex?: number): number;
        
        function sortedIndex<T>(array: T[], value: T, iterator?: ListIterator<T, any>, context?: any): number;
        
        function findIndex<T>(array: T[], predicate: Predicate<T>, context?: any): number;
        
        function findLastIndex<T>(array: T[], predicate: Predicate<T>, context?: any): number;
        
        function range(start: number, stop?: number, step?: number): number[];

        // Function functions
        function bind(func: Function, ...args: any[]): Function;
        function partial(func: Function, ...args: any[]): Function;
        function bindAll(object: any, ...methodNames: string[]): void;
        function memoize(func: Function, hasher?: Function): Function;
        function delay(func: Function, wait: number, ...args: any[]): number;
        function defer(func: Function, ...args: any[]): number;
        function throttle(func: Function, wait: number, options?: { leading?: boolean; trailing?: boolean }): Function;
        function debounce(func: Function, wait: number, immediate?: boolean): Function;
        function once(func: Function): Function;
        function wrap(func: Function, wrapper: Function): Function;
        function negate(predicate: Function): Function;
        function compose(...functions: Function[]): Function;
        function after(count: number, func: Function): Function;
        function before(count: number, func: Function): Function;
        function restArgs(func: Function): Function;

        // Object functions
        function keys(object: any): string[];
        function allKeys(object: any): string[];
        function values(object: any): any[];
        function mapObject(object: any, iterator: ObjectIterator<any, any>, context?: any): any[];
        function pairs(object: any): [string, any][];
        function invert(object: any): { [key: string]: any };
        function functions(object: any): string[];
        function methods(object: any): string[];
        function extend(object: any, ...sources: any[]): any;
        function extendOwn(object: any, ...sources: any[]): any;
        function assign(object: any, ...sources: any[]): any;
        function findKey(object: any, predicate: Predicate<any>, context?: any): string | undefined;
        function pick(object: any, ...keys: string[]): any;
        function omit(object: any, ...keys: string[]): any;
        function defaults(object: any, ...defaults: any[]): any;
        function clone(object: any): any;
        function tap(object: any, interceptor: Function): any;
        function has(object: any, key: string): boolean;
        function property(key: string): Function;
        function propertyOf(object: any): Function;
        function matcher(attrs: any): Predicate<any>;
        function matches(attrs: any): Predicate<any>;
        function isEqual(a: any, b: any): boolean;
        function isMatch(object: any, properties: any): boolean;
        function isEmpty(value: any): boolean;
        function isElement(value: any): boolean;
        function isArray(value: any): value is any[];
        function isObject(value: any): boolean;
        function isArguments(value: any): boolean;
        function isFunction(value: any): value is Function;
        function isString(value: any): value is string;
        function isNumber(value: any): value is number;
        function isFinite(value: any): boolean;
        function isBoolean(value: any): value is boolean;
        function isDate(value: any): value is Date;
        function isRegExp(value: any): value is RegExp;
        function isError(value: any): value is Error;
        function isSymbol(value: any): boolean;
        function isMap(value: any): boolean;
        function isWeakMap(value: any): boolean;
        function isSet(value: any): boolean;
        function isWeakSet(value: any): boolean;
        function isDataView(value: any): boolean;
        function isArrayBuffer(value: any): boolean;
        function isTypedArray(value: any): boolean;

        // Utility functions
        function noConflict(): UnderscoreStatic;
        function identity<T>(value: T): T;
        function constant<T>(value: T): () => T;
        function noop(): void;
        function property(path: string[]): Function;
        function propertyOf(object: any): Function;
        function matcher(attrs: any): Predicate<any>;
        function matches(attrs: any): Predicate<any>;
        function times<T>(n: number, iterator: (n: number) => T, context?: any): T[];
        function random(min?: number, max?: number): number;
        function mixin(object: any): void;
        function iteratee(value: any, context?: any): Function;
        function uniqueId(prefix?: string): string;
        function escape(string: string): string;
        function unescape(string: string): string;
        function result(object: any, property: string, fallback?: any): any;
        function now(): number;
        function template(templateText: string, settings?: TemplateSettings): TemplateFunction;
    }

    // Constructor type
    const _: UnderscoreStatic;
    type UnderscoreStatic = typeof Underscore;
}

export {};