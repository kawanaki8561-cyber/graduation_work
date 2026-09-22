export default class DemoUploader{
    async csv_reader() {
        const res = await fetch('/csv/demo.csv');
        console.log(res);
        if(res.ok){
            const csvBlob = await res.blob();
            console.log('抽出されたBlob:', csvBlob);
        }
    }
}