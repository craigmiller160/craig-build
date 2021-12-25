interface MavenMetadataSnapshotVersion {
	readonly extension: string[];
	readonly value: string[];
	readonly updated: string[];
}

interface MavenMetadataSnapshotVersions {
	snapshotVersion: MavenMetadataSnapshotVersion[];
}

export interface MavenMetadataNexus {
	readonly metadata: {
		readonly groupId: string[];
		readonly artifactId: string[];
		readonly version: string[];
		readonly snapshotVersions: MavenMetadataSnapshotVersions[];
	};
}
