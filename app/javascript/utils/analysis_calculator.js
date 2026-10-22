// app/javascript/utils/spc_calculator.js
import { sampleCorrelation } from "simple-statistics"

export default class AnalysisCalculator {
    static calculateCorrelation(csvDataArray,selectedDataArray,selectedColumn){
        
    }

    static getValidPairedData(columnAValues,columnBValues){
        let validAData =[];
        let validBData =[];

        const length = Math.min(columnAValues.length, columnBValues.length);

        const isValidNumber = (val) =>{
            if(val === null || val === undefined || isNaN(val)){
                return false;
            }
            return Number.isFinite(Number(val));
        };

        for(let i=0; i < length;i++){
            let currentAValue = columnAValues[i];
            let currentBValue = columnBValues[i];
            if(isValidNumber(currentAValue) && isValidNumber(currentBValue)){
                validAData.push(currentAValue);
                validBData.push(currentBValue);
            }
        }

        return { validAData,validBData }
    }
}
