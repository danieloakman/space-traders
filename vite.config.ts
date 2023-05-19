import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte',
			autoInstall: true
		})
	],
	test: {
		includeSource: ['src/**/*.{js,ts}'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: {
		'import.meta.vitest': undefined
	}
});
