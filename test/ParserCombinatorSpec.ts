/// <reference path="../typings/index.d.ts" />

import * as assert from "assert"
import * as Parser from "../src/ParserCombinator"
import { CharStream } from "../src/ParserStream"
import { Result, Failure } from "../src/ParserResult"

type Char = string

function runParser<B>( p: Parser.CharParser<B>, doc: string ): B {
    return p.parse(new CharStream(doc)).getDataOrElse(() => null)
}

describe('char parser', function () {
    it('parse a charactor 1', function () {
        assert.equal(
            runParser(Parser.char('a'), 'a'),
            'a'
        )
    })
    it('parse a charactor 2', function () {
        assert.equal(
            runParser(Parser.char('a'), 'b'),
            null
        )
    })
    it('parse a charactor 3', function () {
        const r = Parser.char('a').parse(new CharStream('abc'))
        assert(r.getStream().toString(), 'bc')
    })
})

describe('string parser', function () {
    it('parse string 1', function () {
        assert.equal(
            runParser(Parser.str('hello'), 'hello world'),
            'hello'
        )
    })
    it('parse string 2', function () {
        const r = Parser.str('hoge').rollback().parse(new CharStream('hello world'))
        assert.equal(
            (<Failure<Char, string>>r).getMessage(),
            "hoge: expected o but e was found"
        )
        assert.equal(
            r.getStream().position().getCount(),
            0
        )
    })
})

describe('parse one of charactors', function () {
    it('oneOf 1', function () {
        assert.equal(
            runParser(Parser.oneOf('abcd'), 'a'),
            'a'
        )
    })
    it('oneOf 2', function () {
        assert.equal(
            runParser(Parser.oneOf('abcd'), 'f'),
            null
        )
    })
})

describe('parse none of charactors', function () {
    it('noneOf 1', function () {
        assert.equal(
            runParser(Parser.noneOf('abcd'), 'a'),
            null
        )
    })
    it('noneOf 2', function () {
        assert.equal(
            runParser(Parser.noneOf('abcd'), 'f'),
            'f'
        )
    })
})

describe('parse alphabet and digits', function () {
    it('alphabet 1', function () {
        assert.equal(
            runParser(Parser.alphabet(), 'a'),
            'a'
        )
    })
    it('alphabet 2', function () {
        assert.equal(
            runParser(Parser.alphabet(), '1'),
            null
        )
    })
    it('digit 1', function () {
        assert.equal(
            runParser(Parser.digit(), '2'),
            '2'
        )
    })
    it('digit 2', function () {
        assert.equal(
            runParser(Parser.digit(), '-'),
            null
        )
    })
})


describe('parse many', function () {
    it('many 1', function () {
        assert.deepEqual(
            runParser(Parser.digit().many(), '1234abc'),
            ['1', '2', '3', '4']
        )
    })
    it('many 2', function () {
        assert.deepEqual(
            runParser(Parser.digit().many(), 'abc'),
            []
        )
    })
    it('many 3', function () {
        assert.deepEqual(
            runParser(Parser.digit().many1(), 'abc'),
            null
        )
    })
    it('many 4', function () {
        assert.deepEqual(
            runParser(Parser.digit().many1(), '1234abc'),
            ['1', '2', '3', '4']
        )
    })
    it('many 5', function () {
        assert.equal(
            runParser(Parser.digit().manyStr(), '1234abc'),
            '1234'
        )
    })
    it('many 6', function () {
        assert.equal(
            runParser(Parser.digit().manyStr1(), '1234abc'),
            '1234'
        )
    })
})
