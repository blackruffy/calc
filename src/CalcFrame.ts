import {SMap} from "./SMap"

/**
 * 変数や呼ばれた関数を保持するクラス。
 * @param <A> 変数の型
 */
export class CalcFrame<A> {
    private vars: SMap<A>;
    private callees: SMap<string>;
    constructor( vars: SMap<A>, callees: SMap<string> ) {
        this.vars = vars
        this.callees = callees
    }

    getVars(): SMap<A> {
        return this.vars;
    }

    getCallees(): SMap<string> {
        return this.callees;
    }
}
