import { json, type RequestHandler } from '@sveltejs/kit';
import { getLineageService } from '$lib/server/service';
import fs from 'node:fs';
import { getFileReadableStream } from '$lib/io/stream';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) {
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	const service = getLineageService();
	const person = await service.getPersonById(id);
	if (!person) {
		return json({ message: 'Person not found' }, { status: 404 });
	}

	const url = person.avatarUrl;
	if (!url) {
		return json({ message: 'Avatar not found' }, { status: 404 });
	}

	const filename = `${env.ASSET_DIR}/${id}.${params.ext}`;

	const f = fs.createReadStream(filename, {
		flags: 'r',
		autoClose: true
	});
	const source = getFileReadableStream(f);

	return new Response(source, {
		headers: {
			'Cache-Control': 'max-age=600' // 10 minutes
		}
	});
};
