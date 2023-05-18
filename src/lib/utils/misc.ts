import type { DataObject, UnwrapData } from '$types';

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
			if (!isNaN(date.getTime()))
				return date.toLocaleString();
		}
		return value;
	});
}
