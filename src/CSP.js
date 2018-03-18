
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
