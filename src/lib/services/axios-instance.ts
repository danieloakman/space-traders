import { sleep } from '$utils';
import Axios from 'axios';

const axios = Axios.create();

axios.interceptors.response.use(undefined, async (e) => {
	const apiError = e.response?.data?.error;

	// Handle rate limiting:
	if (e.response?.status === 429) {
		const retryAfter = e.response.headers['retry-after'];

		await sleep(retryAfter * 1000);

		return axios.request(e.config);
	}

	throw apiError || e;
});

export { axios };
export default axios;
