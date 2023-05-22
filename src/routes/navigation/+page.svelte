<script>
	// import { Application, Text } from 'svelte-pixi';
  import { api } from '$lib';
	import { JsonView } from '@zerodevx/svelte-json-view';

  const systems = api.systems();
</script>

<!-- <Application>
	<Text
		text="Hello World"
		anchor={0.5}
		x={200}
		y={200}
		style={{
			fill: 'white'
		}}
	/>
</Application> -->

{#await systems then s}
  <JsonView json={s} depth={1}/>
{/await}