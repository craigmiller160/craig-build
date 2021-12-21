export interface NexusSearchResultAsset {
	downloadUrl: string;
	path: string;
	id: string;
}

export interface NexusSearchResultItem {
	id: string;
	repository: string;
	format: string;
	group: string;
	name: string;
	version: string;
	assets: NexusSearchResultAsset[];
}

export default interface NexusSearchResult {
	items: NexusSearchResultItem[];
}
