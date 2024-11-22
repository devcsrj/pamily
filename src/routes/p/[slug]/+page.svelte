<script lang="ts">
	import type { PageData } from './$types';
	import {
		Background,
		ConnectionLineType,
		ConnectionMode,
		Controls,
		type Edge,
		type Node,
		type NodeTypes,
		SvelteFlow
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { writable } from 'svelte/store';
	import Person from '$lib/component/pamily/Person.svelte';
	import { onMount } from 'svelte';
	import { getLayoutedElements } from '$lib/layout';

	let { data }: { data: PageData } = $props();

	const people = $derived(data.people);
	const relationships = $derived(data.relationships);

	const nodeTypes: NodeTypes = {
		person: Person
	};
	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);

	$effect(() => {
		const _nodes = people.map((person) => ({
			id: person.id,
			position: { x: 0, y: 0 },
			type: 'person',
			data: person
		}));
		nodes.set(_nodes);

		const _edges = relationships.map(({ source, target }) => ({
			id: `${source}-${target}`,
			source,
			target
		}));
		edges.set(_edges);
	});
</script>

<main class="h-screen">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		fitView
		connectionMode={ConnectionMode.Loose}
		connectionLineType={ConnectionLineType.SmoothStep}
		defaultEdgeOptions={{ type: 'smoothstep' }}
		on:nodeclick={({ detail }) => console.log(detail)}
	>
		<Background />
		<Controls />
	</SvelteFlow>
</main>
