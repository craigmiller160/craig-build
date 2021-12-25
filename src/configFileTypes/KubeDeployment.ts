interface KubeContainer {
	readonly name: string;
	readonly image: string;
}

interface KubeTemplateSpec {
	readonly containers: KubeContainer[];
}

interface KubeTemplate {
	readonly spec: KubeTemplateSpec;
}

interface KubeRootSpec {
	readonly replicas: number;
	readonly template: KubeTemplate;
}

interface KubeRootMetadata {
	readonly name: string;
}

export interface KubeDeployment {
	readonly apiVersion: string;
	readonly kind: string;
	readonly spec: KubeRootSpec;
	readonly metadata: KubeRootMetadata;
}
