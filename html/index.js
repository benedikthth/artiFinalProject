/* get board size from query param */
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var query = getParameterByName('n');
let n;
if(query == null){
  n = 6;
} else {
  n = query - 0;
}
/* ------------ */

function makeVarName(x, y) {
  return '[' + x + ',' + y + ']'
}

/* Create a board of size n * n */
let cells = {}
var board = document.createElement('table');

for (var y = 0; y < n; y++) {
  let row = document.createElement('tr');
  board.appendChild(row);
  for (var x = 0; x < n; x++) {
    let cell = document.createElement('td');
    cells[makeVarName(x, y)] = cell;
    row.appendChild(cell);
  }
}

document.body.appendChild(board);

/*-------------*/

var csp = new CSP();



for (var x = 0; x < n; x++) {

  for (var y = 0; y < n; y++) {

    csp.addVariable( new Variable( makeVarName(x, y), [0, 1] ) );

  }


}

for (var y = 0; y < n; y++) {
  var rowVariables = [];
  var colVariables = [];
  for (var x = 0; x < n; x++) {

    rowVariables.push(makeVarName(x, y));
    colVariables.push(makeVarName(y, x));
    if(x > 0 && x < n-1){


      csp.addConstraint(Constraint.notAllTheSame, [
        makeVarName(x-1, y),
        makeVarName(x, y),
        makeVarName(x+1, y)
      ]);

    }

    if(y > 0 && y < n-1){

      csp.addConstraint(Constraint.notAllTheSame, [
        makeVarName(x, y-1),
        makeVarName(x, y),
        makeVarName(x, y+1)
      ]);

    }
  }
  //console.log(rowVariables);
  csp.addConstraint(Constraint.noMajority, colVariables);
  csp.addConstraint(Constraint.noMajority, rowVariables);
}

/*
t.addVariable(new Variable("one", ['blue']) );
t.addVariable(new Variable("two", ['blue']) );
t.addVariable(new Variable("three", ['blue', 'red']) );
t.addVariable(new Variable("four", ['blue', 'red']) );
t.addVariable(new Variable("five", ['blue', 'red']) );
t.addVariable(new Variable("six", ['blue', 'red']) );
t.addVariable(new Variable("seven", ['blue', 'red']) );
*/
//all are different.

//t.addConstraint( Constraint.notAllTheSame , ['one', 'two', 'three', 'four', 'five', 'six', 'seven']);


//t.assignVariable('one', 'blue');

//t.assignVariable('two', 'blue');

//  t.assignVariable('three', 'yellow');
function doBoard(assignment){
  //console.log(assignment);
  Object.keys(assignment.variables).forEach((x)=>{
    cells[x].innerHTML = assignment.variables[x].value;
  });
}

var sol = csp.BT2()/*.then((value)=>{
  doBoard(value);
});
*/
//console.log(cells);
/*
Object.keys(sol).forEach((x)=>{
  //console.log(cells[x]);
  cells[x].innerHTML = sol[x].value;
});
*/
