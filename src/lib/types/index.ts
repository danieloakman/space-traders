// import type { Readable } from "svelte/store";
import type { Agent, Contract, Faction, Ship } from 'spacetraders-sdk';

export interface AgentToken {
	symbol: string;
	// faction: string;
	token: string;
}

// export interface Reloadable<T> {
// 	reload(): void;
// 	readonly store: Readable<T>;
// }

export interface RecursiveData<T> {
	data: T | RecursiveData<T>;
}

// export type PickData<T extends RecursiveData<any>> = T['data'] extends RecursiveData<any>
// 	? PickData<T['data']>
// 	: T['data'];

export interface RegisterResponse {
	agent: Agent;
	contract: Contract;
	faction: Faction;
	ship: Ship;
	token: string;
}
