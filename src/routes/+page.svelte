<script lang="ts">
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import RegisterAgent from '$components/RegisterAgent.svelte';
	import AddAgentToken from '$components/AddAgentToken.svelte';

	let tabSet = 0;
</script>

<TabGroup justify="justify-center">
	<Tab bind:group={tabSet} name="Register" value={0}>Manage</Tab>
	<Tab bind:group={tabSet} name="Manager" value={1}>Register</Tab>

	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<AddAgentToken />
		{:else if tabSet === 1}
			<RegisterAgent />
		{/if}
	</svelte:fragment>
</TabGroup>
