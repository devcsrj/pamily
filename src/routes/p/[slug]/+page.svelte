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
		SvelteFlow,
		useSvelteFlow
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { writable } from 'svelte/store';
	import Person from '$lib/component/pamily/Person.svelte';
	import { type Person as PersonDto } from '$lib/types/person';
	import { TreeLayout } from '$lib/component/xyz/tree-layout';
	import Plus from 'lucide-svelte/icons/plus';
	import PersonDialog from '$lib/component/pamily/PersonDialog.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();

	const familyId = $derived(data.familyId);
	const people = $derived(data.people);
	const relationships = $derived(data.relationships);

	const nodeTypes: NodeTypes = {
		person: Person
	};

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);
	const { screenToFlowPosition } = useSvelteFlow();
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

	async function onAddNode() {
		const center = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2
		};
		const position = screenToFlowPosition(center);
		console.log(position);

		const res = await fetch('/api/people', {
			method: 'POST',
			body: JSON.stringify({ familyId })
		});
		if (res.ok) {
			const person = await res.json();
			$nodes = [
				...$nodes,
				{
					id: person.id,
					type: 'person',
					position,
					data: person
				}
			];
		}
	}

	$effect(() => {
		const _nodes: Node<PersonDto>[] = people.map((person) => ({
			id: person.id,
			type: 'person',
			position: { x: 0, y: 0 },
			data: person
		}));

		const _edges: Edge[] = relationships.map(({ source, target }) => ({
			id: `${source}-${target}`,
			source,
			target,
			type: 'smoothstep'
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
		fitView={true}
		connectionLineType={ConnectionLineType.Step}
		defaultEdgeOptions={{ type: 'smoothstep' }}
		onconnect={(e) => onNodeConnect(e)}
		on:nodeclick={(e) => onNodeClick(e)}
	>
		<div class="fixed bottom-5 left-1/2 z-10 translate-x-[-50%]">
			<Button onclick={onAddNode}>
				<Plus />
				Person
			</Button>
		</div>
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
		onDelete={async (person) => {
			$nodes = $nodes.filter((n) => n.type === 'person').filter((n) => n.data.id !== person.id);
			selectedPerson = null;
		}}
		bind:show={showPersonDialog}
	/>
{/if}

<style>
	:global(.svelte-flow__edge-path) {
		stroke-width: 2px;
	}

	:global(g.selected .svelte-flow__edge-path) {
		stroke: #065f46 !important;
		stroke-width: 3px !important;
	}
</style>
