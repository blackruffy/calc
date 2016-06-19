
import { Stream } from "./ParserStream"
import { Result, Success, Failure } from "./ParserResult"
import { Unit, unit } from "./Unit"

/**
 * 基本的なパーサクラス。
 * A: Streamの型
 * B: パース結果の型
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
     * パーサを合成してパーサを生成する。
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

    /**
     * パーサを合成して新たなパーサを生成する。
     */
    bind<C>( p: () => Parser<A, C> ): Parser<A, C> {
        const self = this;
        return self.flatMap( _ => p() )
    }
    
    /**
     * パースが失敗した時のメッセージを変更する。
     */
    onFailure( func: (s: Stream<A>, e: string) => string ): Parser<A, B> {
        const self = this;
        return new Parser<A, B>( s => {
            return self.parse( s ).orElse( (s, e) => {
                return new Failure<A, B>(s, func(s, e))
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
     * 本パーサを０個以上の繰り返すパーサを生成する。
     */    
    many(): Parser<A, Array<B>> {
        const self = this
        return new Parser<A, Array<B>>(
            s => self.many1().parse( s ).orElse(
                (t, e) => new Success(s, []) ) )
    }

    /**
     * 本パーサを１個以上の繰り返すパーサを生成する。
     */    
    many1(): Parser<A, Array<B>> {
        const self = this
        return new Parser<A, Array<B>>(
            s => self.parse( s ).flatMap(
                (t, d) => self.many().parse( t ).flatMap(
                    (u, ds) => new Success(u, [d].concat(ds)))))
    }

    /**
     * 本パーサを０個以上の繰り返し、文字列として結合するパーサを生成する。
     */    
    manyStr(): Parser<A, string> {
        const self = this
        return new Parser<A, string>(
            s => self.manyStr1().parse( s ).orElse(
                (t, e) => new Success(s, '') ) )
    }

    /**
     * 本パーサを１個以上の繰り返し、文字列として結合するパーサを生成する。
     */    
    manyStr1(): Parser<A, string> {
        const self = this
        return new Parser<A, string>(
            s => self.parse( s ).flatMap(
                (t, d) => self.manyStr().parse( t ).flatMap(
                    (u, ds) => new Success(u, d + ds) ) ) )
    }

    /**
     * 失敗してもStreamを消費しないパーサを生成する。
     */
    rollback(): Parser<A, B> {
        const self = this
        return new Parser<A, B>( 
            s => self.parse( s ).orElse(
                (t, e) => new Failure<A, B>(s, e) ) )
    }

    /**
     * パーサpで区切られた本パーサの繰り返しのパーサを生成する。
     */
    startBy<C>( p: () => Parser<A, C> ): Parser<A, Array<B>> {
        const self = this
        return p().flatMap( b => self ).many()
    }
    
    /**
     * パーサpで区切られた本パーサの繰り返しのパーサを生成する。
     */
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
        return this.sepBy1( p ).rollback().or(
            () => new Parser<A, Array<B>>(
                s => new Success<A, Array<B>>(s, []) ) )
    }
    
}

type Char = string

/**
 * 文字のStreamを入力とするパーサ。
 */
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
            _ => new Failure<A, Unit>(s, "ストリームの最後に達していません。" ) )
            .getOrElse( () => new Success<A, Unit>(s, unit) ) )
}

function char_( func: (c: Char) => boolean, msg: string ): CharParser<Char> {
    return new Parser<Char, Char>(
        s => s.head().map(
            c => {
                if( func(c) ) return new Success<Char, Char>( s.tail(), c )
                else return new Failure<Char, Char>( s.tail(), `${c}ではなく${msg}ではありませんか？` )
            })
            .getOrElse(
                () => new Failure<Char, Char>( s, `ストリームの最後に達しました: ${msg}`) ) )
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
    return str_( d, 0 ).onFailure( (s, e) => d + ': ' + e)
}

/**
 * 空白をパースする。
 */
export function space(): CharParser<Char> {
    return char_( c => c == ' ' || c == '\t', '空白' )
}

/**
 * 空白の連続をパースする。
 */
export function spaces(): CharParser<string> {
    return space().manyStr()
}

/**
 * どんな文字でも１つパースする。
 */
export function anyChar(): CharParser<Char> {
    return char_( _ => true, "１つの文字")
}

/**
 * 与えられた文字列の中の１つの文字にマッチする文字をパースする。
 */
export function oneOf( xs: string ): CharParser<Char> {
    return char_( c => xs.indexOf(c) != -1, `${xs}の中の１文字` )
}

/**
 * 与えられた文字列の中のどの文字にもマッチしない文字をパースする。
 */
export function noneOf( xs: string ): CharParser<Char> {
    return char_( c => xs.indexOf(c) == -1, `「${xs}」以外の文字` )
}

/**
 * アルファベット(a-z, A-Z)を１文字パースする。
 */
export function alphabet(): CharParser<Char> {
    return char_( c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'), 'アルファベット' )
}

/**
 * 数字(0-9)を１文字パースする。
 */
export function digit(): CharParser<Char> {
    return char_( c => c >= '0' && c <= '9', '数字' )
}

/**
 * アルファベットと数値を１文字パースする。
 */
export function alphanum(): CharParser<Char> {
    return alphabet().or( digit )
}
