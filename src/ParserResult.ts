/**
 * パース結果を表現するモジュール
 */

import { Stream } from "./ParserStream"
import { Either, Right, Left } from "./Either"
import { Position } from "./Position"

/**
 * パース失敗時のエラーを表現するクラス。
 */
export class Error {
    private msg: string
    private pos: Position
    
    constructor( msg: string, pos: Position ) {
        this.msg = msg
        this.pos = pos
    }

    getMessage(): string {
        return this.msg 
    }

    getPosition(): Position {
        return this.pos
    }
}

/**
 * パース結果を表現するクラス。
 * @param <A> Streamの型
 * @param <B> パース結果の型
 */
export abstract class Result<A, B> {

    /**
     * 結果を合成する。
     */
    abstract flatMap<C>( func: (s: Stream<A>, b: B) => Result<A, C> ): Result<A, C>;

    /**
     * 結果が失敗した場合に、代わりの結果を生成する。
     */
    abstract orElse( func: (s: Stream<A>, e: Error) => Result<A, B> ): Result<A, B>;

    /**
     * 結果のデータを取得する。
     * 失敗していた場合は、代わりのデータを与える。
     */
    abstract getDataOrElse( func: () => B ): B;

    /**
     * 消費されてないストリームを取得する。
     */
    abstract getStream(): Stream<A>;

    /**
     * 結果のデータを取得する。
     */
    abstract getData(): Either<Error, B>;

    /**
     * 結果が成功したか判定する。
     */
    abstract isSuccess(): boolean;
}

/**
 * パースが成功した時に用いるクラス
 */
export class Success<A, B> extends Result<A, B> {
    private stream: Stream<A>;
    private data: B;
    
    constructor( s: Stream<A>, data: B ) {
        super()
        this.stream = s;
        this.data = data;
    }
    
    flatMap<C>( func: (s: Stream<A>, data: B) => Result<A, C> ): Result<A, C> {
        return func( this.stream, this.data )
    }

    orElse( func: (s: Stream<A>, e: Error) => Result<A, B> ): Result<A, B> {
        return this;
    }

    getDataOrElse( func: () => B ): B {
        return this.data;
    }
    
    getStream(): Stream<A> {
        return this.stream
    }

    getData(): Either<Error, B> {
        return new Right<Error, B>(this.data)
    }
    
    isSuccess() {
        return true;
    }
}

/**
 * パースが失敗したときに用いるクラス
 */
export class Failure<A, B> extends Result<A, B> {
    private stream: Stream<A>;
    private error: Error;
    
    constructor( s: Stream<A>, error: Error ) {
        super()
        this.stream = s
        this.error = error
    }

    flatMap<C>( func: (s: Stream<A>, data: B) => Result<A, C> ): Result<A, C> {
        return new Failure<A, C>(this.stream, this.error);
    }

    orElse( func: (s: Stream<A>, e: Error) => Result<A, B> ): Result<A, B> {
        return func(this.stream, this.error);
    }
    
    getDataOrElse( func: (e: Error) => B ): B {
        return func(this.error);
    }
    
    getStream(): Stream<A> {
        return this.stream
    }

    getData(): Either<Error, B> {
        return new Left<Error, B>(this.error);
    }
    
    isSuccess() {
        return false;
    }
}
