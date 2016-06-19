/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import { Either, Right, Left } from "../src/Either"
import { Maybe, Just, Nothing } from "../src/Maybe"
import * as E from "../src/CalcProcessor"
import * as P from "../src/CalcParser"
import { unit } from "../src/Unit"
import { CallStack } from "../src/CallStack"

function right<B>( b: B ): Either<string, B> {
    return new Right<string, B>( b )
}

function left<B>( s: string ): Either<string, B> {
    return new Left<string, B>( s )
}

describe('evalVar', function () {
    it('1', function () {
        assert.deepEqual(
            E.evalVar(P.mkvar('PI')),
            right(Math.PI)
        )
    })
})

describe('evalNum', function () {
    it('1', function () {
        assert.deepEqual(
            E.evalNum(P.mknum('1')),
            right(1)
        )
    })
})

describe('evalFunCall', function () {
    it('1', function () {
        assert.deepEqual(
            E.evalFunCall(P.mkfun(
                P.mkvar('sin'),
                [P.toPM(P.toMD(P.toTerm(P.fnum(P.mknum('1.57079632679')))))])),
            right(1)
        )
    })
})

describe('evalExprPM', function () {
    it('1', function () {
        assert.deepEqual(
            P.parse('1 + 2 * 3').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            right(7)
        )
    })
    it('2', function () {
        assert.deepEqual(
            P.parse('sin( PI / 2 )').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            right(1)
        )
    })
    it('3', function () {
        assert.deepEqual(
            P.parse('2^3').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            right(8)
        )
    })
    it('4', function () {
        assert.deepEqual(
            P.parse('2 & 3').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            left("' & 3'を認識できません。")
        )
    })
    it('5', function () {
        assert.deepEqual(
            P.parse('11 % 3').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            right(2)
        )
    })
    it('6', function () {
        assert.deepEqual(
            P.parse('-11 / 0').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            right(-Infinity)
        )
    })
})

describe('evalDef', function () {
    it('1', function () {
        assert.deepEqual(
            P.parse('x = 1').getData().flatMap(s => E.evalDef(<P.Def>s) ),
            right("変数'x'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('x'),
            new Just(1)
        )
    })
    it('2', function () {
        assert.deepEqual(
            P.parse('x = a').getData().flatMap(s => E.evalDef(<P.Def>s) ),
            left("a は定義されていません。")
        )
        assert.deepEqual(
            P.parse('x = 2').getData().flatMap(s => E.evalDef(<P.Def>s) ),
            right("変数'x'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('x'),
            new Just(2)
        )
    })
    it('3', function () {
        assert.deepEqual(
            P.parse('y = x').getData().flatMap(s => E.evalDef(<P.Def>s) ),
            right("変数'y'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('y'),
            new Just(2)
        )
    })
    it('4', function () {
        assert.deepEqual(
            P.parse('f(x, y) = x + y').getData().flatMap(s => E.evalDef(<P.Def>s) ),
            right("関数'f'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('f').isNothing(),
            false
        )
        assert.deepEqual(
            P.parse('f(1, 2) * 2').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            right(6)
        )
    })
    it('5', function () {
        assert.deepEqual(
            P.parse('g(x, y) = g(x, y)').getData().flatMap(s => E.evalDef(<P.Def>s) ),
            right("関数'g'を定義しました。")
        )
        assert.deepEqual(
            P.parse('g(1, 2)').getData().flatMap(s => E.evalExprPM(<P.ExprPM>s) ),
            left("関数'g'は再帰的に呼び出すことはできません。")
        )
    })
})
