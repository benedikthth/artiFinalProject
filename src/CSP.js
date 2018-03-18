
class CSP {

  constructor(){
    this.assignment = {};//new MySet();
    this.constraints = [];
    this.unassigned = [];
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
    /*
    let t = Object.keys(this.assignment).map(x=>{return this.getVariable(x);}).filter(x=>{return x.value == null;} );
    return t;
    */
    let t = Object.entries(this.assignment).filter( x => { return (x[1].value == null); }).map((x)=>{return x[1];});
    //console.log(t);
    return t;
  }


  BT2(assignment, unassigned){
    //initial call?
    if(typeof assignment === 'undefined' || typeof unassigned == 'undefined'){
      //console.log(this.unassigned);
      assignment = new Assignment(this.unassigned.length);
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
        let result = this.BT2(nassignment, ulis);

        if(result != null){
          return result;
        }
        assignment.remove(v);
      }
    }

    return null;

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
      //assign variable.
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
    this.unassigned.push(variable);
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
        //return assigned variable
        if(typeof this.assignment[x] !== 'undefined'){
          return this.assignment[x];
        } else {
          //or dummy variable
          return new Variable(x, [0, 1]);
        }
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
