// biwascheme_run_logic.js

// BiwaScheme インタープリタのシングルトンインスタンス
let biwaSchemeInterpreter = null;
let biwaSchemeOutputBuffer = ""; // BiwaSchemeのdisplay出力を捕捉するバッファ

// SICPパッチコード (前回のエディタから持ってくる)
const sicpPatch = `(define nil '())
(define true #t)
(define false #f)
(define (random n)
  (random-integer n))
(define (date2runtime date)
  (+  
     (* (date-hour date) 60 60 1000) 
     (* (date-minute date) 60 1000) 
     (* (date-second date) 1000) 
     (date-millisecond date)
  ))
(define (runtime) (date2runtime (current-date)))`;

/**
 * BiwaSchemeインタープリタを初期化（または既存のものを返す）し、SICPパッチを適用します。
 */
async function getOrCreateBiwaSchemeInterpreter() {
    if (biwaSchemeInterpreter) {
        return biwaSchemeInterpreter;
    }

    // 新しいインタープリタを作成
    biwaSchemeInterpreter = new BiwaScheme.Interpreter({
        default_stdout: function(s) {
            biwaSchemeOutputBuffer += s;
        }
    });

    // SICPパッチを適用
    try {
        await Promise.resolve(biwaSchemeInterpreter.evaluate(sicpPatch));
        console.log("BiwaScheme interpreter initialized and SICP patch applied.");
    } catch (e) {
        console.error("Failed to apply SICP patch:", e);
        // エラーをユーザーに通知する方法を検討（例: コンソールに出力、特定の場所に表示）
    }
    return biwaSchemeInterpreter;
}


/**
 * Schemeコードを実行し、結果を整形して返します。
 * @param {string} code 実行するSchemeコード
 * @returns {Promise<string>} 評価結果とdisplay出力を結合した文字列
 */
async function runSchemeCode(code) {
//デバッグコード
console.log("Attempting to run code:", code.substring(0, Math.min(code.length, 50)) + "...");
    const interpreter = await getOrCreateBiwaSchemeInterpreter();
    biwaSchemeOutputBuffer = ""; // 実行前にバッファをクリア

    try {

//デバッグコード
console.log("Before evaluate.");
        const result = await Promise.resolve(interpreter.evaluate(code));
//デバッグコード
console.log("After evaluate. Result:", result);
        
        const capturedOutput = biwaSchemeOutputBuffer;
//デバッグコード
console.log("Captured output:", capturedOutput);
        biwaSchemeOutputBuffer = ""; // 次の実行のためにバッファをクリア

        let resultString = "";
        if (result !== BiwaScheme.undef) {
            if (typeof interpreter.write_to_string === 'function') {
                resultString = interpreter.write_to_string(result);
            } else if (result && typeof result.to_write_string === 'function') {
                resultString = result.to_write_string();
            } else {
                resultString = String(result);
            }
        }

        let combinedOutput = capturedOutput;
        if (resultString && resultString !== "undefined") {
            if (combinedOutput.length > 0 && !combinedOutput.endsWith('\n')) {
                combinedOutput += '\n'; // display出力があった場合で改行がない場合、改行を追加
            }
            combinedOutput += resultString;
        }

        
        return combinedOutput.trim() || "Done (no explicit output)"; // 結果がない場合も分かりやすく
    } catch (e) {
        // エラーオブジェクト全体をログに出力してみる
        console.error("Scheme Evaluation Error caught:", e);
        // エラーのプロパティを個別にログに出力してみる
        if (e.name) console.error("Error name:", e.name);
        if (e.message) console.error("Error message:", e.message);
        if (e.stack) console.error("Error stack:", e.stack);
        if (typeof e === 'object' && e !== null) {
            for (const key in e) {
                if (Object.prototype.hasOwnProperty.call(e, key)) {
                    console.error(`Error property '${key}':`, e[key]);
                }
            }
        }
        return `Error: ${e.message || e.toString() || "Unknown error occurred"}`;
    }
}

// ページのDOMが完全にロードされた後に実行
document.addEventListener('DOMContentLoaded', async () => {
    // BiwaScheme インタープリタを事前に初期化しておく
    await getOrCreateBiwaSchemeInterpreter();

    // すべてのSchemeコードブロックを検索
    const codeBlocks = document.querySelectorAll('pre code.language-scheme');

    codeBlocks.forEach(codeBlock => {
        const preElement = codeBlock.parentNode;
        // mdbookが `scheme,editable` を `class="language-scheme editable"` に変換することを期待
        const isEditable = codeBlock.classList.contains('editable');

        if (isEditable) {
            // codeBlockを直接編集可能にする
            codeBlock.setAttribute('contenteditable', 'true');
            // 編集可能なブロックには視覚的なフィードバックを追加
            codeBlock.style.border = '1px solid #ccc';
            codeBlock.style.padding = '5px';
            codeBlock.style.outline = 'none'; // フォーカス時のアウトラインを消す場合
            // contenteditableがうまく機能するようにスタイルを調整
            // <pre>のwhite-spaceをnormalにすると、コードのインデントが崩れる可能性がある
            // 代わりに、codeBlock自体にスタイルを適用する
            codeBlock.style.whiteSpace = 'pre-wrap'; 
            codeBlock.style.display = 'block';
        }

        // Runボタンを作成
        const runButton = document.createElement('button');
        runButton.textContent = 'Run Scheme';
        runButton.classList.add('run-scheme-button');

        // 出力表示エリアを作成
        const outputArea = document.createElement('pre');
        outputArea.classList.add('scheme-output-area');
        outputArea.textContent = 'Output will appear here...';
        outputArea.style.display = 'none';

        // ボタンのクリックイベントリスナー
        runButton.addEventListener('click', async () => {
            outputArea.textContent = 'Running...';
            outputArea.style.display = 'block';
            
            // 常に現在のtextContentを取得すれば、編集可能な場合もそうでない場合も対応できる
            const codeToRun = codeBlock.textContent;
            
            const result = await runSchemeCode(codeToRun);
            outputArea.textContent = result;
        });

        // ボタンと出力エリアをコードブロックのすぐ下に挿入
        preElement.insertAdjacentElement('afterend', outputArea);
        preElement.insertAdjacentElement('afterend', runButton);
    });
});