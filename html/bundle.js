class Assignment{
  constructor(length){
    this.variables = {};
    this.targetLength = length;
  }

  add(variable, value){

    if(value === undefined){
      throw 'Assignment.add called with value = undefined. did you forget to pass the value';
    }
    let t = new Variable(variable.name, variable.domain);
    t.value = value;
    this.variables[t.name] = t;

  }

  clone(){
    let t = new Assignment(this.targetLength);


    Object.values(this.variables).forEach(variable=>{

      if(typeof variable.value === 'undefined'){
        throw "variable value is undefined";
      }

      let v = variable.clone();
      t.add( variable.clone(), v.value);
    });
    return t;
  }

  isAssigned(variable){
    if(typeof variable !== 'string'){
      throw "Assignment.remove should receive string";
    }

    return (typeof this.variables[variable] !== 'undefined');

  }

  remove(variable){
   if(typeof variable !== 'string'){
     throw "Assignment.remove should receive string";
   }

   let t = this.variables[variable];

   if(t === undefined){
     return null;
   }

   let n = new Variable(t.name, t.domain);
   delete this.variables[variable];
   return n;

  }



  isComplete(){
    return (Object.values(this.variables).length === this.targetLength);
  }



  isValid(constraints){


    for (var i = 0; i < constraints.length; i++) {
      //fetch variables that this constraint applies to.

      let count = 0;
      let varlist;

      if(constraints[i].hlc){

        let preEmpt = false;

        varlist = constraints[i].variables.map(lis=>{

          let t = "";
          //loop through all variables to fetch values.
          for (var i = 0; i < lis.length; i++) {
            if(typeof this.variables[lis[i]] !== 'undefined' ){
              t += this.variables[lis[i]].value;
            } else {
              //if the variable isn't assigned the row/column can't
              // fail. otherwize everything will fail
              preEmpt = true;
              return null;
            }
          }
          //return amalgamation
          return t;
        }).filter((x)=>{return x!==null});

        //there cannot be any comparison between 0-1 object.
        if(varlist.length < 2){
          continue;
        }



      } else {

        varlist = constraints[i].variables.map(varname=>{
          if( typeof this.variables[varname] === 'undefined'){
            count += 1;
            return new Variable(varname, [0, 1]);
          } else  {
            return this.variables[varname].clone();
          }

        });

      }


      //this means that the current constraint doesn't have
      // any of its variables assigned. we don't care
      //
      if(count == constraints[i].variables.length){
        continue;
      }


      //console.log(constraints[i], varlist, this.variables);

      //console.log(varlist);

      if(!constraints[i].constraintFunction(varlist)){
        //console.log('constraints failed for', constraints[i], varlist);
        return false;
      }

    }
    return true;
  }


}

var doMeOnce = true;

class Constraint{



  constructor(constraintorFunction, variableList, hlc){
    if(typeof hlc !== 'undefined'){
      this.hlc = hlc;
    } else {
      this.hlc = false;
    }
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
    /*
    for (var i = 0; i < variableList.length; i++) {
      // there's still a chance that the next assignment will satisfy this constraint.
      if(variableList[i].value == null){
          return true;
      }

      if(typeof valueMap[variableList[i].value] === 'undefined'){
        valueMap[variableList[i].value] = 1;
      }

    }*/

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


class CSP {

  constructor(variable_number){
    this.constraints = [];
    this.unassigned = [];
    this.initial_assignment = new Assignment(variable_number);
  }


  // DATA STRUCTURE FOR UNASSIGNED VARIABLES =
  //




  assignVariable(v, value){
    //v = "var_name"
    if(typeof v !== 'string'){
      throw "assignVariable should receive a string not a " + typeof v;
    }
    //variable to assign to.
    let t;

    //variable is not in the list of unassigneds. IT SHOULDNT!
    if(this.initial_assignment.isAssigned(v)){

      t = this.initial_assignment.remove(v);

    } else {

      //remove variable from unassigned variables.
      this.unassigned = this.unassigned.filter((x)=>{
        if(x.name === v){
          t = x;
          return false;
        }
        return true;
      });
    }

    this.initial_assignment.add(t, value);
  }

  unassignVariable(v){
    this.unassigned.push(this.initial_assignment.remove(v));
  }


  BT(assignment, unassigned){
    //initial call?
    if(typeof assignment === 'undefined' || typeof unassigned == 'undefined'){
      //??
      assignment = this.initial_assignment;
      unassigned = this.unassigned.map(x=>{ return x.clone(); });
    } else {

      if( assignment.isComplete() ){
        return assignment;
      }
    }

    let v = unassigned.pop();

    for (var i = 0; i < v.domain.length; i++) {

      assignment.add(v, v.domain[i]);

      if(assignment.isValid(this.constraints)){

        //clone the unassigned list
        let ulis = unassigned.map( x =>{
          return x.clone  ();
        });

        let nassignment = assignment.clone() ;
        //console.log(nassignment, ulis);
        let result = this.BT(nassignment, ulis);

        if(result != null){
          return result;
        }
        assignment.remove(v.name);
      }
    }

    return null;

  }



  /**
   * addVariable - adds a variable to the set of variables.
   *
   * @param  {string} varname the name of this variable. this is used in the lookup.
   * @param  {list} domain  The values this variable can take on.
   * @return {type}         description
   */

  addVariable(variable){
    this.unassigned.push(variable);
    //this.assignment.push(new Variable(varname, domain));
  }






  /**
   * addConstraint - Adds a constraint to the list of constraints.
   *
   * @param  {Constraint} constraint A function that must hold true for all variables.
   * @param  {String[]} variables  A list of variable names.
   * @return {type}            description
   */
  addConstraint(constraint, variables, hlc){

    this.constraints.push(new Constraint(constraint, variables, hlc));

  }




}

class Variable {

  /**
   * constructor - Create a new variable
   * variables are uniquely identified by their name.
   *
   * @param  {String} name   name of variable
   * @param  {List} domain   which values the variables can take.
   * @return {Variable}      Variable instance
   */
  constructor(name, domain){
    this.value = null;
    this.name = name;
    this.domain = domain;
  }

  clone(){

    let k = this.domain.map(x=>{return x;});
    let t = new Variable(this.name, k);
    t.value = this.value;
    return t;

  }

}
