import type { Asyncable } from 'svelte-asyncable';
import { writable, type Readable, derived } from 'svelte/store';
import { syncable } from 'svelte-asyncable';

export interface Reloadable<T> extends Readable<T> {
	reload(): void;
}

export function reloadable<T>(store: Asyncable<T>): Reloadable<T> {
	const reload = writable<void>();
	const sync = syncable<T>(store);
	return Object.assign(
		derived([sync, reload], ([value]) => value),
		{
			reload: () => {
				reload.set();
			}
		}
	);
}
