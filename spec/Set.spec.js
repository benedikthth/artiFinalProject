const VariableSet = require( '../src/Set.js');
const Variable = require( '../src/Variable.js');

describe('Set', ()=>{
  let set;
  beforeEach(()=>{
    set = new VariableSet();
  });

  describe('contains', ()=>{

    it('calls contains on a set with no variables', ()=>{
      let v = new Variable('0,0');
      let value = set.contains(v);
      expect(value).toBe(false);
    });

  });

});
