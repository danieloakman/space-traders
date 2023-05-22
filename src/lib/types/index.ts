import type { Agent, Contract, Faction, GetMyAgent200Response, Ship } from 'spacetraders-sdk';
import type { Readable } from 'svelte/store';

export interface Reloadable<T> extends Readable<T> {
	reload(): void;
	get(): T;
}

export interface SavedAgent extends Identifiable {
	symbol: string;
	// faction: string;
	token: string;
}

export interface DataObject<T> {
	data: T;
}

type UnwrapData1<T> = T extends DataObject<infer V> ? V : T;
type UnwrapData2<T> = T extends DataObject<infer V> ? UnwrapData1<V> : T;
type UnwrapData3<T> = T extends DataObject<infer V> ? UnwrapData2<V> : T;
/** Unwraps a DataObject<T> to T recursively up to 3 levels deep. */
export type UnwrapData<T> = T extends DataObject<infer V> ? UnwrapData3<V> : T;

export interface RegisterResponse {
	agent: Agent;
	contract: Contract;
	faction: Faction;
	ship: Ship;
	token: string;
}

export interface Identifiable {
	id: string;
}

export interface FullWaypoint {
	sector: string;
	system: string;
	waypoint: string;
}

/** One or more `Readable`s. Use this over the svelte-asyncable package's types */
export type Stores =
	| Readable<any>
	| [Readable<any>, ...Array<Readable<any>>]
	| Array<Readable<any>>;

/** One or more values from `Readable` stores. Use this over the svelte-asyncable package's types */
export type StoresValues<T> = T extends Readable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
	  };

export type SafeAwaitDepth1<T> = T extends Promise<infer U> ? U : T;

export interface HasGet<T> {
	get: () => T;
}

export interface StoreMethods<
	TGet,
	TSet extends (value: any) => void,
	TUpdate extends (fn: (value: any) => any) => void
> extends Readable<TGet> {
	set: TSet;
	update: TUpdate;
}
