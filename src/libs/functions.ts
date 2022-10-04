import { SnapType } from "./common.types";
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
            var polygon = [];
            for (var pp = 0; pp < 4; pp++) {
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
};
