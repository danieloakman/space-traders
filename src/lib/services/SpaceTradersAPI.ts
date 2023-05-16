import type { AgentToken, RegisterResponse } from '$lib/types';
import { AGENT_TOKENS_PATH, SECRETS_DIR, SPACE_TRADERS_URL } from '../constants';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import axios from './axios-instance';
import {
	AgentsApi,
	Configuration,
	FactionsApi,
	SystemsApi,
	type Register201Response,
	type Agent,
	type RegisterRequestFactionEnum
} from 'spacetraders-sdk';
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
		this.systemsAPI = derived(this.config, (config) => new SystemsApi(config, undefined, axios));
		this.agentsAPI = derived(this.config, (config) => new AgentsApi(config, undefined, axios));
	}

	async registerAgent(
		symbol: string,
		faction: RegisterRequestFactionEnum
	): Promise<RegisterResponse> {
		const res: RegisterResponse = await axios
			.post(
				SPACE_TRADERS_URL + 'register',
				JSON.stringify({
					symbol,
					faction
				})
			)
			.then(pickData);
		console.log({ res });
		await addAgentToken({ symbol, token: res.token });
		return res;
	}

	systems(limit?: number, page?: number) {
		return get(this.systemsAPI).getSystems({ limit, page });
	}

	// a() {
	// 	return this.registerAgent('test', 'COSMIC').then(d => d.)
	// }
}

export const DEFAULT_HEADERS = {
	'Content-Type': 'application/json'
};

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

export async function addAgentToken(agentToken: AgentToken) {
	const agentTokens = await getAgentTokens();
	agentTokens.push(agentToken);
	await setAgentTokens(agentTokens);
}
