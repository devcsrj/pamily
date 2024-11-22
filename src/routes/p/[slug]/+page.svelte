<script lang="ts">
	import type { PageData } from './$types';
	import {
		Background,
		ConnectionLineType,
		Controls,
		type Edge,
		MiniMap,
		type Node,
		type NodeTypes,
		SvelteFlow
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { writable } from 'svelte/store';
	import Person from '$lib/component/pamily/Person.svelte';
	import { TreeLayout } from '$lib/component/xyz/tree-layout';

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

		const _edges = relationships.map(({ source, target }) => ({
			id: `${source}-${target}`,
			source,
			target
		}));

		const tree = new TreeLayout({
			nodeHeight: 140,
			nodeWidth: 300,
			minSpacing: 120
		});
		tree.layout(_nodes, _edges);

		nodes.set(_nodes);
		edges.set(_edges);
	});
</script>

<main class="h-screen">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		fitView
		connectionLineType={ConnectionLineType.Step}
		defaultEdgeOptions={{ type: 'smoothstep' }}
		on:nodeclick={({ detail }) => console.log(detail)}
	>
		<MiniMap nodeStrokeWidth={3} />
		<Background />
		<Controls />
	</SvelteFlow>
</main>
