// app/javascript/controllers/csv_controller.js
import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"

export default class extends Controller {
  // HTML側の data-csv-target="output" と紐付け
  static targets = [ "output" ] 

  parse(event) {
    // 選択された単一のファイルオブジェクトを取得
    const file = event.target.files; 
    if (!file) return;

    this.outputTarget.textContent = "解析中...";

    // PapaParseでローカルファイルを直接解析 [2, 4]
    Papa.parse(file, {
      header: true,          // 1行目をヘッダー（キー）として扱う [5, 6]
      dynamicTyping: true,   // 数値やブール値を自動的に適切な型に変換する [5, 6]
      worker: true,          // Webワーカーを使用し、大容量ファイルでもUIをフリーズさせない [3, 7]
      skipEmptyLines: true,  // 空行をスキップする [8, 9]
      
      // 解析完了時の非同期コールバック [2, 4]
      complete: (results) => {
        console.log("解析完了:", results);
        
        // エラーハンドリング（クォーテーションの欠落などがあればエラー配列に格納されます）[10, 11]
        if (results.errors.length > 0) {
          this.outputTarget.textContent = "警告/エラーが発生しました:\n" + JSON.stringify(results.errors, null, 2);
          return;
        }

        // 解析されたJSONデータを画面に出力 (results.data に配列として格納されます) [10, 12]
        this.outputTarget.textContent = JSON.stringify(results.data, null, 2);
      },
      
      // ファイル読み込み自体のエラー処理 [5, 6]
      error: (error) => {
        this.outputTarget.textContent = "CSVの読み込みに失敗しました。";
        console.error("CSV解析エラー:", error);
      }
    });
  }
}