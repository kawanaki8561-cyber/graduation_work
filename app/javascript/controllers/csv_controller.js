// app/javascript/controllers/csv_controller.js
import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"

export default class extends Controller {
  static targets = [ "output" ] 

  parse(event) {
    const file = event.target.files.item(0); 
    if (!file) return;

    this.outputTarget.textContent = "解析中...";

    Papa.parse(file, {
      header: true,          // 1行目をキー（プロパティ名）として使用する
      dynamicTyping: true,   // idや測定値を自動的に数値型(Number)に変換する
      worker: false,         // メインスレッドで安全に処理する
      skipEmptyLines: true,  // 末尾の空行などを無視する
      
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

        // 成功した場合、綺麗にフォーマットされたJSONが出力されます
        this.outputTarget.textContent = JSON.stringify(results.data, null, 2);
      },
      
      error: (error) => {
        this.outputTarget.textContent = "CSVの読み込みに失敗しました。";
        console.error("CSV解析エラー:", error);
      }
    });
  }
}