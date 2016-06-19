/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import * as Parser from "../src/ParserCombinator"
import { CharStream } from "../src/ParserStream"
import { Result, Failure } from "../src/ParserResult"
import { Either, Right, Left } from "../src/Either"
import { Unit, unit } from "../src/Unit"

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

describe('char parser', function () {
    it('parse a charactor 1', function () {
        assert.deepEqual(
            runParser(Parser.char('a'), 'a'),
            right('a')
        )
    })
    it('parse a charactor 2', function () {
        assert.deepEqual(
            runParser(Parser.char('a'), 'b'),
            left('bではなくaではありませんか？')
        )
    })
    it('parse a charactor 3', function () {
        const r = Parser.char('a').parse(new CharStream('abc'))
        assert(r.getStream().toString(), 'bc')
    })
})

describe('string parser', function () {
    it('parse string 1', function () {
        assert.deepEqual(
            runParser(Parser.str('hello'), 'hello world'),
            right('hello')
        )
    })
    it('parse string 2', function () {
        const r = Parser.str('hoge').rollback().parse(new CharStream('hello world'))
        assert.equal(
            r.getData().getLeftOrElse(() => 'error'),
            "hoge: eではなくoではありませんか？"
        )
        assert.equal(
            r.getStream().position().getCount(),
            0
        )
    })
})

describe('parse one of charactors', function () {
    it('oneOf 1', function () {
        assert.deepEqual(
            runParser(Parser.oneOf('abcd'), 'a'),
            right('a')
        )
    })
    it('oneOf 2', function () {
        assert.deepEqual(
            runParser(Parser.oneOf('abcd'), 'f'),
            left('fではなくabcdの中の１文字ではありませんか？')
        )
    })
})

describe('parse none of charactors', function () {
    it('noneOf 1', function () {
        assert.deepEqual(
            runParser(Parser.noneOf('abcd'), 'a'),
            left('aではなく「abcd」以外の文字ではありませんか？')
        )
    })
    it('noneOf 2', function () {
        assert.deepEqual(
            runParser(Parser.noneOf('abcd'), 'f'),
            right('f')
        )
    })
})

describe('parse alphabet and digits', function () {
    it('alphabet 1', function () {
        assert.deepEqual(
            runParser(Parser.alphabet(), 'a'),
            right('a')
        )
    })
    it('alphabet 2', function () {
        assert.deepEqual(
            runParser(Parser.alphabet(), '1'),
            left('1ではなくアルファベットではありませんか？')
        )
    })
    it('digit 1', function () {
        assert.deepEqual(
            runParser(Parser.digit(), '2'),
            right('2')
        )
    })
    it('digit 2', function () {
        assert.deepEqual(
            runParser(Parser.digit(), '-'),
            left('-ではなく数字ではありませんか？')
        )
    })
})


describe('parse many', function () {
    it('many 1', function () {
        assert.deepEqual(
            runParser(Parser.digit().many(), '1234abc'),
            right(['1', '2', '3', '4'])
        )
    })
    it('many 2', function () {
        assert.deepEqual(
            runParser(Parser.digit().many(), 'abc'),
            right([])
        )
    })
    it('many 3', function () {
        assert.deepEqual(
            runParser(Parser.digit().many1(), 'abc'),
            left('aではなく数字ではありませんか？')
        )
    })
    it('many 4', function () {
        assert.deepEqual(
            runParser(Parser.digit().many1(), '1234abc'),
            right(['1', '2', '3', '4'])
        )
    })
    it('many 5', function () {
        assert.deepEqual(
            runParser(Parser.digit().manyStr(), '1234abc'),
            right('1234')
        )
    })
    it('many 6', function () {
        assert.deepEqual(
            runParser(Parser.digit().manyStr1(), '1234abc'),
            right('1234')
        )
    })
    it('many 7', function () {
        assert.deepEqual(
            runParser(Parser.digit().many().bind(() => Parser.char('a')), '1234abc'),
            right('a')
        )
    })
    it('many 8', function () {
        assert.deepEqual(
            runParser(Parser.digit().many1().bind(() => Parser.char('a')), '1234abc'),
            right('a')
        )
    })
    it('many 9', function () {
        assert.deepEqual(
            runParser(Parser.digit().manyStr().flatMap(
                x => Parser.char('a').map(
                    y => x + y )), '1234abc'),
            right('1234a')
        )
    })
    it('many 10', function () {
        assert.deepEqual(
            runParser(Parser.digit().manyStr1().flatMap(
                x => Parser.char('a').map(
                    y => x + y)), '1234abc'),
            right('1234a')
        )
    })
    it('many 11', function () {
        assert.deepEqual(
            runParser(Parser.digit().manyStr1(), 'abc'),
            left('aではなく数字ではありませんか？')
        )
    })
})

describe('parse separate by', function () {
    it('sepBy 1', function () {
        assert.deepEqual(
            runParser(Parser.digit().sepBy(() => Parser.char(',')), '1,2,3'),
            right(['1', '2', '3'])
        )
    })
    it('sepBy 2', function () {
        assert.deepEqual(
            runParser(Parser.digit().sepBy(() => Parser.char(',')), '1'),
            right(['1'])
        )
    })
    it('sepBy 3', function () {
        assert.deepEqual(
            runParser(Parser.digit().sepBy(() => Parser.char(',')), ''),
            right([])
        )
    })
    it('sepBy 4', function () {
        assert.deepEqual(
            runParser(Parser.digit().sepBy(() => Parser.char(',')).bind(() => Parser.char('a')), 'abc'),
            right('a')
        )
    })
})

describe('or parser', function () {
    it('or 1', function () {
        assert.deepEqual(
            runParser(Parser.str('abc').or(()  => Parser.str('xyz')), 'abc'),
            right('abc')
        )
    })
    it('or 2', function () {
        assert.deepEqual(
            runParser(Parser.str('abc').or(() => Parser.str('xyz')), 'xyz'),
            left('xyz: yではなくxではありませんか？')
        )
    })
    it('or 3', function () {
        assert.deepEqual(
            runParser(Parser.str('abc').rollback().or(() => Parser.str('xyz')), 'xyz'),
            right('xyz')
        )
    })
})

describe('eof parser', function () {
    it('eof 1', function () {
        assert.deepEqual(
            runParser(Parser.eof<Char>(), ''),
            right(unit)
        )
    })
    it('eof 2', function () {
        assert.deepEqual(
            runParser(Parser.eof<Char>(), 'abc'),
            left('ストリームの最後に達していません。')
        )
    })
})
