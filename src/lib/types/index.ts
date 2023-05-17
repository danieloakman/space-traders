import type { Agent, Contract, Faction, GetMyAgent200Response, Ship } from 'spacetraders-sdk';
import type { Asyncable } from 'svelte-asyncable';

export interface Reloadable<T> extends Asyncable<T> {
	reload(): void;
}

export interface SavedAgent {
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
