// app/javascript/utils/spc_calculator.js
import { mean, standardDeviation } from "simple-statistics"

export default class SpcCalculator {
  // インスタンス化せずに使えるよう static メソッドとして定義
  static calculate(dataArray) {
    // 1. 欠損値（null/undefined）や非数値（NaN）を除外し、計算可能な有効データの配列を作成
    const validData = dataArray.filter(val => val !== null && val !== undefined && !isNaN(val));

    // 2. データが2未満の場合は標準偏差が計算できないため null を返す
    if (validData.length < 2) return null;

    // 3. simple-statistics を使って平均値(CL)と標準偏差(σ)を計算
    const cl = mean(validData);
    const sigma = standardDeviation(validData);

    // 4. 上方・下方管理限界線（UCL / LCL）の計算 (平均 ± 3σ)
    const ucl = cl + (3 * sigma);
    const lcl = cl - (3 * sigma);

    // 5. 外れ値の判定（UCLより大きい、またはLCLより小さいデータのインデックスを記録）
    const outlierIndices = [];
    validData.forEach((value, index) => {
      if (value > ucl || value < lcl) {
        outlierIndices.push(index);
      }
    });

    // 6. 計算結果と表示に必要なデータをひとまとめのオブジェクトとして返す
    return {
      validData,
      cl,
      sigma,
      ucl,
      lcl,
      outlierIndices
    };
  }
}