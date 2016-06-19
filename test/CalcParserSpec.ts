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
    return p.parse(new CharStream(doc)).getData()
}

function right<B>( b: B ): Either<string, B> {
    return new Right<string, B>( b )
}

function left<B>( s: string ): Either<string, B> {
    return new Left<string, B>( s )
}

describe('integer', function () {
    it('integer 1', function () {
        assert.deepEqual(
            runParser(Calc.integer(), '1234'),
            right(new Num('1234'))
        )
    })
    it('integer 2', function () {
        assert.deepEqual(
            runParser(Calc.integer(), '1234.567'),
            right(new Num('1234'))
        )
    })
    it('integer 3', function () {
        assert.deepEqual(
            runParser(Calc.integer(), 'abc'),
            left('aではなく数字ではありませんか？')
        )
    })
})

describe('number', function () {
    it('num 1', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234'),
            right(new Num('1234'))
        )
    })
    it('num 2', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234.567'),
            right(new Num('1234.567'))
        )
    })
    it('num 3', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234.'),
            right(new Num('1234'))
        )
    })
})

describe('varname', function () {
    it('could be hoge', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge'),
            right(new Var('hoge'))
        )
    })
    it('could be _hoge', function () {
        assert.deepEqual(
            runParser(Calc.varname(), '_hoge'),
            right(new Var('_hoge'))
        )
    })
    it('could be hoge_123', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge_123'),
            right(new Var('hoge_123'))
        )
    })
    it('could be hoge123', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge123.456'),
            right(new Var('hoge123'))
        )
    })
    it('should be fail', function () {
        assert.deepEqual(
            runParser(Calc.varname(), '1'),
            left("1ではなく_の中の１文字ではありませんか？")
        )
    })
})

describe('funcall', function () {
    it('could be funcall 1', function () {
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
    it('could be var', function () {
        assert.deepEqual(
            runParser(Calc.fact(), 'hoge'),
            right(new VarFact(new Var('hoge')))
        )
    })
    it('could be num', function () {
        assert.deepEqual(
            runParser(Calc.fact(), '123.456'),
            right(new NumFact(new Num('123.456')))
        )
    })
    it('could be -num', function () {
        assert.deepEqual(
            runParser(Calc.fact(), '-123.456'),
            right(new NegFact(new NumFact(new Num('123.456'))))
        )
    })
})

describe('term', function () {
    it('could be term 1', function () {
        assert.deepEqual(
            runParser(Calc.term(), '123^2'),
            right(new PowTerm(
                new NumFact(new Num('123')),
                new FactTerm(new NumFact(new Num('2')))
            ))
        )
    })
    it('could be term 2', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a^b'),
            right(new PowTerm(
                new VarFact(new Var('a')),
                new FactTerm(new VarFact(new Var('b')))
            ))
        )
    })
    it('could be term 3', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a ^  b'),
            right(new PowTerm(
                new VarFact(new Var('a')),
                new FactTerm(new VarFact(new Var('b')))
            ))
        )
    })
    it('could be term 4', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a'),
            right(new FactTerm(new VarFact(new Var('a'))))
        )
    })
})

describe('exprmd', function () {
    it('could be exprmd 1', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 * 456'),
            right(new MultExprMD(
                new FactTerm(new NumFact(new Num('123'))),
                new TermExprMD(new FactTerm(new NumFact(new Num('456'))))
            ))
        )
    })
    it('could be exprmd 2', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), 'abc * 2'),
            right(new MultExprMD(
                new FactTerm(new VarFact(new Var('abc'))),
                new TermExprMD(new FactTerm(new NumFact(new Num('2'))))
            ))
        )
    })
    it('could be exprmd 3', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 / 456'),
            right(new DivExprMD(
                new FactTerm(new NumFact(new Num('123'))),
                new TermExprMD(new FactTerm(new NumFact(new Num('456'))))
            ))
        )
    })
    it('could be exprmd 4', function () {
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
    it('could be exprpm 1', function () {
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
    it('could be exprpm 2', function () {
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
    it('could be exprpm 3', function () {
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
    it('could be paren 1', function () {
        assert.deepEqual(
            runParser(Calc.paren(), '(1 + 2)'),
            right(plus(
                toMD(toTerm(fnum(mknum('1')))),
                toPM(toMD(toTerm(fnum(mknum('2')))))
            ))
        )
    })
    it('could be paren 2', function () {
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
    it('could be defun 1', function () {
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
    
    it('could be defun 2', function () {
        
        assert.deepEqual(
            runParser(Calc.def(), 'hoge(1) = 1'),
            right("(ではなく=ではありませんか？")
        )
    })
    
    it('could be defvar 1', function () {
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
