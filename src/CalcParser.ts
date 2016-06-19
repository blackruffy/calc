
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

import { Result } from "./ParserResult"
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
         Statement
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
                  .map( y => new Num(x.getData()
                                     + '.'
                                     + y.getData()) )
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
    return fact().flatMap(
        t => spaces()
            .bind(() => char('^'))
            .bind(spaces)
            .bind(term).map(
                f => new PowTerm(t, f) )
            .rollback()
            .or(() => success<Char, Term>(() => new FactTerm(t))))
}

/**
 * 乗算、除算、剰余のパーサを生成する。
 */
export function exprmd(): CharParser<ExprMD> {
    return term().flatMap(
        x => spaces()
            .bind(() => char('*')
                  .rollback()
                  .or(() => char('/'))
                  .rollback()
                  .or(() => char('%')))
            .flatMap( o => spaces()
                      .bind(exprmd).map( y => {
                          if( o == '*' )
                              return new MultExprMD(x, y)
                          else if( o == '/' )
                              return new DivExprMD(x, y)
                          else 
                              return new ModExprMD(x, y)
                      }) )
            .rollback()
            .or(() => success<Char, ExprMD>(
                () => new TermExprMD(x) ) ) )
}

/**
 * 加算、減算のパーサを生成する。
 */
export function exprpm(): CharParser<ExprPM> {
    return exprmd().flatMap(
            x => spaces()
            .bind(() => char('+')
                  .rollback()
                  .or(() => char('-')))
            .flatMap( o => spaces()
                      .bind(exprpm).map( y => {
                          if( o == '+' )
                              return new PlusExprPM(x, y)
                          else
                              return new MinusExprPM(x, y)
                      } ) )
            .rollback()
            .or(() => success<Char, ExprPM>(
                () => new MDExprPM(x) ) ) )
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
        .flatMap( s => eof<Char>().map( _ => s ) )
        .onFailure( (s, e) => '\'' + s.toString() + '\'を認識できません。' )
}

/**
 * 入力文字列をパースして構文木を生成する。
 */
export function parse( s: string ): Result<Char, Statement> {
    return stmt().parse(new CharStream(s))
}
