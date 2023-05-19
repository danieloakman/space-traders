<script lang="ts">
	import { api } from '$lib';
	import { JsonView } from '@zerodevx/svelte-json-view';
	import { page } from '$app/stores';
	import { formatAPIResponse } from '$utils';
	import { goto } from '$app/navigation';
	import type { Contract } from 'spacetraders-sdk';

	let depth = 1;

	async function nextStep(contract: Contract) {
		if (!contract.accepted) await api.acceptContract(contract.id);
		else if (!contract.fulfilled) await api.deliverContract(contract.id);
		else await api.fulfillContract(contract.id);
	}
</script>

{#await api.contract($page.params.id)}
	<section class="card w-full m-4 p-4">
		<div class="space-y-4">
			<div class="placeholder" />
			<div class="grid grid-cols-3 gap-8">
				<div class="placeholder" />
				<div class="placeholder" />
				<div class="placeholder" />
			</div>
			<div class="grid grid-cols-4 gap-4">
				<div class="placeholder" />
				<div class="placeholder" />
				<div class="placeholder" />
				<div class="placeholder" />
			</div>
		</div>
	</section>
{:then contract}
	<div class="ms-2">
		<JsonView json={formatAPIResponse(contract)} {depth} />
	</div>

	<div class="flex justify-center my-2">
		<button class="btn-lg variant-filled-primary" on:click={async () => nextStep(contract)}>
			{!contract.accepted ? 'Accept' : !contract.fulfilled ? 'Deliver' : 'Fulfill'}
		</button>
	</div>
{/await}
