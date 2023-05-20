import {
	writable,
	type Readable,
	derived,
	type Writable,
	get,
	type Subscriber,
	type Unsubscriber,
	readable
} from 'svelte/store';
import { asyncable, type Asyncable } from 'svelte-asyncable';
import type { Identifiable, Reloadable, Stores, StoresValues } from '$types';
import { readFile, writeFile } from '$services';
import { noop } from 'svelte/internal';

function empty(): Readable<never> {
	return {
		subscribe: (_run) => {
			return noop;
		}
	};
}

export function toStore<T>(getter: () => T): Readable<T>;
export function toStore<T>(...args: any[]): Readable<never>;
export function toStore<T extends Stores, U>(...args: any[]): Readable<U> | Writable<U> {
	if (args.length === 1) {
		const getter = args[0];
		return {
			subscribe: (run) => {
				run(getter());
				return noop;
			}
		} as Readable<U>;
	} else if (args.length > 1 && args.every(arg => typeof arg === 'function')) {
		const [getter, setter] = args;
		return {
			set: setter,
			subscribe: (run) => {
				run(getter());
				return noop;
			}
		}
	}

	console.error('Invalid arguments passed to `toStore`');
	return empty();
}

/** @deprecated Just use normal `derived`. */
export function asyncDerived<T extends Stores, U extends Promise<any>>(
	stores: T,
	fn: ($stores: StoresValues<T>) => U
): Asyncable<Awaited<U>> {
	return asyncable(
		(...stores: StoresValues<T>) => fn(stores),
		undefined,
		// @ts-ignore
		stores
	);
}

export function reloadable<T extends Promise<any>>(getter: () => T): Reloadable<T>;
export function reloadable<T extends Stores, U extends Promise<any>>(
	stores: T,
	getter: ($stores: StoresValues<T>) => U,
): Reloadable<U>;
export function reloadable(...args: any[]): Reloadable<any> {
	const [stores, getter] = args.length === 1 ? [[], args[0]] : args;

	const reload = counter();

	// Setup the initial value;
	let resolve: (value: any) => void;
	const initial = new Promise((res) => (resolve = res));

	const derived$ = derived([...stores, reload], (values) => values.slice(0, -1));

	const { subscribe } = writable(initial, (set) => {
		return derived$.subscribe(async (values = []) => {
			let value = getter(values);
			if (value === undefined) return;
			value = Promise.resolve(value);
			set(value);
			resolve(value);
		});
	});

	return {
		subscribe,
		reload: () => reload.inc(),
		get: () => new Promise((resolve) => subscribe(resolve)())
	};
}

/**
 * Provides a writable that isn't actually "writable". Every time `set` or `update` is called it increments
 * the internal integer. Can be used as an easy way to trigger a reload for example.
 */
export function counter(start = 0) {
	const { subscribe, update } = writable<number>(start);
	return {
		inc: () => update((n) => n + 1),
		dec: () => update((n) => n - 1),
		reset : () => update(() => start),
		get get() {
			return get({ subscribe });
		},
		subscribe
	};
}

/** @deprecated Shouldn't convert things to Asyncable, just use a regular store that contains a promise. */
export function toAsyncable<T>(source: Readable<T>): Asyncable<T>;
export function toAsyncable<T>(source: Writable<T>, options?: { readonly?: boolean }): Asyncable<T>;
export function toAsyncable<T>(
	source: Writable<T> | Readable<T>,
	options: { readonly?: boolean } = {}
) {
	const setter = !options.readonly && 'set' in source ? (value: T) => source.set(value) : undefined;
	return asyncable(async ($source: Promise<T>) => $source, setter, [source]);
}

export class EntityStore<T extends Identifiable> implements Readable<Promise<T[]>> {
	// TODO: Could maybe make this class more efficient by using a map<ID, array index>.
	// Also, there's no internal ID checking against values already in the store.
	constructor(protected source: Asyncable<T[]>) {}

	get subscribe() {
		return this.source.subscribe;
	}

	async get(): Promise<T[]>;
	async get(id: string): Promise<T | undefined>;
	async get(id?: string) {
		const entities = await this.source.get();
		if (id) return entities.find((e) => e.id === id);
		return entities;
	}

	select(id: string): Asyncable<T | undefined> {
		return asyncable(
			async ($source: Promise<T[]>) => (await $source).find((e) => e.id === id),
			(value: T) => this.update(id, () => value),
			[this.source]
		);
	}

	set(...values: (Partial<T> & Identifiable)[]) {
		this.source.update((entities) => {
			for (const value of values) {
				const idx = entities.findIndex((e) => e.id === value.id);
				if (idx) Object.assign(entities[idx], value);
			}
			return entities;
		});
	}

	update(id: string, updater: (entity: T) => Partial<T>) {
		this.source.update((entities) => {
			const idx = entities.findIndex((e) => e.id === id);
			if (idx) Object.assign(entities[idx], updater(entities[idx]));
			return entities;
		});
	}

	create(...newEntities: T[]) {
		this.source.update((entities) => {
			entities.push(...newEntities);
			return entities;
		});
	}

	delete(...ids: string[]) {
		this.source.update((entities) => {
			for (let i = entities.length - 1; i >= 0; i--) {
				if (ids.includes(entities[i].id)) {
					console.log('deleting', entities[i]);
					entities.splice(i, 1);
				}
			}
			return entities;
		});
	}
}

/** Alias for `new EntityStore(source)`. */
export function entityStore<T extends Identifiable>(source: Asyncable<T[]>) {
	return new EntityStore(source);
}

export function fileStore<T>(path: string, initialValue: T, options: { readonly?: boolean } = {}) {
	return asyncable(
		async () => {
			return (await readFile<T>(path)) ?? initialValue;
		},
		options.readonly
			? undefined
			: async (newValue: T) => {
					await writeFile(path, newValue);
			  }
	);
}
