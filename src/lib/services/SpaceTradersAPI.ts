import type { AgentToken } from '$lib/types';
import { AGENT_TOKENS_PATH, SECRETS_DIR, SPACE_TRADERS_URL } from '../constants';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import axios from './axios-instance';
import { AgentsApi, Configuration, FactionsApi, SystemsApi, type Agent } from 'spacetraders-sdk';
import { derived, get, writable, type Readable } from 'svelte/store';
import { pickData, reloadable, type Reloadable } from '$utils';
import { asyncable } from 'svelte-asyncable';

export class SpaceTradersAPI {
	protected readonly config: Readable<Configuration>;
	readonly myAgent: Reloadable<Agent>;
	protected readonly systemsAPI: Readable<SystemsApi>;
	protected readonly agentsAPI: Readable<AgentsApi>;

	constructor(protected readonly agentToken: Readable<string | null>) {
		this.config = derived(
			this.agentToken,
			(token) =>
				new Configuration({
					accessToken: token ?? '',
					basePath: SPACE_TRADERS_URL
				})
		);
		this.myAgent = reloadable(asyncable(() => get(this.agentsAPI).getMyAgent().then(pickData)));
		// this.myAgent = iife(() => {
		// 	const reload = writable(0);
		// 	return {
		// 		reload: () => {
		// 			reload.update(n => n + 1);
		// 		},
		// 		store: derived([this.agentsAPI, reload], ([api]) => api.getMyAgent().then(data => data.data.data)),
		// 	};
		// });
		this.systemsAPI = derived(this.config, (config) => new SystemsApi(config, undefined, axios));
		this.agentsAPI = derived(this.config, (config) => new AgentsApi(config, undefined, axios));
	}

	registerAgent(symbol: string, faction: string) {
		return axios.post('register', {}, {});
	}

	systems(limit?: number, page?: number) {
		return get(this.systemsAPI).getSystems({ limit, page });
	}

	a() {
		return get(this.agentsAPI).getMyAgent();
	}
}

export const DEFAULT_HEADERS = {
	'Content-Type': 'application/json'
};

export async function registerAgent(symbol: string, faction: string) {
	console.log('registering agent:', symbol, faction);
	const result = await fetch(SPACE_TRADERS_URL + `register`, {
		method: 'POST',
		headers: DEFAULT_HEADERS,
		body: JSON.stringify({ symbol, faction })
	});
	const json = await result.json();
	console.log(json);
	return result;
	// agentTokens.set(json);
}

export async function agentDetails(token: string): Promise<{
	accountId: string;
	symbol: string;
	credits: number;
	headquarters: string;
}> {
	const result = await fetch(SPACE_TRADERS_URL + `my/agent`, {
		method: 'GET',
		headers: {
			...DEFAULT_HEADERS,
			Authorization: `Bearer ${token}`
		}
	});
	return (await result.json()).data;
}

export async function getAgentTokens() {
	try {
		const file = await Filesystem.readFile({
			path: AGENT_TOKENS_PATH,
			directory: Directory.Data,
			encoding: Encoding.UTF8
		});
		return JSON.parse(file.data) as AgentToken[];
	} catch (e: any) {
		console.error(e);
		return [];
	}
}

export async function setAgentTokens(agentTokens: AgentToken[]) {
	await Filesystem.writeFile({
		path: AGENT_TOKENS_PATH,
		directory: Directory.Data,
		data: JSON.stringify(agentTokens),
		encoding: Encoding.UTF8
	});
}
