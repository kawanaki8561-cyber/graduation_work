// app/javascript/controllers/spc_chart_controller.js
import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"
import SpcCalculator from "../utils/spc_calculator"
import ChartRenderer from "../utils/chart_renderer"

export default class extends Controller {
  // 【変更】targets に "selectedColumnName" を追加
  static targets = [ "select", "selectedColumnName", "mean", "stddev", "ucl", "lcl", "test1Outliers", "test3Outliers", "canvas" ]

  connect() {
    this.csvData = []
    this.chartRenderer = null
  }

  handleFileUpload(event) {
    const file = event.target.files.item(0);
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      worker: false,
      skipEmptyLines: true,
      encoding: "Shift_JIS",

      complete: (results) => {
        console.log("解析完了:", results);

        if (results.errors.length > 0) {
          console.warn("警告/エラー詳細:", results.errors);
          return;
        }

        this.csvData = results.data;
        this.buildSelectOptions(results.meta.fields);
      },

      error: (error) => {
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
    
    // 【追加】選択された項目名を HTML へ反映（未選択の場合は「未選択」）
    if (this.hasSelectedColumnNameTarget) {
      this.selectedColumnNameTarget.textContent = selectedColumn || "未選択";
    }

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

    const { cl, sigma, ucl, lcl, outlierIndices, test3Indices } = spcResults;

    // 2. 画面（ViewのTarget）へ結果を出力
    if (this.hasMeanTarget) this.meanTarget.textContent = cl.toFixed(3);
    if (this.hasStddevTarget) this.stddevTarget.textContent = sigma.toFixed(3);
    if (this.hasUclTarget) this.uclTarget.textContent = ucl.toFixed(3);
    if (this.hasLclTarget) this.lclTarget.textContent = lcl.toFixed(3);

    // TEST1 異常件数の表示
    if (this.hasTest1OutliersTarget) {
      const count1 = outlierIndices.length;
      if (count1 > 0) {
        this.test1OutliersTarget.textContent = `${count1}件`;
        this.test1OutliersTarget.className = "fs-4 fw-bold text-danger";
      } else {
        this.test1OutliersTarget.textContent = "0件（正常）";
        this.test1OutliersTarget.className = "fs-4 fw-bold text-success";
      }
    }

    // TEST3 異常件数の表示
    if (this.hasTest3OutliersTarget) {
      const count3 = test3Indices.length;
      if (count3 > 0) {
        this.test3OutliersTarget.textContent = `${count3}件`;
        this.test3OutliersTarget.className = "fs-4 fw-bold text-danger";
      } else {
        this.test3OutliersTarget.textContent = "0件（正常）";
        this.test3OutliersTarget.className = "fs-4 fw-bold text-success";
      }
    }

    // 3. ChartRenderer を使ってグラフを描画
    if (this.hasCanvasTarget) {
      const ctx = this.canvasTarget.getContext('2d');
      this.chartRenderer = new ChartRenderer(ctx);
      this.chartRenderer.draw(spcResults);
    }
  }

  disconnect() {
    if (this.chartRenderer && this.chartRenderer.chartInstance) {
      this.chartRenderer.chartInstance.destroy();
    }
  }
}