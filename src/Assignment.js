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
