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

export default interface KubeDeployment {
  apiVersion: string;
  kind: string;
  spec: KubeRootSpec;
}
