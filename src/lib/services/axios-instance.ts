import { sleep, iife } from '$utils';
import Axios from 'axios';
import iter from 'iteragain/iter';

const axios = Axios.create({ headers: { 'Content-Type': 'application/json' } });
const INVALID_PAYLOAD = /invalid payload/i;

axios.interceptors.response.use(undefined, async (e) => {
	const apiError = iife(() => {
		const possibleErrors: string[] = iter(e.response?.data || {})
			.filterMap((v) => typeof v[1] === 'string' ? v[1] : null)
			.filter(v => !INVALID_PAYLOAD.test(v))
			.toArray();
		if (possibleErrors.length && possibleErrors.every(v => typeof v === 'string'))
			return possibleErrors.join('\n');
		return undefined;
	});

	// Handle rate limiting:
	if (e.response?.status === 429) {
		const retryAfter = e.response.headers['retry-after'];

		console.log('Rate limited, retrying after', retryAfter, 'seconds');

		await sleep(retryAfter * 1000);

		return axios.request(e.config);
	}

	if (apiError) throw new Error(apiError);
	throw e;
});

export { axios };
export default axios;
