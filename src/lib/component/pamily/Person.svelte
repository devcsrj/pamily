<script lang="ts">
	import { Handle, type NodeTypes, Position } from '@xyflow/svelte';
	import dayjs from 'dayjs';
	import { createAvatar } from '@dicebear/core';
	import { adventurerNeutral } from '@dicebear/collection';
	import type { Person } from '$lib/types/person';

	type Params = NodeTypes & {
		type: 'person';
		data: Person;
	};

	let { data }: Params = $props();

	let noAvatar = $state(false);

	const name = $derived(data.name);
	const avatarUrl = $derived(data.avatarUrl);
	const dateOfBirth = $derived(data.dateOfBirth);
	const generatedAvatar = $derived(
		createAvatar(adventurerNeutral, {
			seed: name
		})
	);
	const age = $derived(dateOfBirth ? dayjs().diff(dateOfBirth, 'year') : null);
</script>

<div
	class="min-h-16 rounded-md border-2 border-stone-300 bg-white p-4 shadow-md hover:shadow-teal-200"
>
	<Handle type="target" position={Position.Top} class="!w-6 !h-2 !rounded-none !border-none !bg-teal-500" />
	<div class="flex">
		<div class="flex items-center justify-center rounded-full bg-gray-100">
			{#if !avatarUrl || noAvatar}
				<img
					src={generatedAvatar.toDataUri()}
					alt={name}
					class="h-12 w-12 rounded-full object-cover"
				/>
			{:else}
				<img
					src={avatarUrl}
					alt={name}
					class="h-12 w-12 rounded-full"
					onerror={() => {
						noAvatar = true;
					}}
				/>
			{/if}
		</div>
		<div class="ml-2 w-32">
			<div class="overflow-x-clip text-ellipsis text-nowrap text-lg font-bold">{name}</div>
			{#if age}
				<div class="text-xs text-gray-500">{age}</div>
			{/if}
		</div>
	</div>
	<Handle
		type="source"
		position={Position.Bottom}
		class="!w-6 !h-2 !rounded-none !border-none !bg-teal-500"
	/>
</div>
