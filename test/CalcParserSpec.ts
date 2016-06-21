/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import * as Parser from "../src/ParserCombinator"
import { CharStream } from "../src/ParserStream"
import { Result, Failure } from "../src/ParserResult"
import * as Calc from "../src/CalcParser"
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
       } from "../src/CalcStructure"
import { Either, Right, Left } from "../src/Either"

type Char = string

function runParser<B>( p: Parser.CharParser<B>, doc: string ): Either<string, B> {
    return p.parse(new CharStream(doc))
        .getData()
        .mapLeft( e => e.getMessage() )
}

function right<B>( b: B ): Either<string, B> {
    return new Right<string, B>( b )
}

function left<B>( s: string ): Either<string, B> {
    return new Left<string, B>( s )
}

describe('integer', function () {
    it('should parse integer number 1', function () {
        assert.deepEqual(
            runParser(Calc.integer(), '1234'),
            right(new Num('1234'))
        )
    })
    it('should parse integer number 2', function () {
        assert.deepEqual(
            runParser(Calc.integer(), '1234.567'),
            right(new Num('1234'))
        )
    })
    it('should failed to parse variable', function () {
        assert.deepEqual(
            runParser(Calc.integer(), 'abc'),
            left("ここでは'a'は無効です。")
        )
    })
})

describe('number', function () {
    it('should parse integer number 1', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234'),
            right(new Num('1234'))
        )
    })
    it('should parse floating point number', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234.567'),
            right(new Num('1234.567'))
        )
    })
    it('should parse integer number 2', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234.'),
            right(new Num('1234'))
        )
    })
})

describe('varname', function () {
    it('should parse variable: hoge', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge'),
            right(new Var('hoge'))
        )
    })
    it('should parse variable: _hoge', function () {
        assert.deepEqual(
            runParser(Calc.varname(), '_hoge'),
            right(new Var('_hoge'))
        )
    })
    it('should parse variable: hoge_123', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge_123'),
            right(new Var('hoge_123'))
        )
    })
    it('should parse variable: hoge123', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge123.456'),
            right(new Var('hoge123'))
        )
    })
    it('should fail to parse number', function () {
        assert.deepEqual(
            runParser(Calc.varname(), '1'),
            left("ここでは'1'は無効です。")
        )
    })
})

describe('funcall', function () {
    it('should parse a literal of calling function', function () {
        assert.deepEqual(
            runParser(Calc.funcall(), 'hoge(1, 2, 3)'),
            right(new FunCall(
                new Var('hoge'),
                [
                    new MDExprPM(
                        new TermExprMD(
                            new FactTerm(
                                new NumFact(
                                    new Num('1')
                                )
                            )
                        )
                    ),
                    new MDExprPM(
                        new TermExprMD(
                            new FactTerm(
                                new NumFact(
                                    new Num('2')
                                )
                            )
                        )
                    ),
                    new MDExprPM(
                        new TermExprMD(
                            new FactTerm(
                                new NumFact(
                                    new Num('3')
                                )
                            )
                        )
                    )
                ]
            ))
        )
    })
})

describe('fact', function () {
    it('should parse variable: hoge', function () {
        assert.deepEqual(
            runParser(Calc.fact(), 'hoge'),
            right(new VarFact(new Var('hoge')))
        )
    })
    it('should parse number: 123.456', function () {
        assert.deepEqual(
            runParser(Calc.fact(), '123.456'),
            right(new NumFact(new Num('123.456')))
        )
    })
    it('should parse nevative number: -123.456', function () {
        assert.deepEqual(
            runParser(Calc.fact(), '-123.456'),
            right(new NegFact(new NumFact(new Num('123.456'))))
        )
    })
})

describe('term', function () {
    it('should parse power: 123^2', function () {
        assert.deepEqual(
            runParser(Calc.term(), '123^2'),
            right(new PowTerm(
                new NumFact(new Num('123')),
                new FactTerm(new NumFact(new Num('2')))
            ))
        )
    })
    it('should parse power: a^b', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a^b'),
            right(new PowTerm(
                new VarFact(new Var('a')),
                new FactTerm(new VarFact(new Var('b')))
            ))
        )
    })
    it('should parse power which contains spaces: a ^  b', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a ^  b'),
            right(new PowTerm(
                new VarFact(new Var('a')),
                new FactTerm(new VarFact(new Var('b')))
            ))
        )
    })
    it('should parse variable: a', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a'),
            right(new FactTerm(new VarFact(new Var('a'))))
        )
    })
})

describe('exprmd', function () {
    it('should parse multiply: 123 * 456', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 * 456'),
            right(new MultExprMD(
                new FactTerm(new NumFact(new Num('123'))),
                new TermExprMD(new FactTerm(new NumFact(new Num('456'))))
            ))
        )
    })
    it('should parse multiply: abc * 2', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), 'abc * 2'),
            right(new MultExprMD(
                new FactTerm(new VarFact(new Var('abc'))),
                new TermExprMD(new FactTerm(new NumFact(new Num('2'))))
            ))
        )
    })
    it('should parse divide: 123 / 456', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 / 456'),
            right(new DivExprMD(
                new FactTerm(new NumFact(new Num('123'))),
                new TermExprMD(new FactTerm(new NumFact(new Num('456'))))
            ))
        )
    })
    it('should parse multiply and power', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 * 456 ^ abc'),
            right(new MultExprMD(
                new FactTerm(new NumFact(new Num('123'))),
                new TermExprMD(new PowTerm(
                    new NumFact(new Num('456')),
                    new FactTerm(new VarFact(new Var('abc')))
                ))
            ))
        )
    })
})

describe('exprpm', function () {
    it('should parse plus: 123 + 456', function () {
        assert.deepEqual(
            runParser(Calc.exprpm(), '123 + 456'),
            right(new PlusExprPM(
                new TermExprMD(
                    new FactTerm(
                        new NumFact(
                            new Num('123')))),
                new MDExprPM(
                    new TermExprMD(
                        new FactTerm(
                            new NumFact(
                                new Num('456')))))
            ))
        )
    })
    it('should parse plus and divide', function () {
        assert.deepEqual(
            runParser(Calc.exprpm(), '123 + 456 / 3'),
            right(new PlusExprPM(
                new TermExprMD(
                    new FactTerm(
                        new NumFact(
                            new Num('123')))),
                new MDExprPM(
                    new DivExprMD(
                        new FactTerm(
                            new NumFact(
                                new Num('456'))),
                        new TermExprMD(
                            new FactTerm(
                                new NumFact(
                                    new Num('3'))))
                ))
            ))
        )
    })
    it('should parse complecated expression', function () {
        assert.deepEqual(
            runParser(Calc.exprpm(), 'a * (123 + 456) / ( (b + c)*f(x, y, z) )'),
            right(toPM(mult(
                toTerm(fvar(mkvar('a'))),
                div(
                    toTerm(fexpr(plus(
                        toMD(toTerm(fnum(mknum('123')))),
                        toPM(toMD(toTerm(fnum(mknum('456')))))
                    ))),
                    toMD(toTerm(fexpr(toPM(mult(
                        toTerm(fexpr(plus(
                            toMD(toTerm(fvar(mkvar('b')))),
                            toPM(toMD(toTerm(fvar(mkvar('c')))))))),
                        toMD(toTerm(ffun(mkfun(
                            mkvar('f'),
                            [ toPM(toMD(toTerm(fvar(mkvar('x'))))),
                              toPM(toMD(toTerm(fvar(mkvar('y'))))),
                              toPM(toMD(toTerm(fvar(mkvar('z'))))) ])))))))))))))
        )
    })
})

describe('paren', function () {
    it('should parse parenthese 1', function () {
        assert.deepEqual(
            runParser(Calc.paren(), '(1 + 2)'),
            right(plus(
                toMD(toTerm(fnum(mknum('1')))),
                toPM(toMD(toTerm(fnum(mknum('2')))))
            ))
        )
    })
    it('should parse parenthese 2', function () {
        assert.deepEqual(
            runParser(Calc.paren(), '(1 + 2) + 3'),
            right(plus(
                toMD(toTerm(fnum(mknum('1')))),
                toPM(toMD(toTerm(fnum(mknum('2')))))
            ))
        )
    })
})

describe('defun', function () {
    it('should parse literal of defining function', function () {
        assert.deepEqual(
            runParser(Calc.def(), 'hoge(x, y, z) = x + y + z'),
            right(new Defun(
                new Var('hoge'),
                [
                    new Var('x'),
                    new Var('y'),
                    new Var('z')
                ],
                new PlusExprPM(
                    new TermExprMD(
                        new FactTerm(
                            new VarFact(
                                new Var('x')))),
                    new PlusExprPM(
                        new TermExprMD(
                            new FactTerm(
                                new VarFact(
                                    new Var('y')))),
                        new MDExprPM(
                            new TermExprMD(
                                new FactTerm(
                                    new VarFact(
                                        new Var('z')))))
                    )
                )
            ))
        )
    })
    
    it('should fail to parse invalid literal of defining function', function () {
        
        assert.deepEqual(
            runParser(Calc.def(), 'hoge(1) = 1'),
            right("ここでは'1'は無効です。")
        )
    })
    
    it('should fail to parse literal of defining variable', function () {
        assert.deepEqual(
            runParser(Calc.def(), 'hoge = 1 + 2 + 3'),
            right(new Defvar(
                new Var('hoge'),
                new PlusExprPM(
                    new TermExprMD(
                        new FactTerm(
                            new NumFact(
                                new Num('1')))),
                    new PlusExprPM(
                        new TermExprMD(
                            new FactTerm(
                                new NumFact(
                                    new Num('2')))),
                        new MDExprPM(
                            new TermExprMD(
                                new FactTerm(
                                    new NumFact(
                                        new Num('3')))))
                    )
                )
            ))
        )
    })
})
