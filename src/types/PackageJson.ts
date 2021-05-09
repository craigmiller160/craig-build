export interface Dependencies {
  [key: string]: string;
}

export default interface PackageJson {
  name: string;
  version: string;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
}
