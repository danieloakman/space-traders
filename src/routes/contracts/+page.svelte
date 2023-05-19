<script lang="ts">
	import { api } from '$stores';
</script>

<nav data-sveltekit-preload-data="off" class="list-nav">
	<!-- (optionally you can provide a label here) -->
	{#await api.contracts()}
		<span>Loading...</span>
	{:then contracts}
		<ul class="h-5">
			{#each contracts as contract}
				<li class="h-10">
					<a href="/contracts/{contract.id}" class="h-10">
						<span class="badge bg-primary-500">💀</span>
						<span class="flex-auto">{contract.type}</span>
						<span class="flex-none">{contract.expiration}</span>
						<!-- <span class="flex-none">{contract.accepted}</span> -->
					</a>
				</li>
			{/each}
		</ul>
	{/await}
</nav>
