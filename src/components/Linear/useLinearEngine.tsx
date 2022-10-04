import { useStore } from "effector-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useThrottle } from "../../hooks/useThrottle";
import { editor } from "../../libs/editor";
import { intersection, intersectionOff, minMoveGrid, save, rib } from "../../libs/functions";
import { qSVG } from "../../libs/qSVG";
import { 
  $cursor, 
  $hasAction, 
  $multipleMode, 
  cursorChange,
  hasActionChange,
} from "../../state";

const Rcirclebinder = 8;
const gridMeausre = 20;
const factor = 1.3093580819798918;
const gridSnap = "on";

const WALL_SIZE = 20;
const PARTITION_SIZE = 8;

const calculateSnap = ({
  event,
  factor,
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
  
  const originViewbox = useRef({
    x: -200,
    y: -152.2041763341067,
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

  const mouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();

    if (mode == "line_mode" || mode == "partition_mode") {
      if (hasAction == 0) {
        const snap = calculateSnap({
          event, 
          state: gridSnap,
          factor,
          offset: offset.current,
          originViewbox: originViewbox.current,
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
  }, [
    mode, 
    hasAction,  
    currentPositon,
    originViewbox,
    offset,
    wallStartConstruc,
    construct,
    tactile, 
  ]);

  const mouseMove = useCallback((event: React.MouseEvent) => {
    let newCursor = cursor;
    event.preventDefault();    

    if ((mode == "line_mode" || mode == "partition_mode") && hasAction == 0) {
      const snap  = calculateSnap({
        event, 
        state: "off",
        factor,
        offset: offset.current,
        originViewbox: originViewbox.current,
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
  
    if (hasAction == 1 && (mode == "line_mode" || mode == "partition_mode")) {
      const snap = calculateSnap({
        event, 
        state: gridSnap,
        factor,
        offset: offset.current,
        originViewbox: originViewbox.current,
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

          if (mode == "partition_mode") {
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

    if (newCursor != cursor) {
      cursorChange(newCursor);
    }
  }, [
    mode, 
    currentPositon ,
    startedCursorPositon,
    originViewbox,
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

    if (mode == "line_mode" || mode == "partition_mode") {
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

        if (mode == "partition_mode") {
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
          originViewbox: originViewbox.current,
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
    originViewbox,
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
    const width_viewbox = taille?.clientWidth;
    const height_viewbox = taille?.clientHeight;

    offset.current.top = taille?.clientTop || 0;
    offset.current.left = taille?.clientLeft || 0;

    document.querySelectorAll("svg").forEach((item) => {
      item.setAttribute(
        "viewBox", "-200 -152.2041763341067 1693 1288.4083526682134",
        // "viewBox", `${originViewbox.current.x || 0} ${originViewbox.current.y || 0} ${width_viewbox} ${height_viewbox}`
      );
    });
  }, [offset]);

  useEffect(() => {
    if (!ref?.current) {
        return;
    }

    ref.current.addEventListener("mouseup", mouseUp, true);
    ref.current.addEventListener("mousemove", throttleMouseMove);

    ref.current.addEventListener("mousedown", mouseDown, true);

    ref.current.addEventListener("click", (event: React.MouseEvent) => {
        event.preventDefault();
    });

    return function cleanup() {
      ref.current?.removeEventListener("mouseup", mouseUp, true);
      ref.current?.removeEventListener("mousemove", throttleMouseMove);

      ref.current?.removeEventListener("mousedown", mouseDown, true);

      ref.current?.removeEventListener("click", (event: React.MouseEvent) => {
          event.preventDefault();
      });
    };

  }, [ref, mouseDown, mouseUp, throttleMouseMove]);
};

export {
    useLinearEngine,
};