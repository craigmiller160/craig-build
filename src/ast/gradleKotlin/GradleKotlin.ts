export interface GradleDependency {
	readonly group: string;
	readonly name: string;
	readonly version: string;
}

// TODO rename this
export interface GradleKotlin {
	readonly name: string;
	readonly group: string;
	readonly version: string;
	readonly dependencies: ReadonlyArray<GradleDependency>;
}
