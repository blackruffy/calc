
export class Position {
    private row: number
    private col: number
    private count: number
    private line: string
    
    constructor( row: number, col: number, count: number, line: string) {
        this.row = row;
        this.col = col;
        this.count = count;
        this.line = line;
    }

    getRow(): number {
        return this.row;
    }

    getColumn(): number {
        return this.col;
    }

    getCount(): number {
        return this.count;
    }

    getLine(): string {
        return this.line;
    }
    
    toString(): string {
        return `Position(${this.row}, ${this.col}, ${this.count}, ${this.line})`
    }
}


