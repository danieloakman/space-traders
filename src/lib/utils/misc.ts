import type { DataObject, UnwrapData } from '$types';

export function sleep(ms: number): Promise<number> {
	return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}

export function iife<T extends () => any>(fn: T): ReturnType<T> {
	return fn();
}

export function unwrapData<T extends DataObject<any>>(data: T): UnwrapData<T> {
	return typeof data === 'object' && data && 'data' in data.data
		? unwrapData(data.data)
		: data.data;
}

export function formatAPIResponse<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj), (key, value) => {
		if (typeof value === 'string') {
			const date = new Date(value);
			if (!isNaN(date.getTime())) return date.toLocaleString();
		}
		return value;
	});
}

/**
 * @see https://stackoverflow.com/a/52171480 For source.
 * @description Hashes a string (quickly) to a 53 bit integer. This isn't secure, so it's only for use in performance
 * and non-security related tasks.
 */
export function fastHash(str: string, seed = 0): number {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 0x85ebca77);
		h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d);
	}
	h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
	h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
	h1 ^= h2 >>> 16;
	h2 ^= h1 >>> 16;
	return 2097152 * (h2 >>> 0) + (h1 >>> 11);
}
