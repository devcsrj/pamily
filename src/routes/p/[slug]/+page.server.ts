import type { PageServerLoad } from './$types';

export const ssr = false;

export const load: PageServerLoad = async ({ params }) => {
	return {
		nodes: [
			{
				id: '1',
				position: { x: 0, y: 0 },
				type: 'person',
				data: {
					name: 'Reijhanniel',
					dob: new Date('1995-06-01')
				}
			},
			{
				id: '2',
				position: { x: 0, y: 0 },
				type: 'person',
				data: {
					name: 'Clara',
					dob: new Date('1995-04-24')
				}
			}
		],
		edges: [
			{
				id: '1-2',
				source: '1',
				target: '2',
				label: 'jowa',
			}
		]
	};
};
