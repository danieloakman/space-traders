import { asyncable } from 'svelte-asyncable';
import { derived, writable, type Readable } from 'svelte/store';
import type { StoresValues, Stores } from '../src/lib/types';
import type { Asyncable } from 'svelte-asyncable';

function sleep(ms: number): Promise<number> {
	return new Promise((resolve) =>
		setTimeout(() => {
			console.log({ sleep: ms });
			return resolve(ms);
		}, ms)
	);
}

// const s1 = asyncable(async () => {
//   return sleep(500);
// });

// const s2 = asyncable(async () => {
//   return sleep(await s1.get() * 2);
// });
// (async () => {
//   await s2.get();
// })();

// (async () => {
//   const reload = writable<number>(0);
//   const d = reload.subscribe((n) => {
//     console.log('reload', n);
//   });
//   reload.update(n => ++n);
//   reload.update(n => ++n);
//   reload.update(n => ++n);
//   await sleep(1000);
// })();

// (async () => {
// 	const s1 = reloadable(asyncable(() => sleep(500)));
// 	const unsub = s1.subscribe((n) => console.log('s1', n));
// 	s1.reload();
// 	unsub();
// })();

export function asyncDerived<T extends Stores, U extends Promise<any>>(
	stores: T,
	fn: (...$stores: StoresValues<T>) => U
): Asyncable<Awaited<U>> {
	return asyncable(
		fn,
		undefined,
		// @ts-ignore
		stores
	);
}

(async () => {
	const s1 = asyncable(() => sleep(500));
	const s2 = asyncable(() => sleep(750).then((n) => n.toString()));
	const s3 = asyncDerived([s1, s2], ($s1, $s2) => {
		return Promise.all([$s1, $s2]);
	});
	s3.subscribe(async (v) => {
		console.log('s3', await v);
	});

	// const s4 = derived([writable(1), writable('2')], ())
})();
