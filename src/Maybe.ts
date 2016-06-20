
/**
 * Maybeモナド。
 * @param <A> 保持する型
 */
export interface Maybe<A> {
    flatMap<B>( func: (a: A) => Maybe<B> ): Maybe<B>;
    map<B>( func: (a: A) => B ): Maybe<B>;
    forEach( func: (a: A) => void ): void;
    orElse( func: () => Maybe<A> ): Maybe<A>;
    getOrElse( func: () => A ): A;
    getOrNull(): A;
    toArray(): Array<A>;
    isNothing(): boolean;
    toString(): string;
}

export class Just<A> implements Maybe<A> {
    private data: A
    
    constructor( a: A ) {
        this.data = a 
    }
    
    flatMap(func: (a: A) => Maybe<A>): Maybe<A> {
        return func(this.data)
    }
    
    map<B>( func: (a: A) => B ): Maybe<B> {
        return new Just(func(this.data))
    }
    
    forEach( func: (a: A) => void ): void {
        func(this.data)
    }
    
    orElse( func: () => Maybe<A> ): Maybe<A> {
        return this;
    }
    
    getOrElse( func: () => A ): A {
        return this.data;
    }
    
    getOrNull(): A {
        return this.data;
    }
    
    toArray(): Array<A> {
        return [this.data];
    }
    
    isNothing(): boolean {
        return false;
    }

    toString(): string {
        return `Just(${this.data})`
    }

}


export class Nothing<A> implements Maybe<A> {
    constructor() {}
    
    flatMap<B>( func: (a: A) => Maybe<B> ): Maybe<B> {
        return new Nothing<B>();
    }

    map<B>( func: (a: A) => B ): Maybe<B> {
        return new Nothing<B>();
    }
    
    forEach( func: (a: A) => void ): void {}
    
    orElse( func: () => Maybe<A> ): Maybe<A> {
        return func();
    }
    
    getOrElse( func: () => A ): A {
        return func();
    }
    
    getOrNull(): A {
        return null;
    }
    
    toArray(): Array<A> {
        return []
    }
    
    isNothing(): boolean {
        return true;
    }
    
    toString(): string {
        return 'Nothing()'
    }
    
}
