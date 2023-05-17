import type { SavedAgent, RegisterResponse, FullWaypoint, Reloadable } from '$lib/types';
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
	type RegisterRequestFactionEnum,
	type Waypoint
} from 'spacetraders-sdk';
import { derived, get, writable, type Readable } from 'svelte/store';
import { unwrapData, reloadable } from '$utils';
import { asyncable } from 'svelte-asyncable';
import { iter } from 'iteragain-es';

export class SpaceTradersAPI {
	protected readonly config: Readable<Configuration>;
	readonly myAgent: Reloadable<Agent>;
	readonly headquarters: Reloadable<Waypoint>;
	protected readonly agentsAPI: Readable<AgentsApi>;
	protected readonly systemsAPI: Readable<SystemsApi>;

	constructor(protected readonly agentToken: Readable<string>) {
		this.config = derived(this.agentToken, (token) => this.createConfig({ token }));
		this.myAgent = reloadable(asyncable(() => get(this.agentsAPI).getMyAgent().then(unwrapData)), { readonly: true });
		this.headquarters = reloadable(
			asyncable(() => this.myAgent.get().then(agent => this.waypoint(agent.headquarters))),
			{ readonly: true }
		)
		this.agentsAPI = derived(this.config, this.createAgentsApi);
		this.systemsAPI = derived(this.config, this.createSystemsApi);
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
			.then(unwrapData);
		console.log({ res });
		await addAgentToken({ symbol, token: res.token });
		return res;
	}

	agent(token: string): Promise<Agent> {
		return this.createAgentsApi(this.createConfig({ token })).getMyAgent().then(unwrapData);
	}

	systems(limit?: number, page?: number) {
		return get(this.systemsAPI).getSystems({ limit, page });
	}

	waypoint(sectorSystemWaypoint: string): Promise<Waypoint>;
	waypoint(sectorSystem: string, waypoint: string): Promise<Waypoint>;
	waypoint(sector: string, system: string, waypoint: string): Promise<Waypoint>
	waypoint(...args: string[]): Promise<Waypoint> {
		const wp = fullWaypoint(...args);
		const systemSymbol = wp.system;
		const waypointSymbol = wp.waypoint;
		return get(this.systemsAPI).getWaypoint({ systemSymbol, waypointSymbol }).then(unwrapData);
	}

	private createConfig(options: { token: string }) {
		return new Configuration({
			accessToken: options.token,
			basePath: SPACE_TRADERS_URL
		});
	}

	private createAgentsApi(config: Configuration) {
		return new AgentsApi(config, undefined, axios);
	}

	private createSystemsApi(config: Configuration) {
		return new SystemsApi(config, undefined, axios);
	}
}

export function fullWaypoint(...args: string[]): FullWaypoint {
	const parts = iter(args).flatMap(str => str.split('-')).toArray();
	if (parts.length !== 3) {
		console.error('Invalid args passed to fullWaypoint:', args);
		return { sector: '', system: '', waypoint: '' };
	}
	return { sector: parts[0], system: parts[0] + '-' + parts[1], waypoint: parts.join('-') };
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
		return JSON.parse(file.data) as SavedAgent[];
	} catch (e: any) {
		console.error(e);
		return [];
	}
}

export async function setAgentTokens(agentTokens: SavedAgent[]) {
	await Filesystem.writeFile({
		path: AGENT_TOKENS_PATH,
		directory: Directory.Data,
		data: JSON.stringify(agentTokens),
		encoding: Encoding.UTF8
	});
}

export async function addAgentToken(agentToken: SavedAgent) {
	const agentTokens = await getAgentTokens();
	agentTokens.push(agentToken);
	await setAgentTokens(agentTokens);
}
