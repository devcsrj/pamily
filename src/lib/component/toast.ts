import Toastify from 'toastify-js';

export function errorToast(message: string) {
	Toastify({
		text: message,
		style: {
			background: '#ef4444'
		}
	}).showToast();
}
