<script lang="ts">
	import type { PageData } from './$types';
	import {
		Background,
		ConnectionLineType,
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

	const nodeTypes: NodeTypes = {
		person: Person
	};
	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);

	onMount(() => {
		const _nodes = data.nodes || [];
		const _edges = data.edges || [];
		const layouted = getLayoutedElements(_nodes, _edges, {
			nodeWidth: 130,
			nodeHeight: 400,
			direction: 'TB'
		});
		$nodes = layouted.nodes;
		$edges = layouted.edges;
	});
</script>

<main class="h-screen">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		fitView
		connectionLineType={ConnectionLineType.SmoothStep}
		defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
		on:nodeclick={({ detail }) => console.log(detail)}
	>
		<Background />
		<Controls />
	</SvelteFlow>
</main>
