// app/javascript/utils/spc_calculator.js
import { sampleCorrelation } from "simple-statistics"

export default class AnalysisCalculator {
    static calculateCorrelation(csvDataArray,selectedDataArray,selectedColumn){
        const columns = Object.keys(csvDataArray[0]).filter(val => val !== selectedColumn);
        const entries = columns.map(col => {
            const extracData = csvDataArray.map(val => val[col]);
            const { validAData,validBData } = this.getValidPairedData(extracData,selectedDataArray);
            if( validAData.length >= 2 && validBData.length >= 2){
                const r = sampleCorrelation(validAData,validBData);
                return [col, r];
            }
        }).filter(Boolean);
        
        return Object.fromEntries(entries);
        
    }

    static getValidPairedData(columnAValues,columnBValues){
        let validAData =[];
        let validBData =[];

        const length = Math.min(columnAValues.length, columnBValues.length);

        const isValidNumber = (val) =>{
            if(val === null || val === undefined || isNaN(val) || String(val).trim() === ""){
                return false;
            }
            return Number.isFinite(Number(val));
        };

        for(let i=0; i < length;i++){
            let currentAValue = columnAValues[i];
            let currentBValue = columnBValues[i];
            if(isValidNumber(currentAValue) && isValidNumber(currentBValue)){
                validAData.push(Number(currentAValue));
                validBData.push(Number(currentBValue));
            }
        }

        return { validAData,validBData }
    }
}
