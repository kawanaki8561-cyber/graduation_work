// app/javascript/utils/chart_renderer.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import SpcCalculator from "utils/spc_calculator"

export default class ChartRenderer {
  // コンストラクタで対象となる Canvas のコンテキストを受け取る
  constructor(canvasContext) {
    this.ctx = canvasContext;
    this.chartInstance = null;
  }

  // 既存のChart破棄処理を共通化
  destroyExistingChart(){
    const existingChart = Chart.getChart(this.ctx);
    if(existingChart){
      existingChart.destroy();
    }
    if(this.chartInstance){
      this.chartInstance.destroy();
    }
  }

  // グラフを描画するメソッド
  draw(spcResults) {
    // 【変更】outlierIndices (TEST1) と test3Indices (TEST3) の両方を受け取り
    const { validData, cl, ucl, lcl, outlierIndices = [], test3Indices = [] } = spcResults;

    // 1. Canvas 上に既存の Chart インスタンスが存在する場合は確実に破棄（重複エラー防止）
    this.destroyExistingChart();


    // 2. X軸のラベルを作成 (データ数に合わせて 1, 2, 3... と連番を振る)
    const labels = validData.map((_, index) => index + 1);

    // 3. UCL, CL, LCL を直線のデータとして定数配列化
    const uclData = Array(validData.length).fill(ucl);
    const clData = Array(validData.length).fill(cl);
    const lclData = Array(validData.length).fill(lcl);

    // 4. Chart.js インスタンスの生成
    this.chartInstance = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '測定値',
            data: validData,
            borderColor: '#0d6efd',
            borderWidth: 2,

            // 【追加】Scriptable Options: 異常ルールごとにマーカーの色を塗り分け
            pointBackgroundColor: (context) => {
              const idx = context.dataIndex;
              const isTest1 = outlierIndices.includes(idx);
              const isTest3 = test3Indices.includes(idx);

              if (isTest1 && isTest3) return '#6f42c1'; // TEST1 & 3 重複: 紫色
              if (isTest1) return '#dc3545';            // TEST1 (3σ超過): 赤色
              if (isTest3) return '#fd7e14';            // TEST3 (連続変化): オレンジ色
              return '#0d6efd';                         // 正常: 青色
            },

            // 【追加】Scriptable Options: マーカーの外枠色を合わせる
            pointBorderColor: (context) => {
              const idx = context.dataIndex;
              const isTest1 = outlierIndices.includes(idx);
              const isTest3 = test3Indices.includes(idx);

              if (isTest1 && isTest3) return '#6f42c1';
              if (isTest1) return '#dc3545';
              if (isTest3) return '#fd7e14';
              return '#0d6efd';
            },

            // 【追加】Scriptable Options: 異常ルールごとにマーカーの形状を変更
            pointStyle: (context) => {
              const idx = context.dataIndex;
              const isTest1 = outlierIndices.includes(idx);
              const isTest3 = test3Indices.includes(idx);

              if (isTest1 && isTest3) return 'triangle';  // 重複: 三角
              if (isTest1) return 'crossRot';             // TEST1: ❌印
              if (isTest3) return 'rect';                 // TEST3: 四角
              return 'circle';                            // 正常: 丸
            },

            // 【追加】Scriptable Options: 異常マーカーのサイズを大きくして強調
            pointRadius: (context) => {
              const idx = context.dataIndex;
              const isTest1 = outlierIndices.includes(idx);
              const isTest3 = test3Indices.includes(idx);

              return (isTest1 || isTest3) ? 7 : 3;
            }
          },
          {
            label: 'UCL (+3σ)',
            data: uclData,
            borderColor: 'rgba(255, 99, 132, 0.7)',
            borderDash: [5, 5],
            pointRadius: 0
          },
          {
            label: 'CL (平均)',
            data: clData,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            borderDash: [5, 5],
            pointRadius: 0
          },
          {
            label: 'LCL (-3σ)',
            data: lclData,
            borderColor: 'rgba(255, 99, 132, 0.7)',
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          // 【追加】ツールチップで何の異常が発生しているかテキスト表示
          tooltip: {
            callbacks: {
              label: (context) => {
                const idx = context.dataIndex;
                const val = context.parsed.y.toFixed(3);
                const isTest1 = outlierIndices.includes(idx);
                const isTest3 = test3Indices.includes(idx);

                let status = '';
                if (isTest1 && isTest3) status = ' [⚠️ TEST1 & TEST3 異常]';
                else if (isTest1) status = ' [⚠️ TEST1 異常(±3σ超過)]';
                else if (isTest3) status = ' [⚠️ TEST3 異常(6点連続上昇/下降)]';

                return `${context.dataset.label}: ${val}${status}`;
              }
            }
          }
        }
      }
    });
  }

  // 2. 【新規追加】ヒストグラム描画メソッド
  drawHistogram(dataArray) {
    

    this.destroyExistingChart();

    // スタージェスの公式で階級数を動的算出
    const result = SpcCalculator.calculateNclass(dataArray);
    if(!result) return null;
    const {validData, nClasses, breaks} = result;
    
    const labels = [];
    const counts = new Array(nClasses).fill(0);

    //xラベル生成
    for(let i=0;i < nClasses; i++){
      labels.push(`${breaks[i].toFixed(1)} - ${breaks[i + 1].toFixed(1)}`);
    }

    //度数集計
    validData.forEach(val => {
      for (let i = 0; i < nClasses; i++){
        const isLastBin = (i === nClasses - 1);
        if (val >= breaks[i] && (isLastBin ? val <= breaks[i + 1] : val < breaks[i + 1])){
          counts[i]++;
          break;
        }
      }
    });

    //Chart.js の最もシンプルな基本構成 ▼▼
    this.chartInstance = new Chart(this.ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "度数",
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)', // 枠線をくっきり表示
          borderWidth: 1, // 柱の境界線
          barPercentage: 1.0, // 柱同士の隙間をなくす
          categoryPercentage: 1.0
        }] 
      },
      options: {
        responsive: true,
        //maintainAspectRatio: false, // 親要素のサイズにフィット
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `度数： ${context.raw}件`
            }
          }
        },
      }
    });

    return this.chartInstance;

  }
}