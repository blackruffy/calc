
/**
 * ネイティブな関数を表現する。
 */
export class NativeFunc {
    private func: (args: Array<number>) => number
    constructor( func: (args: Array<number>) => number ) {
        this.func = func
    }
    
    eval( args: Array<number> ): number {
        return this.func( args )
    }
}
