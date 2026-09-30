export default class DemoUploader{
    async csv_reader() {
        //const res = await fetch('/csv/demo.csv');
        const res = await fetch('/csv/demo.csv?t=' + new Date().getTime());
        //console.log(res);
        if(res.ok){
            const csvBlob = await res.blob();
            //console.log('抽出されたBlob:', csvBlob);
            const demoFile = new File([csvBlob],'demo.csv',{
                type :'text/csv'
            });
            //console.log('生成されたFile:', demoFile);
            //console.log('ファイル名:', demoFile.name);
            //console.log('最終更新日時', demoFile.lastModified);
            const dt = new DataTransfer();
            dt.items.add(demoFile);
            //console.log('DataTransferオブジェクト:', dt);
            //console.log('生成された FileList:', dt.files);
            //console.log('格納されたファイル[0]:', dt.files[0]);

           // 画面上の <input type="file" id="csv_file"> を取得
           const csvInput = document.querySelector('#csv_file');
           if(csvInput){
            // 1. input要素にファイルを代入
            csvInput.files = dt.files;
            const dispatched = csvInput.dispatchEvent(new Event('change',{bubbles: true }));
            console.log('2 changeイベント発火結果:', dispatched);

            return csvInput;
           }
        }
    }
}
/*
function setupDemoButton(){
    //demoBtnを取得（#demo_btn）
    //条件分岐：demoBtnの存在確認、且つイベントリスナー紐づけ確認（!demoBtn.dataset.bound）
    //ベントリスナー紐づけをON
    //console.log('ボタンが準備できました');
    // ボタンクリック時に非同期で csv_reader を実行
     //demoBtn.addEventListener
     //クリックイベントを設置
     // 第二引数を関数（非同期処理）
     //DemoUploader()をインスタンス化し変数uploaderへ
     //uploaderのcsv_reader()を実行

    const demoBtn = document.querySelector('#demo_btn');
    if(demoBtn && !demoBtn.dataset.bound){
        demoBtn.dataset.bound = 'true';
        console.log('ボタンが準備できました');

        demoBtn.addEventListener('click', async ()=>{
            const uploader = new DemoUploader();
            await uploader.csv_reader();
        });
    }
}
// 画面読み込み時に初期化関数を実行
// （Rails/Hotwire環境のため turbo:load を主とし、念のため DOMContentLoaded も併記）
document.addEventListener('turbo:load', buildDemonstration);
document.addEventListener('DOMContentLoaded', buildDemonstration);
*/
/*
            // ボタンクリックでcsv_readerを実行

            async document.addEventListener('DOMContentLoaded',() => {
                const demoBtn = document.querySelector('#demo_btn');
                if(demoBtn){
                    const uploader = new DemoUploader();
                    await uploader.csv_reader();
                }
            });
*/

