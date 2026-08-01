// app/javascript/controllers/spc_chart_controller.js
import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"

// ① 切り出した2つのモジュールをインポート
import SpcCalculator from "../utils/spc_calculator"
import ChartRenderer from "../utils/chart_renderer"

export default class extends Controller {
  static targets = [ "output", "select", "mean", "stddev", "ucl", "lcl", "outliers", "canvas" ]

  connect() {
    this.csvData = [];
    // 描画モジュールの初期化（対象のCanvasを渡す）
    this.chartRenderer = new ChartRenderer(this.canvasTarget.getContext('2d'));
  }

  // ファイル読み込みとパース
  handleFileUpload(event) {
    const file = event.target.files.item(0);
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        this.csvData = results.data;
        if (this.csvData.length > 0) {
          const fields = Object.keys(this.csvData[0]);
          this.buildSelectOptions(fields);
        }
      }
    });
  }

  // セレクトボックスの生成
  buildSelectOptions(fields) {
    this.selectTarget.innerHTML = '<option value="">カラムを選択してください</option>';
    fields.forEach(field => {
      const option = document.createElement('option');
      option.value = field;
      option.textContent = field;
      this.selectTarget.appendChild(option);
    });
  }

  // セレクトボックス変更時に実行されるメイン処理
  extractData(event) {
    const selectedColumn = event.target.value;
    if (!selectedColumn) return;

    // データの抽出
    const columnData = this.csvData.map(row => row[selectedColumn]);
    
    // ② 計算モジュールへ処理を委譲
    const spcResults = SpcCalculator.calculate(columnData);
    if (!spcResults) return;

    // ③ View(DOM) の更新（メソッドに切り出し）
    this.updateDom(spcResults);

    // ④ グラフ描画モジュールへ処理を委譲
    this.chartRenderer.draw(spcResults);
  }

  // ③のDOM更新メソッド：受け取った計算結果を各Targetに反映する
  updateDom({ cl, sigma, ucl, lcl, outlierIndices }) {
    if (this.hasMeanTarget) this.meanTarget.textContent = cl.toFixed(3);
    if (this.hasStddevTarget) this.stddevTarget.textContent = sigma.toFixed(3);
    if (this.hasUclTarget) this.uclTarget.textContent = ucl.toFixed(3);
    if (this.hasLclTarget) this.lclTarget.textContent = lcl.toFixed(3);
    
    if (this.hasOutliersTarget) {
      this.outliersTarget.textContent = outlierIndices.length > 0 ? outlierIndices.join(', ') : "なし";
    }
  }
}