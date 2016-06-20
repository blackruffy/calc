
import { evaluate, clearStack } from "./CalcProcessor"

/** 計算式の履歴を保持する配列 */
let hist: Array<string> = []

/**
 * エントリーポイント。
 */
window.onload = () => {

    // クリアボタン押下時に、スタックや履歴をクリアする。
    document.getElementById("clear-btn").addEventListener("click", ev => {
        clearStack()
        hist = []
        document.getElementById("main").innerHTML = ""
        mkSection(1)
    })

    // ウインドウのサイズが変更された時の動作
    window.addEventListener("resize", ev => {
        resize();
    })

    // 最初の入力フィールドを作成する。
    mkSection(1)

    // 表示サイズ調整
    resize()
}

/**
 * 表示を画面サイズに合わせる。
 */
function resize(): void {
    const header = document.getElementById("header")
    const main = document.getElementById("main")

    const mainHeight = window.innerHeight - header.clientHeight - 10
    main.style.height = mainHeight + "px"

    const iwidth = window.innerWidth - document.getElementsByClassName("input-head")[0].clientWidth - 30
    const its = document.getElementsByClassName("input-text")
    for( let i=0; i<its.length; i++ ) {
        (<HTMLElement>its[i]).style.width = iwidth + "px"
    }
    const ots = document.getElementsByClassName("output-text")
    for( let i=0; i<ots.length; i++ ) {
        (<HTMLElement>ots[i]).style.width = iwidth + "px"
    }
    const ets = document.getElementsByClassName("error-text")
    for( let i=0; i<ets.length; i++ ) {
        (<HTMLElement>ets[i]).style.width = iwidth + "px"
    }
}

/**
 * 計算式を入力する要素を作成する。
 */
function mkSection( idx: number ): void {
    const main = document.getElementById("main")
    const self = document.createElement("div")
    self.innerHTML = `
    <div class="section">
      
      <div id="input-line${idx}" class="input-line">
        <div class="input-head">入力${idx}</div>
        <div class="input-body">
          <input type="text" id="input-text${idx}" class="input-text" placeholder="計算式を入力してください。"></input>
        </div>
      </div>
      
      <div id="progress-line${idx}" class="progress-line">
        <span>計算中・・・<span>
      </div>

      <div id="output-line${idx}" class="output-line">
        <div class="output-head">出力${idx}</div>
        <div class="output-body">
          <input type="text" id="output-text${idx}" class="output-text" disabled="true"></input>
        </div>
      </div>

      <div id="error-line${idx}" class="error-line">
        <div class="error-head">エラー${idx}</div>
        <div class="error-body">
          <input type="text" id="error-text${idx}" class="error-text"  disabled="true"></input>
        </div>
      </div>
      
    </div>
`
    main.appendChild(self)
    resize()
    
    const input = <HTMLInputElement>document.getElementById(`input-text${idx}`)
    input.focus()

    let currIdx = idx
    
    input.addEventListener("keydown", ev => {
        // 上ボタンで前の履歴を参照する
        if( ev.which == 38 ) {
            if( currIdx > 1 ) {
                currIdx--
                input.value = hist[currIdx]
            }
        }
        // 下ボタンで次の履歴を参照する
        else if( ev.which == 40 ) {
            if( currIdx < idx - 1 ) {
                currIdx++
                input.value = hist[currIdx]
            }
        }
    })
    
    input.addEventListener("keypress", ev => {
        // エンターキーが押された式を評価する。
        if( ev.which == 13 ) {
            const src = input.value.trim()
            hist[idx] = src
            const outputLine = (<HTMLElement>document.getElementById(`output-line${idx}`))
            const errorLine = (<HTMLElement>document.getElementById(`error-line${idx}`))
            const progLine = (<HTMLElement>document.getElementById(`progress-line${idx}`))

            // エラー処理関数
            const error = (msg: string) => {
                outputLine.style.display = "none";
                errorLine.style.display = "block";
                const output = <HTMLInputElement>document.getElementById(`error-text${idx}`)
                output.value = msg
                main.scrollTop = main.scrollHeight
                resize()
            }
            
            if( src == "" ) error("式が入力されていません。")
            else if( hasMultiBytes( src ) ) error("全角文字は使用できません。")
            else {
                // 「計算中」と表示する
                progLine.style.display = "block";
                outputLine.style.display = "none";
                errorLine.style.display = "none";
                main.scrollTop = main.scrollHeight

                setTimeout(() => {
                    // 計算式をパースして、評価する
                    const r = evaluate(src);
                    
                    progLine.style.display = "none";

                    // 計算式の評価結果が正常な場合
                    if( r.isRight() ) {
                        input.setAttribute("disabled", "true");
                        outputLine.style.display = "block";
                        errorLine.style.display = "none";
                        const output = <HTMLInputElement>document.getElementById(`output-text${idx}`)
                        const o = r.getRightOrElse(() => null)
                        output.value = o.toString()
                        mkSection(idx + 1)
                        main.scrollTop = main.scrollHeight
                        resize()
                    }
                    // エラーの場合
                    else error(r.getLeftOrElse(() => null))
                    
                }, 10)
            }
        }
    })
}

/**
 * マルチバイト文字が含まれているか判定する。
 */
function hasMultiBytes( src: string ): boolean {
    for( let i=0; i<src.length; i++ ) {
        const c = src.charCodeAt(i)
        if( !((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) ) {
            return true
        }
    }
    return false
}
