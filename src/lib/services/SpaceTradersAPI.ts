import { PUBLIC_SPACETRADERS_URL } from '$env/static/public';
import type { AgentToken } from '$lib/types';
import { AGENT_TOKENS_PATH, SECRETS_DIR } from '../constants';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';

export const DEFAULT_HEADERS = {
	'Content-Type': 'application/json'
};

export function registerAgent(symbol: string, faction: string) {
	return fetch(PUBLIC_SPACETRADERS_URL + `register`, {
		method: 'POST',
		headers: DEFAULT_HEADERS,
		body: JSON.stringify({ symbol, faction })
	});
}

export async function getAgentTokens() {
	const file = await Filesystem.readFile({
    path: AGENT_TOKENS_PATH,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  });
	try {
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
		encoding: Encoding.UTF8,
	});
}
