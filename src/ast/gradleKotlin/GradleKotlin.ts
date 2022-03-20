export interface GradleKotlin {
	readonly plugins: {
		// TODO how to do this?
	};
	readonly group: string;
	readonly version: string;
	readonly rootProject: {
		readonly name: string;
	};
	readonly java: {
		readonly sourceCompatibility: string;
		readonly targetCompatibility: string;
	};
	readonly repositories: {
		// TODO how to do this?
	};
	readonly dependencies: {
		// TODO how to do this?
	};
}
