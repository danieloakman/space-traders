import { Directory } from '@capacitor/filesystem';
import { writable, readable, derived } from 'svelte/store';
import type { Readable, Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';
import { asyncable, type Asyncable, syncable } from 'svelte-asyncable';
import { getAgentTokens, setAgentTokens } from '$services';
import type { AgentToken } from '$lib';
import { iter } from 'iteragain-es';
import { localStorageStore } from '@skeletonlabs/skeleton';

// TODO: fix circular dependency here.
export const agentTokens = asyncable(
	getAgentTokens,
	async ($newValue: AgentToken[], $prevValue: AgentToken[]) => {
		console.log('agentTokens changed', $newValue, $prevValue);
		await setAgentTokens(
			iter($newValue)
				.concat($prevValue)
				.unique({ iteratee: (agentToken) => agentToken.token })
				.toArray()
		);
	}
);

export const currentAgentToken = localStorageStore<AgentToken | null>('currentAgentToken', null);

export interface Reloadable<T> extends Readable<T> {
	reload(): void;
}

export function reloadable<T>(store: Asyncable<T>): Reloadable<T> {
	const reload = writable<void>();
	const sync = syncable<T>(store);
	return Object.assign(derived([sync, reload], ([value]) => value), {
		reload: () => {
			reload.set();
		}
	});
}

// export interface EntityStore<T> {
//   store: Readable<T>;
//   read(): T;
//   update: (updateFn: (storedValue: T) => T) => any;
//   set: (value: T) => any;
//   delete: () => any;
// }
// export class FSStore<T> implements Writable<T> {
//   constructor(readonly path: string, protected readonly store: Writable<T>) {}

//   get subscribe() {
//     return this.store.subscribe;
//   }

//   set(value: T): void {

//   }

//   update(updater: Updater<T>): void {

//   }

// }

// export const agents = writable<string>();
