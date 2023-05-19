import type { Asyncable } from 'svelte-asyncable';
import {
	writable,
	type Readable,
	derived,
	type Writable,
	get,
	type Subscriber,
	type Unsubscriber
} from 'svelte/store';
import { asyncable, syncable } from 'svelte-asyncable';
import type { Identifiable, Reloadable, Stores, StoresValues } from '$types';
import { readFile, writeFile } from '$services';
export { asyncable, syncable, type Asyncable };

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
	getter: ($stores: StoresValues<T>) => U
): Reloadable<U>
export function reloadable(...args: any[]): Reloadable<any> {
	const [stores, getter] = args.length === 1 ? [[], args[0]] : args;

	const reload = counter();
	const { subscribe } = derived([...stores, reload], getter);
	let unsub: (() => void) | undefined;
	return {
		subscribe,
		reload: () => reload.inc(),
		get: () => new Promise(resolve => {
			unsub = subscribe(value => {
				if (unsub) {
					unsub();
					unsub = undefined;
				}
				resolve(value);
			})
		})
	}

	// const result = asyncDerived(
	// 	getter,
	// 	undefined,
	// 	// @ts-ignore
	// 	[...stores, reload]
	// );
	// return Object.assign(result, {
	// 	reload: () => reload.inc()
	// })
}

/**
 * Provides a writable that isn't actually "writable". Every time `set` or `update` is called it increments
 * the internal integer. Can be used as an easy way to trigger a reload for example.
 */
export function counter(start = 0) {
	const { subscribe, update } = writable<number>(start);
	return {
		inc: () => update((n) => n + 1),
		subscribe
	};
}

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
