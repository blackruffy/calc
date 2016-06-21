
/**************************************
 * 構文の構造を表現するクラス群
 ***************************************/

export abstract class Identifier {
    private data: string;
    constructor( x: string ) {
        this.data = x;
    }
    getData(): string {
        return this.data;
    }
}

/**
 * 数値を表現するクラス。
 */
export class Num extends Identifier {
    private __num__: Num
}

/**
 * 変数を表現するクラス。
 */
export class Var extends Identifier {
    private __var__: Var
}

/**
 * 定義を表現する基底クラス。
 */
export abstract class Def {
    private __def__: Def;
    constructor() {}
}

/**
 * 変数定義を表現するクラス。
 */
export class Defvar extends Def {
    name: Var;
    expr: ExprPM;

    constructor( name: Var, expr: ExprPM ) {
        super()
        this.name = name
        this.expr = expr
    }
}

/**
 * 関数定義を表現するクラス。
 */
export class Defun extends Def {
    name: Var;
    args: Array<Var>;
    expr: ExprPM;
    
    constructor( name: Var, args: Array<Var>, expr: ExprPM ) {
        super()
        this.name = name
        this.args = args
        this.expr = expr
    }
}

/**
 * 関数呼び出しを表現するクラス。
 */
export class FunCall {
    name: Var;
    args: Array<ExprPM>;
    constructor( name: Var, args: Array<ExprPM> ) {
        this.name = name
        this.args = args
    }
}

/**
 * 関数呼び出し、変数、数値、式などを表現する基底クラス。
 */
export abstract class Fact {
    private __fact__: Fact;
}

export class FuncFact extends Fact {
    funcall: FunCall
    constructor( funcall: FunCall ) {
        super()
        this.funcall = funcall
    }
}

export class VarFact extends Fact {
    varname: Var
    constructor( varn: Var ) {
        super()
        this.varname = varn
    }
}

export class NumFact extends Fact {
    num: Num
    constructor( num: Num ) {
        super()
        this.num = num
    }
}

export class ExprFact extends Fact {
    expr: ExprPM
    constructor( expr: ExprPM ) {
        super()
        this.expr = expr
    }
}

export class NegFact extends Fact {
    fact: Fact
    constructor( fact: Fact ) {
        super()
        this.fact = fact
    }
}

/**
 * 累乗を表現するクラス。
 */
export abstract class Term {
    private __term__: Term
}

export class FactTerm extends Term {
    fact: Fact
    constructor( fact: Fact ) {
        super()
        this.fact = fact
    }
}

export class PowTerm extends Term {
    base: Term
    pow: Fact
    constructor( base: Term, pow: Fact ) {
        super()
        this.base = base
        this.pow = pow
    }
}

/**
 * 乗算、割算、剰余を表現するクラス。
 */
export abstract class ExprMD {
    private __exprmd__: ExprMD;
}

export class TermExprMD extends ExprMD {
    private __termexprmd__: TermExprMD
    term: Term
    constructor( term: Term ) {
        super()
        this.term = term
    }
}

export class MultExprMD extends ExprMD {
    private __multexprmd__: MultExprMD
    expr: ExprMD
    term: Term
    constructor( expr: ExprMD, term: Term ) {
        super()
        this.expr = expr
        this.term = term
    }
}

export class DivExprMD extends ExprMD {
    private __divexprmd__: DivExprMD;
    expr: ExprMD
    term: Term
    constructor( expr: ExprMD, term: Term ) {
        super()
        this.expr = expr
        this.term = term
    }
}

export class ModExprMD extends ExprMD {
    private __modexprmd__: ModExprMD;
    expr: ExprMD
    term: Term
    constructor( expr: ExprMD, term: Term ) {
        super()
        this.expr = expr
        this.term = term
    }
}

/**
 * 加算、減算を表現するクラス。
 */
export abstract class ExprPM {
    private __exprpm__: ExprPM
}

export class MDExprPM extends ExprPM {
    private __mdexprpm__: MDExprPM
    expr: ExprMD
    constructor( expr: ExprMD ) {
        super()
        this.expr = expr
    }
}

export class PlusExprPM extends ExprPM {
    private __plusexprpm__: PlusExprPM;
    expr1: ExprPM
    expr2: ExprMD
    constructor( expr1: ExprPM, expr2: ExprMD ) {
        super()
        this.expr1 = expr1
        this.expr2 = expr2 
    }

}

export class MinusExprPM extends ExprPM {
    private __minusexprpm__: MinusExprPM
    expr1: ExprPM
    expr2: ExprMD
    constructor( expr1: ExprPM, expr2: ExprMD ) {
        super()
        this.expr1 = expr1
        this.expr2 = expr2
    }
}

/**
 * 式または定義を表現する型
 */
export type Statement = ExprPM | Def

/*************************************************
 * 上記のクラスのインスタンスを生成するヘルパー関数群。
 *************************************************/

export function isDef( s: Statement ) {
    return s instanceof Def
}

export function isExpr( s: Statement ) {
    return s instanceof ExprPM
}

export function toPM( md: ExprMD ): ExprPM {
    return new MDExprPM( md )
}

export function plus( expr1: ExprPM, expr2: ExprMD ): ExprPM {
    return new PlusExprPM( expr1, expr2 )
}

export function minus( expr1: ExprPM, expr2: ExprMD ): ExprPM {
    return new MinusExprPM( expr1, expr2 )
}

export function toMD( term: Term ): ExprMD {
    return new TermExprMD( term )
}

export function mult( expr: ExprMD, term: Term ): ExprMD {
    return new MultExprMD( expr, term )
}

export function div( expr: ExprMD, term: Term ): ExprMD {
    return new DivExprMD( expr, term )
}

export function mod( expr: ExprMD, term: Term ): ExprMD {
    return new ModExprMD( expr, term )
}

export function toTerm( fact: Fact ): Term {
    return new FactTerm( fact )
}

export function pow( base: Term, pow: Fact ): Term {
    return new PowTerm( base, pow )
}

export function ffun( funcall: FunCall ): Fact {
    return new FuncFact( funcall )
}

export function fvar( name: Var ): Fact {
    return new VarFact( name )
}

export function fnum( num: Num ): Fact {
    return new NumFact( num )
}

export function fexpr( expr: ExprPM ): Fact {
    return new ExprFact( expr )
}

export function fneg( fact: Fact ): Fact {
    return new NegFact( fact )
}

export function mkvar( x: string ): Var {
    return new Var( x )
}

export function mknum( x: string ): Num {
    return new Num( x )
}

export function mkfun( name: Var, args: Array<ExprPM> ): FunCall {
    return new FunCall( name, args )
}

export function defvar( name: Var, expr: ExprPM ): Def {
    return new Defvar( name, expr )
}

export function defun( name: Var, args: Array<Var>, expr: ExprPM ): Def {
    return new Defun( name, args, expr )
}
