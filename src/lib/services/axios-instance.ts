import { sleep } from '$utils';
import Axios from 'axios';

const axios = Axios.create({ headers: { 'Content-Type': 'application/json' } });

axios.interceptors.response.use(undefined, async (e) => {
	const apiError = e.response?.data?.error;

	// Handle rate limiting:
	if (e.response?.status === 429) {
		const retryAfter = e.response.headers['retry-after'];

		console.debug('Rate limited, retrying after', retryAfter, 'seconds');

		await sleep(retryAfter * 1000);

		return axios.request(e.config);
	}

	throw apiError || e;
});

export { axios };
export default axios;
