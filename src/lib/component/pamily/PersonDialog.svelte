<script lang="ts">
	import type { Person } from '$lib/types/person';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today
	} from '@internationalized/date';
	import { CalendarIcon } from 'lucide-svelte';
	import 'toastify-js/src/toastify.css';
	import { errorToast } from '$lib/component/toast';
	import CropDialog from '$lib/component/common/CropDialog.svelte';

	type Params = {
		person: Person;
		show: boolean;
	};

	let { person, show = $bindable(false) }: Params = $props();

	let dob = $state<DateValue | undefined>();
	let dop = $state<DateValue | undefined>();
	let placeholder = $state<DateValue>(today(getLocalTimeZone()));
	let fileBeingCropped = $state<File | null>(null);
	let isCropping = $state(false);

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	$effect(() => {
		dob = person.dateOfBirth ? parseDate(person.dateOfBirth) : undefined;
		dop = person.dateOfDeath ? parseDate(person.dateOfDeath) : undefined;
	});

	function onFileSelect(e: Event) {
		const { files } = e.target as HTMLInputElement;
		if (!files || !files.length) return;

		const file = files[0];
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			errorToast('Photo must be less than 5MB');
			return;
		}
		fileBeingCropped = file;
		isCropping = true;
	}

	async function onFileCrop(blob: Blob) {
		try {
			const response = await fetch(`/api/people/${person.id}/avatar`, {
				method: 'POST',
				headers: {
					'Content-Type': blob.type
				},
				body: blob
			});
			const body = await response.json();
			if (response.ok) {
				if ('url' in body) {
					person.avatarUrl = body.url;
				}
			} else {
				if ('message' in body) {
					errorToast(body.message);
				} else {
					console.error(body);
					errorToast('Failed to upload avatar. Please try again later.');
				}
			}
		} catch (e) {
			console.error(e);
			errorToast('Failed to upload avatar. Please try again.');
		} finally {
			isCropping = false;
		}
	}
</script>

<Dialog.Root bind:open={show}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-3 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" bind:value={person.name} class="col-span-3" />
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="dob" class="text-right">Date of Birth</Label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-[280px] justify-start pl-4 text-left font-normal',
							!dob && 'text-muted-foreground'
						)}
					>
						{dob ? df.format(dob.toDate(getLocalTimeZone())) : ''}
						<CalendarIcon class="ml-auto size-4 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" side="top">
						<Calendar
							type="single"
							value={dob}
							bind:placeholder
							minValue={new CalendarDate(1900, 1, 1)}
							maxValue={today(getLocalTimeZone())}
							calendarLabel="Date of birth"
							onValueChange={(v) => {
								if (v) {
									person.dateOfBirth = v.toString();
								} else {
									person.dateOfBirth = '';
								}
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="dob" class="text-right">Date of Passing</Label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-[280px] justify-start pl-4 text-left font-normal',
							!dop && 'text-muted-foreground'
						)}
					>
						{dop ? df.format(dop.toDate(getLocalTimeZone())) : ''}
						<CalendarIcon class="ml-auto size-4 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" side="top">
						<Calendar
							type="single"
							value={dop}
							bind:placeholder
							minValue={new CalendarDate(1900, 1, 1)}
							maxValue={today(getLocalTimeZone())}
							calendarLabel="Date of passing"
							onValueChange={(v) => {
								if (v) {
									person.dateOfDeath = v.toString();
								} else {
									person.dateOfDeath = '';
								}
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="avatar" class="text-right">Avatar</Label>
				<Input
					id="avatar"
					type="file"
					class="col-span-3"
					onchange={onFileSelect}
					accept="image/png, image/jpeg, image/gif"
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#if isCropping && fileBeingCropped}
	<CropDialog bind:show={isCropping} file={fileBeingCropped} onCrop={onFileCrop} />
{/if}
