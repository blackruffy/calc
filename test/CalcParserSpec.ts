/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import * as Parser from "../src/ParserCombinator"
import { CharStream } from "../src/ParserStream"
import { Result, Failure } from "../src/ParserResult"
import * as Calc from "../src/CalcParser"
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
            right(new Calc.Num('1234'))
        )
    })
    it('integer 2', function () {
        assert.deepEqual(
            runParser(Calc.integer(), '1234.567'),
            right(new Calc.Num('1234'))
        )
    })
    it('integer 3', function () {
        assert.deepEqual(
            runParser(Calc.integer(), 'abc'),
            left('expected digit but a was found')
        )
    })
})

describe('number', function () {
    it('num 1', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234'),
            right(new Calc.Num('1234'))
        )
    })
    it('num 2', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234.567'),
            right(new Calc.Num('1234.567'))
        )
    })
    it('num 3', function () {
        assert.deepEqual(
            runParser(Calc.num(), '1234.'),
            right(new Calc.Num('1234'))
        )
    })
})

describe('varname', function () {
    it('could be hoge', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge'),
            right(new Calc.Var('hoge'))
        )
    })
    it('could be _hoge', function () {
        assert.deepEqual(
            runParser(Calc.varname(), '_hoge'),
            right(new Calc.Var('_hoge'))
        )
    })
    it('could be hoge_123', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge_123'),
            right(new Calc.Var('hoge_123'))
        )
    })
    it('could be hoge123', function () {
        assert.deepEqual(
            runParser(Calc.varname(), 'hoge123.456'),
            right(new Calc.Var('hoge123'))
        )
    })
})

describe('funcall', function () {
    it('could be funcall 1', function () {
        assert.deepEqual(
            runParser(Calc.funcall(), 'hoge(1, 2, 3)'),
            right(new Calc.FunCall(
                new Calc.Var('hoge'),
                [
                    new Calc.MDExprPM(
                        new Calc.TermExprMD(
                            new Calc.FactTerm(
                                new Calc.NumFact(
                                    new Calc.Num('1')
                                )
                            )
                        )
                    ),
                    new Calc.MDExprPM(
                        new Calc.TermExprMD(
                            new Calc.FactTerm(
                                new Calc.NumFact(
                                    new Calc.Num('2')
                                )
                            )
                        )
                    ),
                    new Calc.MDExprPM(
                        new Calc.TermExprMD(
                            new Calc.FactTerm(
                                new Calc.NumFact(
                                    new Calc.Num('3')
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
            right(new Calc.VarFact(new Calc.Var('hoge')))
        )
    })
    it('could be num', function () {
        assert.deepEqual(
            runParser(Calc.fact(), '123.456'),
            right(new Calc.NumFact(new Calc.Num('123.456')))
        )
    })
    it('could be -num', function () {
        assert.deepEqual(
            runParser(Calc.fact(), '-123.456'),
            right(new Calc.NegFact(new Calc.NumFact(new Calc.Num('123.456'))))
        )
    })
})

describe('term', function () {
    it('could be term 1', function () {
        assert.deepEqual(
            runParser(Calc.term(), '123^2'),
            right(new Calc.PowTerm(new Calc.NumFact(new Calc.Num('123')), new Calc.NumFact(new Calc.Num('2'))))
        )
    })
    it('could be term 2', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a^b'),
            right(new Calc.PowTerm(new Calc.VarFact(new Calc.Var('a')), new Calc.VarFact(new Calc.Var('b'))))
        )
    })
    it('could be term 3', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a ^  b'),
            right(new Calc.PowTerm(new Calc.VarFact(new Calc.Var('a')), new Calc.VarFact(new Calc.Var('b'))))
        )
    })
    it('could be term 4', function () {
        assert.deepEqual(
            runParser(Calc.term(), 'a'),
            right(new Calc.FactTerm(new Calc.VarFact(new Calc.Var('a'))))
        )
    })
})

describe('exprmd', function () {
    it('could be exprmd 1', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 * 456'),
            right(new Calc.MultExprMD(
                new Calc.FactTerm(new Calc.NumFact(new Calc.Num('123'))),
                new Calc.FactTerm(new Calc.NumFact(new Calc.Num('456')))
            ))
        )
    })
    it('could be exprmd 2', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), 'abc * 2'),
            right(new Calc.MultExprMD(
                new Calc.FactTerm(new Calc.VarFact(new Calc.Var('abc'))),
                new Calc.FactTerm(new Calc.NumFact(new Calc.Num('2')))
            ))
        )
    })
    it('could be exprmd 3', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 / 456'),
            right(new Calc.DivExprMD(
                new Calc.FactTerm(new Calc.NumFact(new Calc.Num('123'))),
                new Calc.FactTerm(new Calc.NumFact(new Calc.Num('456')))
            ))
        )
    })
    it('could be exprmd 4', function () {
        assert.deepEqual(
            runParser(Calc.exprmd(), '123 * 456 ^ abc'),
            right(new Calc.MultExprMD(
                new Calc.FactTerm(new Calc.NumFact(new Calc.Num('123'))),
                new Calc.PowTerm(
                    new Calc.NumFact(new Calc.Num('456')),
                    new Calc.VarFact(new Calc.Var('abc'))
                )
            ))
        )
    })
})

describe('exprpm', function () {
    it('could be exprpm 1', function () {
        assert.deepEqual(
            runParser(Calc.exprpm(), '123 + 456'),
            right(new Calc.PlusExprPM(
                new Calc.TermExprMD(new Calc.FactTerm(new Calc.NumFact(new Calc.Num('123')))),
                new Calc.MDExprPM(
                    new Calc.TermExprMD(
                        new Calc.FactTerm(
                            new Calc.NumFact(
                                new Calc.Num('456')
                            )
                        )
                    )
                )
            ))
        )
    })
    it('could be exprpm 2', function () {
        assert.deepEqual(
            runParser(Calc.exprpm(), '123 + 456 / 3'),
            right(new Calc.PlusExprPM(
                new Calc.TermExprMD(new Calc.FactTerm(new Calc.NumFact(new Calc.Num('123')))),
                new Calc.DivExprMD(
                    new Calc.FactTerm(new Calc.NumFact(new Calc.Num('456'))),
                    new Calc.FactTerm(new Calc.NumFact(new Calc.Num('3')))
                )
            ))
        )
    })
})

//describe('defun', function () {
//    it('could be defun 1', function () {
//        assert.deepEqual(
//            runParser(Calc.defun(), 'hoge(x, y, z) = x + y + z'),
//            right(new Calc.Defun(
//                new Calc.Var('hoge'),
//                [
//                    new Calc.Var('x'),
//                    new Calc.Var('y'),
//                    new Calc.Var('z')
//                ],
//                
//                new Calc.TermExprMD(new Calc.FactTerm(new Calc.NumFact(new Calc.Num('123')))),
//                new Calc.TermExprMD(new Calc.FactTerm(new Calc.NumFact(new Calc.Num('456'))))
//            ))
//        )
//    })
//})
