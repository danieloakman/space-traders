import { Directory } from '@capacitor/filesystem';
import { writable, readable, derived } from 'svelte/store';
import type { Readable, Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';
import { asyncable } from 'svelte-asyncable';
import { getAgentTokens, setAgentTokens } from '$services';
import type { AgentToken } from '$lib';
import { iter } from 'iteragain-es';

export const agentTokens = asyncable(
	getAgentTokens,
	async ($newValue: AgentToken[], $prevValue: AgentToken[]) => {
    console.log('agentTokens changed', $newValue, $prevValue)
		await setAgentTokens(
			iter($newValue)
				.concat($prevValue)
				.unique({ iteratee: (agentToken) => agentToken.token })
				.toArray()
		);
	}
);

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
