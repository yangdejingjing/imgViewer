declare class Viewer {
	constructor(url: string, options: ViewerOptions);
	close(): void;
}

declare interface ViewerOptions {
	step?: number;
	max?: number;
}