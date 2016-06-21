/**
 * 構文を処理するモジュール。
 * 
 */

import { Maybe, Just, Nothing } from "./Maybe"
import { Either, Left, Right } from "./Either"
import { ExprPM,
         MDExprPM,
         PlusExprPM,
         MinusExprPM,
         ExprMD,
         TermExprMD,
         MultExprMD,
         DivExprMD,
         ModExprMD,
         Num,
         Var,
         Def,
         Defvar,
         Defun,
         FunCall,
         Fact,
         FuncFact,
         VarFact,
         NumFact,
         ExprFact,
         NegFact,
         Term,
         FactTerm,
         PowTerm } from "./CalcStructure"
import { parse } from "./CalcParser"
import { Stack, stack, cons, nil } from "./Stack"
import { CalcFrame, emptyFrame } from "./CalcFrame"
import { SMap, emptySMap } from "./SMap"
import { Unit, unit } from "./Unit"
import { NativeFunc } from "./NativeFunc"
import { CallStack, FrameType, StackType } from "./CallStack"

/**
 * 式を評価した結果を表現する。
 */
type Result = Either<string, number>

/**
 * ソースをパースし評価する。
 * @param d 計算式の文字列
 * @return 計算結果
 */
export function evaluate( d: string ): Either<string, string | number> {
    return parse(d)
        .getData()
        .mapLeft( e => `${e.getMessage()}(${e.getPosition().getCount()+1}文字目)`)
        .flatMap( s => {
            if( s instanceof Def ) return <Either<string, string|number>>evalDef(<Def>s)
            else if( s instanceof ExprPM ) return <Either<string, string|number>>evalExprPM(<ExprPM>s)
            else return <Either<string, string|number>>error('parsed result should be Def or ExprPM')
        })
}

/**
 * スタックをクリアする。
 */
export function clearStack(): void {
    CallStack.clearStack()
}

/**
 * エラーを生成する。
 */
export function error( msg: string ): Result {
    return new Left<string, number>(msg)
}

/**
 * 変数や関数の定義を評価する。
 */
export function evalDef( def: Def ): Either<string, string> {
    if( def instanceof Defvar ) {
        const p = <Defvar>def
        return evalExprPM(p.expr).map( x => {
            CallStack.getStack().head().getOrNull().getVars().set( p.name.getData(), x )
            return `変数'${p.name.getData()}'を定義しました。`
        })
    }
    else if( def instanceof Defun ) {
        const p = <Defun>def
        CallStack.getStack().head().getOrNull().getVars().set( p.name.getData(), p )
        return new Right<string, string>(`関数'${p.name.getData()}'を定義しました。`)
    }
    else return new Left<string,
    string>('unknown type')
}

/**
 * ExprPMを評価する。
 */
export function evalExprPM( expr: ExprPM ): Result {
    if( expr instanceof MDExprPM ) {
        return evalExprMD( (<MDExprPM>expr).expr )
    }
    else if( expr instanceof PlusExprPM ) {
        const p = <PlusExprPM>expr
        return evalExprPM( p.expr1 ).flatMap(
            x => evalExprMD( p.expr2 ).flatMap( y => {
                try {
                    return new Right<string, number>(x + y)
                } catch( ex ) {
                    return new Left<string, number>(ex)
                }
            }))
    }
    else if( expr instanceof MinusExprPM ) {
        const p = <MinusExprPM>expr
        return evalExprPM( p.expr1 ).flatMap(
            x => evalExprMD( p.expr2 ).flatMap( y => {
                try {
                    return new Right<string, number>(x - y)
                } catch( ex ) {
                    return new Left<string, number>(ex)
                }
            }))
    }
    else return error('unkown type')
}

/**
 * ExprMDを評価する。
 */
export function evalExprMD( expr: ExprMD ): Result {
    if( expr instanceof TermExprMD ) {
        return evalTerm( (<TermExprMD>expr).term )
    }
    else if( expr instanceof MultExprMD ) {
        const p = <MultExprMD>expr
        return evalExprMD( p.expr ).flatMap(
            x => evalTerm( p.term ).flatMap( y => {
                try {
                    return new Right<string, number>(x * y)
                } catch( ex ) {
                    return new Left<string, number>(ex)
                }
            }))
    }
    else if( expr instanceof DivExprMD ) {
        const p = <DivExprMD>expr
        return evalExprMD( p.expr ).flatMap(
            x => evalTerm( p.term ).flatMap( y => {
                try {
                    return new Right<string, number>(x / y)
                } catch( ex ) {
                    return new Left<string, number>(ex)
                }
            }))
    }
    else if( expr instanceof ModExprMD ) {
        const p = <ModExprMD>expr
        return evalExprMD( p.expr ).flatMap(
            x => evalTerm( p.term ).flatMap( y => {
                try {
                    return new Right<string, number>(x % y)
                } catch( ex ) {
                    return new Left<string, number>
                        (ex)
                }
            }))
    }
    else return error('unkown type')
}

/**
 * Termを評価する。
 */
export function evalTerm( term: Term ): Result {
    if( term instanceof FactTerm ) {
        return evalFact( (<FactTerm>term).fact )
    }
    else if( term instanceof PowTerm ) {
        const p = <PowTerm>term
        return evalTerm( p.base ).flatMap(
            x => evalFact( p.pow ).map(
                y => Math.pow(x, y) ))
    }
    else return error('unkown type')
}

/**
 * Factを評価する。
 */
export function evalFact( fact: Fact ): Result {
    if( fact instanceof FuncFact ) {
        return evalFunCall( (<FuncFact>fact).funcall )
    }
    else if( fact instanceof VarFact ) {
        return evalVar( (<VarFact>fact).varname )
    }
    else if( fact instanceof NumFact ) {
        return evalNum( (<NumFact>fact).num )
    }
    else if( fact instanceof ExprFact ) {
        return evalExprPM( (<ExprFact>fact).expr )
    }
    else if( fact instanceof NegFact ) {
        return evalFact( (<NegFact>fact).fact ).map( x => -x )
    }
    else return error('unkown type')
}

/**
 * FunCallを評価する。
 */
export function evalFunCall( funcall: FunCall ): Result {
    const n = funcall.name.getData() // 関数名
    // 再帰的に呼びだされているかチェックする。
    if( CallStack.findCallee( n ).isNothing() ) {
        return CallStack.findVar( n ).map( f => {
            // ユーザ定義関数の場合
            if( f instanceof Defun ) {
                const defun = <Defun>f
                if( defun.args.length == funcall.args.length ) {
                    // フレームを生成する
                    const frame = emptyFrame<FrameType>()
                    // 呼び出し元を設定する
                    frame.setCallee( n )
                    // 引数の変数と値をマッピングする
                    return funcall.args.reduce<Either<string, any>>( (r, a) => r.flatMap( o => {
                        const k = defun.args[o.idx].getData()
                        o.idx++
                        if( o.frame.getVars().get( k ).isNothing() ) {
                            return evalExprPM(a).map( v => {
                                o.frame.getVars().set( k, v )
                                return o
                            })
                        }
                        else return error(k + ' は既に定義されています。')
                    } ), new Right<string, any>(
                        { idx: 0, frame: frame }
                    ) ).flatMap( o => {
                        CallStack.push( o.frame )
                        const r = evalExprPM(defun.expr)
                        CallStack.pop()
                        return r
                    } )
                }
                else return error(n + 'の引数の数が正しくありません。' + defun.args.length + '個です。')
            }
            // ネイティブ関数の場合
            else if( f instanceof NativeFunc ) {
                const nf = <NativeFunc>f
                if( nf.getNArgs() == funcall.args.length ) {
                    return funcall
                        .args
                        .reduce<Either<string, Array<number>>>(
                            (r, a) => r.flatMap(
                                xs => evalExprPM(a).map(
                                    x => {
                                        xs.push(x)
                                        return xs
                                    }
                                )
                            ),
                            new Right<string, Array<number>>([]))
                        .map( xs => nf.eval(xs) )
                }
                else return error(n + 'の引数の数が正しくありません。' + nf.getNArgs() + '個です。')
            }
            else return error(n + ' は関数ではありません。')
        }).getOrElse(() => error(n + ' は定義されていません。'))
    }
    else return error("関数'" + n + "'は再帰的に呼び出すことはできません。")
}

/**
 * Varを評価する。
 */
export function evalVar( name: Var ): Result {
    const n = name.getData()
    return CallStack.findVar( n ).map( r => {
        if( r instanceof Num ) {
            return new Right<string, number>(parseFloat(r.getData()))
        }
        else if( r instanceof Number ) {
            return new Right<string, number>( r.valueOf() )
        }
        else if( (typeof r) == 'number' ) {
            return new Right<string, number>( new Number(r).valueOf() )
        }
        else return error(n + ' は数値ではありません。')
    }).getOrElse( () => error(n + ' は定義されていません。') )
}

/**
 * Numを評価する。
 */
export function evalNum( num: Num ): Result {
    return new Right<string, number>(parseFloat(num.getData()))
}
