import { useStore } from "effector-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useThrottle } from "../../hooks/useThrottle";
import { MODES, ZOOM_MODES } from "../../libs/common";
import { editor } from "../../libs/editor";
import { intersection, intersectionOff, minMoveGrid, save, rib } from "../../libs/functions";
import { qSVG } from "../../libs/qSVG";
import { 
  $cursor, 
  $hasAction, 
  $heightViewbox, 
  $multipleMode, 
  $originXViewbox, 
  $originYViewbox, 
  $widthViewbox, 
  cursorChange,
  hasActionChange,
  heightViewboxChange,
  setRatioViewbox,
  widthViewboxChange,
} from "../../state";

const Rcirclebinder = 8;
const gridMeausre = 20;
let factor = 1;
const gridSnap = "off";

const WALL_SIZE = 20;
const PARTITION_SIZE = 8;
export const ZOOM_SPEED_MULTIPLIER = 0.065;


let originX_viewbox;
let originY_viewbox;

let drag = 0;

const zoomMaker = (lens: ZOOM_MODES, xmove: number, xview: number, zoom: number, originViewbox) => {
  const taille = document.getElementById("lin");
  let width_viewbox = taille?.clientWidth || 0;
  let height_viewbox = taille?.clientHeight || 0;

  if (!originX_viewbox) {
    originX_viewbox = originViewbox.current.x;
  }
  if (!originY_viewbox) {
    originY_viewbox = originViewbox.current.y;
  }

  const ratio_viewbox = height_viewbox / width_viewbox;

  if (lens == ZOOM_MODES.ZOOM_OUT) {
    zoom--;
    width_viewbox += xmove;

    // const ratioWidthZoom = taille_w / width_viewbox;

    height_viewbox = width_viewbox * ratio_viewbox;
    // myDiv = document.getElementById("scaleVal");
    // myDiv.style.width = 60 * ratioWidthZoom + "px";

    originX_viewbox = originX_viewbox - xmove / 2;
    originY_viewbox = originY_viewbox - (xmove / 2) * ratio_viewbox;
  }
  if (lens == ZOOM_MODES.ZOOM_IN) {
    zoom++;
    width_viewbox -= xmove;
    // const ratioWidthZoom = taille_w / width_viewbox;
    // height_viewbox = width_viewbox * ratio_viewbox;
    // myDiv = document.getElementById("scaleVal");
    // myDiv.style.width = 60 * ratioWidthZoom + "px";

    originX_viewbox = originX_viewbox + xmove / 2;
    originY_viewbox = originY_viewbox + (xmove / 2) * ratio_viewbox;
  }
  
  // factor = width_viewbox / (taille?.clientWidth || 0);

  if (lens == ZOOM_MODES.ZOOM_RESET) {
    originX_viewbox = 0;
    originY_viewbox = 0;
    factor = 1;
  }
  if (lens == ZOOM_MODES.ZOOM_RIGHT) {
    originX_viewbox += xview;
  }
  if (lens == ZOOM_MODES.ZOOM_LEFT) {
    originX_viewbox -= xview;
  }
  if (lens == ZOOM_MODES.ZOOM_TOP) {
    originY_viewbox -= xview;
  }
  if (lens == ZOOM_MODES.ZOOM_BOTTOM) {
    originY_viewbox += xview;
  }
  if (lens == ZOOM_MODES.ZOOM_DRAG) {
    originX_viewbox -= xmove;
    originY_viewbox -= xview;
  }

  // document.querySelectorAll("svg").forEach((item) => {
  //   item.setAttribute(
  //     "viewBox", `${originX_viewbox} ${originY_viewbox} ${width_viewbox} ${height_viewbox}`,
  //   );
  // });
};















const calculateSnap = ({
  event,
  factor,
  offset,
  originViewbox,
  state,
  tactile,
}) => {
  console.log('factor', factor);

  const grid = {
    x: 0, 
    y: 0,
  };
  const temp = {
    x: 0,
    y: 0,
  };

  if (event.touches) {
    const touches = event.changedTouches;

    temp.x = touches[0].pageX;
    temp.y = touches[0].pageY;
    tactile.current = true;
  } else {
    temp.x  = event.pageX;
    temp.y = event.pageY;
  }

  const mouse = {
    x: temp.x * factor - offset.left * factor + originViewbox.x,
    y: temp.y * factor - offset.top * factor + originViewbox.y,
  };

  if (state == "on") {
      grid.x = Math.round(mouse.x / gridMeausre) * gridMeausre;
      grid.y = Math.round(mouse.y / gridMeausre) * gridMeausre;
  }
  if (state == "off") {
    grid.x = mouse.x;
    grid.y = mouse.y;
  }
  return {
    ...grid,
    xMouse: mouse.x,
    yMouse: mouse.y,
  };
};

const useLinearEngine = (ref?: React.RefObject<SVGAElement>, mode?: string) => {
  const currentPositon = useRef({
    x: 0,
    y: 0,
  });

  const startedCursorPositon = useRef({
    x: 0,
    y: 0,
  });
     
  const offset = useRef({
    top: 0,
    left: 0,
  });    

  const wallStartConstruc = useRef<{x: number, y: number} | false>(false);
  const wallEndConstruc = useRef<{x: number, y: number} | boolean>(false);

  const construct = useRef(0);
  const tactile = useRef(false);

  const hasAction = useStore($hasAction);
  const cursor = useStore($cursor);
  const multipleMode = useStore($multipleMode);

  const originXViewbox = useStore($originXViewbox);
  const originYViewbox = useStore($originYViewbox);
  const widthViewbox = useStore($widthViewbox);
  const heightViewbox = useStore($heightViewbox);

  const mouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();

    if (mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE) {
      if (hasAction == 0) {
        const snap = calculateSnap({
          event, 
          state: gridSnap,
          factor,
          offset: offset.current,
          originViewbox: {
            x: originXViewbox,
            y: originYViewbox,
          },
          tactile,
        });

        currentPositon.current.x = snap.x;
        currentPositon.current.y = snap.y;
        
        wallStartConstruc.current = editor.nearWall({snap, range:12});

        if (wallStartConstruc.current) {
          // TO SNAP SEGMENT TO FINALIZE X2Y2
          currentPositon.current.x = wallStartConstruc.current.x;
          currentPositon.current.y = wallStartConstruc.current.y;
        }
      } else {
        construct.current = 1;
      }
      console.log("blяяя");
      hasActionChange(1);
    }

    if (mode == MODES.SELECT_MODE) {
      let newHasAction = hasAction;

      if (
        typeof window.editorVars.binder != "undefined" &&
        (window.editorVars.binder.type == "segment" ||
          window.editorVars.binder.type == "node" ||
          window.editorVars.binder.type == "obj" ||
          window.editorVars.binder.type == "boundingBox")
      ) {
        mode = MODES.BIND_MODE;
  
        if (window.editorVars.binder.type == "obj" || window.editorVars.binder.type == "boundingBox") {
          newHasAction = 1;
        }
  
        // INIT FOR HELP BINDER NODE MOVING H V (MOUSE DOWN)
        if (window.editorVars.binder.type == "node") {
          const node = window.editorVars.binder.data;

          startedCursorPositon.current.x = node.x;
          startedCursorPositon.current.y = node.y;

          const nodeControl = { 
            x: startedCursorPositon.current.x, 
            y: startedCursorPositon.current.y,
          };
  
          // DETERMINATE DISTANCE OF OPPOSED NODE ON EDGE(s) PARENT(s) OF THIS NODE !!!! NODE 1 -- NODE 2 SYSTE% :-(
          const wallListObj = []; // SUPER VAR -- WARNING
          let objWall;
          const wallListRun = [];

          for (let ee = window.editorVars.WALLS.length - 1; ee > -1; ee--) {
            // SEARCH MOST YOUNG WALL COORDS IN NODE BINDER
            if (
              isObjectsEquals(window.editorVars.WALLS[ee].start, nodeControl) ||
              isObjectsEquals(window.editorVars.WALLS[ee].end, nodeControl)
            ) {
              wallListRun.push(window.editorVars.WALLS[ee]);
              break;
            }
          }

          if (wallListRun[0].child != null) {
            if (
              isObjectsEquals(wallListRun[0].child.start, nodeControl) ||
              isObjectsEquals(wallListRun[0].child.end, nodeControl)
            )
              wallListRun.push(wallListRun[0].child);
          }
          if (wallListRun[0].parent != null) {
            if (
              isObjectsEquals(wallListRun[0].parent.start, nodeControl) ||
              isObjectsEquals(wallListRun[0].parent.end, nodeControl)
            )
              wallListRun.push(wallListRun[0].parent);
          }
  
          for (const k in wallListRun) {
            if (
              isObjectsEquals(wallListRun[k].start, nodeControl) ||
              isObjectsEquals(wallListRun[k].end, nodeControl)
            ) {
              let nodeTarget = wallListRun[k].start;
              if (isObjectsEquals(wallListRun[k].start, nodeControl)) {
                nodeTarget = wallListRun[k].end;
              }
              objWall = editor.objFromWall(wallListRun[k]); // LIST OBJ ON EDGE -- NOT INDEX !!!
              wall = wallListRun[k];

              for (let ob = 0; ob < objWall.length; ob++) {
                const objTarget = objWall[ob];
                const distance = qSVG.measure(objTarget, nodeTarget);
                wallListObj.push({
                  wall: wall,
                  from: nodeTarget,
                  distance: distance,
                  obj: objTarget,
                  indexObj: ob,
                });
              }
            }
          }

          magnetic = 0;
          newHasAction = 1;
        }

        // if (binder.type == "segment") {
        //   $("#boxScale").hide(100);
        //   var wall = binder.wall;
        //   binder.before = binder.wall.start;
        //   equation2 = editor.createEquationFromWall(wall);
        //   if (wall.parent != null) {
        //     equation1 = editor.createEquationFromWall(wall.parent);
        //     var angle12 = qSVG.angleBetweenEquations(equation1.A, equation2.A);
        //     if (angle12 < 20 || angle12 > 160) {
        //       var found = true;
        //       for (var k in WALLS) {
        //         if (
        //           qSVG.rayCasting(wall.start, WALLS[k].coords) &&
        //           !isObjectsEquals(WALLS[k], wall.parent) &&
        //           !isObjectsEquals(WALLS[k], wall)
        //         ) {
        //           if (
        //             wall.parent.parent != null &&
        //             isObjectsEquals(wall, wall.parent.parent)
        //           )
        //             wall.parent.parent = null;
        //           if (
        //             wall.parent.child != null &&
        //             isObjectsEquals(wall, wall.parent.child)
        //           )
        //             wall.parent.child = null;
        //           wall.parent = null;
        //           found = false;
        //           break;
        //         }
        //       }
        //       if (found) {
        //         var newWall;
        //         if (isObjectsEquals(wall.parent.end, wall.start, "1")) {
        //           newWall = new editor.wall(
        //             wall.parent.end,
        //             wall.start,
        //             "normal",
        //             wall.thick
        //           );
        //           WALLS.push(newWall);
        //           newWall.parent = wall.parent;
        //           newWall.child = wall;
        //           wall.parent.child = newWall;
        //           wall.parent = newWall;
        //           equation1 = qSVG.perpendicularEquation(
        //             equation2,
        //             wall.start.x,
        //             wall.start.y
        //           );
        //         } else if (isObjectsEquals(wall.parent.start, wall.start, "2")) {
        //           newWall = new editor.wall(
        //             wall.parent.start,
        //             wall.start,
        //             "normal",
        //             wall.thick
        //           );
        //           WALLS.push(newWall);
        //           newWall.parent = wall.parent;
        //           newWall.child = wall;
        //           wall.parent.parent = newWall;
        //           wall.parent = newWall;
        //           equation1 = qSVG.perpendicularEquation(
        //             equation2,
        //             wall.start.x,
        //             wall.start.y
        //           );
        //         }
        //         // CREATE NEW WALL
        //       }
        //     }
        //   }
        //   if (wall.parent == null) {
        //     var foundEq = false;
        //     for (var k in WALLS) {
        //       if (
        //         qSVG.rayCasting(wall.start, WALLS[k].coords) &&
        //         !isObjectsEquals(WALLS[k].coords, wall.coords)
        //       ) {
        //         var angleFollow = qSVG.angleBetweenEquations(
        //           WALLS[k].equations.base.A,
        //           equation2.A
        //         );
        //         if (angleFollow < 20 || angleFollow > 160) break;
        //         equation1 = editor.createEquationFromWall(WALLS[k]);
        //         equation1.follow = WALLS[k];
        //         equation1.backUp = {
        //           coords: WALLS[k].coords,
        //           start: WALLS[k].start,
        //           end: WALLS[k].end,
        //           child: WALLS[k].child,
        //           parent: WALLS[k].parent,
        //         };
        //         foundEq = true;
        //         break;
        //       }
        //     }
        //     if (!foundEq)
        //       equation1 = qSVG.perpendicularEquation(
        //         equation2,
        //         wall.start.x,
        //         wall.start.y
        //       );
        //   }
  
        //   if (wall.child != null) {
        //     equation3 = editor.createEquationFromWall(wall.child);
        //     var angle23 = qSVG.angleBetweenEquations(equation3.A, equation2.A);
        //     if (angle23 < 20 || angle23 > 160) {
        //       var found = true;
        //       for (var k in WALLS) {
        //         if (
        //           qSVG.rayCasting(wall.end, WALLS[k].coords) &&
        //           !isObjectsEquals(WALLS[k], wall.child) &&
        //           !isObjectsEquals(WALLS[k], wall)
        //         ) {
        //           if (
        //             wall.child.parent != null &&
        //             isObjectsEquals(wall, wall.child.parent)
        //           )
        //             wall.child.parent = null;
        //           if (
        //             wall.child.child != null &&
        //             isObjectsEquals(wall, wall.child.child)
        //           )
        //             wall.child.child = null;
        //           wall.child = null;
        //           found = false;
        //           break;
        //         }
        //       }
        //       if (found) {
        //         if (isObjectsEquals(wall.child.start, wall.end)) {
        //           var newWall = new editor.wall(
        //             wall.end,
        //             wall.child.start,
        //             "new",
        //             wall.thick
        //           );
        //           WALLS.push(newWall);
        //           newWall.parent = wall;
        //           newWall.child = wall.child;
        //           wall.child.parent = newWall;
        //           wall.child = newWall;
        //           equation3 = qSVG.perpendicularEquation(
        //             equation2,
        //             wall.end.x,
        //             wall.end.y
        //           );
        //         } else if (isObjectsEquals(wall.child.end, wall.end)) {
        //           var newWall = new editor.wall(
        //             wall.end,
        //             wall.child.end,
        //             "normal",
        //             wall.thick
        //           );
        //           WALLS.push(newWall);
        //           newWall.parent = wall;
        //           newWall.child = wall.child;
        //           wall.child.child = newWall;
        //           wall.child = newWall;
        //           equation3 = qSVG.perpendicularEquation(
        //             equation2,
        //             wall.end.x,
        //             wall.end.y
        //           );
        //         }
        //         // CREATE NEW WALL
        //       }
        //     }
        //   }
        //   if (wall.child == null) {
        //     var foundEq = false;
        //     for (var k in WALLS) {
        //       if (
        //         qSVG.rayCasting(wall.end, WALLS[k].coords) &&
        //         !isObjectsEquals(WALLS[k].coords, wall.coords, "4")
        //       ) {
        //         var angleFollow = qSVG.angleBetweenEquations(
        //           WALLS[k].equations.base.A,
        //           equation2.A
        //         );
        //         if (angleFollow < 20 || angleFollow > 160) break;
        //         equation3 = editor.createEquationFromWall(WALLS[k]);
        //         equation3.follow = WALLS[k];
        //         equation3.backUp = {
        //           coords: WALLS[k].coords,
        //           start: WALLS[k].start,
        //           end: WALLS[k].end,
        //           child: WALLS[k].child,
        //           parent: WALLS[k].parent,
        //         };
        //         foundEq = true;
        //         break;
        //       }
        //     }
        //     if (!foundEq)
        //       equation3 = qSVG.perpendicularEquation(
        //         equation2,
        //         wall.end.x,
        //         wall.end.y
        //       );
        //   }
  
        //   equationFollowers = [];
        //   for (var k in WALLS) {
        //     if (
        //       WALLS[k].child == null &&
        //       qSVG.rayCasting(WALLS[k].end, wall.coords) &&
        //       !isObjectsEquals(wall, WALLS[k])
        //     ) {
        //       equationFollowers.push({
        //         wall: WALLS[k],
        //         eq: editor.createEquationFromWall(WALLS[k]),
        //         type: "end",
        //       });
        //     }
        //     if (
        //       WALLS[k].parent == null &&
        //       qSVG.rayCasting(WALLS[k].start, wall.coords) &&
        //       !isObjectsEquals(wall, WALLS[k])
        //     ) {
        //       equationFollowers.push({
        //         wall: WALLS[k],
        //         eq: editor.createEquationFromWall(WALLS[k]),
        //         type: "start",
        //       });
        //     }
        //   }
  
        //   equationsObj = [];
        //   var objWall = editor.objFromWall(wall); // LIST OBJ ON EDGE
        //   for (var ob = 0; ob < objWall.length; ob++) {
        //     var objTarget = objWall[ob];
        //     equationsObj.push({
        //       obj: objTarget,
        //       wall: wall,
        //       eq: qSVG.perpendicularEquation(equation2, objTarget.x, objTarget.y),
        //     });
        //   }
        //   action = 1;
        // }
      } else {
        newHasAction = 0;
        drag = 1;

        const snap  = calculateSnap({
          event, 
          state: "off",
          factor,
          offset: offset.current,
          originViewbox: {
            x: originXViewbox,
            y: originYViewbox,
          },
          tactile
        });

        // если что править тута
        startedCursorPositon.current.x = snap.xMouse;
        startedCursorPositon.current.y = snap.yMouse;
      }

      if (newHasAction != hasAction) {
        hasActionChange(newHasAction);
      }
    }
  }, [
    mode, 
    hasAction,  
    currentPositon,
    originXViewbox,
    originYViewbox,
    offset,
    wallStartConstruc,
    construct,
    tactile, 
  ]);

  const mouseMove = useCallback((event: React.MouseEvent) => {
    let newCursor = cursor;
    event.preventDefault();    

    if ((mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE) && hasAction == 0) {
      const snap  = calculateSnap({
        event, 
        state: "off",
        factor,
        offset: offset.current,
        originViewbox: {
          x: originXViewbox,
          y: originYViewbox,
        },
        tactile
      });
      
      newCursor = "grab";
      startedCursorPositon.current.x = snap.x;
      startedCursorPositon.current.y = snap.y;

      const helpConstruc = intersection({snap, range: 25});

      if (helpConstruc) {
        if (helpConstruc.distance < 10) {
          startedCursorPositon.current.x = helpConstruc.x;
          startedCursorPositon.current.y = helpConstruc.y;
          newCursor = "grab";
        } else {
          newCursor = "crosshair";
        }
      }

      const wallNode = editor.nearWallNode({snap, range: 20});

      if (wallNode) {
        startedCursorPositon.current.x = wallNode.x;
        startedCursorPositon.current.y = wallNode.y;
        
        newCursor = "grab";

        if (!window.editorVars.binder) {
          window.editorVars.binder = qSVG.create("boxbind", "circle", {
            id: "circlebinder",
            class: "circle_css_2",
            cx: wallNode.x,
            cy: wallNode.y,
            r: Rcirclebinder / 1.5,
          });
        }
        intersectionOff();
      } else {
        if (!helpConstruc) {
          newCursor = "crosshair";
        }

        if (window.editorVars.binder) {

          if (window.editorVars.binder.graph) {
            window.editorVars.binder.graph.remove();
          } else {
            window.editorVars.binder.remove();
          }
          window.editorVars.binder = undefined;
        }
      }
    }
  
    if (hasAction == 1 && (mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE)) {
      const snap = calculateSnap({
        event, 
        state: gridSnap,
        factor,
        offset: offset.current,
        originViewbox: {
          x: originXViewbox,
          y: originYViewbox,
        },
        tactile,
      });

      currentPositon.current.x = snap.x;
      currentPositon.current.y = snap.y;
      const starter = minMoveGrid(snap, startedCursorPositon.current.x, startedCursorPositon.current.y);
  
      if (!document.querySelectorAll("#line_construc").length) {
        const wallNode = editor.nearWallNode({ snap, range: 20 });

        if (wallNode ) {
          currentPositon.current.x = wallNode.x;
          currentPositon.current.y = wallNode.y;
  
          wallStartConstruc.current = false;
          if (wallNode.bestWall == window.editorVars.WALLS.length - 1) {
            newCursor = "validation";
          } else {
            newCursor = "grab";
          }
        } else {
          newCursor = "crosshair";
        }
      }
  
      if (starter > gridMeausre) {
        if (!document.querySelectorAll("#line_construc").length) {
          
          let ws = 20;

          if (mode == MODES.PARTITION_MODE) {
            ws = 10;
          }

          qSVG.create("boxbind", "line", {
            id: "line_construc",
            x1: startedCursorPositon.current.x,
            y1: startedCursorPositon.current.y,
            x2: currentPositon.current.x,
            y2: currentPositon.current.y,
            "stroke-width": ws,
            "stroke-linecap": "butt",
            "stroke-opacity": 0.7,
            stroke: "#9fb2e2",
          });
  
          qSVG.create("boxbind", "line", {
            // ORANGE TEMP LINE FOR ANGLE 0 90 45 -+
            id: "linetemp",
            x1: startedCursorPositon.current.x,
            y1: startedCursorPositon.current.y,
            x2: currentPositon.current.x,
            y2: currentPositon.current.y,
            // stroke: "transparent",
            stroke: "red",
            "stroke-width": 0.5,
            "stroke-opacity": "0.9",
          });
        } else {
          // THE LINES AND BINDER ARE CREATED
  
          const lineTemp = document.getElementById("linetemp");

          if (lineTemp) {
            lineTemp.setAttribute("x2", (currentPositon.current.x).toString());
            lineTemp.setAttribute("y2", (currentPositon.current.y).toString());
          }
  
          const helpConstrucEnd = intersection({snap, range: 10});

          if (helpConstrucEnd) {
            currentPositon.current.x = helpConstrucEnd.x;
            currentPositon.current.y = helpConstrucEnd.y;
          }

          wallEndConstruc.current = editor.nearWall({snap, range: 12});

          if (wallEndConstruc.current) {
            // TO SNAP SEGMENT TO FINALIZE X2Y2
            currentPositon.current.x = wallEndConstruc.current.x;
            currentPositon.current.y = wallEndConstruc.current.y;
            newCursor = "grab";
          } else {
            newCursor = "crosshair";
          }
  
          // nearNode helped to attach the end of the construc line

          const wallNode = editor.nearWallNode({snap, range: 20});

          if (wallNode) {
            if (!window.editorVars.binder) {
              window.editorVars.binder = qSVG.create("boxbind", "circle", {
                id: "circlebinder",
                class: "circle_css_2",
                cx: wallNode.x,
                cy: wallNode.y,
                r: Rcirclebinder / 1.5,
              });
            }

            const lineConstruc = document.getElementById("line_construc");

            if (lineConstruc && wallNode) {
              lineConstruc.setAttribute("x2", (wallNode.x).toString());
              lineConstruc.setAttribute("y2", (wallNode.y).toString());
            }

            currentPositon.current.x = wallNode.x;
            currentPositon.current.y = wallNode.y;
            wallEndConstruc.current = true;
            
            intersectionOff();
            
            if ( wallNode.bestWall == window.editorVars.WALLS.length - 1 && multipleMode) {
              newCursor = "crosshair";
            } else {
              newCursor = "grab";
            }
          } else {
            if (window.editorVars.binder) {
              window.editorVars.binder.remove();
              window.editorVars.binder = undefined;
            }
            if (wallEndConstruc.current === false) {
              newCursor = "crosshair";
            }
          }
          
          // LINETEMP AND LITLLE SNAPPING FOR HELP TO CONSTRUC ANGLE 0 90 45 *****************************************
          const fltt = qSVG.angle(
            startedCursorPositon.current.x, 
            startedCursorPositon.current.y, 
            currentPositon.current.x, 
            currentPositon.current.y
          );
          const flt = Math.abs(fltt.deg);
          const coeff = fltt.deg / flt; // -45 -> -1     45 -> 1
          const phi = startedCursorPositon.current.y - coeff * startedCursorPositon.current.x;
          const Xdiag = (currentPositon.current.y - phi) / coeff;

          let lineConstruc;

          if (window.editorVars.binder) {
            // HELP FOR H LINE
            let found = false;
            if (flt < 15 && Math.abs(currentPositon.current.y - startedCursorPositon.current.y) < 25) {
              startedCursorPositon.current.y = currentPositon.current.y;
              found = true;
            } // HELP FOR V LINE
            if (flt > 75 && Math.abs(currentPositon.current.x - startedCursorPositon.current.x) < 25) {
              startedCursorPositon.current.x = currentPositon.current.x;
              found = true;
            } // HELP FOR DIAG LINE
            if (flt < 55 && flt > 35 && Math.abs(Xdiag - startedCursorPositon.current.x) < 20) {
              startedCursorPositon.current.x = Xdiag;
              found = true;
            }

            lineConstruc = document.getElementById("line_construc");

            if (lineConstruc && wallNode) {
              lineConstruc.setAttribute("stroke-opacity", (wallNode.x).toString());

              if (found) {
                lineConstruc.setAttribute("stroke-opacity", (1).toString());
              } else {
                lineConstruc.setAttribute("stroke-opacity", (0.7).toString());
              }
            }
          }


          lineConstruc = document.getElementById("line_construc");

          if (lineConstruc) {
            lineConstruc.setAttribute("x2", (currentPositon.current.x).toString());
            lineConstruc.setAttribute("y2", (currentPositon.current.y).toString());
          }
  
          // // SHOW WALL SIZE -------------------------------------------------------------------------
          const startText = qSVG.middle(
            startedCursorPositon.current.x, 
            startedCursorPositon.current.y, 
            currentPositon.current.x, 
            currentPositon.current.y,
          );
          const angleText = qSVG.angle(
            startedCursorPositon.current.x, 
            startedCursorPositon.current.y, 
            currentPositon.current.x, 
            currentPositon.current.y,
          );
          const valueText = (
            qSVG.measure(
              {
                x: startedCursorPositon.current.x,
                y: startedCursorPositon.current.y,
              },
              {
                x: currentPositon.current.x,
                y: currentPositon.current.y,
              }
            ) / 60
          ).toFixed(2);
          
          if (typeof window.editorVars.lengthTemp == "undefined") {
            window.editorVars.lengthTemp = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text"
            );
            window.editorVars.lengthTemp.setAttributeNS(null, "x", (startText.x).toString());
            window.editorVars.lengthTemp.setAttributeNS(null, "y", (startText.y - 15).toString());
            window.editorVars.lengthTemp.setAttributeNS(null, "text-anchor", "middle");
            window.editorVars.lengthTemp.setAttributeNS(null, "stroke", "none");
            window.editorVars.lengthTemp.setAttributeNS(null, "stroke-width", "0.6px");
            window.editorVars.lengthTemp.setAttributeNS(null, "fill", "#777777");
            window.editorVars.lengthTemp.textContent = valueText + "m";

            document.getElementById("boxbind")?.append(window.editorVars.lengthTemp);
          }
          if (typeof window.editorVars.lengthTemp != "undefined" && Number(valueText) > 0.1) {
            window.editorVars.lengthTemp.setAttributeNS(null, "x", (startText.x).toString());
            window.editorVars.lengthTemp.setAttributeNS(null, "y", (startText.y - 15).toString());
            window.editorVars.lengthTemp.setAttribute(
              "transform",
              `rotate(${angleText.deg} ${startText.x},${startText.y})`
            );
            window.editorVars.lengthTemp.textContent = valueText + " m";
          }
          if (typeof window.editorVars.lengthTemp != "undefined" && Number(valueText) < 0.1) {
            window.editorVars.lengthTemp.textContent = "";
          }
        }
      }
    }

    if (mode == MODES.SELECT_MODE && drag === 1) {
      const snap = calculateSnap({
        event, 
        state: gridSnap,
        factor,
        offset: offset.current,
        originViewbox: {
          x: originXViewbox,
          y: originYViewbox,
        },
        tactile,
      });

      newCursor = "move";

      const distX = (snap.xMouse - startedCursorPositon.current.x) * factor;
      const distY = (snap.yMouse - startedCursorPositon.current.y) * factor;

      // console.log("distX", distX);
      // console.log("distY", distY);

      zoomMaker(ZOOM_MODES.ZOOM_DRAG, distX, distY, 1,{
        x: originXViewbox,
        y: originYViewbox,
      },);
    }

    if (newCursor != cursor) {
      cursorChange(newCursor);
    }
  }, [
    mode, 
    currentPositon ,
    startedCursorPositon,
    originXViewbox,
    originYViewbox,
    offset,    
    wallStartConstruc,
    wallEndConstruc,
    construct,
    tactile,
    hasAction,
    cursor,
  ]);

  const mouseUp = useCallback((event: React.MouseEvent) => {
    let newCursor = cursor;
    let newHasActionState = hasAction;
    
    event.preventDefault();

    drag = 0;
    newCursor = "default";

    if (mode == MODES.SELECT_MODE) {
      if (typeof window.editorVars.binder != "undefined") {
        window.editorVars.binder.remove();
        save();
      }
    }

    if (mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE) {
      document.getElementById("linetemp")?.remove();
      intersectionOff();
  
      let sizeWall = qSVG.measure({ 
        x: currentPositon.current.x, 
        y: currentPositon.current.y 
      }, 
      { 
        x: startedCursorPositon.current.x,
        y: startedCursorPositon.current.y
      });
  
      sizeWall = sizeWall / window.editorVars.METER;
  

      if (document.querySelectorAll("#line_construc").length && sizeWall > 0.3) {
        sizeWall = WALL_SIZE;

        if (mode == MODES.PARTITION_MODE) {
          sizeWall = PARTITION_SIZE;
        }

        const wall = new editor.wall({
            x: currentPositon.current.x, 
            y: currentPositon.current.y 
          },
          {
            x: startedCursorPositon.current.x,
            y: startedCursorPositon.current.y
          },
          "normal",
          sizeWall
        );

        window.editorVars.WALLS.push(wall);
        editor.architect(window.editorVars.WALLS);
  
        console.log("wallEndConstruc.current", wallEndConstruc.current);
        if (multipleMode && (typeof wallEndConstruc.current === "boolean" && !wallEndConstruc.current)) {
          newCursor ="validation";

          newHasActionState = 1;
        } else {
          newHasActionState = 0;
        }

        document.getElementById("line_construc")?.remove(); // DEL LINE CONSTRUC HELP TO VIEW NEW SEG PATH

        if (window.editorVars.lengthTemp) {
          window.editorVars.lengthTemp.remove();
        }

        window.editorVars.lengthTemp = undefined;

        construct.current = 0;

        console.log("wallEndConstruc", wallEndConstruc.current);
        if (wallEndConstruc.current) {
          newHasActionState = 0;
        }
        
        wallEndConstruc.current = false;
        
        startedCursorPositon.current.x = currentPositon.current.x;
        startedCursorPositon.current.y = currentPositon.current.y;

        save();
      } else {
        newHasActionState = 0;
        construct.current = 0;

        if (window.editorVars.binder) {
          window.editorVars.binder.remove();
          window.editorVars.binder = undefined;
        }
        const snap = calculateSnap({
          event, 
          state: gridSnap,
          factor,
          offset: offset.current,
          originViewbox: {
            x: originXViewbox,
            y: originYViewbox,
          },
          tactile
        });
        
        currentPositon.current.x = snap.x;
        currentPositon.current.y = snap.y;
      }
    }

    if (mode != "edit_room_mode") {
      editor.showScaleBox();
      rib();
    }

    if (newHasActionState != hasAction) {
      hasActionChange(newHasActionState);
    }

    if (newCursor != cursor) {
      cursorChange(newCursor);
    }
  }, [   
    mode, 
    hasAction,
    currentPositon ,
    startedCursorPositon,
    originXViewbox,
    originYViewbox,
    offset,    
    wallStartConstruc,
    wallEndConstruc,
    construct,
    tactile,
    cursor,
  ]);

  const throttleMouseMove = useThrottle((event) => mouseMove(event), 30);

  useEffect(() => {
    const taille = document.getElementById("lin");
    const widthViewbox = taille?.clientWidth || 0;
    const heightViewbox = taille?.clientHeight || 0;

    offset.current.top = taille?.clientTop || 0;
    offset.current.left = taille?.clientLeft || 0;

    widthViewboxChange(widthViewbox);
    heightViewboxChange(heightViewbox);

    setRatioViewbox(heightViewbox / widthViewbox);
  }, [offset]);

  useEffect(() => {
    const taille = document.getElementById("lin");
    const tailleWidth = taille?.clientWidth || 0;

    factor = widthViewbox / tailleWidth;

    document.querySelectorAll("svg#lin").forEach((item) => {
      item.setAttribute(
        "viewBox", `${originXViewbox} ${originYViewbox} ${widthViewbox} ${heightViewbox}`
      );
    });
  }, [originXViewbox, originYViewbox, widthViewbox, heightViewbox]);

  const getOffset = useCallback((e: MouseEvent | Touch) => {
    if (!ref?.current) {
      return;
    }

    const containerRect = ref?.current.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    
    return { x: offsetX, y: offsetY };
  }, [ref]);

  const zoomTo = useCallback((x: number, y: number, ratio: number) => {
    const { minZoom, maxZoom } = { minZoom: 1, maxZoom: 1000};
    const { x: transformX, y: transformY, scale, angle } = {    
      x: 0,
      y: 0,
      scale: 1,
      angle: 0,
    };

    let newScale = scale * ratio;
    if (newScale < minZoom) {
      if (scale === minZoom) {
        return;
      }
      ratio = minZoom / scale;
      newScale = minZoom;
    } else if (newScale > maxZoom) {
      if (scale === maxZoom) {
        return;
      }
      ratio = maxZoom / scale;
      newScale = maxZoom;
    }

    const newX = x - ratio * (x - transformX);
    const newY = y - ratio * (y - transformY);

    console.log("newX", newX);
    console.log("newY", newY);
    console.log("angle", angle);

    // const { boundX, boundY } = getBoundCoordinates({ x: newX, y: newY }, { angle, scale, offsetX: newX, offsetY: newY });
    const { boundX, boundY } = {
      boundX: 50,
      boundY: 45
    };

    const prevPanPosition = { x: boundX, y: boundY };

    console.log("prevPanPosition", prevPanPosition);

    console.log("final", { x: boundX, y: boundY, scale: newScale });

    // document.querySelectorAll("svg").forEach((item) => {
    //   item.setAttribute(
    //     "viewBox", `${originX_viewbox} ${originY_viewbox} ${width_viewbox} ${height_viewbox}`,
    //   );
    // });

    // if (newScale> 0) {
    //   zoomMaker(ZOOM_MODES.ZOOM_IN, boundX, boundY, newScale, originViewbox);
    // } else {
    //   zoomMaker(ZOOM_MODES.ZOOM_OUT, boundX, boundY, newScale, originViewbox);
    // }
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const getScaleMultiplier = (delta: number, zoomSpeed = 1): number => {
      const speed = ZOOM_SPEED_MULTIPLIER * zoomSpeed;
      let scaleMultiplier = 1;
      if (delta > 0) { // zoom out
        scaleMultiplier = (1 - speed);
      } else if (delta < 0) { // zoom in
        scaleMultiplier = (1 + speed);
      }
    
      return scaleMultiplier;
    };

    const scale = getScaleMultiplier(e.deltaY, 1);

    console.log("scale", scale);

   const offset = getOffset(e);

   if (offset) {
    console.log("offset", offset);

    zoomTo(offset.x, offset.y, scale);
   }
  }, []);

  useEffect(() => {
    if (!ref?.current) {
        return;
    }

    ref.current.addEventListener("wheel", onWheel, { passive: false });

    ref.current.addEventListener("click", (event: React.MouseEvent) => {
      event.preventDefault();
    });

    return function cleanup() {
      ref.current?.removeEventListener("wheel", onWheel, true);

      ref.current?.removeEventListener("click", (event: React.MouseEvent) => {
        event.preventDefault();
      });
    };

  }, [ref]);

  useEffect(() => {
    if (!ref?.current) {
        return;
    }

    ref.current.addEventListener("mouseup", mouseUp, true);
    ref.current.addEventListener("mousemove", throttleMouseMove);
    ref.current.addEventListener("mousedown", mouseDown, true);

    return function cleanup() {
      ref.current?.removeEventListener("mouseup", mouseUp, true);
      ref.current?.removeEventListener("mousemove", throttleMouseMove);

      ref.current?.removeEventListener("mousedown", mouseDown, true);
    };

  }, [ref, mouseDown, mouseUp, throttleMouseMove]);
};

export {
    useLinearEngine,
};