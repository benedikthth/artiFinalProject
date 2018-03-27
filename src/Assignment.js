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
