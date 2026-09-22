export default class DemoUploader{
    async csv_reader() {
        const res = await fetch('/csv/demo.csv');
        console.log(res);
        if(res.ok){
            const csvBlob = await res.blob();
            //console.log('抽出されたBlob:', csvBlob);
            const demoFile = new File([csvBlob],'demoFile',{
                type :'text/csv'
            });
            console.log('生成されたFile:', demoFile);
            console.log('ファイル名:', demoFile.name);
            console.log('最終更新日時', demoFile.lastModified);
        }
    }
}