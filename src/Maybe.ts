
/**
 * Maybeモナド。
 * @param <A> 保持する型
 */
export abstract class Maybe<A> {
    abstract flatMap<B>( func: (a: A) => Maybe<B> ): Maybe<B>;
    abstract map<B>( func: (a: A) => B ): Maybe<B>;
    abstract forEach( func: (a: A) => void ): void;
    abstract orElse( func: () => Maybe<A> ): Maybe<A>;
    abstract getOrElse( func: () => A ): A;
    abstract getOrNull(): A;
    abstract toArray(): Array<A>;
    abstract isNothing(): boolean;
    abstract toString(): string;
}

export class Just<A> extends Maybe<A> {
    private data: A
    
    constructor( a: A ) {
        super()
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


export class Nothing<A> extends Maybe<A> {
    constructor() {
        super()
    }
    
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
