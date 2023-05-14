// import type { Readable } from "svelte/store";

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

export type PickData<T extends RecursiveData<any>> = T['data'] extends RecursiveData<any> ? PickData<T['data']> : T['data'];
