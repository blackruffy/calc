/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import { Either, Right, Left } from "../src/Either"
import * as E from "../src/CalcProcessor"
import * as P from "../src/CalcParser"
import { unit } from "../src/Unit"

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
            right(new Number(Math.PI))
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
})
