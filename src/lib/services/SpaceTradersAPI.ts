import type { RegisterResponse, FullWaypoint, Reloadable, Pagination } from '$lib/types';
import { SPACE_TRADERS_URL } from '../constants';
import axios from './axios-instance';
import {
	AgentsApi,
	Configuration,
	FactionsApi,
	SystemsApi,
	ContractsApi,
	DefaultApi,
	FleetApi,
	type Agent,
	type RegisterRequestFactionEnum,
	type Waypoint,
	type System
} from 'spacetraders-sdk';
import { derived, get, type Readable } from 'svelte/store';
import { unwrapData, reloadable, toMS, handleError } from '$utils';
import iter from 'iteragain/iter';
import { truncate } from 'lodash-es';

export class SpaceTradersAPI {
	protected readonly config: Readable<Configuration>;
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

	readonly status = reloadable<Promise<object | null>>(async () =>
		axios
			.get(SPACE_TRADERS_URL)
			.then(unwrapData)
			.catch(handleError(() => ({ result: {} })))
	);
	/** The current agent's details. */
	readonly myAgent: Reloadable<Promise<Agent>>;
	/** The current agent's headquarters. */
	readonly headquarters: Reloadable<Promise<Waypoint>>;

	constructor(
		/** The agent token to use for all relevant API calls. */
		protected readonly agentToken: Readable<string>
	) {
		this.config = derived(this.agentToken, (token) => this.createConfig({ token }));
		this.agentsAPI = derived(this.config, this.createAgentsApi);
		this.systemsAPI = derived(this.config, this.createSystemsApi);
		this.contractsAPI = derived(this.config, this.createContractsApi);
		this.factionsAPI = derived(this.config, this.createFactionsApi);
		this.fleetAPI = derived(this.config, this.createFleetApi);
		this.myAgent = reloadable([this.agentsAPI], ([agentsAPI]) => {
			return agentsAPI
				.getMyAgent()
				.then(unwrapData)
				.catch(
					handleError((err) => {
						const hideToast = /missing bearer token/i.test(err.message);
						return {
							result: {
								accountId: 'UNKNOWN',
								credits: 0,
								headquarters: 'UNKNOWN',
								symbol: 'UNKNOWN'
							} as Agent,
							hideToast,
							timeout: toMS(5, 'seconds')
						};
					})
				);
		});
		this.headquarters = reloadable([this.myAgent], async ([myAgent]) =>
			this.waypoint((await myAgent).headquarters)
		);
	}

	async registerAgent(
		symbol: string,
		faction: RegisterRequestFactionEnum,
		email?: string
	): Promise<RegisterResponse | null> {
		const res = await this.defaultAPI
			.register({
				registerRequest: {
					symbol,
					faction,
					email
				}
			})
			.then(unwrapData)
			.catch(handleError(() => ({ result: null })));
		return res;
	}

	/**
	 * Returns Agent data from a separate token. Does not return the agent details for the current agent.
	 * That's what `myAgent` is for.
	 */
	agent(token: string): Promise<Agent | null> {
		return this.createAgentsApi(this.createConfig({ token }))
			.getMyAgent()
			.then(unwrapData)
			.catch(
				handleError((err) => ({
					result: null,
					message: `Could not find an agent with token: "${truncate(token, { length: 20 })}"`
				}))
			);
	}

	systems({ limit, page }: Pagination = {}): Promise<System[]> {
		return get(this.systemsAPI)
			.getSystems({ limit, page })
			.then(unwrapData)
			.catch(handleError(() => ({ result: [] })));
	}

	waypoint(...args: string[]): Promise<Waypoint> {
		const wp = fullWaypoint(...args);
		const systemSymbol = wp.system;
		const waypointSymbol = wp.waypoint;
		return get(this.systemsAPI)
			.getWaypoint({ systemSymbol, waypointSymbol })
			.then(unwrapData)
			.catch(
				handleError(() => ({
					result: {
						symbol: 'UNKOWN',
						systemSymbol: 'UNKNOWN',
						type: 'PLANET',
						x: 0,
						y: 0,
						orbitals: [] as any,
						traits: [] as any
					} as Waypoint
				}))
			);
	}

	waypoints(systemSymbol: string, pagination?: Pagination) {
		return get(this.systemsAPI)
			.getSystemWaypoints({ systemSymbol, ...pagination })
			.then(unwrapData)
			.catch(handleError(() => ({ result: [] })));
	}

	contracts(limit?: number, page?: number) {
		return get(this.contractsAPI).getContracts({ limit, page }).then(unwrapData);
	}

	// TODO: contracts should be a store instead of calling getContract like this.
	contract(id: string) {
		return get(this.contractsAPI).getContract({ contractId: id }).then(unwrapData);
	}

	acceptContract(id: string) {
		return get(this.contractsAPI).acceptContract({ contractId: id }).then(unwrapData);
	}

	deliverContract(id: string) {
		// TODO: need to fill out deliverContractRequest:
		return get(this.contractsAPI)
			.deliverContract({
				contractId: id,
				deliverContractRequest: {
					shipSymbol: '',
					tradeSymbol: '',
					units: 0
				}
			})
			.then(unwrapData);
	}

	fulfillContract(id: string) {
		return get(this.contractsAPI).fulfillContract({ contractId: id }).then(unwrapData);
	}

	// TODO: factions should also be a store.
	factions() {
		return get(this.factionsAPI).getFactions().then(unwrapData);
	}

	ships() {
		return get(this.fleetAPI).getMyShips().then(unwrapData);
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
