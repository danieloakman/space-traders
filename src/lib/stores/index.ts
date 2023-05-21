import { SpaceTradersAPI, SAVED_AGENTS_PATH, entityStore, type SavedAgent, fileStore } from '$lib';
import { localStorageStore } from '@skeletonlabs/skeleton';
import { get } from 'svelte/store';

export const savedAgents = entityStore(fileStore<SavedAgent[]>(SAVED_AGENTS_PATH, []));

export const currentToken = localStorageStore('currentAgentToken', '');
savedAgents.subscribe(async ($savedAgents) => {
	const savedAgents = await $savedAgents;
	const token = get(currentToken);
	if (!savedAgents.length || !savedAgents.find((agent) => agent.token === token))
		currentToken.set('');
})();

export const api = new SpaceTradersAPI(currentToken);
