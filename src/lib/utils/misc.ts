import type { RecursiveData } from '$types';

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function iife<T extends () => any>(fn: T): ReturnType<T> {
	return fn();
}

export function pickData<T extends RecursiveData<any>>(data: T): any {
	return typeof data === 'object' && data && 'data' in data.data ? pickData(data.data) : data.data;
}
