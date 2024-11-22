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
	import { type Person as PersonDto } from '$lib/types/person';
	import { TreeLayout } from '$lib/component/xyz/tree-layout';
	import PersonModal from '$lib/component/pamily/PersonModal.svelte';

	let { data }: { data: PageData } = $props();

	const people = $derived(data.people);
	const relationships = $derived(data.relationships);

	const nodeTypes: NodeTypes = {
		person: Person
	};

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);

	let selectedPerson = $state<PersonDto | null>(null);
	let showPersonModal = $state(false);

	function onNodeClick(e: CustomEvent<{ node: Node<PersonDto>; e: PointerEvent; }>) {
		selectedPerson = e.detail.node.data;
		showPersonModal = true;
	}

	$effect(() => {
		const _nodes = people.map((person) => ({
			id: person.id,
			type: 'person',
			position: { x: 0, y: 0 },
			draggable: false,
			data: person,
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
		on:nodeclick={(e) => onNodeClick(e)}
	>
		<MiniMap nodeStrokeWidth={3} />
		<Background />
		<Controls />
	</SvelteFlow>
</main>

{#if selectedPerson}
	<PersonModal person={selectedPerson} bind:show={showPersonModal}/>
{/if}
