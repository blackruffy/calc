/**
 * パース結果を表現するモジュール
 */

import { Stream } from "./ParserStream"
import { Either, Right, Left } from "./Either"

export interface Result<A, B> {
    flatMap<C>( func: (s: Stream<A>, b: B) => Result<A, C> ): Result<A, C>

    orElse( func: (s: Stream<A>, e: string) => Result<A, B> ): Result<A, B>;
    getDataOrElse( func: () => B ): B;
    getStream(): Stream<A>;
    getData(): Either<string, B>;
    isSuccess(): boolean;
}

/**
 * パースが成功した時に用いるクラス
 */
export class Success<A, B> implements Result<A, B> {
    private stream: Stream<A>;
    private data: B;
    
    constructor( s: Stream<A>, data: B ) {
        this.stream = s;
        this.data = data;
    }
    
    flatMap<C>( func: (s: Stream<A>, data: B) => Result<A, C> ): Result<A, C> {
        return func( this.stream, this.data )
    }

    orElse( func: (s: Stream<A>, e: string) => Result<A, B> ): Result<A, B> {
        return this;
    }

    getDataOrElse( func: () => B ): B {
        return this.data;
    }
    
    getStream(): Stream<A> {
        return this.stream
    }

    getData(): Either<string, B> {
        return new Right<string, B>(this.data)
    }
    
    isSuccess() {
        return true;
    }
}

/**
 * パースが失敗したときに用いるクラス
 */
export class Failure<A, B> implements Result<A, B> {
    private stream: Stream<A>;
    private msg: string;
    
    constructor( s: Stream<A>, msg: string ) {
        this.stream = s
        this.msg = msg;
    }

    flatMap<C>( func: (s: Stream<A>, data: B) => Result<A, C> ): Result<A, C> {
        return new Failure<A, C>(this.stream, this.msg);
    }

    orElse( func: (s: Stream<A>, e: string) => Result<A, B> ): Result<A, B> {
        return func(this.stream, this.msg);
    }
    
    getDataOrElse( func: () => B ): B {
        return func();
    }
    
    getStream(): Stream<A> {
        return this.stream
    }

    getData(): Either<string, B> {
        return new Left<string, B>(this.msg);
    }
    
    isSuccess() {
        return false;
    }
}
