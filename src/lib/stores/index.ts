import {
	SpaceTradersAPI,
	AGENT_TOKENS_PATH,
	entityStore,
	type SavedAgent,
	fileStore,
} from '$lib';
import { localStorageStore } from '@skeletonlabs/skeleton';

export const savedAgents = entityStore(fileStore<SavedAgent[]>(AGENT_TOKENS_PATH, []));

export const currentToken = localStorageStore('currentAgentToken', '');

export const api = new SpaceTradersAPI(currentToken);
