
/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import {Stack, stack, cons, nil} from "../src/Stack"

describe('stack', function () {
    it('stack 1', function () {
        assert.deepEqual(
            stack<number>(),
            nil<number>()
        )
    })
    it('stack 2', function () {
        assert.deepEqual(
            stack(1, 2, 3),
            cons(1, cons(2, cons(3, nil<number>())))
        )
    })
})

describe('stack size', function () {
    it('size 1', function () {
        assert.deepEqual(
            stack(1).size(),
            1
        )
    })
    it('size 2', function () {
        assert.deepEqual(
            stack(1, 2, 3).size(),
            3
        )
    })
})

describe('stack map', function () {
    it('map 1', function () {
        assert.deepEqual(
            stack(1, 2, 3).map( x => x * 2 ),
            stack(2, 4, 6)
        )
    })
})

describe('stack flatMap', function () {
    it('flatMap 1', function () {
        assert.deepEqual(
            stack(stack(1,2), stack(3,4), stack(5,6)).flatMap( x => x ),
            stack(1, 2, 3, 4, 5, 6)
        )
    })
})

describe('stack concat', function () {
    it('concat 1', function () {
        assert.deepEqual(
            stack(1, 2, 3).concat(stack(4, 5, 6)),
            stack(1, 2, 3, 4, 5, 6)
        )
    })
})
