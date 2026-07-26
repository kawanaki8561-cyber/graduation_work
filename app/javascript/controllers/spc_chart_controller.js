import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"

// Connects to data-controller="spc-chart"

export default class extends Controller {
  // "output" と "select" のターゲットを定義
  static targets = [ "output","select" ] 

  //コントローラー接続時にCSVデータを保持するための変数を初期化
  connect(){
    this.csvData = []
  }

  handleFileUpload(event) {
    const file = event.target.files.item(0); 
    if (!file) return;

    this.outputTarget.textContent = "解析中...";

    Papa.parse(file, {
      header: true,          // 1行目をキー（プロパティ名）として使用する
      dynamicTyping: true,   // idや測定値を自動的に数値型(Number)に変換する
      worker: false,         // メインスレッドで安全に処理する
      skipEmptyLines: true,  // 末尾の空行などを無視する
      encoding: "Shift_JIS",   // Shift_JISを正しく読み込む
      
      // ※もしExcelで保存したShift-JISのCSVで文字化けする場合は、
      // 以下のコメントアウトを外してエンコーディングを指定してください
      // encoding: "Shift_JIS", 

      complete: (results) => {
        console.log("解析完了:", results);
        
        if (results.errors.length > 0) {
          console.warn("エラー詳細:", results.errors);
          this.outputTarget.textContent = "警告/エラーが発生しました:\n" + JSON.stringify(results.errors, null, 2);
          return;
        }
        // 後でデータを抽出できるように、パース結果のデータをクラス変数に保持
        this.csvData = results.data;

        // 成功した場合、綺麗にフォーマットされたJSONが出力されます
        this.outputTarget.textContent = JSON.stringify(results.data, null, 2);

        // ヘッダー情報の配列(results.meta.fields)を渡してセレクトボックスを構築
        this.buildSelectOptions(results.meta.fields);

      },
      
      error: (error) => {
        this.outputTarget.textContent = "CSVの読み込みに失敗しました。";
        console.error("CSV解析エラー:", error);
      }
    });
  }

  //セレクトボックスの選択肢（<option>）を動的生成するメソッド
  buildSelectOptions(fields){
    if(!fields) return;

    this.selectTarget.innerHTML = '<option value="">カラムを選択してください</option>';

    // Array.prototype.map() を使い、カラム名から新しい Option 要素の配列を生成
    const options = fields.map(field => new Option(field, field));

    // 生成した Option 要素を <select> ターゲットに追加
    options.forEach(option => {
      this.selectTarget.add(option);
    });

  }
  
}
