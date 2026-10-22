// app/javascript/controllers/spc_chart_controller.js
import { Controller } from "@hotwired/stimulus"
import Papa from "papaparse"
// import SpcCalculator from "../utils/spc_calculator"
// import ChartRenderer from "../utils/chart_renderer"
import SpcCalculator from "utils/spc_calculator"
import ChartRenderer from "utils/chart_renderer"
import DemoUploader from "utils/demo_uploader"
import AnalysisCalculator from "utils/analysis_calculator"

export default class extends Controller {
  // 【変更】targets に "selectedColumnName" を追加
  static targets = [ "select", "selectedColumnName", "mean", "stddev", "ucl", "lcl", "test1Outliers", "test3Outliers", "canvas", "histogramCanvas", "usl", "lsl", "cpk", "cp" ]

  connect() {
    this.csvData = []
    this.chartRenderer = null
    // this.buildDemonstration()
    // document.addEventListener('turbo:load', this.buildDemonstration);
    // document.addEventListener('DOMContentLoaded', this.buildDemonstration);
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
        alert(`CSV解析エラー: ${error.message || error}`);
      }
    });
  }

  async buildDemonstration(event){
    if(event) event.preventDefault();

    const uploader =  new DemoUploader();
    await uploader.csv_reader();

    console.log('サンプルデータを読み込みました');
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

    this.currentDataArray = this.csvData.map(row => row[selectedColumn]);
    console.log(`【${selectedColumn}】の抽出データ:`, this.currentDataArray);

    this.processSPC(this.currentDataArray);

    const {validAData,validBData} = AnalysisCalculator.getValidPairedData(this.currentDataArray, this.currentDataArray);
    console.log('カリキュレーターTEST：', validAData);
  }

  processSPC(dataArray) {
    // 1. SpcCalculator を使って統計値と外れ値を算出
    const spcResults = SpcCalculator.calculate(dataArray);

    if (!spcResults) {
      console.warn("計算に必要なデータ数が不足しています");
      return;
    }

    const { cl, sigma, ucl, lcl, outlierIndices, test3Indices } = spcResults;

    // 2.5. 工程能力指数を算出
    // 修正後
    const rawUsl = this.hasUslTarget ? parseFloat(this.uslTarget.value) : NaN;
    const usl = !isNaN(rawUsl) ? rawUsl : null;

    const rawLsl = this.hasLslTarget ? parseFloat(this.lslTarget.value) : NaN;
    const lsl = !isNaN(rawLsl) ? rawLsl : null;

    const { cp, cpk } = SpcCalculator.calculateCpk(usl, lsl, cl, sigma);
    

    // 2. 画面（ViewのTarget）へ結果を出力
    if (this.hasMeanTarget) this.meanTarget.textContent = cl.toFixed(3);
    if (this.hasStddevTarget) this.stddevTarget.textContent = sigma.toFixed(3);
    if (this.hasUclTarget) this.uclTarget.textContent = ucl.toFixed(3);
    if (this.hasLclTarget) this.lclTarget.textContent = lcl.toFixed(3);
    if (this.hasCpkTarget && cpk !== null) this.cpkTarget.textContent = cpk.toFixed(2);
    if (this.hasCpTarget && cp !== null) this.cpTarget.textContent = cp.toFixed(2);

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

    this.hundleDrawHistogram(dataArray, usl, lsl, cl);
    

  }

  hundleDrawHistogram(dataArray, usl, lsl, cl){
    if(this.hasHistogramCanvasTarget){  
      const ctx = this.histogramCanvasTarget.getContext('2d');
      this.histogramRenderer = new ChartRenderer(ctx);
      this.histogramRenderer.drawHistogram(dataArray, usl, lsl, cl);
    }
  }





  hundleCalateCpk(event){
    const rawUsl = this.hasUslTarget ? parseFloat(this.uslTarget.value) : NaN;
    const currentUsl = !isNaN(rawUsl) ? rawUsl : null;
    
    const rawLsl = this.hasLslTarget ? parseFloat(this.lslTarget.value) : NaN;
    const currentLsl = !isNaN(rawLsl) ? rawLsl : null;

    let displayCp = "-";
    let displayCpk = "-";

    if(currentUsl !== null || currentLsl !== null){

      // 2.5. 工程能力指数を算出
      const stddevText = this.hasStddevTarget ? this.stddevTarget.textContent : "";
      const meanText = this.hasMeanTarget ? this.meanTarget.textContent : "";
      // 初期値の "-" や空文字の場合は null にする
      const sigma = (stddevText !== "" && stddevText !== "-") ? parseFloat(stddevText) : null;
      const cl = (meanText !== "" && meanText !== "-") ? parseFloat(meanText) : null;

      const result = SpcCalculator.calculateCpk(currentUsl, currentLsl, cl, sigma);

      if(result){
        if (result.cp !== null) displayCp = result.cp.toFixed(2);
        if (result.cpk !== null) displayCpk = result.cpk.toFixed(2);
      }       
    this.hundleDrawHistogram(this.currentDataArray, currentUsl, currentLsl, cl);  
    }
     // 4. 最後に1回だけ画面（DOM）を更新する
    if (this.hasCpTarget) this.cpTarget.textContent = displayCp;
    if (this.hasCpkTarget) this.cpkTarget.textContent = displayCpk;

    
    
  }

  disconnect() {
    if (this.chartRenderer && this.chartRenderer.chartInstance) {
      this.chartRenderer.chartInstance.destroy();
    }
  }
}