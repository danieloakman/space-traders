<script lang="ts">
	import { Close } from '$icons';
	import { api, currentToken, savedAgents } from '$stores';
	import { fastHash, toMS } from '$utils';
	import { ListBox, ListBoxItem, clipboard, toastStore } from '@skeletonlabs/skeleton';
	import { get } from 'svelte/store';
	import { debounce } from 'lodash-es';

	let token = '';
	const addToken = debounce(async () => {
		const result = await api.agent(token);
		if (!result) return;
		console.log(result);
		savedAgents.create({
			id: fastHash(JSON.stringify(result)).toString(),
			symbol: result.symbol,
			token: token,
		});
    toastStore.trigger({
      message: `Added "${result.symbol}" to your saved agents.`,
      timeout: toMS(3, 's'),
      background: 'bg-green-500',
    })
    token = '';
	}, 500);

	$: if (token) addToken();
</script>

<div class="card p-4 m-4">
	<label class="label">
		<span>Add an agent's token</span>
		<input bind:value={token} class="input p-4" type="text" placeholder="token" />
	</label>
</div>
{#await $savedAgents}
	<p>Loading...</p>
{:then agents}
	{#if agents.length > 0}
		<div class="card p-4 m-4">
			{#each agents as agent}
				<ListBox default={get(currentToken)}>
					<ListBoxItem
						class="flex w-100"
						bind:group={$currentToken}
						name="medium"
						value={agent.token}
					>
						<span>
							{agent.symbol}
							<!-- {token.faction} -->
						</span>
						<button type="button" class="btn variant-filled-primary" use:clipboard={agent.token}
							>Copy token</button
						>
						<button
							type="button"
							class="btn-icon variant-filled-error ps-auto"
							on:click={() => {
								savedAgents.delete(agent.id);
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
