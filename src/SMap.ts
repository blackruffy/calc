
import {Maybe, Just, Nothing} from "./Maybe"

/**
 * キーが文字列のマップ。
 * @param <B> 値の型 
 */
export class SMap<B> {
    private obj: Object;
    
    constructor( o: Object ) {
        this.obj = o;
    }

    get( key: string ): Maybe<B> {
        const v: B = (<any>this.obj)[key]
        return v ? new Just(v) : new Nothing<B>()
        
    }

    set( key: string, value: B ): void {
        (<any>this.obj)[key] = value
    }
    
}
