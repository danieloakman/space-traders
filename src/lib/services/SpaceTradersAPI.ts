import type { SavedAgent, RegisterResponse, FullWaypoint, Reloadable } from '$lib/types';
import { AGENT_TOKENS_PATH, SECRETS_DIR, SPACE_TRADERS_URL } from '../constants';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import axios from './axios-instance';
import {
	AgentsApi,
	Configuration,
	FactionsApi,
	SystemsApi,
	ContractsApi,
	DefaultApi,
	FleetApi,
	type Register201Response,
	type Agent,
	type RegisterRequestFactionEnum,
	type Waypoint
} from 'spacetraders-sdk';
import { derived, get, writable, type Readable } from 'svelte/store';
import { unwrapData, reloadable } from '$utils';
import { asyncable } from 'svelte-asyncable';
import iter from 'iteragain-es/iter';

export class SpaceTradersAPI {
	protected readonly config: Readable<Configuration>;
	/** The current agent's details. */
	readonly myAgent: Reloadable<Agent>;
	/** The current agent's headquarters. */
	readonly headquarters: Reloadable<Waypoint>;
	protected readonly defaultAPI = new DefaultApi(
		this.createConfig({ token: '' }),
		undefined,
		axios
	);
	protected readonly agentsAPI: Readable<AgentsApi>;
	protected readonly systemsAPI: Readable<SystemsApi>;
	protected readonly contractsAPI: Readable<ContractsApi>;
	protected readonly factionsAPI: Readable<FactionsApi>;
	protected readonly fleetAPI: Readable<FleetApi>;

	constructor(
		/** The agent token to use for all relevant API calls. */
		protected readonly agentToken: Readable<string>
	) {
		this.config = derived(this.agentToken, (token) => this.createConfig({ token }));
		this.myAgent = reloadable(
			asyncable(() => get(this.agentsAPI).getMyAgent().then(unwrapData)),
			{ readonly: true }
		);
		this.headquarters = reloadable(
			asyncable(() => this.myAgent.get().then((agent) => this.waypoint(agent.headquarters))),
			{ readonly: true }
		);
		this.agentsAPI = derived(this.config, this.createAgentsApi);
		this.systemsAPI = derived(this.config, this.createSystemsApi);
		this.contractsAPI = derived(this.config, this.createContractsApi);
		this.factionsAPI = derived(this.config, this.createFactionsApi);
		this.fleetAPI = derived(this.config, this.createFleetApi);
	}

	async registerAgent(
		symbol: string,
		faction: RegisterRequestFactionEnum,
		email?: string
	): Promise<RegisterResponse> {
		const res = await this.defaultAPI
			.register({
				registerRequest: {
					symbol,
					faction,
					email
				}
			})
			.then(unwrapData);
		await addAgentToken({ symbol: res.agent.symbol, token: res.token });
		return res;
	}

	/** Returns Agent data from a separate token. Does not return the agent details for the current agent. That */
	agent(token: string): Promise<Agent> {
		return this.createAgentsApi(this.createConfig({ token })).getMyAgent().then(unwrapData);
	}

	systems(limit?: number, page?: number) {
		return get(this.systemsAPI).getSystems({ limit, page }).then(unwrapData);
	}

	waypoint(...args: string[]): Promise<Waypoint> {
		const wp = fullWaypoint(...args);
		const systemSymbol = wp.system;
		const waypointSymbol = wp.waypoint;
		return get(this.systemsAPI).getWaypoint({ systemSymbol, waypointSymbol }).then(unwrapData);
	}

	contracts(limit?: number, page?: number) {
		return get(this.contractsAPI).getContracts({ limit, page }).then(unwrapData);
	}

	contract(id: string) {
		return get(this.contractsAPI).getContract({ contractId: id }).then(unwrapData);
	}

	acceptContract(id: string) {
		return get(this.contractsAPI).acceptContract({ contractId: id }).then(unwrapData);
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

	private createContractsApi(config: Configuration) {
		return new ContractsApi(config, undefined, axios);
	}

	private createFactionsApi(config: Configuration) {
		return new FactionsApi(config, undefined, axios);
	}

	private createFleetApi(config: Configuration) {
		return new FleetApi(config, undefined, axios);
	}
}

export function fullWaypoint(...args: string[]): FullWaypoint {
	const parts = iter(args)
		.flatMap((str) => str.split('-'))
		.toArray();
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
