export interface Dependencies {
	[key: string]: string;
}

export interface PackageJson {
	name: string;
	version: string;
	dependencies?: Dependencies;
	devDependencies?: Dependencies;
}
