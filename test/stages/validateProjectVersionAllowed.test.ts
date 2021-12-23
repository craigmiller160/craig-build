export {};

describe('validateProjectVersionAllowed', () => {
	it('allows npm pre-release version', () => {
		throw new Error();
	});

	it('allows maven pre-release version', () => {
		throw new Error();
	});

	it('allows docker pre-release version', () => {
		throw new Error();
	});

	it('allows npm release version with no conflicts', () => {
		throw new Error();
	});

	it('allows maven release version with no conflicts', () => {
		throw new Error();
	});

	it('allows docker release version with no conflicts', () => {
		throw new Error();
	});

	it('rejects npm release version with conflict', () => {
		throw new Error();
	});

	it('rejects maven release version with conflicts', () => {
		throw new Error();
	});

	it('rejects docker release version with conflicts', () => {
		throw new Error();
	});
});
