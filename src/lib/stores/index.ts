import { derived, get } from 'svelte/store';
import { asyncable } from 'svelte-asyncable';
import { SpaceTradersAPI, readFile, writeFile, AGENT_TOKENS_PATH, entityStore, type SavedAgent, fileStore } from '$lib';
import iter from 'iteragain-es/iter';
import { localStorageStore } from '@skeletonlabs/skeleton';

// export async function getAgentTokens() {
// 	try {
// 		const file = await fs.readFile({
// 			path: AGENT_TOKENS_PATH,
// 			directory: Directory.Data,
// 			encoding: Encoding.UTF8
// 		});
// 		return JSON.parse(file.data) as SavedAgent[];
// 	} catch (e: any) {
// 		console.error(e);
// 		return [];
// 	}
// }

// export async function setAgentTokens(agentTokens: SavedAgent[]) {
// 	try {
// 		await fs.mkdir({
// 			path: AGENT_TOKENS_PATH.split('/').slice(0, -1).join('/'),
// 			recursive: true
// 		});
// 		await fs.writeFile({
// 			path: AGENT_TOKENS_PATH,
// 			directory: Directory.Data,
// 			data: JSON.stringify(agentTokens),
// 			encoding: Encoding.UTF8
// 		});
// 	} catch (e: any) {
// 		console.error(e.message);
// 	}
// }

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

export const currentAgent = localStorageStore<SavedAgent | null>('currentAgentToken', null);

export const api = new SpaceTradersAPI(
	derived(currentAgent, (agentToken) => agentToken?.token ?? '')
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
