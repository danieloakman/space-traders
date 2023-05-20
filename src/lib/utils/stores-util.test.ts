import { describe, it, expect } from 'vitest';
import {
	counter,
	reloadable,
	empty,
	fileStore,
	entityStore,
	asyncable
} from './stores-util';
import { iife, sleep } from './misc';
import { derived, get, readable, writable } from 'svelte/store';
import { once } from 'lodash-es';

describe('stores-utils.ts', () => {
	it('empty', async () => {
		const e = empty();
		expect(get(e)).toBe(undefined);
	});

	it('playing around with readables', async () => {
		const c = counter();
		const r1 = readable(
			Promise.resolve(0),
			once((set) => {
				c.inc();
				return set(sleep(50));
			})
		);
		expect(await get(r1)).toBe(50);
		expect(await get(r1)).toBe(50);
		expect(c.get).toBe(1);

		// const r2 = readable(0, iife(() => {
		// 	let v: number;
		// 	return (set: (newValue: number) => void) => {
		// 		if (v === undefined)
		// 		c.inc();
		// 		return set(1);
		// 	}
		// }))
		const r2 = readable(0, (v) => {
			c.inc();
			v(1);
			return () => {};
		});
	});

	// it('asyncDerived', async () => {
	// 	const s1 = asyncable(() => sleep(50));
	// 	const s2 = asyncable(() => sleep(75).then((n) => n.toString()));
	// 	const s3 = asyncDerived([s1, s2], ([$s1, $s2]) => {
	// 		return Promise.all([$s1, $s2]);
	// 	});
	// 	expect(await s3.get()).toStrictEqual([50, '75']);
	// 	expect(
	// 		await asyncDerived([s1, s2], ([s1, s2]) =>
	// 			Promise.all([s1, s2]).then(([n, s]) => n + s)
	// 		).get()
	// 	).toBe('5075');
	// });

	// it('toStore', async () => {
	// 	const s1 = toStore(() => {
	// 		// console.log('s4');
	// 		return sleep(50)
	// 	});
	// 	const s2 = toStore(() => {
	// 		// console.log('s5');
	// 		return sleep(75).then((n) => n.toString())
	// 	});
	// 	const s3 = derived([s1, s2], async ([a, b]) => {
	// 		const resultA = await a;
	// 		const resultB = await b;
	// 		return resultA + resultB;
	// 	});

	// 	await get(s3);
	// 	expect(await get(s3)).toBe('5075');

	// 	let mem = 0;
	// 	const s4 = toStore(() => sleep(50), async (p, n) => {
	// 		console.log('s4', p, n);
	// 		mem = await p + await n;
	// 		return mem;
	// 	})
	// 	s4.subscribe((n) => {});
	// 	expect(await get(s4)).toBe(50);
	// 	s4.update(async (n) => await n + 1);
	// 	expect(await get(s4)).toBe(50);
	// })

	it(
		'reloadable',
		async function () {
			let c = counter();
			const s1 = asyncable(() => {
				c.inc();
				return sleep(50);
			});
			expect(await s1.get()).toBe(50);
			await s1.get();
			expect(get(c)).toBe(2);

			// Subscribing causes the asyncable to cache it's value:
			c.reset();
			let unsub = s1.subscribe(() => {});
			await s1.get();
			await s1.get();
			unsub();
			expect(get(c)).toBe(1);

			c.reset();
			const s2 = reloadable(() => {
				c.inc();
				return sleep(50);
			});
			await s2.get();
			s2.reload();
			await s2.get();
			expect(get(c)).toBe(2);

			c.reset();
			unsub = s2.subscribe(() => {});
			const unsub2 = s2.subscribe(() => {});
			s2.reload();
			s2.reload();
			s2.reload();
			expect(get(c)).toBe(4);
			c.reset();
			expect(await get(s2)).toBe(50);
			expect(await s2.get()).toBe(50);
			expect(get(c)).toBe(0);
			unsub();
			unsub2();
		},
		{ timeout: 60000 }
	);

	it('toAsyncable', async () => {
		const s1 = asyncable(() => sleep(50));
		expect(await s1.get()).toBe(50);
		expect(s1.get()).instanceOf(Promise);
	});

	// Doesn't work in node, must be in browser:
	// it('fileStore', async () => {
	// 	const s1 = fileStore<{ n: number }[]>('test', []);
	// 	s1.set([{ n: 1 }]);
	// 	expect(await s1.get()).toStrictEqual([{ n: 1 }]);
	// });

	it('entityStore', async () => {
		// const store = entityStore(wri('test', []));
	});
});
