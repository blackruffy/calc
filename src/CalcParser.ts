
import { CharParser,
         digit,
         char,
         success,
         alphabet,
         oneOf,
         spaces
       } from "../src/ParserCombinator"

export abstract class Identifier {
    private data: string;
    constructor( x: string ) {
        this.data = x;
    }
    getData(): string {
        return this.data;
    }
}

export class Num extends Identifier {
    private __num__: Num
}

export class Var extends Identifier {
    private __var__: Var
}

export abstract class Def {
    private __def__: Def;
}

export class Defvar extends Def {
    name: Var;
    expr: ExprPM;

    constructor( name: Var, expr: ExprPM ) {
        super()
        this.name = name
        this.expr = expr
    }
}

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

export class FunCall {
    name: Var;
    args: Array<ExprPM>;
    constructor( name: Var, args: Array<ExprPM> ) {
        this.name = name
        this.args = args
    }
}

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
    base: Fact
    pow: Term
    constructor( base: Fact, pow: Term ) {
        super()
        this.base = base
        this.pow = pow
    }
}

export abstract class ExprMD {
    private __exprmd__: ExprMD;
}

export class TermExprMD extends ExprMD {
    term: Term
    constructor( term: Term ) {
        super()
        this.term = term
    }
}

export class MultExprMD extends ExprMD {
    term: Term
    expr: ExprMD
    constructor( term: Term, expr: ExprMD ) {
        super()
        this.term = term
        this.expr = expr
    }
}

export class DivExprMD extends ExprMD {
    term: Term
    expr: ExprMD
    constructor( term: Term, expr: ExprMD ) {
        super()
        this.term = term
        this.expr = expr
    }
}

export abstract class ExprPM {
    private __exprpm__: ExprPM
}

export class MDExprPM extends ExprPM {
    expr: ExprMD
    constructor( expr: ExprMD ) {
        super()
        this.expr = expr
    }
}

export class PlusExprPM extends ExprPM {
    expr1: ExprMD
    expr2: ExprPM
    constructor( expr1: ExprMD, expr2: ExprPM ) {
        super()
        this.expr1 = expr1
        this.expr2 = expr2 
    }

}

export class MinusExprPM extends ExprPM {
    expr1: ExprMD
    expr2: ExprPM
    constructor( expr1: ExprMD, expr2: ExprPM ) {
        super()
        this.expr1 = expr1
        this.expr2 = expr2
    }
}

export function integer(): CharParser<Num> {
    return digit().manyStr1().map( s => new Num(s) )
}

export function num(): CharParser<Num> {
    return integer().flatMap(
        x => char('.').bind(integer).map(
            y => new Num(x.getData() + '.' + y.getData()) )
            .rollback()
            .or( () => success<string, Num>( () => x ) ) )
}

export function varname(): CharParser<Var> {
    return alphabet()
        .rollback()
        .or( () => oneOf('_') ).flatMap(
            a => alphabet()
                .rollback()
                .or( digit )
                .rollback()
                .or( () => oneOf('_') ).manyStr().map(
                    as => new Var(a + as) ) )
}

export function funcall(): CharParser<FunCall> {
    return varname().flatMap(
        vn => char('(')
            .bind(spaces)
            .bind(() => exprpm()
                  .sepBy(() => spaces()
                         .bind(() => char(','))
                         .bind(spaces))
                  .flatMap(
                      es => spaces().bind(() => char(')')).map(
                          _ => new FunCall(vn, es) ) ) ) )
}

export function fact(): CharParser<Fact> {
    return funcall().map( fc => new FuncFact( fc ) )
        .rollback()
        .or( () => varname().map( vn => new VarFact( vn ) ) )
        .rollback()
        .or( () => num().map( n => new NumFact( n ) ) )
        .rollback()
        .or( () => char('(')
             .bind(spaces)
             .bind(exprpm)
             .flatMap(
                 e => spaces()
                     .bind(() => char(')'))
                     .map( _ => new ExprFact( e ) ) ) )
        .rollback()
        .or( () => char('-')
             .bind(spaces)
             .bind(fact)
             .map( f => new NegFact(f) ) )
}

export function term(): CharParser<Term> {
    return fact().flatMap(
        t => spaces()
            .bind(() => char('^'))
            .bind(spaces)
            .bind(term).map(
                f => new PowTerm(t, f) ) )
        .rollback()
        .or(() => fact().map( f => new FactTerm(f) ) )
}

export function exprmd(): CharParser<ExprMD> {
    return term().flatMap(
        x => spaces()
            .bind(() => char('*'))
            .bind(spaces)
            .bind(exprmd).map(
                y => new MultExprMD(x, y) ) )
        .rollback()
        .or(() => term().flatMap(
            x => spaces()
                .bind(() => char('/'))
                .bind(spaces)
                .bind(exprmd).map(
                    y => new DivExprMD(x, y) ) ) )
        .rollback()
        .or(() => term().map( t => new TermExprMD(t) ))
}

export function exprpm(): CharParser<ExprPM> {
    return exprmd().flatMap(
            x => spaces()
                .bind(() => char('+'))
                .bind(spaces)
                .bind(exprpm).map(
                    y => new PlusExprPM(x, y) ) )
        .rollback()
        .or(() => exprmd().flatMap(
            x => spaces()
                .bind(() => char('-'))
                .bind(spaces)
                .bind(exprpm).map(
                    y => new MinusExprPM(x, y) ) ) )
        .rollback()
        .or(() => exprmd().map( t => new MDExprPM(t) ) ) 
}

export function defun(): CharParser<Def> {
    return varname().flatMap(
        vn => char('(')
            .bind(spaces)
            .bind(() => varname()
                  .sepBy(() => spaces()
                         .bind(() => char(','))
                         .bind(spaces))
                  .flatMap(
                      vs => spaces()
                          .bind(() => char(')'))
                          .bind(spaces)
                          .bind(() => char('='))
                          .bind(spaces)
                          .bind(exprpm)
                          .map(e => new Defun(vn, vs, e ) ) ) ) )
        .rollback()
        .or(() => varname().flatMap(
            vn => spaces()
                .bind(() => char('='))
                .bind(spaces)
                .bind(exprpm)
                .map(e => new Defvar(vn, e)) ) )
}
