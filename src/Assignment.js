class Assignment{
  constructor(length){
    this.variables = {};
    this.targetLength = length;
  }

  add(variable, value){
    //variable.value = value;
    //console.log(value);
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

  remove(variable){
   delete  this.variables[variable.name] ;
  }

  isComplete(){
    return (Object.values(this.variables).length === this.targetLength);
  }



  isValid(constraints){

    if(doMeOnce){
      console.log(this.variables);
    }

    for (var i = 0; i < constraints.length; i++) {
      //fetch variables that this constraint applies to.

      let count = 0;
      let varlist = constraints[i].variables.map(varname=>{
        if( typeof this.variables[varname] === 'undefined'){
          count += 1;
          return new Variable(varname, [0, 1]);
        } else  {
          return this.variables[varname].clone();
        }

      });

      if(doMeOnce){
        console.log(count, constraints[i].variables.length);
      }
      //this means that the current constraint doesn't have
      // any of its variables assigned. we don't care
      //
      if(count == constraints[i].variables.length){
        continue;
      }

      if(doMeOnce){
        console.log(varlist);
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
