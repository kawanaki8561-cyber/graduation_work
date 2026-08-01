// app/javascript/utils/chart_renderer.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default class ChartRenderer {

    //コンストラクタで対象となるCanvasのコンテキストを受け取る
    constructor(canvasContext) {
        this.ctx = canvasContext;
        this.chartInstance = null;
    }
    
    // グラフを描画するメソッド
    draw(spcResults) {
        const { validData, cl, ucl, lcl, outlierIndices } = spcResults;
        
        // 1. 古いグラフが存在する場合は破棄して重複描画を防ぐ
        if(this.chartInstance){
          this.chartInstance.destroy();
        }

        // 2. X軸のラベルを作成 (データ数に合わせて 1, 2, 3... と連番を振る)
        const labels = validData.map((_, index) => index + 1);

        // 3. UCL, CL, LCL を直線のデータとして定数配列化する
        const uclData = Array(validData.length).fill(ucl);
        const clData = Array(validData.length).fill(cl);
        const lclData = Array(validData.length).fill(lcl);

        // 4. Chart.jsインスタンスの生成
        this.chartInstance = new Chart(this.ctx, {
        type: 'line', // 折れ線グラフを指定
        data: {
            labels: labels,
            datasets: [
            {
                label: '測定値',
                data: validData,
                borderColor: 'blue',
                borderWidth: 2,
                // Scriptable Options を用いた異常値ハイライト
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return outlierIndices.includes(index) ? 'red' : 'blue'; 
                },
                pointRadius: (context) => {
                  const index = context.dataIndex;
                  return outlierIndices.includes(index) ? 6 : 3; 
                }
            },
            {
                label: 'UCL (+3σ)',
                data: uclData,
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderDash: [1], // 点線にする（※ここが消えてエラーになっていました）
                pointRadius: 0 // 丸マーカーを非表示
            },
            {
                label: 'CL (平均)',
                data: clData,
                borderColor: 'rgba(75, 192, 192, 0.5)',
                borderDash: [1], // （※ここも修正しました）
                pointRadius: 0
            },
            {
                label: 'LCL (-3σ)',
                data: lclData,
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderDash: [1], // （※ここも修正しました）
                pointRadius: 0
            }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
        });
    }
}