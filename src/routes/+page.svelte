<script lang="ts">
	import { ListBox, ListBoxItem, Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { savedAgents, api, currentAgent } from '$stores';
	// import { agentDetails } from '$services';
	import { get, writable } from 'svelte/store';
	import type { RegisterRequestFactionEnum } from 'spacetraders-sdk';
	import type { SavedAgent } from '$types';
	import { Close } from '$icons';
	import { fastHash } from '$utils';

	const agent = {
		symbol: '',
		faction: 'COSMIC' as RegisterRequestFactionEnum
	};
	let newToken = '';
	let selectedAgent: SavedAgent = { id: '', symbol: '', token: '' };
	let tabSet = 0;


	$: if (selectedAgent.token.length) {
		savedAgents.get().then((agents) => console.log({ agents }));
		currentAgent.set(selectedAgent);
		// api.myAgent.reload();
		console.time('myAgent');
		api.myAgent.get().then((myAgent) => {
			console.log({ myAgent });
			console.timeEnd('myAgent');
		});
		// api.headquarters.get().then((headquarters) => {
		// 	console.log({ headquarters });
		// });
	}
</script>

<TabGroup justify="justify-center">
	<Tab bind:group={tabSet} name="Register" value={0}>Register</Tab>
	<Tab bind:group={tabSet} name="Manager" value={1}>Manage</Tab>
	<!-- <Tab bind:group={tabSet} name="tab3" value={2}>(label)</Tab> -->

	<!-- Tab Panels --->
	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<div class="card p-4 m-4">
				<label class="label">
					<span>Symbol (name)</span>
					<input bind:value={agent.symbol} class="input p-4" type="text" placeholder="Z3R0" />
				</label>

				<label class="label pt-4">
					<span>Faction</span>
					<input bind:value={agent.faction} class="input p-4" type="text" placeholder="COSMIC" />
				</label>

				<button
					type="button"
					class="btn variant-filled"
					on:click={async () => {
						const result = await api.registerAgent(agent.symbol, agent.faction);
						savedAgents.create({
							id: fastHash(JSON.stringify(result)).toString(),
							symbol: result.agent.symbol,
							token: result.token
						});
					}}>Submit</button
				>
			</div>
		{:else if tabSet === 1}
			<div class="card p-4 m-4">
				<label class="label">
					<span>Add an agent's token</span>
					<input bind:value={newToken} class="input p-4" type="text" placeholder="token" />
				</label>

				<button
					type="button"
					class="btn variant-filled"
					on:click={async () => {
						const result = await api.agent(newToken);
						console.log(result);
						savedAgents.create({
							id: fastHash(JSON.stringify(result)).toString(),
							symbol: result.symbol,
							token: newToken
						});
					}}
				>
					Submit
				</button>
			</div>
			{#await $savedAgents}
				<p>Loading...</p>
			{:then agents}
				{#if agents.length > 0}
					<div class="card p-4 m-4">
						{#each agents as token}
							<ListBox>
								<ListBoxItem bind:group={selectedAgent} name="medium" value={token}>
									<span>
										{token.symbol}
										<!-- {token.faction} -->
									</span>
									<button
										type="button"
										class="btn-icon variant-filled"
										on:click={() => {
											savedAgents.delete(token.id);
										}}
									>
										<Close />
									</button>
								</ListBoxItem>
							</ListBox>
						{/each}
					</div>
				{/if}
			{:catch error}
				<span>{error.message}</span>
			{/await}
		{/if}
	</svelte:fragment>
</TabGroup>
