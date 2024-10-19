export type CrossingStorage = {
	pseudoAddress(object: object): string;
	setItem(id: string, object: any): void;
	getItem(id: string): any | undefined;
	removeItem(id: string): void;
	clear(): void;
};

type ElementCrossing = {
	addrWeakMap: WeakMap<any, string>;
	storageMap?: Map<string, any>;
	frameDocument?: Document;
	fun: CrossingStorage;
	iframe?: HTMLIFrameElement;
};

declare global {
	interface Window {
		__vtbag: {
			elementCrossing?: ElementCrossing | undefined;
		};
		crossingStorage: ElementCrossing['fun'];
	}
}

export type Spec = {
	kind: string;
	key: string;
	value?: string;
};
export type ElementSpec = {
	id: string;
	timestamp: number;
	specs: Spec[];
};

type ShortExpressionKindMap = {
	'#': 'id';
	'.': 'class';
	'@': 'prop';
	'-': 'style';
	'~': 'anim';
};
type ExpressionKindMap = {
	id: '#';
	class: '.';
	prop: '@';
	style: '-';
	anim: '~';
};
type ShortExpressionKind = keyof ShortExpressionKindMap;
type ExpressionKind = keyof ExpressionKindMap;
type UniqueExpressionKind = Extract<ExpressionKind, 'id'>;
type UniqueShortExpressionKind = ExpressionKindMap[UniqueExpressionKind];

type ExtractExpressionKind<E extends string> = E extends `${infer U}:${string}`
	? U extends ExpressionKind
		? U
		: never
	: E extends `${infer V}${string}`
		? V extends ShortExpressionKind
			? ShortExpressionKindMap[V]
			: never
		: never;

type Validate<
	S extends string,
	E extends ExpressionKind = ExpressionKind,
> = S extends `${E}:${string}`
	? S extends `${E}:${string} ${infer Rest}`
		? S extends `${infer F} ${Rest}`
			? ExtractExpressionKind<F> extends UniqueExpressionKind
				? `${F} ${Validate<Rest, Exclude<E, ExtractExpressionKind<F>>>}`
				: `${F} ${Validate<Rest, E>}`
			: never
		: S
	: S extends `${ExpressionKindMap[E]}${string}`
		? S extends `${ExpressionKindMap[E]}${string} ${infer Rest}`
			? S extends `${infer F} ${Rest}`
				? ExtractExpressionKind<F> extends UniqueShortExpressionKind
					? `${F} ${Validate<Rest, Exclude<E, ExtractExpressionKind<F>>>}`
					: `${F} ${Validate<Rest, E>}`
				: never
			: S
		: never;

const validate = <T extends string>(t: T extends Validate<T> ? T : Validate<T>) => t;

const validated = validate(
	'id:test class:prop .prop style:pop -pop prop:test prop:test anim:asdf ~asdf'
);
