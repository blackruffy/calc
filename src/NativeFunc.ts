
/**
 * ネイティブな関数を表現する。
 */
export class NativeFunc {
    private nargs: number;
    private func: (args: Array<number>) => number;
    constructor( nargs: number, func: (args: Array<number>) => number ) {
        this.nargs = nargs
        this.func = func
    }

    getNArgs(): number {
        return this.nargs
    }
    
    eval( args: Array<number> ): number {
        return this.func( args )
    }
}
