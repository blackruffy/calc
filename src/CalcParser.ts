
import { CharParser,
         digit,
         char,
         success,
         alphabet,
         oneOf,
         spaces
       } from "../src/ParserCombinator"

abstract class Identifier {
    private data: string;
    constructor( x: string ) {
        this.data = x;
    }
    getData(): string {
        return this.data;
    }
}

class Num extends Identifier {}

class Var extends Identifier {}

class Defun {
    constructor( varn: Var, args: Array<Var> ) {
    }
}

class FunCall {
    constructor( varn: Var, exprs: Array<ExprPM> ) {
    }
}

abstract class Fact {
}

class FuncFact extends Fact {
    constructor( funcall: FunCall ) {
        super()
    }
}

class VarFact extends Fact {
    constructor( varn: Var ) {
        super()
    }
}

class NumFact extends Fact {
    constructor( num: Num ) {
        super()
    }
}

class ExprFact extends
Fact {
    constructor( expr: ExprPM ) {
        super()
    }
}

class NegFact extends Fact {
    constructor( fact: Fact ) {
        super()
    }
}

abstract class Term {
}

class FactTerm extends Term {
    constructor( fact: Fact ) {
        super()
    }
}

class PowTerm extends Term {
    constructor( term: Term, fact: Fact ) {
        super()
    }
}

abstract class ExprMD {
}

class TermExprMD extends ExprMD {
    constructor( term: Term ) {
        super()
    }
}

class MultExprMD extends ExprMD {
    constructor( expr: ExprMD, term: Term ) {
        super()
    }
}

class DivExprMD extends ExprMD {
    constructor( expr: ExprMD, term: Term ) {
        super()
    }
}

abstract class ExprPM {
}

class MDExprPM extends ExprPM {
    constructor( expr: ExprMD ) {
        super()
    }
}

class PlusExprPM extends ExprPM {
    constructor( expr1: ExprPM, expr2: ExprMD ) {
        super()
    }
}

class MinusExprPM extends ExprPM {
    constructor( expr1: ExprPM, expr2: ExprMD ) {
        super()
    }
}

function integer(): CharParser<Num> {
    return digit().flatMap(
        x => integer().map(
            xs => new Num(x + xs.getData()) ) )
}

function float(): CharParser<Num> {
    return integer().flatMap(
        x => char('.').flatMap(
            _ => integer().map(
                y => new Num(x.getData() + '.' + y.getData()) ) )
            .or( success<string, Num>( x ) ) )
}

function varname(): CharParser<Var> {
    return alphabet().or( oneOf('_') ).flatMap(
        a => alphabet()
            .or( digit() )
            .or( oneOf('_') ).manyStr().map(
                as => new Var(a + as) ) )
}

// function fact(): CharParser<Fact> {
//     return char('(').bind(spaces()).bind(
//         expr().flatMap(
//             e => spaces().bind(char(')')).map(
// }

function exprmd(): CharParser<Term> {
    return null
    //return fact().map( f => new FactTerm(f) )
    //    .or(term().flatMap(
    //        x => spaces()
    //            .bind(char('*'))
    //            .bind(spaces())
    //            .bind(fact()).flatMap(
    //                y => new MultTerm(x, y) ) ) )
    //    .or(expr().flatMap(
    //        x => spaces()
    //            .bind(char('/'))
    //            .bind(spaces())
    //            .bind(term()).flatMap(
    //                y => new DivExpr(x, y) ) ) )
}

function exprpm(): CharParser<ExprPM> {
    return exprmd().map( t => new MDExprPM(t) )
        .or(exprpm().flatMap(
            x => spaces()
                .bind(char('+'))
                .bind(spaces())
                .bind(exprmd()).map(
                    y => new PlusExprPM(x, y) ) ) )
        .or(exprpm().flatMap(
            x => spaces()
                .bind(char('-'))
                .bind(spaces())
                .bind(exprmd()).map(
                    y => new MinusExprPM(x, y) ) ) )
}
