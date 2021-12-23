export interface MavenDependency {
	groupId: string[];
	artifactId: string[];
	version?: string[];
}

export interface MavenDependencies {
	dependency: MavenDependency[];
}

export interface MavenProperties {
	[key: string]: string[];
}

export interface PomXml {
	project: {
		groupId: string[];
		artifactId: string[];
		version: string[];
		properties?: MavenProperties[];
		dependencies: MavenDependencies[];
	};
}
