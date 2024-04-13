export type MavenArtifact = Readonly<{
	groupId: string[];
	artifactId: string[];
	version?: string[];
}>;

export type MavenDependencies = Readonly<{
	dependency: MavenArtifact[];
}>;

export type MavenProperties = Readonly<{
	[key: string]: string[];
}>;

export type MavenPlugins = Readonly<{
	plugin?: MavenArtifact[];
}>;

export type MavenBuild = Readonly<{
	plugins?: MavenPlugins[];
}>;

export type PomXml = Readonly<{
	project: Readonly<{
		groupId?: string[];
		artifactId: string[];
		version?: string[];
		properties?: MavenProperties[];
		dependencies?: MavenDependencies[];
		build?: MavenBuild[];
	}>;
}>;
