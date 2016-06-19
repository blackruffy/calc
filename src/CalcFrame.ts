import {SMap, emptySMap} from "./SMap"
import {Maybe, Just, Nothing} from "./Maybe"

/**
 * 変数や呼ばれた関数を保持するクラス。
 * @param <A> 変数の型
 */
export class CalcFrame<A> {
    private vars: SMap<A>;
    private callee: Maybe<string>;
    constructor( vars: SMap<A>, callee: Maybe<string> ) {
        this.vars = vars
        this.callee = callee
    }

    getVars(): SMap<A> {
        return this.vars;
    }

    getCallee(): Maybe<string> {
        return this.callee;
    }

    setCallee( name: string ): void {
        this.callee = new Just(name)
    }
}

export function emptyFrame<A>(): CalcFrame<A> {
    return new CalcFrame<A>( emptySMap<A>(), new Nothing<string>() )
}
