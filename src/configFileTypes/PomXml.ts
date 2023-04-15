export interface MavenArtifact {
	readonly groupId: string[];
	readonly artifactId: string[];
	readonly version?: string[];
}

export interface MavenDependencies {
	readonly dependency: MavenArtifact[];
}

export interface MavenProperties {
	readonly [key: string]: string[];
}

export interface MavenPlugins {
	readonly plugin?: MavenArtifact[];
}

export interface MavenBuild {
	readonly plugins?: MavenPlugins[];
}

export interface PomXml {
	readonly project: {
		readonly groupId: string[];
		readonly artifactId: string[];
		readonly version: string[];
		readonly properties?: MavenProperties[];
		readonly dependencies?: MavenDependencies[];

		readonly build?: MavenBuild[];
	};
}
