<script lang="ts">
	import type { PageData } from './$types';
	import {
		Background,
		type Connection,
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
	import PersonDialog from '$lib/component/pamily/PersonDialog.svelte';
	import type { Relationship } from '$lib/types/family';

	let { data }: { data: PageData } = $props();

	const people = $derived(data.people);
	const relationships = $derived(data.relationships);

	const nodeTypes: NodeTypes = {
		person: Person
	};

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);
	const tree = new TreeLayout({
		nodeHeight: 200,
		nodeWidth: 300,
		minSpacing: 120
	});

	let selectedPerson = $state<PersonDto | null>(null);
	let showPersonDialog = $state(false);

	function onNodeClick(e: CustomEvent<{ node: Node<PersonDto>; e: PointerEvent }>) {
		const thisPerson = e.detail.node.data;
		if (selectedPerson?.id === thisPerson.id) {
			showPersonDialog = true;
			return;
		}

		selectedPerson = e.detail.node.data;
	}

	async function onNodeConnect(connection: Connection) {
		const childId = connection.target;
		const parentId = connection.source;
		await fetch(`/api/people/${childId}/parents/${parentId}`, {
			method: 'PUT'
		});
	}

	$effect(() => {
		const _nodes = people.map((person) => ({
			id: person.id,
			type: 'person',
			position: { x: 0, y: 0 },
			data: person
		}));

		const _edges = relationships.map(({ source, target }) => ({
			id: `${source}-${target}`,
			source,
			target
		}));

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
		onconnect={(e) => onNodeConnect(e)}
		on:nodeclick={(e) => onNodeClick(e)}
	>
		<MiniMap nodeStrokeWidth={3} />
		<Background />
		<Controls />
	</SvelteFlow>
</main>

{#if selectedPerson}
	<PersonDialog
		person={selectedPerson}
		onSave={async (person) => {
			$nodes = $nodes.map((node) => {
				if (node.type === 'person' && node.data.id === person.id) {
					node.data = person;
					return node;
				}
				return node;
			});
			selectedPerson = null;
		}}
		bind:show={showPersonDialog}
	/>
{/if}
