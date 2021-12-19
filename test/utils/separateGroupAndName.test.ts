import { separateGroupAndName } from '../../src/utils/separateGroupAndName';

const expectedGroup = 'craigmiller160';
const expectedName = 'craig-build';

describe('separateGroupAndName', () => {
	it('returns both group and name', () => {
		const [group, name] = separateGroupAndName(
			`@${expectedGroup}/${expectedName}`
		);
		expect(group).toEqual(expectedGroup);
		expect(name).toEqual(expectedName);
	});

	it('returns name only when no group', () => {
		const [group, name] = separateGroupAndName(expectedName);
		expect(group).toEqual('');
		expect(name).toEqual(expectedName);
	});
});
