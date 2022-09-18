export interface MavenDependency {
	readonly groupId: string[];
	readonly artifactId: string[];
	readonly version?: string[];
}

export interface MavenDependencies {
	readonly dependency: MavenDependency[];
}

export interface MavenProperties {
	readonly [key: string]: string[];
}

export interface PomXml {
	readonly project: {
		readonly groupId: string[];
		readonly artifactId: string[];
		readonly version: string[];
		readonly properties?: MavenProperties[];
		readonly dependencies?: MavenDependencies[];
	};
}
