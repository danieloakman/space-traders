<script lang="ts">
	import { api } from '$lib';
  import { JsonView } from '@zerodevx/svelte-json-view'


	export let data;
  let depth = Infinity;
</script>

{#await api.contract(data.id)}
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
	<!-- <div class="card p-4 m-4">
    <ul>
      <li>
        <span>ID: {contract.id}</span>
      </li>
      <li>
        <span>Accepted: {contract.accepted}</span>
      </li>
      <li>
        <span>Fullfilled: {contract.fulfilled}</span>
      </li>
      <li>
        <span>Expires: {new Date(contract.expiration).toLocaleString()}</span>
      </li>
      <li>
        <span>Faction: {contract.factionSymbol}</span>
      </li>
      <li>
        <span>Type: {contract.type}</span>
      </li>
      <li>
        <span>Terms:</span>
        <ul>
          <li>
            <span>Good: {contract.terms.deliver[0].}</span>
          </li>
        </ul>
      </li>
    </ul>
	</div> -->
  <div class="ms-1">
    <JsonView json={contract} {depth}/>
  </div>
  <button class="btn">Accept</button>
{/await}
