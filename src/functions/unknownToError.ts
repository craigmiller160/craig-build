export const unknownToError = (theUnknown: unknown): Error => {
	if (theUnknown instanceof Error) {
		return theUnknown as Error;
	}
	return new Error(`Unknown Error: ${theUnknown}`);
};
