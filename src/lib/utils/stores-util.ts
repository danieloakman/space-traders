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
import { asyncable as _asyncable, type Asyncable } from 'svelte-asyncable';
import type { Identifiable, Reloadable, SafeAwaitDepth1, Stores, StoresValues } from '$types';
import { readFile, writeFile } from '$services';
import { noop } from 'svelte/internal';
export { Asyncable };

/** A Readable that always returns undefined. */
export function empty(): Readable<undefined> {
	return {
		subscribe: (_run) => {
			return noop;
		}
	};
}

export function reloadable<T extends Promise<any>>(getter: () => T): Reloadable<T>;
export function reloadable<T extends Stores, U extends Promise<any>>(
	stores: T,
	getter: ($stores: StoresValues<T>) => U
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
		reset: () => update(() => start),
		get get() {
			return get({ subscribe });
		},
		subscribe
	};
}

/**
 * Create an Asynable. This is effectively a wrapper for `asyncable` from `svelte-asyncable` that fixed some
 * typing issues and adds some convenience.
 */
export function asyncable<T>(
	getter: () => T,
	setter?: (
		newValue: SafeAwaitDepth1<T>,
		oldValue?: SafeAwaitDepth1<T>
	) => T | Promise<T> | void | Promise<void>
): Asyncable<SafeAwaitDepth1<T>>;
export function asyncable<T extends Stores, U>(
	stores: T,
	getter: ($values: StoresValues<T>) => U,
	setter?: (
		newValue: SafeAwaitDepth1<U>,
		oldValue?: SafeAwaitDepth1<U>
	) => U | Promise<U> | void | Promise<void>
): Asyncable<SafeAwaitDepth1<U>>;
export function asyncable<T>(
	source: Writable<T>,
	options?: { readonly?: boolean }
): Asyncable<SafeAwaitDepth1<T>>;
export function asyncable<T>(source: Readable<T>): Asyncable<SafeAwaitDepth1<T>>;
export function asyncable<T>(...args: any[]) {
	if (typeof args[0] === 'function') {
		const [getter, setter] = args;
		return _asyncable((...values: any[]) => getter(values.length > 1 ? values : values[0]), setter);
	} else if (
		('subscribe' in args[0] ||
			(Array.isArray(args[0]) && args[0].every((arg) => 'subscribe' in arg))) &&
		typeof args[1] === 'function'
	) {
		const [source, getter, setter] = args;
		return _asyncable(
			(...values: any[]) => getter(values.length > 1 ? values : values[0]),
			setter,
			Array.isArray(source) ? source : ([source] as any)
		);
	}

	// Handle cases where Readables or Writables and options are passed:
	const [source, options = {}] = args;
	return {
		subscribe: source.subscribe,
		get: async () => get(source),
		// Just silently ignore the setter if the source is readonly with using `noop`:
		set: !options.readonly && 'set' in source ? source.set : noop,
		update: !options.readonly && 'update' in source ? source.update : noop
	};
}

class EntityStore<T extends Identifiable> implements Readable<Promise<T[]>> {
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
			this.source,
			async ($source) => {
				return (await $source).find((e) => e.id === id);
			},
			(value) => {
				if (value) this.update(id, () => value);
			}
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
