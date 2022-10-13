import { SnapType } from "./common.types";
import { editor } from "./editor";
import { qSVG } from "./qSVG";

const clearHtmlTagById = (tag: string) => {
  const target = document.getElementById(tag);

  if (target) {
    target.innerHTML = "";
  }
};

const cursor = (tool) => {
  if (tool == "grab") { 
    tool = "url('https://wiki.openmrs.org/s/en_GB/7502/b9217199c27dd617c8d51f6186067d7767c5001b/_/images/icons/emoticons/add.png') 8 8, auto";
  }
  if (tool == "scissor") {
    tool = "url('https://maxcdn.icons8.com/windows10/PNG/64/Hands/hand_scissors-64.png'), auto";
  }
  if (tool == "trash") {
    tool = "url('https://cdn4.iconfinder.com/data/icons/common-toolbar/36/Cancel-32.png'), auto";
  }
  if (tool == "validation") {
    tool = "url('https://images.fatguymedia.com/wp-content/uploads/2015/09/check.png'), auto";

  }

  document.getElementById("lin")?.style.cursor = tool;
};


const save = (boot = false) => {
  if (boot) {
    localStorage.removeItem("history");
  }

  const {
    WALLS,
    HISTORY,
    OBJDATA, 
    ROOM,
  } = window.editorVars;

  // FOR CYCLIC OBJ INTO LOCALSTORAGE !!!
  for (const k in WALLS) {
    if (WALLS[k].child != null) {
      WALLS[k].child = WALLS.indexOf(WALLS[k].child);
    }
    if (WALLS[k].parent != null) {
      WALLS[k].parent = WALLS.indexOf(WALLS[k].parent);
    }
  }
  if (
    JSON.stringify({ objData: OBJDATA, wallData: WALLS, roomData: ROOM }) ==
    HISTORY[HISTORY.length - 1]
  ) {
    for (const k in WALLS) {
      if (WALLS[k].child != null) WALLS[k].child = WALLS[WALLS[k].child];
      if (WALLS[k].parent != null) WALLS[k].parent = WALLS[WALLS[k].parent];
    }
    return false;
  }

  if (HISTORY.index < HISTORY.length) {
    HISTORY.splice(HISTORY.index, HISTORY.length - HISTORY.index);
  }

  HISTORY.push(
    JSON.stringify({ objData: OBJDATA, wallData: WALLS, roomData: ROOM })
  );

  localStorage.setItem("history", JSON.stringify(HISTORY));

  HISTORY.index++;
  if (HISTORY.index > 1) {
    // $("#undo").removeClass("disabled");
  }
  for (const k in WALLS) {
    if (WALLS[k].child != null) {
      WALLS[k].child = WALLS[WALLS[k].child];
    }
    if (WALLS[k].parent != null) {
      WALLS[k].parent = WALLS[WALLS[k].parent];
    }
  }

  window.editorVars.WALLS = WALLS;
  window.editorVars.HISTORY = HISTORY;
  window.editorVars.OBJDATA = OBJDATA;
  window.editorVars.ROOM = ROOM;

  return true;
};

type IntersectionArgs = {
  snap: SnapType; 
  range: number;
  except?: string[];
};

const intersection = ({ 
  snap, 
  range = Infinity, 
  except = [""],
}: IntersectionArgs) => {
    // ORANGE LINES 90° NEAR SEGMENT
    const bestEqPoint = {};
    const equation = {};
  
    bestEqPoint.distance = range;
  
    intersectionOff();
      
    window.editorVars.lineIntersection = qSVG.create("boxbind", "path", {
      // ORANGE TEMP LINE FOR ANGLE 0 90 45 -+
      d: "",
      stroke: "transparent",
      "stroke-width": 0.5,
      "stroke-opacity": "1",
      fill: "none",
    });
  
    for (let index = 0; index < window.editorVars.WALLS.length; index++) {
      if (except.indexOf(window.editorVars.WALLS[index]) == -1) {
        const x1 = window.editorVars.WALLS[index].start.x;
        const y1 = window.editorVars.WALLS[index].start.y;
        const x2 = window.editorVars.WALLS[index].end.x;
        const y2 = window.editorVars.WALLS[index].end.y;
  
        // EQUATION 90° of segment nf/nf-1 at X2/Y2 Point
        if (Math.abs(y2 - y1) == 0) {
          equation.C = "v"; // C/D equation 90° Coef = -1/E
          equation.D = x1;
          equation.E = "h"; // E/F equation Segment
          equation.F = y1;
          equation.G = "v"; // G/H equation 90° Coef = -1/E
          equation.H = x2;
          equation.I = "h"; // I/J equation Segment
          equation.J = y2;
        } else if (Math.abs(x2 - x1) == 0) {
          equation.C = "h"; // C/D equation 90° Coef = -1/E
          equation.D = y1;
          equation.E = "v"; // E/F equation Segment
          equation.F = x1;
          equation.G = "h"; // G/H equation 90° Coef = -1/E
          equation.H = y2;
          equation.I = "v"; // I/J equation Segment
          equation.J = x2;
        } else {
          equation.C = (x1 - x2) / (y2 - y1);
          equation.D = y1 - x1 * equation.C;
          equation.E = (y2 - y1) / (x2 - x1);
          equation.F = y1 - x1 * equation.E;
          equation.G = (x1 - x2) / (y2 - y1);
          equation.H = y2 - x2 * equation.C;
          equation.I = (y2 - y1) / (x2 - x1);
          equation.J = y2 - x2 * equation.E;
        }
        equation.A = equation.C;
        equation.B = equation.D;
        eq = qSVG.nearPointOnEquation(equation, snap);
        if (eq.distance < bestEqPoint.distance) {
          bestEqPoint.distance = eq.distance;
          bestEqPoint.node = index;
          bestEqPoint.x = eq.x;
          bestEqPoint.y = eq.y;
          bestEqPoint.x1 = x1;
          bestEqPoint.y1 = y1;
          bestEqPoint.x2 = x2;
          bestEqPoint.y2 = y2;
          bestEqPoint.way = 1;
        }
        equation.A = equation.E;
        equation.B = equation.F;
        eq = qSVG.nearPointOnEquation(equation, snap);
        if (eq.distance < bestEqPoint.distance) {
          bestEqPoint.distance = eq.distance;
          bestEqPoint.node = index;
          bestEqPoint.x = eq.x;
          bestEqPoint.y = eq.y;
          bestEqPoint.x1 = x1;
          bestEqPoint.y1 = y1;
          bestEqPoint.x2 = x2;
          bestEqPoint.y2 = y2;
          bestEqPoint.way = 1;
        }
        equation.A = equation.G;
        equation.B = equation.H;
        eq = qSVG.nearPointOnEquation(equation, snap);
        if (eq.distance < bestEqPoint.distance) {
          bestEqPoint.distance = eq.distance;
          bestEqPoint.node = index;
          bestEqPoint.x = eq.x;
          bestEqPoint.y = eq.y;
          bestEqPoint.x1 = x1;
          bestEqPoint.y1 = y1;
          bestEqPoint.x2 = x2;
          bestEqPoint.y2 = y2;
          bestEqPoint.way = 2;
        }
        equation.A = equation.I;
        equation.B = equation.J;
        eq = qSVG.nearPointOnEquation(equation, snap);
        if (eq.distance < bestEqPoint.distance) {
          bestEqPoint.distance = eq.distance;
          bestEqPoint.node = index;
          bestEqPoint.x = eq.x;
          bestEqPoint.y = eq.y;
          bestEqPoint.x1 = x1;
          bestEqPoint.y1 = y1;
          bestEqPoint.x2 = x2;
          bestEqPoint.y2 = y2;
          bestEqPoint.way = 2;
        }
      } // END INDEXOF EXCEPT TEST
    } // END LOOP FOR
  
    if (bestEqPoint.distance < range) {
      if (bestEqPoint.way == 2) {
        window.editorVars.lineIntersection.setAttribute(
          "d", 
          `M${bestEqPoint.x1},${bestEqPoint.y1} L${bestEqPoint.x2},${bestEqPoint.y2} L${bestEqPoint.x},${bestEqPoint.y}`
        );
        window.editorVars.lineIntersection.setAttribute("stroke", "#d7ac57");
      } else {
        window.editorVars.lineIntersection.setAttribute(
          "d", 
          `M${bestEqPoint.x2},${bestEqPoint.y2} L${bestEqPoint.x1},${bestEqPoint.y1} L${bestEqPoint.x},${bestEqPoint.y}`
        );
        window.editorVars.lineIntersection.setAttribute("stroke", "#d7ac57");
      }
      
      return {
        x: bestEqPoint.x,
        y: bestEqPoint.y,
        wall: window.editorVars.WALLS[bestEqPoint.node],
        distance: bestEqPoint.distance,
      };
    } else {
      return false;
    }
};

const intersectionOff = () => {
  console.log();
  if (typeof window.editorVars.lineIntersection != "undefined" && window.editorVars.lineIntersection) {
    window.editorVars.lineIntersection.remove();
  }
};

const minMoveGrid = (mouse, pox: number, poy: number) => {
  return Math.abs(Math.abs(pox - mouse.x) + Math.abs(poy - mouse.y));
  
};

const isObjectsEquals = (a, b, message = false) => {
  if (message) {
    console.log(message);
  }
  
  let isOK = true;

  for (const prop in a) {
    if (a[prop] !== b[prop]) {
      isOK = false;
      break;
    }
  }
  return isOK;
};

let tactile = false;

const calcul_snap = (event, state) => {
  let x_grid;
  let y_grid;
  
  if (event.touches) {
    const touches = event.changedTouches;
    
    console.log("toto");
    eX = touches[0].pageX;
    eY = touches[0].pageY;
    tactile = true;
  } else {
    eX = event.pageX;
    eY = event.pageY;
  }

  const x_mouse = eX * window.editorVars.factor - window.editorVars.offset.left * window.editorVars.factor + window.editorVars.originX_viewbox;
  const y_mouse = eY * window.editorVars.factor - window.editorVars.offset.top * window.editorVars.factor + window.editorVars.originY_viewbox;

  if (state == "on") {
      x_grid = Math.round(x_mouse / grid) * grid;
      y_grid = Math.round(y_mouse / grid) * grid;
  }
  if (state == "off") {
    x_grid = x_mouse;
    y_grid = y_mouse;
  }
  return {
    x: x_grid,
    y: y_grid,
    xMouse: x_mouse,
    yMouse: y_mouse,
  };
};

const rib = (shift = 15) => {
  // return false;

  const ribMaster = [[], []];

  let inter;
  let distance;
  let cross;

  for (const i in window.editorVars.WALLS) {
    if (window.editorVars.WALLS[i].equations.base) {
      ribMaster[0].push([]);
      ribMaster[0][i].push({
        wallIndex: i,
        crossEdge: i,
        side: "up",
        coords: window.editorVars.WALLS[i].coords[0],
        distance: 0,
      });
      ribMaster[1].push([]);
      ribMaster[1][i].push({
        wallIndex: i,
        crossEdge: i,
        side: "down",
        coords: window.editorVars.WALLS[i].coords[1],
        distance: 0,
      });
      for (const p in window.editorVars.WALLS) {
        if (i != p && window.editorVars.WALLS[p].equations.base) {
          cross = qSVG.intersectionOfEquations(
            window.editorVars.WALLS[i].equations.base,
            window.editorVars.WALLS[p].equations.base,
            "object"
          );
          if (
            qSVG.btwn(cross.x, window.editorVars.WALLS[i].start.x, window.editorVars.WALLS[i].end.x, true) &&
            qSVG.btwn(cross.y, window.editorVars.WALLS[i].start.y, window.editorVars.WALLS[i].end.y, true)
          ) {
            inter = qSVG.intersectionOfEquations(
              window.editorVars.WALLS[i].equations.up,
              window.editorVars.WALLS[p].equations.up,
              "object"
            );
            if (
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[i].coords[0].x,
                window.editorVars.WALLS[i].coords[3].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[i].coords[0].y,
                window.editorVars.WALLS[i].coords[3].y,
                true
              ) &&
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[p].coords[0].x,
                window.editorVars.WALLS[p].coords[3].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[p].coords[0].y,
                window.editorVars.WALLS[p].coords[3].y,
                true
              )
            ) {
              distance = qSVG.measure(window.editorVars.WALLS[i].coords[0], inter) / window.editorVars.METER;
              ribMaster[0][i].push({
                wallIndex: i,
                crossEdge: p,
                side: "up",
                coords: inter,
                distance: distance.toFixed(2),
              });
            }

            inter = qSVG.intersectionOfEquations(
              window.editorVars.WALLS[i].equations.up,
              window.editorVars.WALLS[p].equations.down,
              "object"
            );
            if (
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[i].coords[0].x,
                window.editorVars.WALLS[i].coords[3].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[i].coords[0].y,
                window.editorVars.WALLS[i].coords[3].y,
                true
              ) &&
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[p].coords[1].x,
                window.editorVars.WALLS[p].coords[2].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[p].coords[1].y,
                window.editorVars.WALLS[p].coords[2].y,
                true
              )
            ) {
              distance = qSVG.measure(window.editorVars.WALLS[i].coords[0], inter) / window.editorVars.METER;
              ribMaster[0][i].push({
                wallIndex: i,
                crossEdge: p,
                side: "up",
                coords: inter,
                distance: distance.toFixed(2),
              });
            }

            inter = qSVG.intersectionOfEquations(
              window.editorVars.WALLS[i].equations.down,
              window.editorVars.WALLS[p].equations.up,
              "object"
            );
            if (
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[i].coords[1].x,
                window.editorVars.WALLS[i].coords[2].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[i].coords[1].y,
                window.editorVars.WALLS[i].coords[2].y,
                true
              ) &&
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[p].coords[0].x,
                window.editorVars.WALLS[p].coords[3].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[p].coords[0].y,
                window.editorVars.WALLS[p].coords[3].y,
                true
              )
            ) {
              distance = qSVG.measure(window.editorVars.WALLS[i].coords[1], inter) / window.editorVars.METER;
              ribMaster[1][i].push({
                wallIndex: i,
                crossEdge: p,
                side: "down",
                coords: inter,
                distance: distance.toFixed(2),
              });
            }

            inter = qSVG.intersectionOfEquations(
              window.editorVars.WALLS[i].equations.down,
              window.editorVars.WALLS[p].equations.down,
              "object"
            );
            if (
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[i].coords[1].x,
                window.editorVars.WALLS[i].coords[2].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[i].coords[1].y,
                window.editorVars.WALLS[i].coords[2].y,
                true
              ) &&
              qSVG.btwn(
                inter.x,
                window.editorVars.WALLS[p].coords[1].x,
                window.editorVars.WALLS[p].coords[2].x,
                true
              ) &&
              qSVG.btwn(
                inter.y,
                window.editorVars.WALLS[p].coords[1].y,
                window.editorVars.WALLS[p].coords[2].y,
                true
              )
            ) {
              distance = qSVG.measure(window.editorVars.WALLS[i].coords[1], inter) / window.editorVars.METER;
              ribMaster[1][i].push({
                wallIndex: i,
                crossEdge: p,
                side: "down",
                coords: inter,
                distance: distance.toFixed(2),
              });
            }
          }
        }
      }
      distance = qSVG.measure(window.editorVars.WALLS[i].coords[0], window.editorVars.WALLS[i].coords[3]) / window.editorVars.METER;
      
      ribMaster[0][i].push({
        wallIndex: i,
        crossEdge: i,
        side: "up",
        coords: window.editorVars.WALLS[i].coords[3],
        distance: distance.toFixed(2),
      });

      distance = qSVG.measure(window.editorVars.WALLS[i].coords[1], window.editorVars.WALLS[i].coords[2]) / window.editorVars.METER;
      ribMaster[1][i].push({
        wallIndex: i,
        crossEdge: i,
        side: "down",
        coords: window.editorVars.WALLS[i].coords[2],
        distance: distance.toFixed(2),
      });
    }
  }

  for (const a in ribMaster[0]) {
    ribMaster[0][a].sort(function (a, b) {
      return (a.distance - b.distance).toFixed(2);
    });
  }
  for (const a in ribMaster[1]) {
    ribMaster[1][a].sort(function (a, b) {
      return (a.distance - b.distance).toFixed(2);
    });
  }

  const sizeText = [];
  
  clearHtmlTagById("boxRib");

  for (const t in ribMaster) {
    for (const a in ribMaster[t]) {
      for (let n = 1; n < ribMaster[t][a].length; n++) {
        if (ribMaster[t][a][n - 1].wallIndex == ribMaster[t][a][n].wallIndex) {
          const edge = ribMaster[t][a][n].wallIndex;
          let found = true;
          const valueText = Math.abs(
            ribMaster[t][a][n - 1].distance - ribMaster[t][a][n].distance
          );
          // CLEAR TOO LITTLE VALUE
          if (valueText < 0.15) {
            found = false;
          }
          // CLEAR (thick) BETWEEN CROSS EDGE
          if (
            found &&
            ribMaster[t][a][n - 1].crossEdge == ribMaster[t][a][n].crossEdge &&
            ribMaster[t][a][n].crossEdge != ribMaster[t][a][n].wallIndex
          ) {
            found = false;
          }
          // CLEAR START INTO EDGE
          if (found && ribMaster[t][a].length > 2 && n == 1) {
            const polygon = [];
            for (let pp = 0; pp < 4; pp++) {
              polygon.push({
                x: window.editorVars.WALLS[ribMaster[t][a][n].crossEdge].coords[pp].x,
                y: window.editorVars.WALLS[ribMaster[t][a][n].crossEdge].coords[pp].y,
              }); // FOR Z
            }
            if (qSVG.rayCasting(ribMaster[t][a][0].coords, polygon)) {
              found = false;
            }
          }
          // CLEAR END INTO EDGE
          if (
            found &&
            ribMaster[t][a].length > 2 &&
            n == ribMaster[t][a].length - 1
          ) {
            const polygon = [];
            for (let pp = 0; pp < 4; pp++) {
              polygon.push({
                x: window.editorVars.WALLS[ribMaster[t][a][n - 1].crossEdge].coords[pp].x,
                y: window.editorVars.WALLS[ribMaster[t][a][n - 1].crossEdge].coords[pp].y,
              }); // FOR Z
            }
            if (
              qSVG.rayCasting(
                ribMaster[t][a][ribMaster[t][a].length - 1].coords,
                polygon
              )
            ) {
              found = false;
            }
          }

          if (found) {
            let angleText =
              window.editorVars.WALLS[ribMaster[t][a][n].wallIndex].angle * (180 / Math.PI);
            let shiftValue = -shift;
            if (ribMaster[t][a][n - 1].side == "down") {
              shiftValue = -shiftValue + 10;
            }
            if (angleText > 90 || angleText < -89) {
              angleText -= 180;
              if (ribMaster[t][a][n - 1].side == "down") {
                shiftValue = -shift;
              } else shiftValue = -shiftValue + 10;
            }
            sizeText[n] = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text"
            );
            const startText = qSVG.middle(
              ribMaster[t][a][n - 1].coords.x,
              ribMaster[t][a][n - 1].coords.y,
              ribMaster[t][a][n].coords.x,
              ribMaster[t][a][n].coords.y
            );
            sizeText[n].setAttributeNS(null, "x", startText.x);
            sizeText[n].setAttributeNS(null, "y", startText.y + shiftValue);
            sizeText[n].setAttributeNS(null, "text-anchor", "middle");
            sizeText[n].setAttributeNS(null, "font-family", "arial");
            sizeText[n].setAttributeNS(null, "stroke", "#ffffff");
            sizeText[n].textContent = valueText.toFixed(2);
            if (sizeText[n].textContent < 1) {
              sizeText[n].setAttributeNS(null, "font-size", "0.73em");
              sizeText[n].textContent = sizeText[n].textContent.substring(
                1,
                sizeText[n].textContent.length
              );
            } else sizeText[n].setAttributeNS(null, "font-size", "0.9em");
            sizeText[n].setAttributeNS(null, "stroke-width", "0.2px");
            sizeText[n].setAttributeNS(null, "fill", "#555555");
            sizeText[n].setAttribute(
              "transform",
              "rotate(" +
                angleText +
                " " +
                startText.x +
                "," +
                startText.y +
                ")"
            );

            document.getElementById("boxRib")?.append(sizeText[n]);
          }
        }
      }
    }
  }
};

function load(index = window.editorVars.HISTORY.index, boot = false) {
  if (window.editorVars.HISTORY.length == 0 && !boot) {
    return false;
  }
  for (var k in window.editorVars.OBJDATA) {
    window.editorVars.OBJDATA[k].graph.remove();
  }
  window.editorVars.OBJDATA = [];
  let historyTemp = [];
  historyTemp = JSON.parse(localStorage.getItem("history"));
  historyTemp = JSON.parse(historyTemp[index]);

  for (var k in historyTemp.objData) {
    const OO = historyTemp.objData[k];
    // if (OO.family == 'energy') OO.family = 'byObject';
    const obj = new editor.obj2D(
      OO.family,
      OO.class,
      OO.type,
      { x: OO.x, y: OO.y },
      OO.angle,
      OO.angleSign,
      OO.size,
      (OO.hinge = "normal"),
      OO.thick,
      OO.value
    );
    obj.limit = OO.limit;
    window.editorVars.OBJDATA.push(obj);

    document.getElementById("boxcarpentry")?.append(window.editorVars.OBJDATA[window.editorVars.OBJDATA.length - 1].graph);
    
    obj.update();
  }
  window.editorVars.WALLS = historyTemp.wallData;
  for (var k in window.editorVars.WALLS) {
    if (window.editorVars.WALLS[k].child != null) {
      window.editorVars.WALLS[k].child = window.editorVars.WALLS[window.editorVars.WALLS[k].child];
    }

    if (window.editorVars.WALLS[k].parent != null) {
      window.editorVars.WALLS[k].parent = window.editorVars.WALLS[window.editorVars.WALLS[k].parent];
    }
  }

  window.editorVars.ROOM = historyTemp.roomData;
  editor.architect(window.editorVars.WALLS);
  editor.showScaleBox();
  rib();
}

const initHistory = (boot?: string) => {
  window.editorVars.HISTORY.index = 0;
  if (!boot && localStorage.getItem("history")){
    localStorage.removeItem("history");
  }

  if (localStorage.getItem("history") && boot == "recovery") {
    const historyTemp = JSON.parse(localStorage.getItem("history"));
    load(historyTemp.length - 1, "boot");
    save("boot");
  }

  if (boot == "newSquare") {
    if (localStorage.getItem("history")) {
      localStorage.removeItem("history");
    }

    window.editorVars.HISTORY.push({
      objData: [],
      wallData: [
        {
          thick: 20,
          start: { x: 540, y: 194 },
          end: { x: 540, y: 734 },
          type: "normal",
          parent: 3,
          child: 1,
          angle: 1.5707963267948966,
          equations: {
            up: { A: "v", B: 550 },
            down: { A: "v", B: 530 },
            base: { A: "v", B: 540 },
          },
          coords: [
            { x: 550, y: 204 },
            { x: 530, y: 184 },
            { x: 530, y: 744 },
            { x: 550, y: 724 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 540, y: 734 },
          end: { x: 1080, y: 734 },
          type: "normal",
          parent: 0,
          child: 2,
          angle: 0,
          equations: {
            up: { A: "h", B: 724 },
            down: { A: "h", B: 744 },
            base: { A: "h", B: 734 },
          },
          coords: [
            { x: 550, y: 724 },
            { x: 530, y: 744 },
            { x: 1090, y: 744 },
            { x: 1070, y: 724 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 1080, y: 734 },
          end: { x: 1080, y: 194 },
          type: "normal",
          parent: 1,
          child: 3,
          angle: -1.5707963267948966,
          equations: {
            up: { A: "v", B: 1070 },
            down: { A: "v", B: 1090 },
            base: { A: "v", B: 1080 },
          },
          coords: [
            { x: 1070, y: 724 },
            { x: 1090, y: 744 },
            { x: 1090, y: 184 },
            { x: 1070, y: 204 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 1080, y: 194 },
          end: { x: 540, y: 194 },
          type: "normal",
          parent: 2,
          child: 0,
          angle: 3.141592653589793,
          equations: {
            up: { A: "h", B: 204 },
            down: { A: "h", B: 184 },
            base: { A: "h", B: 194 },
          },
          coords: [
            { x: 1070, y: 204 },
            { x: 1090, y: 184 },
            { x: 530, y: 184 },
            { x: 550, y: 204 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
      ],
      roomData: [
        {
          coords: [
            { x: 540, y: 734 },
            { x: 1080, y: 734 },
            { x: 1080, y: 194 },
            { x: 540, y: 194 },
            { x: 540, y: 734 },
          ],
          coordsOutside: [
            { x: 1090, y: 744 },
            { x: 1090, y: 184 },
            { x: 530, y: 184 },
            { x: 530, y: 744 },
            { x: 1090, y: 744 },
          ],
          coordsInside: [
            { x: 1070, y: 724 },
            { x: 1070, y: 204 },
            { x: 550, y: 204 },
            { x: 550, y: 724 },
            { x: 1070, y: 724 },
          ],
          inside: [],
          way: ["0", "2", "3", "1", "0"],
          area: 270400,
          surface: "",
          name: "",
          color: "gradientWhite",
          showSurface: true,
          action: "add",
        },
      ],
    });
    window.editorVars.HISTORY[0] = JSON.stringify(window.editorVars.HISTORY[0]);
    localStorage.setItem("history", JSON.stringify(window.editorVars.HISTORY));
    load(0);
    save();
  }
  if (boot == "newL") {
    if (localStorage.getItem("history")) {
      localStorage.removeItem("history");
    }
    window.editorVars.HISTORY.push({
      objData: [],
      wallData: [
        {
          thick: 20,
          start: { x: 447, y: 458 },
          end: { x: 447, y: 744 },
          type: "normal",
          parent: 5,
          child: 1,
          angle: 1.5707963267948966,
          equations: {
            up: { A: "v", B: 457 },
            down: { A: "v", B: 437 },
            base: { A: "v", B: 447 },
          },
          coords: [
            { x: 457, y: 468 },
            { x: 437, y: 448 },
            { x: 437, y: 754 },
            { x: 457, y: 734 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 447, y: 744 },
          end: { x: 1347, y: 744 },
          type: "normal",
          parent: 0,
          child: 2,
          angle: 0,
          equations: {
            up: { A: "h", B: 734 },
            down: { A: "h", B: 754 },
            base: { A: "h", B: 744 },
          },
          coords: [
            { x: 457, y: 734 },
            { x: 437, y: 754 },
            { x: 1357, y: 754 },
            { x: 1337, y: 734 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 1347, y: 744 },
          end: { x: 1347, y: 144 },
          type: "normal",
          parent: 1,
          child: 3,
          angle: -1.5707963267948966,
          equations: {
            up: { A: "v", B: 1337 },
            down: { A: "v", B: 1357 },
            base: { A: "v", B: 1347 },
          },
          coords: [
            { x: 1337, y: 734 },
            { x: 1357, y: 754 },
            { x: 1357, y: 134 },
            { x: 1337, y: 154 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 1347, y: 144 },
          end: { x: 1020, y: 144 },
          type: "normal",
          parent: 2,
          child: 4,
          angle: 3.141592653589793,
          equations: {
            up: { A: "h", B: 154 },
            down: { A: "h", B: 134 },
            base: { A: "h", B: 144 },
          },
          coords: [
            { x: 1337, y: 154 },
            { x: 1357, y: 134 },
            { x: 1010, y: 134 },
            { x: 1030, y: 154 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 1020, y: 144 },
          end: { x: 1020, y: 458 },
          type: "normal",
          parent: 3,
          child: 5,
          angle: 1.5707963267948966,
          equations: {
            up: { A: "v", B: 1030 },
            down: { A: "v", B: 1010 },
            base: { A: "v", B: 1020 },
          },
          coords: [
            { x: 1030, y: 154 },
            { x: 1010, y: 134 },
            { x: 1010, y: 448 },
            { x: 1030, y: 468 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
        {
          thick: 20,
          start: { x: 1020, y: 458 },
          end: { x: 447, y: 458 },
          type: "normal",
          parent: 4,
          child: 0,
          angle: 3.141592653589793,
          equations: {
            up: { A: "h", B: 468 },
            down: { A: "h", B: 448 },
            base: { A: "h", B: 458 },
          },
          coords: [
            { x: 1030, y: 468 },
            { x: 1010, y: 448 },
            { x: 437, y: 448 },
            { x: 457, y: 468 },
          ],
          graph: { 0: {}, context: {}, length: 1 },
        },
      ],
      roomData: [
        {
          coords: [
            { x: 447, y: 744 },
            { x: 1347, y: 744 },
            { x: 1347, y: 144 },
            { x: 1020, y: 144 },
            { x: 1020, y: 458 },
            { x: 447, y: 458 },
            { x: 447, y: 744 },
          ],
          coordsOutside: [
            { x: 1357, y: 754 },
            { x: 1357, y: 134 },
            { x: 1010, y: 134 },
            { x: 1010, y: 448 },
            { x: 437, y: 448 },
            { x: 437, y: 754 },
            { x: 1357, y: 754 },
          ],
          coordsInside: [
            { x: 1337, y: 734 },
            { x: 1337, y: 154 },
            { x: 1030, y: 154 },
            { x: 1030, y: 468 },
            { x: 457, y: 468 },
            { x: 457, y: 734 },
            { x: 1337, y: 734 },
          ],
          inside: [],
          way: ["0", "2", "3", "4", "5", "1", "0"],
          area: 330478,
          surface: "",
          name: "",
          color: "gradientWhite",
          showSurface: true,
          action: "add",
        },
      ],
    });
    window.editorVars.HISTORY[0] = JSON.stringify(window.editorVars.HISTORY[0]);
    localStorage.setItem("history", JSON.stringify(window.editorVars.HISTORY));
    load(0);
    save();
  }
};

export {
    intersection,
    cursor,
    clearHtmlTagById,
    save,
    intersectionOff,
    minMoveGrid,
    isObjectsEquals,
    calcul_snap,
    rib,
    initHistory,
};
