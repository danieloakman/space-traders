<script lang="ts">
	import { api } from '$stores';
	import { formatAPIResponse } from '$utils';
	import { JsonView } from '@zerodevx/svelte-json-view';
</script>

<div class="px-1">
	<!-- (optionally you can provide a label here) -->
	{#await api.ships()}
		<span>Loading...</span>
	{:then ships}
		<JsonView json={formatAPIResponse(ships)} depth={1} />
	{/await}
</div>
