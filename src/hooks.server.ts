import { env } from '$env/dynamic/private';
import * as fs from 'node:fs';
import { logger } from '$lib/server/logger';
import type { HandleServerError } from '@sveltejs/kit';
import { ZodError } from 'zod';

(() => {
	const dir = env.ASSET_DIR;
	if (!dir) {
		throw new Error('ASSET_DIR is not set');
	}
	fs.mkdir(dir, { recursive: true }, (err) => {
		if (err) {
			logger.error(err, `Failed to create assets directory: ${dir}`);
		}
	});
})();

export const handleError: HandleServerError = ({ event, error }) => {
	logger.error(
		{
			error,
			url: event?.url.toString(),
			params: event?.params,
			route: event?.route
		},
		`Error while handling request: ${event?.url.toString()}`
	);

	if (error instanceof ZodError) {
		const ze = error as ZodError;
		const firstError = ze.errors[0];
		return {
			message: firstError.message
		};
	}
	if (error instanceof Error) {
		return {
			message: error.message
		};
	}
};
