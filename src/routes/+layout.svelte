<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-rocket.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar, TabGroup, Tab } from '@skeletonlabs/skeleton';
	// import SvelteLogo from 'virtual:icons/logos/svelte-icon';
	// import SvelteLogo from 'virtual:icons/vscode-icons/file-type-svelte';
	// import CheckSmall from 'virtual:icons/material-symbols/check-small';
	import { Home, ReceiptLong, Rocket, Map } from '$icons';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const tabSet = writable('/');
	tabSet.subscribe((value) => {
		if (browser) goto(value);
	});
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<!-- <svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Skeleton</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer"
				>
					Discord
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer"
				>
					Twitter
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/skeletonlabs/skeleton"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a>
			</svelte:fragment> -->
			<svelte:fragment slot="lead"><Home /></svelte:fragment>
			(title)
			<svelte:fragment slot="trail">(actions)</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="footer">
		<TabGroup
			justify="justify-center"
			active="variant-filled-primary"
			hover="hover:variant-soft-primary"
			flex="flex-1 lg:flex-none"
			rounded=""
			border=""
			class="bg-surface-100-800-token w-full"
		>
			<Tab bind:group={$tabSet} name="Home" value={'/'}>
				<svelte:fragment slot="lead"><Home /></svelte:fragment>
			</Tab>
			<Tab bind:group={$tabSet} name="Contracts" value={'/contracts'}>
				<svelte:fragment slot="lead"><ReceiptLong /></svelte:fragment>
			</Tab>
			<Tab bind:group={$tabSet} name="Navigation" value={'/navigation'}>
				<svelte:fragment slot="lead"><Map /></svelte:fragment>
			</Tab>
			<Tab bind:group={$tabSet} name="fleet" value={'/fleet'}>
				<svelte:fragment slot="lead"><Rocket /></svelte:fragment>
			</Tab>
			<!-- ... -->
		</TabGroup>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
