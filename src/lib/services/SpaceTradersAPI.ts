import { PUBLIC_SPACETRADERS_URL } from "$env/static/public";

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export function registerAgent(symbol: string, faction: string) {
  return fetch(PUBLIC_SPACETRADERS_URL + `register`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ symbol, faction }),
  });
}
