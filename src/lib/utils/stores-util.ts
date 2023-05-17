import type { Asyncable } from 'svelte-asyncable';
import { writable, type Readable, derived, type Writable, get } from 'svelte/store';
import { asyncable, syncable } from 'svelte-asyncable';
import type { Identifiable, Reloadable } from '$types';

/**
 * Wraps an Asyncable store with an additional method called `reload`. Which when called will call `source`'s
 * getter.
 */
export function reloadable<T>(
	source: Asyncable<T>,
	options: { readonly?: boolean } = {}
): Reloadable<T> {
	const reload = counter();
	const setter = options.readonly ? undefined : (value: T) => source.set(value);
	const wrapped = asyncable(async () => source.get(), setter, [reload]);
	return Object.assign(wrapped, {
		reload() {
			reload.update((n) => n + 1);
		}
	});
}

/**
 * Provides a writable that isn't actually "writable". Every time `set` or `update` is called it increments
 * the internal integer. Can be used as an easy way to trigger a reload for example.
 */
export function counter(start = 0): Writable<number> {
	const store = writable<number>(start);
	return {
		subscribe: store.subscribe,
		set: () => {
			store.set(get(store) + 1);
		},
		update() {
			store.update((n) => ++n);
		}
	};
}

// export class EntityStore<T extends Identifiable> {
// 	// protected
// 	constructor(protected readonly store: Asyncable<T[]>) {}

// 	create(entity: T) {
// 		this.store.update(entities => {
// 			entities.push(entity);
// 			return entities;
// 		})
// 	}
// }

// function sleep(ms: number): Promise<number> {
//   return new Promise((resolve) => setTimeout(() => {
//     console.log({ sleep: ms });
//     return resolve(ms);
//   }, ms));
// }

// (async () => {
//   const s1 = reloadable(asyncable(() => sleep(500)));
//   const unsub = s1.subscribe(async n => console.log('s1', await n));
//   s1.reload();
//   unsub();
// 	s1.reload();
// })();
