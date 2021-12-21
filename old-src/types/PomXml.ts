interface Dependency {
	groupId: string[];
	artifactId: string[];
	version: string[];
}

interface Dependencies {
	dependency: Dependency[];
}

interface Properties {
	[key: string]: string[];
}

export default interface PomXml {
	project: {
		groupId: string[];
		artifactId: string[];
		version: string[];
		properties: Properties[];
		dependencies: Dependencies[];
	};
}
