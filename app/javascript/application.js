// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

// Issue#7_各ライブラリのインポート
import Papa from "papaparse";
// ※ simple-statistics はES6向けに名前付きエクスポートのみを提供しているため、以下のようにインポートします
import * as ss from "simple-statistics"; 
// ※ Chart.jsは通常、autoを付けてインポートするのが便利です
import Chart from "chart.js/auto";

// ブラウザでの読み込みテスト
document.addEventListener("DOMContentLoaded", ()=> {
    console.log("◆ Importmap Test: 完全ローカル処理の準備確認");
    console.log("Papa Parse loaded:", typeof Papa !== "undefined");
    console.log("simple-statistics min function loaded:", typeof ss.min === "function");
    console.log("Chart.js loaded:", typeof Chart !== "undefined");
});