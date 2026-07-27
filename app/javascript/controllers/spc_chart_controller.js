import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"
import { mean, standardDeviation } from "simple-statistics" 
import Chart from 'chart.js/auto';

// Connects to data-controller="spc-chart"

export default class extends Controller {
  // "output" と "select" のターゲットを定義
  
static targets = [ "output", "select", "mean", "stddev", "ucl", "lcl", "outliers" ]  
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
  
    
  // 【STEP 4 で追加】セレクトボックス変更時にデータ配列を抽出するメソッド
  extractData(event){
    // 選択されたセレクトボックスの値（カラム名）を取得
    const selectedColumn = event.target.value; 

    // 「カラムを選択してください」などの空の値が選ばれた場合は終了
    if (!selectedColumn) return;

    // 保持している this.csvData から、選択されたカラムの値だけを抽出して新しい配列を作成
    const columnData = this.csvData.map(row => row[selectedColumn]);

    // 抽出データの確認（ブラウザのコンソールに出力されます）
    console.log(`【${selectedColumn}】の抽出データ:`, columnData);

     // ★修正ポイント3: 抽出したデータを使って計算メソッドを呼び出す
     this.calculateSPC(columnData);

  }

   calculateSPC(dataArray) {
    // 1. 欠損値（null/undefined）や非数値（NaN）を除外して有効なデータの配列を作る
    const validData = dataArray.filter(val => val !== null && val !== undefined && !isNaN(val));

    // 2. データ数が2つ未満の場合は標準偏差が計算できないため中断
    if (validData.length < 2) {
      console.warn("計算に必要なデータ数が不足しています");
      return;
    }

    // 3. 【Step 3】 simple-statistics による平均値と標準偏差の算出
    const cl = mean(validData);
    const sigma = standardDeviation(validData);

    // 算出結果の確認用ログ
    console.log(`平均値(CL): ${cl}, 標準偏差(σ): ${sigma}`);

    // ※ ここに次の Step 4 以降の処理（UCL/LCLの計算と画面出力）を追加していきます
    // 4. 【Step 4】 上方・下方管理限界線（UCL / LCL）の算出 (平均±3σ)
    const ucl = cl + (3 * sigma);
    const lcl = cl - (3 * sigma);
    console.log(`UCL(+3σ): ${ucl}, LCL(-3σ): ${lcl}`);

    // 5. 【Step 5】 外れ値の判定ループ処理
    const outlierIndices = [];
    validData.forEach((value, index) => {
      if (value > ucl || value < lcl) {
        outlierIndices.push(index);
      }
    });
    
    // 6. 画面（ViewのTarget）への結果出力（小数点第3位まで表示）
    if (this.hasMeanTarget) this.meanTarget.textContent = cl.toFixed(3);
    if (this.hasStddevTarget) this.stddevTarget.textContent = sigma.toFixed(3); // stddevターゲットに出力
    if (this.hasUclTarget) this.uclTarget.textContent = ucl.toFixed(3);
    if (this.hasLclTarget) this.lclTarget.textContent = lcl.toFixed(3);
    
    // 外れ値の出力
    if (this.hasOutliersTarget) {
      this.outliersTarget.textContent = outlierIndices.length > 0 ? outlierIndices.join(', ') : "なし";
    }
  }
}
