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
