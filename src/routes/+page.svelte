<script lang="ts">
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import RegisterAgent from '$components/RegisterAgent.svelte';
	import AddAgentToken from '$components/AddAgentToken.svelte';
	import { JsonView } from '@zerodevx/svelte-json-view';
	import { api } from '$stores';

	const gameStatus = api.status;
	let tabSet = 0;
</script>

<TabGroup justify="justify-center">
	<Tab bind:group={tabSet} name="Register" value={0}>Status</Tab>
	<Tab bind:group={tabSet} name="Register" value={1}>Manage</Tab>
	<Tab bind:group={tabSet} name="Manager" value={2}>Register</Tab>

	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			{#await $gameStatus then gameStatus}
				<JsonView json={gameStatus} depth={0}/>
			{/await}
		{:else if tabSet === 1}
			<AddAgentToken />
		{:else if tabSet === 2}
			<RegisterAgent />
		{/if}
	</svelte:fragment>
</TabGroup>
