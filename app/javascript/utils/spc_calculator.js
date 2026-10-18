// app/javascript/utils/spc_calculator.js
import { mean, standardDeviation } from "simple-statistics"
import { equalIntervalBreaks } from "simple-statistics";


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

  /** 工程能力指数（Cp, Cpk）を計算する 
  * @param {number|null} usl - 規格上限 (Upper Specification Limit)
  * @param {number|null} lsl - 規格下限 (Lower Specification Limit)
  * @param {number} mean - 工程平均 \* @param {number} std - 標準偏差(σ)
  * @returns {Object|null} { cp, cpk, cpu, cpl } または null
  */

  static calculateCpk(usl, lsl, mean, std){
    if(typeof mean !== "number" || isNaN(mean)) return null;
    if(typeof std !== "number" || isNaN(std) || std <= 0) return null;
    
    const hasUsl = usl !==null && usl !== undefined && !isNaN(Number(usl));
    const hasLsl = lsl !==null && lsl !== undefined && !isNaN(Number(lsl));
    
    //if(!hasUsl && !hasLsl) return null;

    const numUsl = hasUsl ? Number(usl) : null;
    const numLsl = hasLsl ? Number(lsl) : null;
    
    let cpu = null;
    let cpl = null; 
    let cp = null;

    // 1. Cpの計算
    if(hasUsl && hasLsl){
      cp = (numUsl - numLsl)/(6 * std);
    }

    // 2. Cpkの計算
    if(hasUsl){
      cpu = (numUsl - mean) / (3 * std);      
    } 

    if(hasLsl){
      cpl = (mean - numLsl) / (3 * std);
    }
    
    // 小さい方を採用する
    let cpk = null;
    if(hasUsl && hasLsl){
      cpk = Math.min(cpu, cpl);
    }else if(hasUsl){
      cpk = cpu;
    }else if(hasLsl){
      cpk = cpl;
    }
    
    console.log("calculateCpkは起動しました");

    return {
      cp: cp !== null ? Number(cp) : null,
      cpk: cpk !== null ? Number(cpk) : null,
    };

  }

  static calculateNclass(dataArray, usl = null, lsl = null){
    const validData =dataArray.filter(val => val !== null && val !== undefined && !isNaN(val));
    const n = validData.length;
    if(n === 0) return null;


    const extendedData = [...validData];

    // スタージェスの公式で階級数を動的算出
    const nClass = Math.ceil(1 + Math.log2(n));
    // simple-statistics で境界値を取得
    const breaks = equalIntervalBreaks(extendedData, nClass); // 拡張された範囲（規格値含む）をもとに equalIntervalBreaks を実行

    return {
      validData: validData !== null ? validData: null, // 度数カウント用には元のデータのみを渡す
      nClasses: nClass !== null ? nClass: null,
      breaks: breaks !== null ? breaks: null
    }
  }


}