import type { ReadStream, WriteStream } from 'node:fs';

export function getRequestReadableStream(request: Request) {
	return new ReadableStream({
		start(controller) {
			const reader = request.body!.getReader();

			function push() {
				reader
					.read()
					.then(({ done, value }) => {
						if (done) {
							controller.close();
							return;
						}

						controller.enqueue(value);
						push();
					})
					.catch((err) => {
						controller.error(err);
					});
			}

			push();
		}
	});
}

export function getFileReadableStream(source: ReadStream) {
	return new ReadableStream({
		start(controller) {
			// Handle data chunks
			source.on('data', (chunk) => {
				controller.enqueue(chunk);
			});

			// Handle end of stream
			source.on('end', () => {
				controller.close();
			});

			// Handle errors
			source.on('error', (error) => {
				controller.error(error);
			});
		},

		// Optional: Handle cancellation
		cancel() {
			source.destroy();
		}
	});
}

export function getFileWritableStream(source: WriteStream) {
	return new WritableStream({
		// Called when new data is written to the stream
		write(chunk) {
			return new Promise((resolve) => {
				// Handle backpressure automatically through the write callback
				const canContinue = source.write(chunk);

				if (canContinue) {
					resolve();
				} else {
					source.once('drain', resolve);
				}
			});
		},

		// Called when stream.close() is called
		close() {
			return new Promise((resolve, reject) => {
				source.end((err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		},

		// Called if the stream is terminated unexpectedly
		abort(reason) {
			source.destroy(reason);
		}
	});
}
