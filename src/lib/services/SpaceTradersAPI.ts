import type { AgentToken } from '$lib/types';
import { AGENT_TOKENS_PATH, SECRETS_DIR, SPACE_TRADERS_URL } from '../constants';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
// import { AgentsApi, Configuration, FactionsApi } from 'spacetraders-sdk';

// const f = new FactionsApi();
// f.getFaction({ factionSymbol: 'OE' })

// const a = new AgentsApi({  });
// a.getMyAgent({  }).then(a => a.data.data))
// import { agentTokens } from '../stores';

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
