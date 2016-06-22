
import { Maybe, Just, Nothing } from "./Maybe"
import { Either, Left, Right } from "./Either"
import { ExprPM,
         MDExprPM,
         PlusExprPM,
         MinusExprPM,
         ExprMD,
         TermExprMD,
         MultExprMD,
         DivExprMD,
         ModExprMD,
         Num,
         Var,
         Def,
         Defvar,
         Defun,
         FunCall,
         Fact,
         FuncFact,
         VarFact,
         NumFact,
         ExprFact,
         NegFact,
         Term,
         FactTerm,
         PowTerm
       } from "./CalcStructure"
import { Stack, stack, cons, nil } from "./Stack"
import { CalcFrame, emptyFrame } from "./CalcFrame"
import { SMap, emptySMap } from "./SMap"
import { Unit, unit } from "./Unit"
import { NativeFunc } from "./NativeFunc"

export type FrameType = Number | number | NativeFunc | Num | Defun
export type StackType = Stack<CalcFrame<FrameType>>

/**
 * 変数や関数を保持するスタック。
 */
export class CallStack {

    private static defaultFrame = new CalcFrame<FrameType>(
        new SMap<FrameType>({
            PI: Math.PI,
            E: Math.E,
            abs: new NativeFunc( 1, args => Math.abs.apply(null, args) ),
            sin: new NativeFunc( 1, args => Math.sin.apply(null, args) ),
            cos: new NativeFunc( 1, args => Math.cos.apply(null, args) ),
            tan: new NativeFunc( 1, args => Math.tan.apply(null, args) ),
            log: new NativeFunc( 1, args => Math.log.apply(null, args) ),
            exp: new NativeFunc( 1, args => Math.exp.apply(null, args) ),
            sqrt: new NativeFunc( 1, args => Math.sqrt.apply(null, args) ),
        }),
        new Nothing<string>()
    )
    
    private static cstack: StackType = stack(
        new CalcFrame<FrameType>( emptySMap<FrameType>(), new Nothing<string>() ),
        CallStack.defaultFrame
    )

    /**
     * スタックを取得する。
     */
    static getStack(): StackType {
        return CallStack.cstack;
    }

    /**
     * スタックをクリアする。
     */
    static clearStack(): void {
        CallStack.cstack = stack(
            new CalcFrame<FrameType>( emptySMap<FrameType>(), new Nothing<string>() ),
            CallStack.defaultFrame
        )
    }
    
    /**
     * 変数や関数をスタックから探す。
     */
    private static _findVar( name: string, cstack: StackType ): Maybe<FrameType> {
        if( cstack.head().isNothing() ) return new Nothing<FrameType>()
        else return cstack
            .head()
            .flatMap( f => f.getVars().get(name) )
            .orElse( () => CallStack._findVar( name, cstack.tail() ) )
    }

    /**
     * 指定した変数や関数を取得する。
     */
    static findVar( name: string ): Maybe<FrameType> {
        return CallStack._findVar( name, CallStack.cstack )
    }

    private static _findCallee( name: string, cstack: StackType ): Maybe<string> {
        if( cstack.head().isNothing() ) return new Nothing<string>()
        else return cstack
            .head()
            .flatMap( f => f.getCallee()
                      .flatMap( n => {
                          if( n == name )
                              return new Just(name)
                          else
                              return new Nothing<string>()
                      } ) )
            .orElse( () => CallStack._findCallee( name, cstack.tail() ) )
    }

    /**
     * 呼び出されている関数を取得する。
     */
    static findCallee( name: string ): Maybe<string> {
        return CallStack._findCallee( name, CallStack.cstack )
    }

    /**
     * フレームを先頭に追加する。
     */
    static push( frame: CalcFrame<FrameType> ): void {
        CallStack.cstack = cons(frame
                                , CallStack.cstack)
    }

    /**
     * 先頭のフレームを取り出す。
     */
    static pop(): Maybe<CalcFrame<FrameType>> {
        const h = CallStack.cstack.head()
        CallStack.cstack = CallStack.cstack.tail()
        return h
    }
}
