
import { Stream } from "./ParserStream"
import { Result, Success, Failure } from "./ParserResult"

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

    map<C>( func: (b: B) => C ): Parser<A, C> {
        const self = this;
        return new Parser<A, C>( s => {
            return self.parse( s ).flatMap( (r, b) => new Success( s, func( b ) ) )
        })
    }

    /**
     * 本パーサが失敗したときに実行するパーサを指定する。
     */
    or<C>( p: Parser<A, C> ): Parser<A, B | C> {
        const self = this
        return new Parser<A, B | C>( s => {
            const res = self.parse( s )
            if( res.isSuccess() ) return res 
            else return p.parse( res.getStream() )
        });
    }

    /**
     * 本パーサの０個以上の繰り返し。
     */
    many(): Parser<A, Array<B>> {
        const self = this
        const p: ( s: Stream<A> ) => Result<A, Array<B>> = s => {
            const res0 = self.parse( s )
            if( res0.isSuccess() ) {
                const res1 = p( res0.getStream() )
                if( res1.isSuccess() ) {
                    const x = (<Success<A, B>>res0).getData()
                    const xs = (<Success<A, Array<B>>>res1).getData()
                    return new Success( res1.getStream(), [x].concat(xs))
                }
                else {
                    const x = (<Success<A, B>>res0).getData()
                    return new Success( res1.getStream(), [x])
                }
            }
            else {
                return new Success( res0.getStream(), [] )
            }
        }
        return new Parser<A, Array<B>>( p )
    }

    /**
     * 失敗してもStreamを消費しない。
     */
    rollback(): Parser<A, B> {
        const self = this
        return new Parser<A, B>( s => {
            const res = self.parse( s )
            if( !res.isSuccess() ) {
                const msg = (<Failure<A, B>>res).getMessage()
                return new Failure<A, B>( s, msg )
            }
            else return res
        })
    }

    startBy<C>( p: Parser<A, C> ): Parser<A, Array<B>> {
        const self = this
        return p.flatMap( b => self ).many()
    }
    
    sepBy1<C>( p: Parser<A, C> ): Parser<A, Array<B>> {
        const self = this
        return self.flatMap( b => self.startBy( p ).map( bs => [b].concat(bs) ) )
    }

    /**
     * ０個以上のパーサpで区切られたパーサを生成する。
     */
    sepBy<C>( p: Parser<A, C> ): Parser<A, Array<B>> {
        const self = this
        return self.sepBy1( p ).or( new Parser<A, Array<B>>( s => new Success<A, Array<B>>(s, []) ) )
    }
    
}

type Char = string

export type CharParser<B> = Parser<Char, B>

export function success<A, B>( b: B ): Parser<A, B> {
    return new Parser<A, B>( s => new Success<A, B>( s, b ) )
}

export function fails<A, B>( msg: string ): Parser<A, B> {
    return new Parser<A, B>( s => new Failure<A, B>( s, msg ) )
}

export function eof<A, B>(): Parser<A, B> {
    return new Parser<A, B>( s => {
        if( s.head().isNothing() ) {
            return new Success<A, B>(s, null)
        }
        else {
            return new Failure<A, B>(s, "not end of file")
        }
    })
}

function char_( func: (c: Char) => boolean, msg: string ): CharParser<Char> {
    return new Parser<Char, Char>( s => {
        const h = s.head()
        if( !h.isNothing() ) {
            if( func( h.getOrNull() ) ) {
                return new Success( s.tail(), h.getOrNull() )
            }
            else {
                return new Failure( s.tail(), `expected ${msg} but ${h.getOrNull()} was found` )
            }
        }
        else {
            return new Failure( s, `end of stream: ${msg}`)
        }
    })
}

export function char( c: Char ): CharParser<Char> {
    return char_( x => x == c, c )
}

export function str_( d: string, i: number ): CharParser<string> {
    return new Parser<Char, string>( s => {
        if( i < d.length ) {
            const h = s.head()
            if( !h.isNothing() ) {
                if( h.getOrNull() == d[i] ) {
                    const res = str_( d, i + 1 ).parse( s.tail() )
                    if( res.isSuccess() ) {
                        const xs = (<Success<Char, string>>res).getData()
                        return new Success(res.getStream(), h.getOrNull() + xs)
                    }
                    else return new Success( s.tail(), d[i] )
                }
                else return new Failure( s.tail(), "does not match" )
            }
            else return new Failure( s, "end of stream" )
        }
        else return new Success( s, "" )
    })
}

export function str( d: string ): CharParser<string> {
    return str_( d, 0 )
}

export function space(): CharParser<Char> {
    return char_( c => c == ' ' || c == '\t', 'space' )
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
    return alphabet().or( digit() )
}
