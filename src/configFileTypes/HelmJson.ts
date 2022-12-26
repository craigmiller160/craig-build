export type HelmType = 'library' | 'application';

export type HelmSetValues = {
	readonly [key: string]: string;
};

export type HelmJson = {
	readonly name: string;
	readonly version: string;
	readonly type: HelmType;
	readonly namespace: string;
	readonly setValues?: HelmSetValues;
};
