export type MavenArtifact = Readonly<{
	groupId: ReadonlyArray<string>;
	artifactId: ReadonlyArray<string>;
	version?: ReadonlyArray<string>;
}>;

export type MavenDependencies = Readonly<{
	dependency: ReadonlyArray<MavenArtifact>;
}>;

export type MavenProperties = Readonly<{
	[key: string]: ReadonlyArray<string>;
}>;

export type MavenPlugins = Readonly<{
	plugin?: ReadonlyArray<MavenArtifact>;
}>;

export type MavenBuild = Readonly<{
	plugins?: ReadonlyArray<MavenPlugins>;
}>;

export type MavenModules = Readonly<{
	module: ReadonlyArray<string>;
}>;

export type PomXml = Readonly<{
	project: Readonly<{
		groupId?: ReadonlyArray<string>;
		artifactId: ReadonlyArray<string>;
		version?: ReadonlyArray<string>;
		properties?: ReadonlyArray<MavenProperties>;
		dependencies?: ReadonlyArray<MavenDependencies>;
		build?: ReadonlyArray<MavenBuild>;
		modules?: ReadonlyArray<MavenModules>;
	}>;
}>;
