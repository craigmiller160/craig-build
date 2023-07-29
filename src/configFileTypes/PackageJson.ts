export interface Dependencies {
	readonly [key: string]: string;
}

export interface PackageJson {
	readonly name: string;
	readonly version: string;
	readonly dependencies?: Dependencies;
	readonly devDependencies?: Dependencies;
	readonly peerDependencies?: Dependencies;
	readonly publishDirectory?: string;
}
