
import { CharParser,
         digit,
         char,
         success,
         alphabet,
         oneOf
       } from "../src/ParserCombinator"

interface Token {
}

class Identifier implements Token {
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

class Pow implements Token {
    constructor( expr1: Expr, expr2: Expr ) {
    }
}

interface Fact {
}

class ExprFact implements Fact {
    constructor( expr: Expr ) {
    }
}

class FuncFact implements Fact {
    constructor( funcall: FunCall ) {
    }
}

interface Term {
}

class FactTerm implements Term {
    constructor( fact: Fact ) {
    }
}

class MultTerm implements Term {
    constructor( term: Term, fact: Fact ) {
    }
}

class DivTerm implements Term {
    constructor( term: Term, fact: Fact ) {
    }
}

interface Expr {
}

class TermExpr implements Expr {
    constructor( term: Term ) {
    }
}

class PlusExpr implements Expr {
    constructor( expr: Expr, term: Term ) {
    }
}

class MinusExpr implements Expr {
    constructor( expr: Expr, term: Term ) {
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
// 
// function term(): CharParser<Term> {
//     return fact().map( f => new FactTerm(f) )
//         .or(term().flatMap(
//             x => spaces()
//                 .bind(char('*'))
//                 .bind(spaces())
//                 .bind(fact()).flatMap(
//                     y => new MultTerm(x, y) ) ) )
//         .or(expr().flatMap(
//             x => spaces()
//                 .bind(char('/'))
//                 .bind(spaces())
//                 .bind(term()).flatMap(
//                     y => new DivExpr(x, y) ) ) )
// }
// 
// function expr(): CharParser<Expr> {
//     return term().map( t => new TermExpr(t) )
//         .or(expr().flatMap(
//             x => spaces()
//                 .bind(char('+'))
//                 .bind(spaces())
//                 .bind(term()).flatMap(
//                     y => new PlusExpr(x, y) ) ) )
//         .or(expr().flatMap(
//             x => spaces()
//                 .bind(char('-'))
//                 .bind(spaces())
//                 .bind(term()).flatMap(
//                     y => new MinusExpr(x, y) ) ) )
// }
