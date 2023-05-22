import type { DataObject, UnwrapData } from '$types';
import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';

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

const MS_MAP = {
	ms: 1,
	millisecond: 1,
	milliseconds: 1,
	s: 1000,
	second: 1000,
	seconds: 1000,
	m: 1000 * 60,
	minute: 1000 * 60,
	minutes: 1000 * 60,
	h: 1000 * 60 * 60,
	hour: 1000 * 60 * 60,
	hours: 1000 * 60 * 60,
	d: 1000 * 60 * 60 * 24,
	day: 1000 * 60 * 60 * 24,
	days: 1000 * 60 * 60 * 24
};

/** Converts `number` to milliseconds using a known conversion from `unit`. */
export function toMS(number: number, unit: keyof typeof MS_MAP) {
	return number * MS_MAP[unit];
}

// export function awaitParams<T extends (...args: Promise<any>[]) => any[]>(fn: T) {
// 	return async (...args: Parameters<T>) => {
// 		const awaitedArgs = [...await Promise.all(args)];
// 		return (...awaitedArgs: Parameters<T>) => fn(...awaitedArgs);
// 		// fn(...awaitedArgs)
// 	};
// }

/** Handles errors by showing it on a toast and returning a result. */
export function handleError<TErrorResult>(
	cb: (err: Error) => {
		/** The result to return in case of an error. */
		result: TErrorResult;
		/** If true, then don't display toast. */
		hideToast?: boolean;
	} & Partial<ToastSettings>
) {
	return (err: Error) => {
		const options = cb(err);
		if (!options?.hideToast)
			toastStore.trigger({
				message: err.message,
				background: 'bg-red-500',
				...(options ?? {})
			});
		return options.result;
	};
}
