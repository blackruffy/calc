
/**
 * Eitherモナド。
 * @param <A> Leftの型
 * @param <B> Rightの型
 */
export abstract class Either<A, B> {

    abstract flatMap<C>( func: (b: B) => Either<A, C> ): Either<A, C>;
    abstract map<C>( func: (b: B) => C ): Either<A, C>;
    abstract mapLeft<C>( func: (a: A) => C): Either<C, B>;
    
    abstract getLeftOrElse( func: (b: B) => A ): A;
    abstract getRightOrElse( func: (a: A) => B ): B;

    abstract isLeft(): boolean;
    abstract isRight(): boolean;
    abstract toString(): string;
}

export class Left<A, B> extends Either<A, B> {
    private data: A
    
    constructor( a: A ) {
        super()
        this.data = a
    }
    
    flatMap<C>( func: (b: B) => Either<A, C> ): Either<A, C> {
        return new Left<A, C>(this.data)
    }
    
    map<C>( func: (b: B) => C ): Either<A, C> {
        return new Left<A, C>(this.data)
    }
    
    mapLeft<C>( func: (a: A) => C): Either<C, B> {
        return new Left<C, B>(func(this.data))
    }

    getLeftOrElse( func: (b: B) => A ): A {
        return this.data;
    }
    
    getRightOrElse( func: (a: A) => B ): B {
        return func(this.data)
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

export class Right<A, B> extends Either<A, B> {
    private data: B
    
    constructor( b: B ) {
        super()
        this.data = b
    }
    
    flatMap<C>( func: (b: B) => Either<A, C> ): Either<A, C> {
        return func(this.data)
    }
    
    map<C>( func: (b: B) => C ): Either<A, C> {
        return new Right<A, C>(func(this.data))
    }

    mapLeft<C>( func: (a: A) => C): Either<C, B> {
        return new Right<C, B>(this.data)
    }

    getLeftOrElse( func: (b: B) => A ): A {
        return func(this.data);
    }
    
    getRightOrElse( func: (a: A) => B ): B {
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
