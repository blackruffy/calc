/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import { Either, Right, Left } from "../src/Either"
import { Maybe, Just, Nothing } from "../src/Maybe"
import * as E from "../src/CalcProcessor"
import * as P from "../src/CalcParser"
import * as S from "../src/CalcStructure"
import { unit } from "../src/Unit"
import { CallStack } from "../src/CallStack"

function right<B>( b: B ): Either<string, B> {
    return new Right<string, B>( b )
}

function left<B>( s: string ): Either<string, B> {
    return new Left<string, B>( s )
}

describe('evalVar', function () {
    it('should be able to evaluate default constant PI', function () {
        assert.deepEqual(
            E.evalVar(S.mkvar('PI')),
            right(Math.PI)
        )
    })
})

describe('evalNum', function () {
    it('should be able to evaluate number', function () {
        assert.deepEqual(
            E.evalNum(S.mknum('1')),
            right(1)
        )
    })
})

describe('evalFunCall', function () {
    it('should be able to evaluate sin function', function () {
        assert.deepEqual(
            E.evalFunCall(S.mkfun(
                S.mkvar('sin'),
                [S.toPM(S.toMD(S.toTerm(S.fnum(S.mknum('1.57079632679')))))])),
            right(1)
        )
    })
})

describe('evalExprPM', function () {
    it('should evaluate expression with + and *', function () {
        assert.deepEqual(
            P.parse('1 + 2 * 3').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            right(7)
        )
    })
    it('should evaluate sin function which takes PI/2', function () {
        assert.deepEqual(
            P.parse('sin( PI / 2 )').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            right(1)
        )
    })
    it('should evaluate 2 to the 3', function () {
        assert.deepEqual(
            P.parse('2^3').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            right(8)
        )
    })
    it('should fail to evaluate &', function () {
        assert.deepEqual(
            P.parse('2 & 3').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            left("' & 3'を認識できません。")
        )
    })
    it('should evaluate %', function () {
        assert.deepEqual(
            P.parse('11 % 3').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            right(2)
        )
    })
    it('should evaluate the number divided by zero', function () {
        assert.deepEqual(
            P.parse('-11 / 0').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            right(-Infinity)
        )
    })
})

describe('evalDef', function () {
    it('should define variable', function () {
        assert.deepEqual(
            P.parse('x = 1').getData().flatMap(s => E.evalDef(<S.Def>s) ),
            right("変数'x'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('x'),
            new Just(1)
        )
    })
    it('should fail to use undefined variable', function () {
        assert.deepEqual(
            P.parse('x = a').getData().flatMap(s => E.evalDef(<S.Def>s) ),
            left("a は定義されていません。")
        )
        assert.deepEqual(
            P.parse('x = 2').getData().flatMap(s => E.evalDef(<S.Def>s) ),
            right("変数'x'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('x'),
            new Just(2)
        )
    })
    it('should be able to use defined variable', function () {
        assert.deepEqual(
            P.parse('y = x').getData().flatMap(s => E.evalDef(<S.Def>s) ),
            right("変数'y'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('y'),
            new Just(2)
        )
    })
    it('should define function and call defined function', function () {
        assert.deepEqual(
            P.parse('f(x, y) = x + y').getData().flatMap(s => E.evalDef(<S.Def>s) ),
            right("関数'f'を定義しました。")
        )
        assert.deepEqual(
            CallStack.findVar('f').isNothing(),
            false
        )
        assert.deepEqual(
            P.parse('f(1, 2) * 2').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            right(6)
        )
    })
    it('should fail to call function recursively', function () {
        assert.deepEqual(
            P.parse('g(x, y) = g(x, y)').getData().flatMap(s => E.evalDef(<S.Def>s) ),
            right("関数'g'を定義しました。")
        )
        assert.deepEqual(
            P.parse('g(1, 2)').getData().flatMap(s => E.evalExprPM(<S.ExprPM>s) ),
            left("関数'g'は再帰的に呼び出すことはできません。")
        )
    })
})
