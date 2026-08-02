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

    // 5. TEST 1（3σ限界線超過）の判定
    const outlierIndices = [];
    validData.forEach((value, index) => {
      if (value > ucl || value < lcl) {
        outlierIndices.push(index);
      }
    });

    // 【追加】TEST 3（6点連続の上昇または下降）の判定
    const test3Indices = this.detectTest3(validData);

    // 【追加】TEST 1 と TEST 3 の重複を除いた統合外れ値インデックスを作成
    const allOutlierIndices = Array.from(
      new Set([...outlierIndices, ...test3Indices])
    ).sort((a, b) => a - b);

    // 6. 計算結果と表示に必要なデータをひとまとめのオブジェクトとして返す
    return {
      validData,
      cl,
      sigma,
      ucl,
      lcl,
      outlierIndices,    // TEST 1 のインデックス（従来通り）
      test3Indices,      // 【追加】TEST 3 のインデックス
      allOutlierIndices  // 【追加】すべての異常インデックス（重複なし）
    };
  }

  /**
   * 【追加】TEST 3: 6点連続で上昇または下降しているかを検出する
   * @param {Array<number>} data - 有効データの配列
   * @returns {Array<number>} TEST 3に該当するインデックス配列
   */
  static detectTest3(data) {
    const outliers = [];
    let incCount = 1; // 連続上昇カウント
    let decCount = 1; // 連続下降カウント

    for (let i = 1; i < data.length; i++) {
      if (data[i] > data[i - 1]) {
        incCount++;
        decCount = 1; // 下降カウントをリセット
      } else if (data[i] < data[i - 1]) {
        decCount++;
        incCount = 1; // 上昇カウントをリセット
      } else {
        // 同値（変化なし）の場合は両方のカウントをリセット
        incCount = 1;
        decCount = 1;
      }

      // 6点連続上昇または下降に達した場合
      if (incCount >= 6 || decCount >= 6) {
        // 該当する6点分（i-5 から i まで）の全インデックスを登録
        for (let j = i - 5; j <= i; j++) {
          outliers.push(j);
        }
      }
    }

    // 重複を除外して返す
    return Array.from(new Set(outliers));
  }
}