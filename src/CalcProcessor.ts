
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
         PowTerm
       } from "./CalcParser"

type Result = Either<string, number>

class NativeFunc {
    private func: (args: Array<number>) => number
    constructor( func: (args: Array<number>) => number ) {
        this.func = func
    }
    
    eval( args: Array<number> ): number {
        return this.func( args )
    }
}

const stack: Array<Object> = [
    {
        PI: new Number(Math.PI),
        E: new Number(Math.E),
        sin: new NativeFunc( args => Math.sin.apply(this, args) ),
        cos: new NativeFunc( args => Math.cos.apply(this, args) ),
        tan: new NativeFunc( args => Math.tan.apply(this, args) ),
        log: new NativeFunc( args => Math.log.apply(this, args) ),
        exp: new NativeFunc( args => Math.exp.apply(this, args) )
    }
]

export function findVar( name: string ): Maybe<any> {
    for( let i in stack ) {
        const v = (<any>stack[i])[name]
        if( v ) return new Just<any>(v)
    }
    return new Nothing<any>()
}

export function error( msg: string ): Result {
    return new Left<string, number>(msg)
}

export function evalExprPM( expr: ExprPM ): Result {
    if( expr instanceof MDExprPM ) {
        return evalExprMD( (<MDExprPM>expr).expr )
    }
    else if( expr instanceof PlusExprPM ) {
        const p = <PlusExprPM>expr
        return evalExprMD( p.expr1 ).flatMap(
            x => evalExprPM( p.expr2 ).map(
                y => x + y ))
    }
    else if( expr instanceof MinusExprPM ) {
        const p = <MinusExprPM>expr
        return evalExprMD( p.expr1 ).flatMap(
            x => evalExprPM( p.expr2 ).map(
                y => x - y ))
    }
    else return error('unkown type')
}

export function evalExprMD( expr: ExprMD ): Result {
    if( expr instanceof TermExprMD ) {
        return evalTerm( (<TermExprMD>expr).term )
    }
    else if( expr instanceof MultExprMD ) {
        const p = <MultExprMD>expr
        return evalTerm( p.term ).flatMap(
            x => evalExprMD( p.expr ).map(
                y => x * y ))
    }
    else if( expr instanceof DivExprMD ) {
        const p = <DivExprMD>expr
        return evalTerm( p.term ).flatMap(
            x => evalExprMD( p.expr ).map(
                y => x / y ))
    
    }
    else return error('unkown type')
}

export function evalTerm( term: Term ): Result {
    if( term instanceof FactTerm ) {
        return evalFact( (<FactTerm>term).fact )
    }
    else if( term instanceof PowTerm ) {
        const p = <PowTerm>term
        return evalFact( p.base ).flatMap(
            x => evalTerm( p.pow ).map(
                y => Math.pow(x, y) ))
    }
    else return error('unkown type')
}

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

export function evalFunCall( funcall: FunCall ): Result {
    const n = funcall.name.getData()
    return findVar( n ).map( f => {
        if( f instanceof Defun ) {
            const defun = <Defun>f
            return funcall.args.reduce<Either<string, any>>( (r, a) => r.flatMap( o => {
                    const k = defun.args[o.idx].getData()
                    o.idx++
                    if( o.frame[k] ) {
                        return error(k + ' is already defined')
                    }
                    else return evalExprPM(a).map( v => {
                        o.frame[k] = v
                        return o
                    })
            } ), new Right<string, any>(
                { idx: 0, frame: {} }
            ) ).flatMap( o => {
                stack.unshift( o.frame )
                const r = evalExprPM(defun.expr)
                stack.shift()
                return r
            } )
        }
        else if( f instanceof NativeFunc ) {
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
                .map( xs => (<NativeFunc>f).eval(xs) )
        }
        else return error(n + ' is not function')
    }).getOrElse(() => error(n + ' is not defined'))
}

export function evalVar( name: Var ): Result {
    const n = name.getData()
    return findVar( n ).map( r => {
        if( r instanceof Num ) {
            return new Right<string, number>(parseFloat(r.getData()))
        }
        else if( r instanceof Number ) {
            return new Right<string, number>( r )
        }
        else return error(n + ' is not number')
    }).getOrElse( () => error(n + ' is not defined') )
}

export function evalNum( num: Num ): Result {
    return new Right<string, number>(parseFloat(num.getData()))
}
    
