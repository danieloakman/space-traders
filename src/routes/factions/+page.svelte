<script lang="ts">
  import { api } from '$stores';
	import { JsonView } from '@zerodevx/svelte-json-view';
</script>

<div class="px-1">
	<!-- (optionally you can provide a label here) -->
	{#await api.factions()}
		<span>Loading...</span>
	{:then factions}
    <JsonView json={factions} depth={1}/>
		<!-- <ul class="h-5">
      {#each factions as faction}
			<li class="h-10">
				<a href="/contracts/{faction.symbol}" class="h-10">
					<span class="flex-auto">{faction.name}</span>
          <span class="flex-none">{faction.headquarters}</span>
				</a>
			</li>
      {/each}
		</ul> -->
	{/await}
</div>
