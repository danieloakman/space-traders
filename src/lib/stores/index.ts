import { SpaceTradersAPI, SAVED_AGENTS_PATH, entityStore, type SavedAgent, fileStore } from '$lib';
import { localStorageStore } from '@skeletonlabs/skeleton';

export const savedAgents = entityStore(fileStore<SavedAgent[]>(SAVED_AGENTS_PATH, []));

export const currentToken = localStorageStore('currentAgentToken', '');

export const api = new SpaceTradersAPI(currentToken);
