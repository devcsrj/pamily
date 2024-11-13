<script lang="ts">
	import {
		SvelteFlow,
		Background,
		Controls,
		type Node,
		type NodeTypes,
		type Edge,
		MarkerType
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { writable } from 'svelte/store';
	import Person from '$lib/component/pamily/Person.svelte';

	const nodeTypes: NodeTypes = {
		person: Person
	};
	const nodes = writable<Node[]>([
		{
			id: '1',
			position: { x: 0, y: 0 },
			type: 'person',
			data: {
				name: 'Reijhanniel',
				dob: new Date('1995-06-01')
			}
		},
		{
			id: '2',
			position: { x: 400, y: 0 },
			type: 'person',
			data: {
				name: 'Clara',
				dob: new Date('1995-04-24')
			}
		}
	]);
	const edges = writable<Edge[]>([
		{
			id: '1-2',
			source: '1',
			target: '2',
			label: 'jowa',
			animated: true,
			markerEnd: {
				type: MarkerType.Arrow
			}
		}
	]);
</script>

<main class="h-screen">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		fitView
		on:nodeclick={({ detail }) => console.log(detail)}
	>
		<Background />
		<Controls />
	</SvelteFlow>
</main>
