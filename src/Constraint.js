class Constraint{



  constructor(constraintorFunction, variableList){
    this.variables = variableList;
    this.constraintFunction = constraintorFunction;
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

  static noMajority(variableList){
    //there cannot be a value which appears more than 1/2 variableList.length times.
    let valueMap = {};
    //console.log(variableList);

    for (var i = 0; i < variableList.length; i++) {
      if(variableList[i].value === null){
        continue;
      }

      if(typeof valueMap[variableList[i].value] === 'undefined'){
        valueMap[variableList[i].value] = 1;
      } else {
        valueMap[variableList[i].value] += 1;

        if(valueMap[variableList[i].value] > (variableList.length/2)){
          //console.log(variableList.length, valueMap[variableList[i].value]);
          return false;
        }
      }

    }
    //console.log(valueMap);
    return true;
  }



  static notAllTheSame(variableList){

    let valueMap = {};
    //console.log(variableList);
    for (var i = 0; i < variableList.length; i++) {
      // there's still a chance that the next assignment will satisfy this constraint.
      if(variableList[i].value == null){
          return true;
      }

      if(typeof valueMap[variableList[i].value] === 'undefined'){
        valueMap[variableList[i].value] = 1;
      } else {
        valueMap[variableList[i].value] += 1;
      }
    }
    return Object.keys(valueMap).length !== 1;
  }

}