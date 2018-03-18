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
    let cname = makeVarName(x, y);


    cell.onclick = ((c, n)=>{
      switch(c.innerHTML){
        case '':
          c.innerHTML = '0';
          doAssign(n, 0);
          break;
        case '0':
          c.innerHTML = '1';
          doAssign(n, 1);
          break;
        case '1':
          c.innerHTML = '';
          removeAssignment(n);
          break;
      }
    }).bind(null, cell, cname);


    cells[cname] = cell;
    row.appendChild(cell);
  }
}

document.body.appendChild(board);

let btn = document.createElement('button');
btn.innerHTML = 'SOLVE ME';
btn.onclick = solveMe;
document.body.appendChild(btn);


/*-------------*/



var csp = new CSP(n*n);



for (var x = 0; x < n; x++) {

  for (var y = 0; y < n; y++) {

    csp.addVariable( new Variable( makeVarName(x, y), [0, 1] ) );

  }


}
let cols = [];
let rows = [];
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
  cols.push(colVariables);
  rows.push(rowVariables);
}

//console.log(cols, rows);

csp.addConstraint(Constraint.diffCols, cols, true);
csp.addConstraint(Constraint.diffCols, rows, true);

function doAssign(name, value){
  csp.assignVariable(name, value);
}

function removeAssignment(name){
  csp.unassignVariable(name);
}

function solveMe(){
  let sol = csp.BT();
  doBoard(sol);
}

function doBoard(assignment){
  //console.log(assignment);
  Object.keys(assignment.variables).forEach((x)=>{
    cells[x].innerHTML = assignment.variables[x].value;
  });
}
