<script lang="ts">
	import { api } from '$stores';
	import { JsonView } from '@zerodevx/svelte-json-view';
</script>

<div class="px-1">
	<!-- (optionally you can provide a label here) -->
	{#await api.factions()}
		<span>Loading...</span>
	{:then factions}
		<JsonView json={factions} depth={1} />
	{/await}
</div>
