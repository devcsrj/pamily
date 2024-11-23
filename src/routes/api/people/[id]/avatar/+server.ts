import { json, type RequestHandler } from '@sveltejs/kit';
import * as fs from 'node:fs';
import { getLineageService } from '$lib/server/service';
import { env } from '$env/dynamic/private';
import { getRequestReadableStream, getFileWritableStream } from '$lib/io/stream';

export const POST: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	const service = getLineageService();
	const person = await service.getPersonById(id);
	if (!person) {
		return json({ message: 'Person not found' }, { status: 404 });
	}

	const ext = (() => {
		const contentType = request.headers.get('content-type');
		if (!contentType) {
			throw new Error('Content-Type header is required');
		}
		if (contentType === 'image/jpeg') {
			return 'jpg';
		}
		if (contentType === 'image/png') {
			return 'png';
		}
		if (contentType === 'image/gif') {
			return 'gif';
		}
		throw new Error(`Unsupported content type: ${contentType}`);
	})();

	const filename = id.replaceAll('/', '__');
	const path = `${env.ASSET_DIR}/${filename}.${ext}`;
	const out = fs.createWriteStream(path, {
		flags: 'w',
		autoClose: true
	});
	const sink = getFileWritableStream(out);
	const source = getRequestReadableStream(request);
	await source.pipeTo(sink);

	const now = Date.now();
	const url = `/api/people/${id}/avatar.${ext}?t=${now}`;
	await service.updatePerson({
		...person,
		avatarUrl: url
	});

	return json({
		url
	});
};
