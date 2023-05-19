<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-rocket.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';

	import { AppShell, AppBar, TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import {
		Home,
		ReceiptLong,
		Rocket,
		Map,
		ChevronLeft,
		Menu,
		MenuOpen,
		Refresh,
		Groups
	} from '$icons';
	import { derived, get, writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
	import { api } from '$stores';
	import { JsonView } from '@zerodevx/svelte-json-view';

	const isDrawerOpen = derived(drawerStore, ($drawer) => $drawer.open ?? false);

	const myAgent = api.myAgent;
	const headquarters = api.headquarters;

	const tabSet = writable('/');
	tabSet.subscribe((value) => {
		if (browser) goto(value);
	});

	// let showSidebar = false;

	// $: {
	// 	if (showSidebar) drawerStore.open();
	// 	else drawerStore.close();
	// }

	const routes = derived(page, ($page) => $page.route.id?.split('/').filter(Boolean) ?? []);

	function goBack(routes: string[]) {
		const current = routes.pop();
		if (!current) return;
		goto('/' + routes.join('/'));
	}
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar>
			<svelte:fragment slot="lead">
				<button
					disabled={$routes.length <= 1}
					class="btn-icon btn-sm variant-filled-primary my-0 py-0"
					on:click={() => goBack($routes)}
				>
					<ChevronLeft />
				</button>
			</svelte:fragment>

			{$page.route.id}

			<svelte:fragment slot="trail">
				<button
					class="btn-icon variant-filled-primary"
					on:click={() => ($isDrawerOpen ? drawerStore.close() : drawerStore.open())}
				>
					{#if $isDrawerOpen}
						<MenuOpen />
					{:else}
						<Menu />
					{/if}
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- <svelte:fragment slot="sidebarRight">
		{#if $showSidebar}
			<div class="card m-4 p-4" style="width: 200px;">
				<span class="">Hello</span>
			</div>
		{/if}
	</svelte:fragment> -->

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

			<Tab bind:group={$tabSet} name="factions" value={'/factions'}>
				<svelte:fragment slot="lead"><Groups /></svelte:fragment>
			</Tab>
		</TabGroup>
	</svelte:fragment>

	<slot />
</AppShell>

<Drawer
	position="right"
	width="w-[280px] md:w-[480px]"
	padding="p-4"
	rounded="rounded-xl"
	bgBackdrop="bg-gradient-to-tr from-blue-500/50 via-purple-500/50 to-red-500/50"
>
	{#if $isDrawerOpen}
		<div class="m-4 flex justify-between">
			<button />
			<button class="btn-icon variant-filled-primary" on:click={() => myAgent.reload()}>
				<Refresh />
			</button>
		</div>

		{#await $myAgent then myAgent}
			<div class="mx-4">
				<JsonView json={myAgent} />
			</div>
		{/await}

		<!-- {#await $headquarters then headquarters}
			<div class="m-4">
				<JsonView json={headquarters} depth={1}/>
			</div>
		{/await} -->
	{/if}
</Drawer>
