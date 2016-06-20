
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

    /**
     * 引数の数を取得する。
     */
    getNArgs(): number {
        return this.nargs
    }

    /**
     * ネイティブ関数を評価する。
     */
    eval( args: Array<number> ): number {
        return this.func( args )
    }
}
