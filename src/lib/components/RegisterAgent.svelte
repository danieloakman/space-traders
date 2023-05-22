<script lang="ts">
	import { FACTIONS } from '$constants';
	import { api, savedAgents } from '$stores';
	import { fastHash } from '$utils';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import type { RegisterRequestFactionEnum } from 'spacetraders-sdk';

	const agentRegister = {
		symbol: '',
		faction: '' as RegisterRequestFactionEnum
	};
</script>

<div class="card p-4 m-4 flex flex-col gap-4">
	<label class="label">
		<span>Symbol (name of agent)</span>
		<input bind:value={agentRegister.symbol} class="input p-4" type="text" placeholder="Z3R0" />
	</label>

	<label class="label" for="faction"><span>Faction</span></label>
	<RadioGroup
		id="faction"
		class="flex"
		rounded="rounded-container-token"
		display="flex-col"
		active="variant-filled-primary"
		hover="hover:variant-soft-primary"
		labelledby="faction"
	>
		{#each FACTIONS as FACTION}
			<RadioItem id="faction" bind:group={agentRegister.faction} name="faction" value={FACTION}>
				{FACTION}
			</RadioItem>
		{/each}
	</RadioGroup>

	<button
		disabled={!agentRegister.symbol || !agentRegister.faction}
		type="button"
		class="btn variant-filled-primary"
		on:click={async () => {
			const result = await api.registerAgent(agentRegister.symbol, agentRegister.faction);
			if (!result) return;
			savedAgents.create({
				id: fastHash(JSON.stringify(result)).toString(),
				symbol: result.agent.symbol,
				token: result.token
			});
		}}
	>
		Submit
	</button>
</div>
