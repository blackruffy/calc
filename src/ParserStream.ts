
import { Maybe, Just, Nothing } from "./Maybe"
import { Position } from "./Position"

type Char = string

export interface Stream<A> {
    head(): Maybe<A>;
    tail(): Stream<A>;
    position(): Position
}

export class CharStream implements Stream<Char> {
    private doc: string
    private index: number
    private row: number
    private col: number
    
    constructor( doc: string, index: number = 0, row: number = 0, col: number = 0 ) {
        this.doc = doc
        this.index = index
        const nl = isNewLine(doc, index)
        this.row = nl ? row + 1 : row
        this.col = nl ? 1 : col
    }

    head(): Maybe<Char> {
        if( this.index < this.doc.length ) return new Just( this.doc[this.index] )
        else return new Nothing<Char>()
    }
    
    tail() {
        return new CharStream(this.doc,
                              this.index + 1,
                              this.row,
                              this.col + 1)
    }
    
    position() {
        return new Position(this.row, this.col, this.index, getLine( this.doc, this.index - this.col + 1 ) )
    }

    toString() {
        return this.doc.slice(this.index)
    }
    
}

function isNewLine( doc: string, index: number ): boolean {
    if( index > 0 ) {
        const c = doc[index-1]
        return c == "\n" || c == "\r"
    }
    else return false;
}

function getLine( doc: string, index: number ): string {
    var i = index < 0 ? 0 : index
    var c = doc[i]
    var s = ""
    while( i < doc.length && c != "\n" ) {
        s += c
        i++
        c = doc[i]
    }
    return s
}
