interface Dependency {
    groupId: string[];
    artifactId: string[];
    version: string[];
}

interface Dependencies {
    dependency: Dependency[];
}

export default interface PomXml {
    project: {
        groupId: string[];
        artifactId: string[];
        version: string[];
        dependencies: Dependencies[];
    };
}
