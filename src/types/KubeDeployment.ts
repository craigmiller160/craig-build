interface KubeContainer {
	name: string;
	image: string;
}

interface KubeTemplateSpec {
	containers: KubeContainer[];
}

interface KubeTemplate {
	spec: KubeTemplateSpec;
}

interface KubeRootSpec {
	replicas: number;
	template: KubeTemplate;
}

interface KubeRootMetadata {
	name: string;
}

export default interface KubeDeployment {
	apiVersion: string;
	kind: string;
	spec: KubeRootSpec;
	metadata: KubeRootMetadata;
}
