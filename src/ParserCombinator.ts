
import { Stream } from "./ParserStream"
import { Result, Success, Failure } from "./ParserResult"
import { Unit, unit } from "./Unit"

/**
 * 基本的なパーサクラス
 */
export class Parser<A, B> {
    private _parse: (s: Stream<A>) => Result<A, B>;

    constructor( p: (s: Stream<A>) => Result<A, B> ) {
        this._parse = p;
    }

    /**
     * Streamを消費して結果を返す。
     */
    parse( s: Stream<A> ): Result<A, B> {
        return this._parse( s );
    }

    /**
     * パーサを合成する。
     */
    flatMap<C>( func: (b: B) => Parser<A, C> ): Parser<A, C> {
        const self = this;
        return new Parser<A, C>( s => {
            return self.parse( s ).flatMap( (r, b) => {
                return func( b ).parse( r )
            })
        });
    }

    /**
     * パース結果を変換するパーサを生成する。
     */
    map<C>( func: (b: B) => C ): Parser<A, C> {
        const self = this;
        return new Parser<A, C>( s => {
            return self.parse( s ).flatMap( (r, b) => new Success( r, func( b ) ) )
        })
    }

    bind<C>( p: () => Parser<A, C> ): Parser<A, C> {
        const self = this;
        return self.flatMap( _ => p() )
    }
    
    /**
     * パースが失敗した時のメッセージを変更する。
     */
    onFailure( func: (e: string) => string ): Parser<A, B> {
        const self = this;
        return new Parser<A, B>( s => {
            return self.parse( s ).orElse( (s, e) => {
                return new Failure<A, B>(s, func(e))
            })
        })
    }

    /**
     * 本パーサが失敗したときに実行するパーサを指定する。
     */
    or<C>( p: () => Parser<A, C> ): Parser<A, B | C> {
        const self = this
        return new Parser<A, B | C>(
            s => self.parse( s ).flatMap(
                (s, d) => new Success<A, B | C>(s, d) )
                .orElse(
                    (s, e) => p().parse( s ) ) )
    }

    /**
     * 本パーサの０個以上の繰り返し。
     */    
    many(): Parser<A, Array<B>> {
        const self = this
        return new Parser<A, Array<B>>(
            s => self.many1().parse( s ).orElse(
                (t, e) => new Success(s, []) ) )
    }

    many1(): Parser<A, Array<B>> {
        const self = this
        return new Parser<A, Array<B>>(
            s => self.parse( s ).flatMap(
                (t, d) => self.many().parse( t ).flatMap(
                    (u, ds) => new Success(u, [d].concat(ds)))))
    }

    manyStr(): Parser<A, string> {
        const self = this
        return new Parser<A, string>(
            s => self.manyStr1().parse( s ).orElse(
                (t, e) => new Success(s, '') ) )
    }

    manyStr1(): Parser<A, string> {
        const self = this
        return new Parser<A, string>(
            s => self.parse( s ).flatMap(
                (t, d) => self.manyStr().parse( t ).flatMap(
                    (u, ds) => new Success(u, d + ds) ) ) )
    }

    /**
     * 失敗してもStreamを消費しない。
     */
    rollback(): Parser<A, B> {
        const self = this
        return new Parser<A, B>( 
            s => self.parse( s ).orElse(
                (t, e) => new Failure<A, B>(s, e) ) )
    }

    startBy<C>( p: () => Parser<A, C> ): Parser<A, Array<B>> {
        const self = this
        return p().flatMap( b => self ).many()
    }
    
    sepBy1<C>( p: () => Parser<A, C> ): Parser<A, Array<B>> {
        const self = this
        return this.flatMap(
            b => self.startBy( p ).map(
                bs => [b].concat(bs) ) )
    }

    /**
     * ０個以上のパーサpで区切られたパーサを生成する。
     */
    sepBy<C>( p: () => Parser<A, C> ): Parser<A, Array<B>> {
        return this.sepBy1( p ).or(
            () => new Parser<A, Array<B>>(
                s => new Success<A, Array<B>>(s, []) ) )
    }
    
}

type Char = string

export type CharParser<B> = Parser<Char, B>

/**
 * 必ず成功するパーサを生成する。
 */
export function success<A, B>( b: () => B ): Parser<A, B> {
    return new Parser<A, B>( s => new Success<A, B>( s, b() ) )
}

/**
 * 必ず失敗するパーサを生成する。
 */
export function fails<A, B>( msg: string ): Parser<A, B> {
    return new Parser<A, B>( s => new Failure<A, B>( s, msg ) )
}

/**
 * ストリームが終了かどうか判定する。
 */
export function eof<A>(): Parser<A, Unit> {
    return new Parser<A, Unit>(
        s => s.head().map<Result<A, Unit>>(
            _ => new Failure<A, Unit>(s, "not end of file" ) )
            .getOrElse( () => new Success<A, Unit>(s, unit) ) )
}

function char_( func: (c: Char) => boolean, msg: string ): CharParser<Char> {
    return new Parser<Char, Char>(
        s => s.head().map(
            c => func(c) ?
                new Success<Char, Char>( s.tail(), c ) :
                new Failure<Char, Char>( s.tail(), `expected ${msg} but ${c} was found` ) )
            .getOrElse(
                () => new Failure<Char, Char>( s, `end of stream: ${msg}`) ) )
}

/**
 * １文字パースする。
 */
export function char( c: Char ): CharParser<Char> {
    return char_( x => x == c, c )
}

function str_( d: string, i: number ): CharParser<string> {
    if( i == d.length ) return success<Char, string>(() => '')
    else return char(d[i]).flatMap<string>(
        c => str_( d, i + 1 ).map<string>(
            cs => c + cs ))
}

/**
 * 文字列をパースする。
 */
export function str( d: string ): CharParser<string> {
    return str_( d, 0 ).onFailure( e => d + ': ' + e)
}

export function space(): CharParser<Char> {
    return char_( c => c == ' ' || c == '\t', 'space' )
}

export function spaces(): CharParser<string> {
    return space().manyStr()
}

export function anyChar(): CharParser<Char> {
    return char_( _ => true, "any char")
}

export function oneOf( xs: string ): CharParser<Char> {
    return char_( c => xs.indexOf(c) != -1, `one of ${xs}` )
}

export function noneOf( xs: string ): CharParser<Char> {
    return char_( c => xs.indexOf(c) == -1, `noen of ${xs}` )
}

export function alphabet(): CharParser<Char> {
    return char_( c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'), 'alphabet' )
}

export function digit(): CharParser<Char> {
    return char_( c => c >= '0' && c <= '9', 'digit' )
}

export function alphanum(): CharParser<Char> {
    return alphabet().or( digit )
}
