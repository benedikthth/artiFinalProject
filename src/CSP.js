
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
      if(this.UniqueSolutionCheck( solution, unassigneds ) ){
       
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
   * Check if a board has a unique solution. Currently AD-HOC for Binary puzzles.
   * @param  {Assignment} assignement the assignment to check for double solution
   * @param  {List<Variable>} unassigned A list of variables to assign values to.
   */
  UniqueSolutionCheck(assignment, unassigned, foundSolution){  
    
    if(assignment.isComplete() || unassigned.length == 0){
      return true;
    }


    let _unassigned = unassigned.map( x=>{ return x.clone(); });

    
    let V = _unassigned.pop();
    

    for(var i = 0; i < V.domain.length; i++){
    
      let _assignment = assignment.clone();
      _assignment.assign(V, V.domain[i]);

      if(!_assignment.isValid(this.constraints, V.name)){
        continue;
      }

      let t = this.UniqueSolutionCheck(_assignment, _unassigned);
      
      if(t && foundSolution){
        return false;
      }

      else if (t){
        foundSolution = true;
      }

    }

    return foundSolution;
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

    if( assignment.isComplete() ){
      return assignment;
    }

    

    let _assignment = assignment.clone();
    let _unassigned = unassigned.map(x=>{return x.clone();})


    let v = _unassigned.pop();

    for (var i = 0; i < v.domain.length; i++) {

      _assignment.assign(v, v.domain[i]);

      if(_assignment.isValid(this.constraints, v.name)){

        let result = this.BT(_assignment, _unassigned);

        if(result != null){
          return result;
        }

        _assignment.remove(v.name);
      }
    }

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
