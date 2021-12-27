export {};

describe('deployToKubernetes', () => {
	it('skips for NpmLibrary', () => {
		throw new Error();
	});

	it('skips for MavenLibrary', () => {
		throw new Error();
	});

	it('skips for DockerImage', () => {
		throw new Error();
	});

	it('deploys for MavenApplication', () => {
		throw new Error();
	});

	it('deploys for NpmApplication', () => {
		throw new Error();
	});

	it('deploys for DockerApplication', () => {
		throw new Error();
	});

	it('deploys for MavenApplication with configmap', () => {
		throw new Error();
	});

	it('deploys for MavenApplication with multiple configmaps', () => {
		throw new Error();
	});
});
