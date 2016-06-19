
/**
 * Eitherモナド。
 */
export interface Either<A, B> {

    flatMap<C>( func: (b: B) => Either<A, C> ): Either<A, C>;
    map<C>( func: (b: B) => C ): Either<A, C>;
    
    getLeftOrElse( func: () => A ): A;
    getRightOrElse( func: () => B ): B;

    isLeft(): boolean;
    isRight(): boolean;
    toString(): string;
}

export class Left<A, B> implements Either<A, B> {
    private data: A
    
    constructor( a: A ) {
        this.data = a
    }
    
    flatMap<C>( func: (b: B) => Either<A, C> ): Either<A, C> {
        return new Left<A, C>(this.data)
    }
    
    map<C>( func: (b: B) => C ): Either<A, C> {
        return new Left<A, C>(this.data)
    }

    getLeftOrElse( func: () => A ): A {
        return this.data;
    }
    
    getRightOrElse( func: () => B ): B {
        return func()
    }
    
    isLeft(): boolean {
        return true;
    }
    
    isRight(): boolean {
        return false;
    }
    
    toString(): string {
        return `Left(${this.data})`
    }
}

export class Right<A, B> implements Either<A, B> {
    private data: B
    
    constructor( b: B ) {
        this.data = b
    }
    
    flatMap<C>( func: (b: B) => Either<A, C> ): Either<A, C> {
        return func(this.data)
    }
    
    map<C>( func: (b: B) => C ): Either<A, C> {
        return new Right<A, C>(func(this.data))
    }

    getLeftOrElse( func: () => A ): A {
        return func();
    }
    
    getRightOrElse( func: () => B ): B {
        return this.data
    }
    
    isLeft(): boolean {
        return false;
    }
    
    isRight(): boolean {
        return true;
    }
    
    toString(): string {
        return `Right(${this.data})`
    }
}
