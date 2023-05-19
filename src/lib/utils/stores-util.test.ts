import { describe, it, expect } from 'vitest';
import { asyncDerived, asyncable, counter, reloadable, toStore } from './stores-util';
import { iife, sleep } from './misc';
import { derived, get, readable, writable } from 'svelte/store';
import { once } from 'lodash-es';

describe('stores-utils.ts', () => {
	it('toStore', async () => {
		const c = counter();
		const r1 = readable(Promise.resolve(0), once((set) => {
			c.inc();
			return set(sleep(50));
		}));
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
			return () => {
				
			};
		})
	})

	it('asyncDerived', async () => {
		const s1 = asyncable(() => sleep(50));
		const s2 = asyncable(() => sleep(75).then((n) => n.toString()));
		const s3 = asyncDerived([s1, s2], ([$s1, $s2]) => {
			return Promise.all([$s1, $s2]);
		});
		expect(await s3.get()).toStrictEqual([50, '75']);
		expect(
			await asyncDerived([s1, s2], ([s1, s2]) =>
				Promise.all([s1, s2]).then(([n, s]) => n + s)
			).get()
		).toBe('5075');

		const s4 = toStore(() => {
			// console.log('s4');
			return sleep(50)
		});
		const s5 = toStore(() => {
			// console.log('s5');
			return sleep(75).then((n) => n.toString())
		});
		const s6 = derived([s4, s5], async ([a, b]) => {
			const resultA = await a;
			const resultB = await b;
			return resultA + resultB;
		});

		await get(s6);
		expect(await get(s6)).toBe('5075');
	});

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
			c = counter();
			let unsub = s1.subscribe(() => {});
			await s1.get();
			await s1.get();
			unsub();
			expect(get(c)).toBe(1);

			c = counter();
			const s2 = reloadable(() => {
				c.inc();
				return sleep(50);
			});
			await s2.get();
			s2.reload();
			await s2.get();
			expect(get(c)).toBe(2);

			c = counter();
			unsub = s2.subscribe(() => {});
			s2.reload();
			s2.reload();
			s2.reload();
			expect(get(c)).toBe(4);
			c = counter();
			await get(s2);
			await get(s2);
			expect(get(c)).toBe(0);

		},
		{ timeout: 60000 }
	);
});
