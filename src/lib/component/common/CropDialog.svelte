<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Cropper from 'cropperjs';
	import 'cropperjs/dist/cropper.min.css';
	import { errorToast } from '$lib/component/toast';
	import { Button } from '$lib/components/ui/button';

	type Params = {
		file: File;
		onCrop: (blob: Blob) => Promise<void>;
		show: boolean;
	};

	let { file, onCrop, show = $bindable(false) }: Params = $props();

	let src = $state<string | null>();
	let cropper = $state<Cropper | null>();

	$effect(() => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result;
			src = result as string;
		};
		reader.onloadend = () => {
			initCropper();
		};
		reader.readAsDataURL(file);
	});

	function crop() {
		if (!cropper) {
			return;
		}
		const canvas = cropper.getCroppedCanvas({
			fillColor: '#fff',
			maxWidth: 4096,
			maxHeight: 4096
		});
		if (!canvas) {
			return;
		}
		canvas.toBlob(
			async (blob) => {
				if (!blob) {
					return;
				}
				await onCrop(blob);
			},
			file.type,
			0.4
		);
	}

	function initCropper() {
		const image = document.getElementById('image') as HTMLImageElement;
		if (!image) {
			errorToast('Could not load cropper. Please refresh the page.');
			return;
		}
		cropper = new Cropper(image, {
			aspectRatio: 1,
			viewMode: 1,
			background: false,
			autoCropArea: 1,
			zoomable: false
		});
	}
</script>

<Dialog.Root bind:open={show}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<div class="p-4">
			<div>
				<img {src} id="image" alt="Image being cropped" class="block h-auto w-full max-w-full" />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" disabled={!cropper} onclick={crop}>Save image</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
