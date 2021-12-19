export default (unknownError: unknown): Error => {
	if (unknownError instanceof Error) {
		return unknownError as Error;
	}
	return new Error(`Unknown Error: ${unknownError}`);
};
