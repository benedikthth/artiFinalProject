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


class CSP {

  constructor(){
    this.assignment = {};//new MySet();
    this.constraints = [];
  }


  // DATA STRUCTURE FOR UNASSIGNED VARIABLES =
  //


  removeAssignment(variable){

    let vname = (typeof variable === 'string')? variable: variable.nam;

    this.assignment[vname].value = null;

  }

  getVariable(varname){
    return this.assignment[varname];
  }

  assignVariable(Var, value){
      let variable;

      if(typeof Var === 'string'){
        variable = this.assignment[Var];
      } else {
        variable = Var;
      }
      //let variable = this.assignment[varname];
      //console.log(this.assignment);
      //console.log(variable, varname);

      if(variable.domain.indexOf(value) !== -1){
        this.assignment[variable.name].value = value;
      } else {
        console.log(value + ', is out of domain for variable ', variable.name);
      }
  }


  getUnassigneds(){
    let t = Object.keys(this.assignment).map(x=>{return this.getVariable(x);}).filter(x=>{return x.value == null;} );
    return t;
  }


  BT(){

    //assignment is complete if all variables have assignments.
    if(this.checkAssignment()){
      console.log('complete assignment');
      //console.log(this.assignment);
      return this.assignment;
    }

    let nextVar = this.getUnassigneds()[0];
    let result = null;


    for (var i = 0; i < nextVar.domain.length; i++) {
      this.assignVariable(nextVar, nextVar.domain[i]);

      if( this.checkConstraints(nextVar) ){
        this.BT();
        if(this.checkAssignment() ){
          return this.assignment;
        }
        this.removeAssignment(nextVar.name);
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
    this.assignment[variable.name] = variable;
    //this.assignment.push(new Variable(varname, domain));
  }


  checkAssignment(){
    let complete = true;

    Object.keys(this.assignment).forEach((varname)=>{
      if(this.assignment[varname].value === null){
        complete = false;
        //console.log(complete);
      }
    });


    //let fulfillsConstraints = this.checkConstraints();

    //console.log(complete, fulfillsConstraints);

    return complete;

  }


  checkConstraints(variable){
    //check for specific variable.


    let constraintsToCheck;
    if(typeof variable !== 'undefined'){
      //fetch only the constraints that apply to this variable.
      constraintsToCheck = this.constraints.filter((c)=>{

        return ( c.variables.indexOf(variable.name) !== -1);

      });


    } else {
      //all constraints.
      constraintsToCheck = this.constraints;
    }

    console.log(constraintsToCheck);
    //check if the thing is violating something idk.
    let passing = true;
    //loop through all constraints and check if they're met
    //this.constraints.forEach( (constraint)=>{
    constraintsToCheck.forEach( (constraint)=>{
      //fetch all variable names that belong to the constraint.
      let variables = (Object.keys(this.assignment).filter((x)=>{
        return constraint.variables.indexOf(x) !== -1;
      //map names to variables
      })).map((x)=>{
        return this.assignment[x];
      });

      //console.log(variables);

      //check the constraint against the variables.
      if( constraint.constraintFunction(variables) == false){
        //console.log('dick');
        passing = false;
      }


    });
    return passing;
  }



  /**
   * addConstraint - Adds a constraint to the list of constraints.
   *
   * @param  {Constraint} constraint A function that must hold true for all variables.
   * @param  {String[]} variables  A list of variable names.
   * @return {type}            description
   */
  addConstraint(constraint, variables){

    this.constraints.push(new Constraint(constraint, variables));

  }




}

///do we need a set?... yes probably.
//

class MySet{
  constructor(){
    this.set = {}
  }


  /**
   * add - Adds an element to the set. Set can only contain an element once.
   *
   * @param  {type} variable description
   * @return {type}          description
   */
  add(variable){
    //check if the set contains variable with name.
    if(typeof this.set[variable.name] === 'undefined'){
      return false;
    }

    this.set[variable.name] = variable;

  }

  /**
   * contains - Returns true if the set contains variable
   *
   * @param  {Variable} variable variable to search for.
   * @return {boolean}           true if set contains variable, false otherwize
   */
  contains(variable){
    return (typeof this.set[variable.name] !== 'undefined');
  }


  /**
   * get - returns the element with the given name
   *
   * @param  {type} varName name of variable
   * @return {Variable}         description
   */
  get(varName){
    if(typeof this.set[varName] === 'undefined'){
      return null;
    }
    return this.set[varName];
  }


  /**
   * forEach - iterates through all
   *
   * @param  {type} f description
   * @return {type}   description
   */



  /**
   * remove - Removes an element from the set.
   *
   * @param  {Variable} variable variable to remove, must have a toString method or a name.
   * @return {Variable}          returns the removed object.
   */
  remove(variable){
    //retreive variable
    let x, y;

    let x = this.set[variable.name];
    //check if the variable is contained in the set.
    if(typeof x === 'undefined'){
      return null;
    }
    //remove from object.
    this.set[variable.name] = undefined;
    //return the variable.
    return x;

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


}
