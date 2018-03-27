var doMeOnce = true;

class Constraint{



  constructor(constraintorFunction, variableList, hlc){

    if(typeof hlc !== 'undefined'){
      this.hlc = hlc;
    } else {
      this.hlc = false;
    }

    this.variables = variableList;

    this.variableLookup = {};

    if(!this.hlc){
      this.variables.forEach(x=>{
        this.variableLookup[x] = true;
      });
    }

    this.constraintFunction = constraintorFunction;

  }

  clone(){
    return new Constraint(this.constraintFunction, this.variables.map(x=>{return x}), this.hlc);
  }


  /**
   * @static AllDifferent - Returns true if no variables share a value.
   *
   * @param  {type} variableList list of variables belonging to the constraint
   * @return {boolean}
   */
  static AllDifferent(variableList){

    let valueMap = {};

    for (var i = 0; i < variableList.length; i++) {

      if(variableList[i].value == null){
        continue;
      }

      if(typeof valueMap[variableList[i].value] === 'undefined'){
        valueMap[variableList[i].value] = 1;
      } else {
        return false;
      }
    }

    return true;

  }

  static diffCols(rowList){
    let valueMap = {}

    for (var i = 0; i < rowList.length; i++) {
      valueMap[rowList[i]] = 1;
    }

    return (Object.keys(valueMap).length == rowList.length);

  }

  static noMajority(variableList){
    //there cannot be a value which appears more than 1/2 variableList.length times.
    let valueMap = {};
    

    for (var i = 0; i < variableList.length; i++) {
      if(variableList[i].value === null){
        continue;
      }

      if(typeof valueMap[variableList[i].value] === 'undefined'){
        valueMap[variableList[i].value] = 1;
      } else {
        valueMap[variableList[i].value] += 1;

        if(valueMap[variableList[i].value] > (variableList.length/2)){
          return false;
        }
      }

    }
    
    return true;
  }



  static notAllTheSame(variableList){

    let valueMap = {};
   

    Object.values(variableList).forEach(x=>{
      if(x.value === null){
        valueMap["_"] = 1;
      } else {
        valueMap[x.value] = true;
      }
    });

    return Object.keys(valueMap).length !== 1;
  }

}
