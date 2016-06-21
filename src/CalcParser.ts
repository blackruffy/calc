
import { CharParser,
         digit,
         char,
         success,
         alphabet,
         oneOf,
         spaces,
         fails,
         eof
       } from "./ParserCombinator"

import { Result, Error } from "./ParserResult"
import { CharStream } from "./ParserStream"

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
         PowTerm,
         Statement,
         toPM,
         plus,
         minus,
         toMD,
         mult,
         div,
         mod,
         toTerm,
         pow,
         ffun,
         fvar,
         fnum,
         fexpr,
         fneg,
         mknum,
         mkvar,
         mkfun,
         defvar,
         defun
       } from "./CalcStructure"

type Char = string

/*************************************************
 * パーサを生成する関数群。
 *************************************************/

/**
 * 整数のパーサを生成する。
 */
export function integer(): CharParser<Num> {
    return digit().manyStr1().map( s => new Num(s) )
}

/**
 * 数値のパーサを生成する。
 */
export function num(): CharParser<Num> {
    return integer()
        .flatMap( x => char('.')
                  .bind(integer)
                  .map( y => new Num(`${x.getData()}.${y.getData()}`) )
                  .rollback()
                  .or( () => success<string, Num>( () => x ) ) )
}

/**
 * 変数のパーサを生成する。
 */
export function varname(): CharParser<Var> {
    return alphabet()
        .rollback()
        .or( () => oneOf('_') )
        .flatMap( a => alphabet()
                  .rollback()
                  .or( digit )
                  .rollback()
                  .or( () => oneOf('_') ).manyStr().map(
                      as => new Var(a + as) ) )
}

/**
 * 関数呼び出しのパーサを生成する。
 */
export function funcall(): CharParser<FunCall> {
    return varname().flatMap(
        vn => char('(')
            .bind(spaces)
            .bind( () => exprpm()
                   .sepBy( () => spaces()
                           .bind( () => char(','))
                           .bind(spaces))
                   .flatMap( es => spaces()
                             .bind(() => char(')'))
                             .map( _ => new FunCall(vn, es) ) ) ) )
}

/**
 * 括弧で囲まれた式のパーサを生成する。
 */
export function paren(): CharParser<ExprPM> {
    return char('(')
        .bind(spaces)
        .bind(exprpm)
        .flatMap( e => spaces()
                  .bind(() => char(')'))
                  .map( _ => e ) )
}

/**
 * 関数呼び出し、変数、数値、式、マイナスの前置演算子のパーサを生成する。
 */
export function fact(): CharParser<Fact> {
    return funcall().map( fc => new FuncFact( fc ) )
        .rollback()
        .or( () => varname().map( vn => new VarFact( vn ) ) )
        .rollback()
        .or( () => num().map( n => new NumFact( n ) ) )
        .rollback()
        .or( () => paren().map( e => new ExprFact( e ) ) )
        .rollback()
        .or( () => char('-')
             .bind(spaces)
             .bind(fact)
             .map( f => new NegFact(f) ) )
}

/**
 * 累乗のパーサを生成する。
 */
export function term(): CharParser<Term> {
    return fact()
        .map(toTerm)
        .flatMap(term_)
}

function term_( x: Term ): CharParser<Term> {
    return spaces()
        .bind(() => char('^'))
        .bind(spaces)
        .bind(fact)
        .map( y => new PowTerm(x, y))
        .flatMap(term_)
        .rollback()
        .or(() => success<Char, Term>(() => x) )
}

/**
 * 乗算、除算、剰余のパーサを生成する。
 */
export function exprmd(): CharParser<ExprMD> {
    return term()
        .map(toMD)
        .flatMap(exprmd_)
}

function exprmd_( x: ExprMD ): CharParser<ExprMD> {
    return spaces()
        .bind(() => char('*')
              .rollback()
              .or(() => char('/'))
              .rollback()
              .or(() => char('%')))
        .flatMap( o => spaces()
                  .bind(term)
                  .map( y => o == '*' ? mult(x, y) : (o == '/' ? div(x, y) : mod(x, y))))
        .flatMap(exprmd_)
        .rollback()
        .or(() => success<Char, ExprMD>(() => x) )
}

/**
 * 加算、減算のパーサを生成する。
 */
export function exprpm(): CharParser<ExprPM> {
    return exprmd()
        .map(toPM)
        .flatMap(exprpm_)
}

function exprpm_( x: ExprPM ): CharParser<ExprPM> {
    return spaces()
        .bind(() => char('+')
              .rollback()
              .or(() => char('-')))
        .flatMap( o => spaces()
                  .bind(exprmd)
                  .map( y => o == '+' ? plus(x, y) : minus(x, y)))
        .flatMap( exprpm_ )
        .rollback()
        .or(() => success<Char, ExprPM>(() => x) )
}

/**
 * 変数定義、関数定義のパーサを生成する。
 */
export function def(): CharParser<Def> {
    return varname().flatMap(
        vn => char('(')
            .bind(spaces)
            .bind(() => varname()
                  .sepBy(() => spaces()
                         .bind(() => char(','))
                         .bind(spaces))
                  .flatMap( vs => spaces()
                            .bind(() => char(')'))
                            .bind(spaces)
                            .bind(() => char('='))
                            .bind(spaces)
                            .bind(exprpm)
                            .map(e => new Defun(vn, vs, e ) ) ) )
            .rollback()
            .or(() => spaces()
                .bind(() => char('='))
                .bind(spaces)
                .bind(exprpm)
                .map(e => new Defvar(vn, e))))
}

/**
 * 定義、式のパーサを生成する。
 */
export function stmt(): CharParser<Statement> {
    return def()
        .rollback()
        .or(exprpm)
        .flatMap( s => eof<Char>()
                  .map( _ => s )
                  .onFailure( (s, e) => new Error(
                      `'${s.toString()}'は無効な入力です。`,
                      e.getPosition() ) ) )
        
}

/**
 * 入力文字列をパースして構文木を生成する。
 */
export function parse( s: string ): Result<Char, Statement> {
    return stmt().parse(new CharStream(s))
}
