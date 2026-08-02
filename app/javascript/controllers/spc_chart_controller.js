// app/javascript/controllers/spc_chart_controller.js
import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"
import SpcCalculator from "../utils/spc_calculator"
import ChartRenderer from "../utils/chart_renderer"

export default class extends Controller {
  static targets = [ "output", "select", "mean", "stddev", "ucl", "lcl", "outliers", "canvas" ]

  connect() {
    this.csvData = []
    // ChartRenderer のインスタンスを保持する変数
    this.chartRenderer = null
  }

  handleFileUpload(event) {
    const file = event.target.files.item(0);
    if (!file) return;

    this.outputTarget.textContent = "解析中...";

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      worker: false,
      skipEmptyLines: true,
      encoding: "Shift_JIS",

      complete: (results) => {
        console.log("解析完了:", results);

        if (results.errors.length > 0) {
          console.warn("エラー詳細:", results.errors);
          this.outputTarget.textContent = "警告/エラーが発生しました:\n" + JSON.stringify(results.errors, null, 2);
          return;
        }

        this.csvData = results.data;
        this.outputTarget.textContent = JSON.stringify(results.data, null, 2);
        this.buildSelectOptions(results.meta.fields);
      },

      error: (error) => {
        this.outputTarget.textContent = "CSVの読み込みに失敗しました。";
        console.error("CSV解析エラー:", error);
      }
    });
  }

  buildSelectOptions(fields) {
    if (!fields) return;

    this.selectTarget.innerHTML = '<option value="">カラムを選択してください</option>';

    const options = fields.map(field => new Option(field, field));
    options.forEach(option => {
      this.selectTarget.add(option);
    });
  }

  extractData(event) {
    const selectedColumn = event.target.value;
    if (!selectedColumn) return;

    const columnData = this.csvData.map(row => row[selectedColumn]);
    console.log(`【${selectedColumn}】の抽出データ:`, columnData);

    this.processSPC(columnData);
  }

  processSPC(dataArray) {
    // 1. SpcCalculator を使って統計値と外れ値を算出
    const spcResults = SpcCalculator.calculate(dataArray);

    if (!spcResults) {
      console.warn("計算に必要なデータ数が不足しています");
      return;
    }

    const { cl, sigma, ucl, lcl, outlierIndices } = spcResults;

    // 2. 画面（ViewのTarget）へ結果を出力
    if (this.hasMeanTarget) this.meanTarget.textContent = cl.toFixed(3);
    if (this.hasStddevTarget) this.stddevTarget.textContent = sigma.toFixed(3);
    if (this.hasUclTarget) this.uclTarget.textContent = ucl.toFixed(3);
    if (this.hasLclTarget) this.lclTarget.textContent = lcl.toFixed(3);

    if (this.hasOutliersTarget) {
      this.outliersTarget.textContent = outlierIndices.length > 0 ? outlierIndices.join(', ') : "なし";
    }

    // 3. ChartRenderer を使ってグラフを描画
    if (this.hasCanvasTarget) {
      const ctx = this.canvasTarget.getContext('2d');
      this.chartRenderer = new ChartRenderer(ctx);
      this.chartRenderer.draw(spcResults);
    }
  }
}