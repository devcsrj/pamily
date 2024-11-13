<script lang="ts">
	import { Handle, type NodeTypes, Position } from '@xyflow/svelte';
	import dayjs from 'dayjs';
	import { createAvatar } from '@dicebear/core';
	import { adventurerNeutral } from '@dicebear/collection';

	type Params = NodeTypes & {
		data: {
			name: string;
			dob?: Date;
		};
		type: 'person';
	};

	let { data }: Params = $props();

	const { name, dob } = data;
	const avatar = $derived(
		createAvatar(adventurerNeutral, {
			seed: name
		})
	);
	const age = $derived(dob ? dayjs().diff(dob, 'year') : null);
</script>

<div class="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md">
	<div class="flex">
		<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
			<img src={avatar.toDataUri()} alt={name} class="rounded-full" />
		</div>
		<div class="ml-2 w-32">
			<div class="text-lg font-bold">{name}</div>
			{#if age}
				<div class="text-gray-500">{age}</div>
			{/if}
		</div>
	</div>
	<Handle
		type="target"
		position={Position.Left}
		class="h-4 rounded-none border-none !bg-teal-500"
	/>
	<Handle
		type="source"
		position={Position.Right}
		class="h-4 rounded-none border-none !bg-teal-500"
	/>
</div>
