import type { Asyncable } from 'svelte-asyncable';
import { asyncable } from 'svelte-asyncable';
import { derived, writable } from 'svelte/store';
import { reloadable } from '../src/lib/utils/stores-util';

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

(async () => {
	const s1 = reloadable(asyncable(() => sleep(500)));
	const unsub = s1.subscribe((n) => console.log('s1', n));
	s1.reload();
	unsub();
})();
