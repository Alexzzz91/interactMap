import { useStore } from "effector-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useThrottle } from "../../hooks/useThrottle";
import { MODES } from "../../libs/common";
import { editor } from "../../libs/editor";
import { 
  intersection,
  intersectionOff,
  minMoveGrid,
  save,
  rib,
  limitObj,
  inWallRib,
  isObjectsEquals,
  clearHtmlTagById,
} from "../../libs/functions";
import { qSVG } from "../../libs/qSVG";
import { 
  $cursor, 
  $hasAction, 
  $heightViewbox, 
  $modeOptions, 
  $multipleMode, 
  $originXViewbox, 
  $originYViewbox, 
  $widthViewbox, 
  cursorChange,
  hasActionChange,
  heightViewboxChange,
  modeChange,
  originXViewboxChange,
  originYViewboxChange,
  setRatioViewbox,
  widthViewboxChange,
} from "../../state";
import { BinderType, ModeOptions } from "../../types/editorVars";

const Rcirclebinder = 8;
let gridMeausre = 20;
const gridSnap = 1;

const WALL_SIZE = 20;
const PARTITION_SIZE = 8;

export const ZOOM_SPEED_MULTIPLIER = 0.065;

let drag = 0;

const calculateSnap = ({
  event,
  offset,
  originViewbox,
  state,
  tactile,
}) => {
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
    x: temp.x * window.editorVars.factor - offset.left * window.editorVars.factor + originViewbox.x,
    y: temp.y * window.editorVars.factor - offset.top * window.editorVars.factor + originViewbox.y,
  };

  if (state) {
      grid.x = Math.round(mouse.x / gridMeausre) * gridMeausre;
      grid.y = Math.round(mouse.y / gridMeausre) * gridMeausre;
  } else {
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
  const modeOptions = useStore($modeOptions);

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
      hasActionChange(1);
    }

    if (mode == MODES.SELECT_MODE) {
      let newHasAction = hasAction;

      if (
        typeof window.editorVars.binder != "undefined" &&
        (window.editorVars.binder.type == BinderType.Segment ||
          window.editorVars.binder.type == BinderType.Node ||
          window.editorVars.binder.type == BinderType.Obj ||
          window.editorVars.binder.type == BinderType.BoundingBox)
      ) {
        mode = MODES.BIND_MODE;
  
        if (window.editorVars.binder.type == BinderType.Obj || window.editorVars.binder.type == BinderType.BoundingBox) {
          newHasAction = 1;
        }
  
        // INIT FOR HELP BINDER NODE MOVING H V (MOUSE DOWN)
        if (window.editorVars.binder.type == BinderType.Node) {
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
          state: 0,
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
    
    const getSnap = (state: boolean) => calculateSnap({
      event, 
      state,
      offset: offset.current,
      originViewbox: {
        x: originXViewbox,
        y: originYViewbox,
      },
      tactile,
    });

    if (mode == MODES.SELECT_MODE && drag === 0) {
      const snap = getSnap(false);
  
      let objTarget = false;

      for (let i = 0; i < window.editorVars.OBJDATA.length; i++) {
        
        const realBboxCoords = window.editorVars.OBJDATA[i].realBbox;

        if (qSVG.rayCasting(snap, realBboxCoords)) {
          objTarget = window.editorVars.OBJDATA[i];
        }
      }

      console.log('objTarget', objTarget);

      if (objTarget !== false) {
        if (window.editorVars.binder && window.editorVars.binder.type == "segment") {
          window.editorVars.binder.graph.remove();
          window.editorVars.binder = undefined;
          newCursor = "default";
        }
        if (objTarget.params.bindBox) {
          // OBJ -> BOUNDINGBOX TOOL
          if (!window.editorVars.binder) {
            window.editorVars.binder = new editor.obj2D({
              family: "free",
              className: "boundingBox",
              type: "",
              pos: objTarget.bbox.origin,
              angle: objTarget.angle,
              angleSign: 0,
              size: objTarget.size,
              hinge: "normal",
              thick: objTarget.thick,
              value: objTarget.realBbox,
              offset: offset.current,
              originXViewbox,
              originYViewbox,
            });

            if (!window.editorVars.binder) {
              return;
            }

            window.editorVars.binder.update();
            window.editorVars.binder.obj = objTarget;
            window.editorVars.binder.type = "boundingBox";
            window.editorVars.binder.oldX = binder.x;
            window.editorVars.binder.oldY = binder.y;
            
            document.getElementById("boxbind")?.append(window.editorVars.binder.graph);
            
            if (!objTarget.params.move) {
              newCursor = "trash";
            } else {
              newCursor = "move";
            }
          }
        } else {
          // DOOR, WINDOW, APERTURE.. -- OBJ WITHOUT BINDBOX (params.bindBox = False) -- !!!!
          if (!window.editorVars.binder) {
            let wallList = editor.rayCastingWall(objTarget);

            if (wallList.length > 1) {
              wallList = wallList[0];
            }
            
            if (wallList) {
              inWallRib(wallList);
            }
            const thickObj = wallList.thick;
            const sizeObj = objTarget.size;
  
            window.editorVars.binder = new editor.obj2D({
              family: "inWall",
              className: "socle",
              type: "",
              pos: objTarget,
              angle: objTarget.angle,
              angleSign: 0,
              size: sizeObj,
              hinge: "normal",
              thick: thickObj,
              value: "",
              offset: offset.current,
              originXViewbox,
              originYViewbox,
            });

            window.editorVars.binder.update();
  
            window.editorVars.binder.oldXY = { x: objTarget.x, y: objTarget.y }; // FOR OBJECT MENU
            document.getElementById("boxbind")?.append(window.editorVars.binder.graph);
          } else {
            if (event.target == window.editorVars.binder.graph.firstChild) {
              newCursor = "move";

              window.editorVars.binder.graph.firstChild.setAttribute("class", "circle_css_2");
              window.editorVars.binder.type = "obj";
              window.editorVars.binder.obj = objTarget;
            } else {
              newCursor = "default";
              window.editorVars.binder.graph.firstChild.setAttribute("class", "circle_css_1");
              window.editorVars.binder.type = false;
            }
          }
        }
      } else {
        if (window.editorVars.binder) {
          if (window.editorVars.binder.graph) {
            window.editorVars.binder.graph.remove();
          } else {
            window.editorVars.binder.remove();
          }
          window.editorVars.binder = undefined;
          newCursor = "default";
          rib();
        }
      }
  
      // // BIND CIRCLE IF nearNode and GROUP ALL SAME XY SEG POINTS
      const wallNode = editor.nearWallNode({ snap, range: 20 });
      if (wallNode) {
        if (!window.editorVars.binder || window.editorVars.binder.type == BinderType.Segment) {
          window.editorVars.binder = qSVG.create("boxbind", "circle", {
            id: "circlebinder",
            class: "circle_css_2",
            cx: wallNode.x,
            cy: wallNode.y,
            r: Rcirclebinder,
          });
          window.editorVars.binder.data = wallNode;
          window.editorVars.binder.type = BinderType.Node;

          if (document.getElementById("linebinder")) {
            document.getElementById("linebinder")?.remove();
          }
        } else {
          // REMAKE CIRCLE_CSS ON BINDER AND TAKE DATA SEG GROUP
          // if (typeof(binder) != 'undefined') {
          //     binder.attr({
          //         class: "circle_css_2"
          //     });
          // }
        }
        newCursor = "move";
      } else {
        if (window.editorVars.binder && window.editorVars.binder.type == BinderType.Node) {
          window.editorVars.binder?.remove();
          window.editorVars.binder = undefined;
          // hideAllSize();
          clearHtmlTagById("boxbind");
          newCursor = "default";
          rib();
        }
      }
  
      // BIND WALL WITH NEARPOINT function ---> WALL BINDER CREATION
      let wallBind = editor.rayCastingWalls(snap);
      if (wallBind) {
        if (wallBind.length > 1) {
          wallBind = wallBind[wallBind.length - 1];
        }
        if (wallBind && !window.editorVars.binder) {
          
          const objWall = editor.objFromWall(wallBind);

          if (objWall.length > 0) {
            editor.inWallRib2(wallBind);
          }
          
          window.editorVars.binder = {};
          window.editorVars.binder.wall = wallBind;
          inWallRib(window.editorVars.binder.wall);

          const line = qSVG.create("none", "line", {
            x1: window.editorVars.binder.wall.start.x,
            y1: window.editorVars.binder.wall.start.y,
            x2: window.editorVars.binder.wall.end.x,
            y2: window.editorVars.binder.wall.end.y,
            "stroke-width": 5,
            stroke: "#5cba79",
          });

          const ball1 = qSVG.create("none", "circle", {
            class: "circle_css",
            cx: window.editorVars.binder.wall.start.x,
            cy: window.editorVars.binder.wall.start.y,
            r: Rcirclebinder / 1.8,
          });

          const ball2 = qSVG.create("none", "circle", {
            class: "circle_css",
            cx: window.editorVars.binder.wall.end.x,
            cy: window.editorVars.binder.wall.end.y,
            r: Rcirclebinder / 1.8,
          });
          window.editorVars.binder.graph = qSVG.create("none", "g", {});
          window.editorVars.binder.graph.append(line);
          window.editorVars.binder.graph.append(ball1);
          window.editorVars.binder.graph.append(ball2);
          document.getElementById("boxbind")?.append(window.editorVars.binder.graph);
          window.editorVars.binder.type = "segment";
          newCursor = "pointer";
        }
      } else {
        let wallBind = editor.nearWall({ snap, range: 6 });
        if (wallBind) {
          if (wallBind && !window.editorVars.binder) {
            wallBind = wallBind.wall;
            const objWall = editor.objFromWall(wallBind);
            if (objWall.length > 0) editor.inWallRib2(wallBind);
            window.editorVars.binder = {};
            window.editorVars.binder.wall = wallBind;
            inWallRib(window.editorVars.binder.wall);
            const line = qSVG.create("none", "line", {
              x1: window.editorVars.binder.wall.start.x,
              y1: window.editorVars.binder.wall.start.y,
              x2: window.editorVars.binder.wall.end.x,
              y2: window.editorVars.binder.wall.end.y,
              "stroke-width": 5,
              stroke: "#5cba79",
            });
            const ball1 = qSVG.create("none", "circle", {
              class: "circle_css",
              cx: window.editorVars.binder.wall.start.x,
              cy: window.editorVars.binder.wall.start.y,
              r: Rcirclebinder / 1.8,
            });
            const ball2 = qSVG.create("none", "circle", {
              class: "circle_css",
              cx: window.editorVars.binder.wall.end.x,
              cy: window.editorVars.binder.wall.end.y,
              r: Rcirclebinder / 1.8,
            });
            window.editorVars.binder.graph = qSVG.create("none", "g");
            window.editorVars.binder.graph.append(line);
            window.editorVars.binder.graph.append(ball1);
            window.editorVars.binder.graph.append(ball2);
            document.getElementById("boxbind")?.append(window.editorVars.binder.graph);
            window.editorVars.binder.type = "segment";
            newCursor = "pointer";
          }
        } else {
          if (window.editorVars.binder && window.editorVars.binder.type == "segment") {
            window.editorVars.binder.graph.remove();
            window.editorVars.binder = undefined;
            // hideAllSize();
            newCursor = "default";
            rib();
          }
        }
      }
    } 

    if ((mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE) && hasAction == 0) {
      const snap = getSnap(false);
      
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
  
    if (mode == MODES.OBJECT_MODE) {
      gridMeausre = 15;
      const snap = getSnap(true);

      if (!window.editorVars.binder) {
        if (modeOptions == ModeOptions.SimpleStair)
          window.editorVars.binder = new editor.obj2D({
            family:  "free",
            className: "stair",
            type: "simpleStair",
            pos: snap,
            angle: 0,
            angleSign: 0,
            size: 0,
            hinge: "normal",
            thick: 0,
            value: 15,
            offset: offset.current,
            originXViewbox,
            originYViewbox,
          });
        else {
          window.editorVars.binder = new editor.obj2D({
            family:  "free",
            className: "furniture",
            type: modeOptions,
            pos: snap,
            angle: 270,
            angleSign: 0,
            size: 20,
            hinge: "normal",
            thick: 0,
            value: 0,
            offset: offset.current,
            originXViewbox,
            originYViewbox,
          });
        }
  
        document.getElementById("boxbind")?.append(window.editorVars.binder.graph);
      } else {
        if (
          (window.editorVars.binder.family != "stick" && window.editorVars.binder.family != "collision") ||
          window.editorVars.WALLS.length == 0
        ) {
          window.editorVars.binder.x = snap.x;
          window.editorVars.binder.y = snap.y;
          window.editorVars.binder.oldX = window.editorVars.binder.x;
          window.editorVars.binder.oldY = window.editorVars.binder.y;
          window.editorVars.binder.update();
        }
        if (window.editorVars.binder.family == "collision") {
          let found = false;
  
          if (editor.rayCastingWalls({ 
            x: window.editorVars.binder.bbox.left, 
            y: window.editorVars.binder.bbox.top 
          }))
            found = true;
          if (
            !found &&
            editor.rayCastingWalls({ 
              x: window.editorVars.binder.bbox.left, 
              y: window.editorVars.binder.bbox.bottom,
            })
          )
            found = true;
          if (
            !found &&
            editor.rayCastingWalls({
              x: window.editorVars.binder.bbox.right,
              y: window.editorVars.binder.bbox.top,
            })
          )
            found = true;
          if (
            !found &&
            editor.rayCastingWalls({
              x: window.editorVars.binder.bbox.right,
              y: window.editorVars.binder.bbox.bottom,
            })
          )
            found = true;
  
          if (!found) {
            window.editorVars.binder.x = snap.x;
            window.editorVars.binder.y = snap.y;
            window.editorVars.binder.oldX = window.editorVars.binder.x;
            window.editorVars.binder.oldY = window.editorVars.binder.y;
            window.editorVars.binder.update();
          } else {
            window.editorVars.binder.x = window.editorVars.binder.oldX;
            window.editorVars.binder.y = window.editorVars.binder.oldY;
            window.editorVars.binder.update();
          }
        }
        if (window.editorVars.binder.family == "stick") {
          const pos = editor.stickOnWall(snap);
          window.editorVars.binder.oldX = pos.x;
          window.editorVars.binder.oldY = pos.y;
          let angleWall = qSVG.angleDeg(
            pos.wall.start.x,
            pos.wall.start.y,
            pos.wall.end.x,
            pos.wall.end.y
          );
          const v1 = qSVG.vectorXY(
            { x: pos.wall.start.x, y: pos.wall.start.y },
            { x: pos.wall.end.x, y: pos.wall.end.y }
          );
          const v2 = qSVG.vectorXY({ x: pos.wall.end.x, y: pos.wall.end.y }, snap);
          window.editorVars.binder.x =
            pos.x -
            (Math.sin(pos.wall.angle * ((360 / 2) * Math.PI)) * window.editorVars.binder.thick) / 2;
          window.editorVars.binder.y =
            pos.y -
            (Math.cos(pos.wall.angle * ((360 / 2) * Math.PI)) * window.editorVars.binder.thick) / 2;
          const newAngle = qSVG.vectorDeter(v1, v2);
          if (Math.sign(newAngle) == 1) {
            angleWall += 180;
            window.editorVars.binder.x =
              pos.x +
              (Math.sin(pos.wall.angle * ((360 / 2) * Math.PI)) * window.editorVars.binder.thick) /
                2;
            window.editorVars.binder.y =
              pos.y +
              (Math.cos(pos.wall.angle * ((360 / 2) * Math.PI)) * window.editorVars.binder.thick) /
                2;
          }
          window.editorVars.binder.angle = angleWall;
          window.editorVars.binder.update();
        }
      }
    }

    if (mode == MODES.DOOR_MODE || mode == MODES.WINDOW_MODE) {
      const snap = getSnap(false);

      if (!snap) {
        return;
      }

      const wallSelect = editor.nearWall({ snap });

      if (wallSelect) {
        const wall = wallSelect.wall;
        if (wall.type != "separate") {
          if (!window.editorVars.binder || window.editorVars.binder.type !== modeOptions) {
            // family, classe, type, pos, angle, angleSign, size, hinge, thick
            window.editorVars.binder = new editor.obj2D({
              family: "inWall",
              className: "doorWindow",
              type: modeOptions,
              pos: wallSelect,
              angle: 0,
              angleSign: 0,
              size: 60,
              hinge: "normal",
              thick: wall.thick,
              value: null,
              offset: offset.current,
              originXViewbox,
              originYViewbox,
            });

            let angleWall = qSVG.angleDeg(
              wall.start.x,
              wall.start.y,
              wall.end.x,
              wall.end.y
            );
            const v1 = qSVG.vectorXY(
              { x: wall.start.x, y: wall.start.y },
              { x: wall.end.x, y: wall.end.y }
            );
            const v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
            const newAngle = qSVG.vectorDeter(v1, v2);

            if (Math.sign(newAngle) == 1) {
              angleWall += 180;
              window.editorVars.binder.angleSign = 1;
            }
            const startCoords = qSVG.middle(
              wall.start.x,
              wall.start.y,
              wall.end.x,
              wall.end.y
            );
            window.editorVars.binder.x = startCoords.x;
            window.editorVars.binder.y = startCoords.y;
            window.editorVars.binder.angle = angleWall;
            window.editorVars.binder.update();
            document.getElementById("boxbind")?.append(window.editorVars.binder.graph);
          } else {
            let angleWall = qSVG.angleDeg(
              wall.start.x,
              wall.start.y,
              wall.end.x,
              wall.end.y
            );
            const v1 = qSVG.vectorXY(
              { x: wall.start.x, y: wall.start.y },
              { x: wall.end.x, y: wall.end.y }
            );
            const v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
            const newAngle = qSVG.vectorDeter(v1, v2);

            window.editorVars.binder.angleSign = 0;
            
            if (Math.sign(newAngle) == 1) {
              window.editorVars.binder.angleSign = 1;
              angleWall += 180;
            }

            const limits = limitObj(wall.equations.base, window.editorVars.binder.size, wallSelect);
            if (
              qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) &&
              qSVG.btwn(limits[0].y, wall.start.y, wall.end.y) &&
              qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) &&
              qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)
            ) {
              window.editorVars.binder.x = wallSelect.x;
              window.editorVars.binder.y = wallSelect.y;
              window.editorVars.binder.angle = angleWall;
              window.editorVars.binder.thick = wall.thick;
              window.editorVars.binder.limit = limits;
              window.editorVars.binder.update();
            }

            if (
              (wallSelect.x == wall.start.x && wallSelect.y == wall.start.y) ||
              (wallSelect.x == wall.end.x && wallSelect.y == wall.end.y)
            ) {
              if (
                qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) &&
                qSVG.btwn(limits[0].y, wall.start.y, wall.end.y)
              ) {
                window.editorVars.binder.x = limits[0].x;
                window.editorVars.binder.y = limits[0].y;
              }
              if (
                qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) &&
                qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)
              ) {
                window.editorVars.binder.x = limits[1].x;
                window.editorVars.binder.y = limits[1].y;
              }
              window.editorVars.binder.limit = limits;
              window.editorVars.binder.angle = angleWall;
              window.editorVars.binder.thick = wall.thick;
              window.editorVars.binder.update();
            }
          }
        }
      } else {
        if (window.editorVars.binder) {
          window.editorVars.binder.graph.remove();
          window.editorVars.binder = undefined;
        }
      }
    } 
    
    if (hasAction == 1 && (mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE)) {
      const snap = getSnap(!!gridSnap);

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
      const snap = getSnap(!!gridSnap);

      newCursor = "move";

      const distX = (snap.xMouse - startedCursorPositon.current.x) * window.editorVars.factor;
      const distY = (snap.yMouse - startedCursorPositon.current.y) * window.editorVars.factor;

      const newOriginXViewbox = originXViewbox - distX;
      const newOriginYViewbox = originYViewbox - distY;

      originXViewboxChange(newOriginXViewbox);
      originYViewboxChange(newOriginYViewbox);
    }

    if (newCursor != cursor) {
      cursorChange(newCursor);
    }
  }, [
    mode, 
    modeOptions,
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
      if (window.editorVars.binder) {
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

    if (mode == MODES.OBJECT_MODE) {
      window.editorVars.OBJDATA.push(window.editorVars.binder);
      window.editorVars.binder?.graph?.remove();

      let targetBox = "boxcarpentry";

      if (window.editorVars.OBJDATA[window.editorVars.OBJDATA.length - 1].class == "energy") {
        targetBox = "boxEnergy";
      }
      if (window.editorVars.OBJDATA[window.editorVars.OBJDATA.length - 1].class == "furniture") {
        targetBox = "boxFurniture";
      }
      
      console.log('targetBox', targetBox);

      document.getElementById(targetBox)?.append(window.editorVars.OBJDATA[window.editorVars.OBJDATA.length - 1].graph);
      
      window.editorVars.binder = undefined;

      if (!multipleMode) {
        modeChange("select_mode");
      }

      save();
      gridMeausre = 20;
    }

    if (mode == MODES.DOOR_MODE || mode == MODES.WINDOW_MODE) {
      if (!window.editorVars.binder) {
        modeChange(MODES.SELECT_MODE);
        return false;
      }
      window.editorVars.OBJDATA.push(window.editorVars.binder);
      window.editorVars.binder.graph.remove();

      document.getElementById("boxcarpentry")?.append(window.editorVars.OBJDATA[window.editorVars.OBJDATA.length - 1]?.graph);
      
      window.editorVars.binder = undefined;

      modeChange(MODES.SELECT_MODE);
      save();
    }
  
    if (mode == MODES.BIND_MODE) {
      newHasActionState = 0;
      construct.current = 0; 

      if (window.editorVars.binder) {
        fonc_button("select_mode");

        // if (window.editorVars.binder.type == BinderType.Node) {

        // } // END BINDER NODE
  
        if (window.editorVars.binder.type == BinderType.Segment) {
          let found = false;

          if (window.editorVars.binder.wall.start == window.editorVars.binder.before) {
            found = true;
          }
  
          if (found) {
            // console.log('found', found);
            // let objWall = editor.objFromWall(wallBind);

            // if (objWall.length > 0) {
            //   $("#separate").hide();
            // } else if (binder.wall.type == "separate") {
            //   $("#separate").hide();
            //   $("#rangeThick").hide();
            //   $("#recombine").show();
            //   $("#cutWall").hide();
            //   document.getElementById("titleWallTools")?.textContent = "Modify the separation";
            // } else {
            //   $("#cutWall").show();
            //   $("#separate").show();
            //   $("#rangeThick").show();
            //   $("#recombine").hide();
            //   document.getElementById("titleWallTools").textContent =
            //     "Modify the wall";
            //   $("#boxinfo").html("Modify the wall");
            // }
            // $("#wallTools").show(200);
            // document.getElementById("wallWidth").setAttribute("min", 7);
            // document.getElementById("wallWidth").setAttribute("max", 50);
            // document.getElementById("wallWidthScale").textContent = "7-50";
            // document.getElementById("wallWidth").value = binder.wall.thick;
            // document.getElementById("wallWidthVal").textContent =
            //   binder.wall.thick;
            // mode = "edit_wall_mode";
          }
          // delete equation1;
          // delete equation2;
          // delete equation3;
          // delete intersectionFollowers;
        }
  
        if (window.editorVars.binder.type == BinderType.Obj) {
          const moveObj =
            Math.abs(window.editorVars.binder.oldXY.x - window.editorVars.binder.x) +
            Math.abs(window.editorVars.binder.oldXY.y - window.editorVars.binder.y);
          if (moveObj < 1) {
            // $("#objTools").show("200", function () {
            //   $("#lin").css("cursor", "default");
            //   $("#boxinfo").html("Config. the door/window");
            //   document
            //     .getElementById("doorWindowWidth")
            //     .setAttribute("min", binder.obj.params.resizeLimit.width.min);
            //   document
            //     .getElementById("doorWindowWidth")
            //     .setAttribute("max", binder.obj.params.resizeLimit.width.max);
            //   document.getElementById("doorWindowWidthScale").textContent =
            //     binder.obj.params.resizeLimit.width.min +
            //     "-" +
            //     binder.obj.params.resizeLimit.width.max;
            //   document.getElementById("doorWindowWidth").value = binder.obj.size;
            //   document.getElementById("doorWindowWidthVal").textContent =
            //     binder.obj.size;
            // });
            modeChange(MODES.EDIT_DOOR_MODE);
          } else {
            modeChange(MODES.SELECT_MODE);
            newHasActionState = 0;
            window.editorVars.binder.graph.remove();
            window.editorVars.binder = undefined;
          }
        }
  
        // if (typeof binder != "undefined" && binder.type == "boundingBox") {
        //   var moveObj =
        //     Math.abs(binder.oldX - binder.x) + Math.abs(binder.oldY - binder.y);
        //   var objTarget = binder.obj;
        //   if (!objTarget.params.move) {
        //     // TO REMOVE MEASURE ON PLAN
        //     objTarget.graph.remove();
        //     OBJDATA.splice(OBJDATA.indexOf(objTarget), 1);
        //     $("#boxinfo").html("Measure deleted !");
        //   }
        //   if (moveObj < 1 && objTarget.params.move) {
        //     if (!objTarget.params.resize) $("#objBoundingBoxScale").hide();
        //     else $("#objBoundingBoxScale").show();
        //     if (!objTarget.params.rotate) $("#objBoundingBoxRotation").hide();
        //     else $("#objBoundingBoxRotation").show();
        //     $("#panel").hide(100);
        //     $("#objBoundingBox").show("200", function () {
        //       $("#lin").css("cursor", "default");
        //       $("#boxinfo").html("Modify the object");
        //       document
        //         .getElementById("bboxWidth")
        //         .setAttribute("min", objTarget.params.resizeLimit.width.min);
        //       document
        //         .getElementById("bboxWidth")
        //         .setAttribute("max", objTarget.params.resizeLimit.width.max);
        //       document.getElementById("bboxWidthScale").textContent =
        //         objTarget.params.resizeLimit.width.min +
        //         "-" +
        //         objTarget.params.resizeLimit.height.max;
        //       document
        //         .getElementById("bboxHeight")
        //         .setAttribute("min", objTarget.params.resizeLimit.height.min);
        //       document
        //         .getElementById("bboxHeight")
        //         .setAttribute("max", objTarget.params.resizeLimit.height.max);
        //       document.getElementById("bboxHeightScale").textContent =
        //         objTarget.params.resizeLimit.height.min +
        //         "-" +
        //         objTarget.params.resizeLimit.height.max;
        //       $("#stepsCounter").hide();
        //       if (objTarget.class == "stair") {
        //         document.getElementById("bboxStepsVal").textContent =
        //           objTarget.value;
        //         $("#stepsCounter").show();
        //       }
        //       document.getElementById("bboxWidth").value = objTarget.width * 100;
        //       document.getElementById("bboxWidthVal").textContent =
        //         objTarget.width * 100;
        //       document.getElementById("bboxHeight").value =
        //         objTarget.height * 100;
        //       document.getElementById("bboxHeightVal").textContent =
        //         objTarget.height * 100;
        //       document.getElementById("bboxRotation").value = objTarget.angle;
        //       document.getElementById("bboxRotationVal").textContent =
        //         objTarget.angle;
        //     });
        //     mode = "edit_boundingBox_mode";
        //   } else {
        //     mode = "select_mode";
        //     action = 0;
        //     binder.graph.remove();
        //     delete binder;
        //   }
        // }
  
        if (mode == MODES.BIND_MODE) {
          window.editorVars.binder.remove();
          window.editorVars.binder = undefined;
        }
      } // END BIND IS DEFINED
      save();
    } // END BIND MODE
  
    if (mode != MODES.EDIT_DOOR_MODE) {
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

    window.editorVars.factor = widthViewbox / tailleWidth;

    document.querySelectorAll("svg#lin").forEach((item) => {
      item.setAttribute(
        "viewBox", `${originXViewbox} ${originYViewbox} ${widthViewbox} ${heightViewbox}`
      );
    });
  }, [originXViewbox, originYViewbox, widthViewbox, heightViewbox]);

  // const getOffset = useCallback((e: MouseEvent | Touch) => {
  //   if (!ref?.current) {
  //     return;
  //   }

  //   const containerRect = ref?.current.getBoundingClientRect();
  //   const offsetX = e.clientX - containerRect.left;
  //   const offsetY = e.clientY - containerRect.top;
    
  //   return { x: offsetX, y: offsetY };
  // }, [ref]);

  // const zoomTo = useCallback((x: number, y: number, ratio: number) => {
  //   const { minZoom, maxZoom } = { minZoom: 1, maxZoom: 1000};
  //   const { x: transformX, y: transformY, scale, angle } = {    
  //     x: 0,
  //     y: 0,
  //     scale: 1,
  //     angle: 0,
  //   };

  //   let newScale = scale * ratio;
  //   if (newScale < minZoom) {
  //     if (scale === minZoom) {
  //       return;
  //     }
  //     ratio = minZoom / scale;
  //     newScale = minZoom;
  //   } else if (newScale > maxZoom) {
  //     if (scale === maxZoom) {
  //       return;
  //     }
  //     ratio = maxZoom / scale;
  //     newScale = maxZoom;
  //   }

  //   const newX = x - ratio * (x - transformX);
  //   const newY = y - ratio * (y - transformY);

  //   console.log("newX", newX);
  //   console.log("newY", newY);
  //   console.log("angle", angle);

  //   // const { boundX, boundY } = getBoundCoordinates({ x: newX, y: newY }, { angle, scale, offsetX: newX, offsetY: newY });
  //   const { boundX, boundY } = {
  //     boundX: 50,
  //     boundY: 45
  //   };

  //   const prevPanPosition = { x: boundX, y: boundY };

  //   console.log("prevPanPosition", prevPanPosition);

  //   console.log("final", { x: boundX, y: boundY, scale: newScale });

  //   // document.querySelectorAll("svg").forEach((item) => {
  //   //   item.setAttribute(
  //   //     "viewBox", `${originX_viewbox} ${originY_viewbox} ${width_viewbox} ${height_viewbox}`,
  //   //   );
  //   // });

  //   // if (newScale> 0) {
  //   //   zoomMaker(ZOOM_MODES.ZOOM_IN, boundX, boundY, newScale, originViewbox);
  //   // } else {
  //   //   zoomMaker(ZOOM_MODES.ZOOM_OUT, boundX, boundY, newScale, originViewbox);
  //   // }
  // }, []);

  // const onWheel = useCallback((e: WheelEvent) => {
  //   e.preventDefault();

  //   const getScaleMultiplier = (delta: number, zoomSpeed = 1): number => {
  //     const speed = ZOOM_SPEED_MULTIPLIER * zoomSpeed;
  //     let scaleMultiplier = 1;
  //     if (delta > 0) { // zoom out
  //       scaleMultiplier = (1 - speed);
  //     } else if (delta < 0) { // zoom in
  //       scaleMultiplier = (1 + speed);
  //     }
    
  //     return scaleMultiplier;
  //   };

  //   const scale = getScaleMultiplier(e.deltaY, 1);

  //   console.log("scale", scale);

  //  const offset = getOffset(e);

  //  if (offset) {
  //   console.log("offset", offset);

  //   zoomTo(offset.x, offset.y, scale);
  //  }
  // }, []);

  // useEffect(() => {
  //   if (!ref?.current) {
  //       return;
  //   }

  //   ref.current.addEventListener("wheel", onWheel, { passive: false });

  //   ref.current.addEventListener("click", (event: React.MouseEvent) => {
  //     event.preventDefault();
  //   });

  //   return function cleanup() {
  //     ref.current?.removeEventListener("wheel", onWheel, true);

  //     ref.current?.removeEventListener("click", (event: React.MouseEvent) => {
  //       event.preventDefault();
  //     });
  //   };

  // }, [ref]);

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