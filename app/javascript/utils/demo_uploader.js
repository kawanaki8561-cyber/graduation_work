export default class DemoUploader{
    async csv_reader() {
        const res = await fetch('/csv/demo.csv');
        //console.log(res);
        if(res.ok){
            const csvBlob = await res.blob();
            //console.log('抽出されたBlob:', csvBlob);
            const demoFile = new File([csvBlob],'demoFile',{
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
            console.log('2\. changeイベント発火結果:', dispatched);
           }
        }
    }
}
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