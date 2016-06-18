
import {Maybe, Just, Nothing} from "./Maybe"

/**
 * スタックを表現するクラス。
 * @param <A> 保持するデータの型。
 */
export interface Stack<A> {
    head(): Maybe<A>;
    tail(): Stack<A>;
    isEmpty(): boolean;
    flatMap<B>( func: (a: A) => Stack<B> ): Stack<B>;
    map<B>( func: (a: A) => B ): Stack<B>;
    concat( xs: Stack<A> ): Stack<A>;
    size(): number;
}

class Cons<A> implements Stack<A> {
    private _head: A;
    private _tail: Stack<A>;
    
    constructor( x: A, xs: Stack<A> ) {
        this._head = x
        this._tail = xs
    }

    head(): Maybe<A> {
        return new Just(this._head);
    }

    tail(): Stack<A> {
        return this._tail;
    }

    isEmpty(): boolean {
        return false;
    }

    flatMap<B>( func: (a: A) => Stack<B> ): Stack<B> {
        return func(this._head).concat(this._tail.flatMap(func))
    }

    map<B>( func: (a: A) => B ): Stack<B> {
        return new Cons(func(this._head), this._tail.map(func))
    }
    
    concat( xs: Stack<A> ): Stack<A> {
        return new Cons(this._head, this._tail.concat(xs))
    }

    size(): number {
        return 1 + this._tail.size()
    }
}

class Nil<A> implements
Stack<A> {

    constructor(){}

    head(): Maybe<A> {
        return new Nothing<A>()
    }

    tail(): Stack<A> {
        return this;
    }

    isEmpty(): boolean {
        return true;
    }
    
    flatMap<B>( func: (a: A) => Stack<B> ): Stack<B> {
        return new Nil<B>();
    }
    
    map<B>( func: (a: A) => B ): Stack<B> {
        return new Nil<B>();
    }
    
    concat( xs: Stack<A> ): Stack<A> {
        return xs;
    }

    size(): number {
        return 0;
    }
}

export function stack<A>( ...xs: Array<A> ): Stack<A> {
    if( xs.length == 0 ) return nil<A>()
    else return cons<A>(xs[0], stack<A>(...(xs.slice(1))))
}

export function cons<A>( x: A, xs: Stack<A> ): Stack<A> {
    return new Cons( x, xs )
}

export function nil<A>() {
    return new Nil<A>()
}
