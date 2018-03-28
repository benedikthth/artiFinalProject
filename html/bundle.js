class Assignment{
  constructor(length){
    this.variables = {};
    this.targetLength = length;
  }


  /**
   * assign - Assign a value to a variable.
   *
   * @param  {Variable} variable the variable to assign a value to.
   * @param  {any} value         the value to assign to this variable.
   */
  assign(variable, value){

    if(value === undefined){
      throw 'Assignment.add called with value = undefined. did you forget to pass the value';
    }
    let t = new Variable(variable.name, variable.domain);
    t.value = value;
    this.variables[t.name] = t;

  }


  /**
   * clone - Create a identical copy of this assignment and its' variables and constraints.
   *
   * @return {Assignment}  An identical clone of this assignment
   */
  clone(){
    let t = new Assignment(this.targetLength);


    Object.values(this.variables).forEach(variable=>{

      if(typeof variable.value === 'undefined'){
        throw "variable value is undefined";
      }

      let v = variable.clone();
      t.assign( variable.clone(), v.value);
    });
    return t;
  }


  /**
   * isAssigned - Checks if the variable has been given a value in this assignment.
   *
   * @param  {String} variable name of the variable to check for
   * @return {Boolean}          true if the variable has a value.
   */
  isAssigned(variable){
    if(typeof variable !== 'string'){
      throw "Assignment.remove should receive string";
    }

    return (typeof this.variables[variable] !== 'undefined');

  }


  /**
   * remove - removes the variable with name = varname from the assignment
   *
   * @param  {String} varname The unique name of the variable
   * @return {Variable}       the variable that was removed
   */
  remove(varname){
   if(typeof varname !== 'string'){
     throw "Assignment.remove should receive string";
   }

   let t = this.variables[varname];

   if(t === undefined){
     return null;
   }

   let n = new Variable(t.name, t.domain);
   delete this.variables[varname];
   return n;

  }


  /**
   * isComplete - Checks all the variables have been assigned a value;
   *
   * @return {boolean}  true if all values have been assigned
   */
  isComplete(){
    return (Object.values(this.variables).length === this.targetLength);
  }



  /**
   * isValid - Loops through the constraints and checks if the Assignment
   * satisfies all of them
   *
   * @param  {Array<Constraint>} constraints List of constraints.
   * @param  {string} varname     Optional, only checks the constraints that apply to the variable with varname.
   * @return {boolean}             true iff the assignment satisfies the constraints,
   */
  isValid(constraints, varname){

    if(typeof varname !== 'undefined'){

   
      ///filter out the constraints that don't have anything to do with this thing
      constraints = constraints.filter(x=>{
        
        if(x.hlc){
          return true;
        }
        
        return typeof x.variableLookup[varname] !== 'undefined';
          
      });

    }

   

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

        //fetch all the relevant variables for the constraint.
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
      // any of its variables assigned. we don't care about it.
      if(count == constraints[i].variables.length){
        continue;
      }

      //check if the constraint fails.
      if(!constraints[i].constraintFunction(varlist)){
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


class CSP {

  constructor(variable_number){
    this.variable_number = variable_number;
    this.constraints = [];
    this.unassigned = [];
    this.initial_assignment = new Assignment(variable_number);
  }




  generatePuzzle(thresh){
    //create a temporary csp as not to pollute the current instance.
    let tmpCsp = new CSP(this.variable_number);
    // copy the current list of unassigned variables.
    this.unassigned.forEach(x=>{tmpCsp.addVariable(x.clone())}); 
    this.constraints.forEach(x=>{
      let p = x.clone();
      tmpCsp.addConstraint(p.constraintFunction, p.variables, p.hlc);
    });
    //arrange the unassigned variables randomly.
    tmpCsp.shuffelIze();
    //solve for the empty board.
    let solution = tmpCsp.BT();
    
    if(solution == null){
      //no solution... what
      alert('Backtracking algomorithm failed.');
      return null;
    }

    //at this point solution is a filled out board.
    ///how many variables to remove.
    if(typeof thresh === 'undefined'){
      thresh = 10;
    }
    //on failing to remove a variable without resulting in t
    //the puzzle not having a unique solution. 
    let attempts = 5;
    //temporary 
    let unassigneds = [];


    while(thresh > 0){
      //randomly pick a variable from the solution
      let variables = Object.values(solution.variables).sort((a,b)=>{
        let p = Math.random();
        if(p > 0.66){
          return -1;
        } else if(p > 0.33){
          return 0;
        } else {
          return 1;
        }
      });

      //store the value of the assignment
      let tmpval = solution.variables[variables[0].name].value;
      //store the variale so that if removing it results in our solution being unsolvable
      let p = solution.remove(variables[0].name);
      //put the variable on the unassigned list
      unassigneds.push(p);

      //check if the solution has unique solution
      if( this.UniqueSolutionCheck( solution, unassigneds ) ){
       
        attempts = 10;
        thresh -= 1;
        //continue;
      } else {

        //assign the variable again.
        solution.assign(p, tmpval);
        //remove it from the unassigned variables.
        unassigneds = unassigneds.filter(x=>{return x.name !== p.name;});
        //attempt decrement.
        attempts -= 1;
        
        if(attempts == 0){
          //force the algorithm to quit.
          return solution;
        }

      }

    }

    //return the tuple. this is so we can assign this to the csp.
    return [solution, unassigneds];

  }


  
  /**
   * Wrapper for initial call of the unique solution checker.
   * 
   * @param {Assignment} assignment 
   * @param {List<Variable>} unassigned 
   * @returns true if there is a unique solution for this assignment.
   * 
   * @memberOf CSP
   */
  UniqueSolutionCheck(assignment, unassigned){
    let p = this._UniqueSolutionCheck(assignment, unassigned, false);
    return p[0];
  }
  /**
   * . 
   * 
   * @param  {Assignment} assignement the assignment to check for double solution
   * @param  {List<Variable>} unassigned A list of variables to assign values to.
   * @returns {Boolean[]} 2 booleans, the first one if a unique solution exists, the second one if 2 solutions exist.
   */
  _UniqueSolutionCheck(assignment, unassigned, foundSolution){  
    
    if(assignment.isComplete() || unassigned.length == 0){
      return [true, false];
    }

    //clone the unassigned list
    let _unassigned = unassigned.map( x=>{ return x.clone(); });

    //get the next variable
    let V = _unassigned.pop();
    //check for each value. whether a solution exists for this variable having this value.
    for(var i = 0; i < V.domain.length; i++){
      //clone assignment
      let _assignment = assignment.clone();
      //assign value to assignment
      _assignment.assign(V, V.domain[i]);
      //if the assignment is not valid via the constraints, continue.
      if(!_assignment.isValid(this.constraints, V.name)){
        continue;
      }
      //check for unique solution existing.
      let t = this._UniqueSolutionCheck(_assignment, _unassigned, foundSolution);
      
      //if t[1] is set as true, that means that the recursive call found that the tree
      //does not contain a solution.
      if(t[1]){
        //console.log('terminating');
        //return false, and true, so the search knows to terminate the search
        return [false, true];
      }

      //this means that 
      if(t[0] && foundSolution){
        return [false, true];
      }

      else if (t[0]){
        foundSolution = true;
      }
      
    }
    
    return [foundSolution, false];
  }
  

  /**
   * assignVariable - Assigns a value to a variable.
   *
   * @param  {String} v     Name of the variable to assign name to.
   * @param  {any} value value to assign to the variable
   */
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

    this.initial_assignment.assign(t, value);
  }


  /**
   * unassignVariable - remove variable from assignment and add it to the
   * list of unassigned variables.
   *
   * @param  {String} varname name of the variable to remove from assignment
   */
  unassignVariable(varName){
    this.unassigned.push(this.initial_assignment.remove(varName));
  }

  shuffelIze(){
    this.unassigned.sort((a, b)=>{
      let r = Math.random();
      if(r > 0.66) {
        return -1;
      } else if(r > 0.33){
        return 0;
      } else {
        return 1;
      }
    });
  }



  
  /**
   * BT - Backtracking algorithm
   *
   * @param  {Assignment} assignment
   * @param  {List<Variable>} unassigned list of unassigned variables
   * @return {Assignment}            Completed assignment or null
   */
  BT(assignment, unassigned){

    //initial call
    if(typeof assignment === 'undefined' || typeof unassigned == 'undefined'){
      assignment = this.initial_assignment.clone();
      unassigned = this.unassigned.map(x=>{ return x.clone(); });
    }

    //if the assignment is completed, we return it.
    if( assignment.isComplete() ){
      return assignment;
    }

    

    let _assignment = assignment.clone();
    let _unassigned = unassigned.map(x=>{return x.clone();})

    //get variable from the unassigned variables
    let v = _unassigned.pop();
    //loop through the domain and check each 'Branch' for solution.
    for (var i = 0; i < v.domain.length; i++) {
      //assign new value to the assignment...
      _assignment.assign(v, v.domain[i]);
      //check the relevant constraints only.
      if(_assignment.isValid(this.constraints, v.name)){
        //recurse.

      

        let p = this.ConstraintPropagation(_assignment, _unassigned, v);

        if(p == null){
          //console.log('goo');
          return null;
        }
     
        let result = this.BT(_assignment, p);
        //if the result is valid, return it. 
        if(result != null){
          return result;
        }
        //remove variable from assignment
        _assignment.remove(v.name);
      }
    }
    //if we reach here without finding a solution. there's not one. 
    return null;

  }




  /**
   * addVariable - Adds a variable to the list of variables.
   *
   * @param  {type} variable description
   * @return {type}          description
   */
  addVariable(variable){
    this.unassigned.push(variable);
    //this.assignment.push(new Variable(varname, domain));
  }


  ConstraintPropagation(assignment, unassigned, variable){
    //make a copy of the unassigned variables.
    let U = unassigned.map(x=>{return x.clone()});
    //
    let C = Object.values(this.constraints).filter(x=>{return typeof x.variableLookup[variable.name] !== 'undefined'});
   
    let A = assignment.clone();

    let V = U.filter(x=>{
      for (let i = 0; i < C.length; i++) {

        if( typeof C[i].variableLookup[x.name] !== 'undefined'){
          return true;
        }
      }
      return false;
    });
    
    
    for (let i = 0; i < V.length; i++) {
      //for each variable V 
      for(let j = V[i].domain.length-1; j >= 0; j--){
        //for each value in variable domain in V
        A.assign(V[i], V[i].domain[j]);
        //check if the constraints are valid.
        if(!A.isValid(C, V[i].name)){
          //if not, remove that value from the variable domain
          V[i].domain = V[i].domain.filter(x=>{return x !== V[i].domain[j]});
          //if the domain is empty. then return null;
          if(V[i].domain.length === 0){
            return null;
          }
        }
      }
      //remove V from A
      A.remove(V[i].name);
      
    }

    
    return U;

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
