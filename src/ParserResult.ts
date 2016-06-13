/**
 * パース結果を表現するモジュール
 */

import { Stream } from "./ParserStream"

export interface Result<A, B> {
    flatMap<C>( func: (s: Stream<A>, b: B) => Result<A, C> ): Result<A, C>

    getStream(): Stream<A>
    isSuccess(): boolean
}

/**
 * パースが成功した時に用いるクラス
 */
export class Success<A, B> {
    private stream: Stream<A>;
    private data: B;
    
    constructor( s: Stream<A>, data: B ) {
        this.stream = s;
        this.data = data;
    }
    
    flatMap<C>( func: (s: Stream<A>, data: B) => Result<A, C> ): Result<A, C> {
        return func( this.stream, this.data )
    }

    getStream(): Stream<A> {
        return this.stream
    }

    getData(): B {
        return this.data
    }
    
    isSuccess() {
        return true;
    }
}

/**
 * パースが失敗したときに用いるクラス
 */
export class Failure<A, B> {
    private stream: Stream<A>;
    private msg: string;
    
    constructor( s: Stream<A>, msg: string ) {
        this.stream = s
        this.msg = msg;
    }

    flatMap<C>( func: (s: Stream<A>, data: B) => Result<A, C> ): Result<A, C> {
        return new Failure(this.stream, this.msg);
    }

    getStream(): Stream<A> {
        return this.stream
    }

    getMessage(): string {
        return this.msg;
    }
    
    isSuccess() {
        return false;
    }
}
