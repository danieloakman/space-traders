import type { PickData, RecursiveData } from '$types';
import type { T } from 'vitest/dist/types-71ccd11d';

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function iife<T extends () => any>(fn: T): ReturnType<T> {
	return fn();
}

export function pickData<T extends RecursiveData<any>>(data: T): PickData<T> {
	// @ts-expect-error
	return 'data' in data.data ? pickData(data.data) : data.data;
}
