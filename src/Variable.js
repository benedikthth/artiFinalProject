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
