import { derived, get } from 'svelte/store';
import { asyncable } from 'svelte-asyncable';
import {
	SpaceTradersAPI,
	readFile,
	writeFile,
	AGENT_TOKENS_PATH,
	entityStore,
	type SavedAgent,
	fileStore,
	fastHash
} from '$lib';
import iter from 'iteragain/iter';
import { localStorageStore } from '@skeletonlabs/skeleton';

export const savedAgents = entityStore(fileStore<SavedAgent[]>(AGENT_TOKENS_PATH, []));

// export const savedAgents = entityStore(asyncable(
// 	async () => {
// 		return (await readFile<SavedAgent[]>(AGENT_TOKENS_PATH)) ?? [];
// 	},
// 	async ($newValue: SavedAgent[], $prevValue: SavedAgent[]) => {
// 		await writeFile(AGENT_TOKENS_PATH, JSON.stringify($newValue);
// 		// console.log('agentTokens changed', $newValue, $prevValue);
// 		// await setAgentTokens(
// 		// 	iter($newValue)
// 		// 		.concat($prevValue)
// 		// 		.unique({ iteratee: (agentToken) => agentToken.token })
// 		// 		.toArray()
// 		// );
// 	}
// ));

// export const currentAgent = localStorageStore<SavedAgent>('currentAgentToken', {
// 	id: '',
// 	token: '',
// 	symbol: ''
// });

export const currentToken = localStorageStore('currentAgentToken', '');

export const api = new SpaceTradersAPI(currentToken);

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
