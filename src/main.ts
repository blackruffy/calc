
import { evaluate, clearStack } from "./CalcProcessor"

window.onload = () => {
    
    document.getElementById("clear-btn").addEventListener("click", ev => {
        clearStack()
        document.getElementById("main").innerHTML = ""
        mkSection(1)
    })

    
    document.getElementById("header-help").addEventListener("click", ev => {
        location.href = "https://github.com/blackruffy/calc/wiki/%E4%BD%BF%E3%81%84%E6%96%B9"
    })
    
    window.addEventListener("resize", ev => {
        resize();
    })
    
    mkSection(1)

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
        
    input.addEventListener("keypress", ev => {
        if( ev.which == 13 ) {
            const src = input.value.trim()
            const outputLine = (<HTMLElement>document.getElementById(`output-line${idx}`))
            const errorLine = (<HTMLElement>document.getElementById(`error-line${idx}`))
            const progLine = (<HTMLElement>document.getElementById(`progress-line${idx}`))

            if( src == "" ) {
                outputLine.style.display = "none";
                errorLine.style.display = "block";
                const output = <HTMLInputElement>document.getElementById(`error-text${idx}`)
                output.value = "式が入力されていません。"
                main.scrollTop = main.scrollHeight
                resize()
            }
            else if( hasMultiBytes( src ) ) {
                outputLine.style.display = "none";
                errorLine.style.display = "block";
                const output = <HTMLInputElement>document.getElementById(`error-text${idx}`)
                output.value = "全角文字は使用できません。"
                main.scrollTop = main.scrollHeight
                resize()
            }
            else {
                progLine.style.display = "block";
                outputLine.style.display = "none";
                errorLine.style.display = "none";

                setTimeout(() => {
                    const r = evaluate(src);
                    
                    progLine.style.display = "none";
                    
                    if( r.isRight() ) {
                        input.setAttribute("disabled", "true");
                        outputLine.style.display = "block";
                        errorLine.style.display = "none";
                        const output = <HTMLInputElement>document.getElementById(`output-text${idx}`)
                        const o = r.getRightOrElse(() => null)
                        output.value = o.toString()
                        mkSection(idx + 1)
                    }
                    else {
                        outputLine.style.display = "none";
                        errorLine.style.display = "block";
                        const output = <HTMLInputElement>document.getElementById(`error-text${idx}`)
                        const o = r.getLeftOrElse(() => null)
                        output.value = o
                    }
                    main.scrollTop = main.scrollHeight
                    resize()
                }, 0)
            }
        }
    })
}

function hasMultiBytes( src: string ): boolean {
    for( let i=0; i<src.length; i++ ) {
        const c = src.charCodeAt(i)
        if( !((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) ) {
            return true
        }
    }
    return false
}
