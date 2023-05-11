<script lang="ts">
	import { ListBox, ListBoxItem, Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { agentTokens } from '$stores';
	import { agentDetails, registerAgent } from '$services';
	import { writable } from 'svelte/store';

	const agent = {
		symbol: '',
		faction: 'COSMIC'
	};
	let newToken = '';
	let agentToken = '';
	let tabSet = 0;
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
						const result = await registerAgent(agent.symbol, agent.faction);
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
						const result = await agentDetails(newToken);
						console.log(result);
						agentTokens.set([{ symbol: result.symbol, token: newToken }]);
					}}>Submit</button
				>
			</div>
			{#await $agentTokens}
				<p>Loading...</p>
			{:then tokens}
				{#if tokens.length > 0}
					<div class="card p-4 m-4">
						{#each tokens as token}
							<ListBox>
								<ListBoxItem bind:group={agentToken} name="medium" value={token.token}>
									<span>
										{token.symbol}
										<!-- {token.faction} -->
									</span>
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
