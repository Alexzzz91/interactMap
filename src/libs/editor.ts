import { carpentryCalc, clearHtmlTagById, isObjectsEquals } from "./functions";
import { qSVG } from "./qSVG";

let scanStart;
let scanEnd;
let globalArea = 0; 

const colorWall = "#666";

type NearWallResult = {
  wall: number;
  x: number;
  y: number;
  distance: number;
}

const editor = {
  wall: function (start, end, type, thick) {
    this.thick = thick;
    this.start = start;
    this.end = end;
    this.type = type;
    this.parent = null;
    this.child = null;
    this.angle = 0;
    this.equations = {};
    this.coords = [];
    this.backUp = false;
  },
  
  makeWall: (way) => {
    const wallScreen = qSVG.create("none", "path", {
      d: way,
      stroke: "none",
      fill: colorWall,
      "stroke-width": 1,
      "stroke-linecap": "butt",
      "stroke-linejoin": "miter",
      "stroke-miterlimit": 4,
      "fill-rule": "nonzero",
    });
    return wallScreen;
  },

  obj2D: function ({
    family,
    className,
    type,
    pos,
    angle,
    angleSign,
    size,
    hinge = "normal",
    thick,
    value,
    offset,
    originXViewbox,
    originYViewbox,
  }
  ) {
    this.family = family; // inWall, stick, collision, free
    this.class = className; // door, window, energy, stair, measure, text ?
    this.type = type; // simple, double, simpleSlide, aperture, doubleSlide, fixed, switch, lamp....
    this.x = pos.x;
    this.y = pos.y;
    this.angle = angle;
    this.angleSign = angleSign;
    this.limit = [];
    this.hinge = hinge; // normal, reverse
    this.graph = qSVG.create("none", "g", {});
    this.scale = { x: 1, y: 1 };
    this.value = value;
    this.size = size;
    this.thick = thick;
    this.width = (this.size / window.editorVars.METER).toFixed(2);
    this.height = (this.thick / window.editorVars.METER).toFixed(2);

    let cc = carpentryCalc(className, type, size, thick, value);
    let blank;

    for (let tt = 0; tt < cc.length; tt++) {
      if (cc[tt].path) {
        blank = qSVG.create("none", "path", {
          d: cc[tt].path,
          "stroke-width": 1,
          fill: cc[tt].fill,
          stroke: cc[tt].stroke,
          "stroke-dasharray": cc[tt].strokeDashArray,
        });
      }
      if (cc[tt].text) {
        blank = qSVG.create("none", "text", {
          x: cc[tt].x,
          y: cc[tt].y,
          "font-size": cc[tt].fontSize,
          stroke: cc[tt].stroke,
          "stroke-width": cc[tt].strokeWidth,
          "font-family": "roboto",
          "text-anchor": "middle",
          fill: cc[tt].fill,
        });
        blank.context.textContent = cc[tt].text;
      }
      this.graph.append(blank);
    } // ENDFOR  

    const bbox = this.graph.getBoundingClientRect();

    bbox.x = bbox.x * window.editorVars.factor - offset.left * window.editorVars.factor + originXViewbox;
    bbox.y = bbox.y * window.editorVars.factor - offset.top * window.editorVars.factor + originYViewbox;
    bbox.origin = { x: this.x, y: this.y };
    this.bbox = bbox;
    this.realBbox = [
      { x: -this.size / 2, y: -this.thick / 2 },
      { x: this.size / 2, y: -this.thick / 2 },
      { x: this.size / 2, y: this.thick / 2 },
      { x: -this.size / 2, y: this.thick / 2 },
    ];

    if (family == "byObject") {
      this.family = cc.family;
    }

    this.params = cc.params; // (bindBox, move, resize, rotate)
    cc.params.width ? (this.size = cc.params.width) : (this.size = size);
    cc.params.height ? (this.thick = cc.params.height) : (this.thick = thick);

    this.update = function () {
      this.width = (this.size / window.editorVars.METER).toFixed(2);
      this.height = (this.thick / window.editorVars.METER).toFixed(2);
      cc = carpentryCalc(
        this.class,
        this.type,
        this.size,
        this.thick,
        this.value
      );
      for (let tt = 0; tt < cc.length; tt++) {
        if (cc[tt].path) {
          this.graph.getElementsByTagName("path")[tt].setAttribute("d", cc[tt].path);
        } else {
          this.graph.find("text").context.textContent = cc[tt].text;
        }
      }
      const hingeStatus = this.hinge; // normal - reverse
      let hingeUpdate;
      if (hingeStatus == "normal") hingeUpdate = 1;
      else hingeUpdate = -1;
      this.graph.setAttribute(
        "transform",
        `translate(${this.x},${this.y}) rotate(${this.angle},0,0) scale(${hingeUpdate}, 1)`
      );
      const bbox = this.graph.getBoundingClientRect();
      bbox.x = bbox.x * window.editorVars.factor - offset.left * window.editorVars.factor + originXViewbox;
      bbox.y = bbox.y * window.editorVars.factor - offset.top * window.editorVars.factor + originYViewbox;
      bbox.origin = { x: this.x, y: this.y };
      this.bbox = bbox;

      if (this.class == "text" && this.angle == 0) {
        this.realBbox = [
          { x: this.bbox.x, y: this.bbox.y },
          { x: this.bbox.x + this.bbox.width, y: this.bbox.y },
          {
            x: this.bbox.x + this.bbox.width,
            y: this.bbox.y + this.bbox.height,
          },
          { x: this.bbox.x, y: this.bbox.y + this.bbox.height },
        ];
        this.size = this.bbox.width;
        this.thick = this.bbox.height;
      }

      const angleRadian = -this.angle * (Math.PI / 180);
      this.realBbox = [
        { x: -this.size / 2, y: -this.thick / 2 },
        { x: this.size / 2, y: -this.thick / 2 },
        { x: this.size / 2, y: this.thick / 2 },
        { x: -this.size / 2, y: this.thick / 2 },
      ];
      const newRealBbox = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ];
      newRealBbox[0].x =
        this.realBbox[0].y * Math.sin(angleRadian) +
        this.realBbox[0].x * Math.cos(angleRadian) +
        this.x;
      newRealBbox[1].x =
        this.realBbox[1].y * Math.sin(angleRadian) +
        this.realBbox[1].x * Math.cos(angleRadian) +
        this.x;
      newRealBbox[2].x =
        this.realBbox[2].y * Math.sin(angleRadian) +
        this.realBbox[2].x * Math.cos(angleRadian) +
        this.x;
      newRealBbox[3].x =
        this.realBbox[3].y * Math.sin(angleRadian) +
        this.realBbox[3].x * Math.cos(angleRadian) +
        this.x;
      newRealBbox[0].y =
        this.realBbox[0].y * Math.cos(angleRadian) -
        this.realBbox[0].x * Math.sin(angleRadian) +
        this.y;
      newRealBbox[1].y =
        this.realBbox[1].y * Math.cos(angleRadian) -
        this.realBbox[1].x * Math.sin(angleRadian) +
        this.y;
      newRealBbox[2].y =
        this.realBbox[2].y * Math.cos(angleRadian) -
        this.realBbox[2].x * Math.sin(angleRadian) +
        this.y;
      newRealBbox[3].y =
        this.realBbox[3].y * Math.cos(angleRadian) -
        this.realBbox[3].x * Math.sin(angleRadian) +
        this.y;
      this.realBbox = newRealBbox;
      return true;
    };
  },

  nearWall: ({snap, range = Infinity}): NearWallResult | false  => {
    let wallDistance = Infinity;
    let wallSelected = {};
    let result;

    if (window.editorVars.WALLS.length == 0) {
      return false;
    }
    
    for (let e = 0; e < window.editorVars.WALLS.length; e++) {
      const eq = qSVG.createEquation(
        window.editorVars.WALLS[e].start.x,
        window.editorVars.WALLS[e].start.y,
        window.editorVars.WALLS[e].end.x,
        window.editorVars.WALLS[e].end.y
      );
      result = qSVG.nearPointOnEquation(eq, snap);
      if (
        result.distance < wallDistance &&
        qSVG.btwn(result.x, window.editorVars.WALLS[e].start.x, window.editorVars.WALLS[e].end.x) &&
        qSVG.btwn(result.y, window.editorVars.WALLS[e].start.y, window.editorVars.WALLS[e].end.y)
      ) {
        wallDistance = result.distance;
        wallSelected = {
          wall: window.editorVars.WALLS[e],
          x: result.x,
          y: result.y,
          distance: result.distance,
        };
      }
    }
    const vv = editor.nearVertice({ snap, range });
    if (vv.distance < wallDistance) {
      wallDistance = vv.distance;
      wallSelected = {
        wall: vv.number,
        x: vv.x,
        y: vv.y,
        distance: vv.distance,
      };
    }
    if (wallDistance <= range) {
      return wallSelected;
    } else {
      return false;
    }
  },

  // RETURN OBJECTS ARRAY INDEX OF WALLS [WALL1, WALL2, n...] WALLS WITH THIS NODE, EXCEPT PARAM = OBJECT WALL
  getWallNode: (coords, except = false) => {
      const nodes = [];
      for (const k in window.editorVars.WALLS) {
        if (!isObjectsEquals(window.editorVars.WALLS[k], except)) {
          if (isObjectsEquals(window.editorVars.WALLS[k].start, coords)) {
            nodes.push({ wall: window.editorVars.WALLS[k], type: "start" });
          }
          if (isObjectsEquals(window.editorVars.WALLS[k].end, coords)) {
            nodes.push({ wall: window.editorVars.WALLS[k], type: "end" });
          }
        }
      }

      if (nodes.length == 0) {
        return false;
      } else {
        return nodes;
      }
    },

  nearWallNode: function ({ snap, range = Infinity, except = [""]}) {
    let best;
    let bestWall;
    let scanDistance;
    let bestDistance = Infinity;

    for (let k = 0; k < window.editorVars.WALLS.length; k++) {
      if (except.indexOf(window.editorVars.WALLS[k]) == -1) {
        scanStart = window.editorVars.WALLS[k].start;
        scanEnd = window.editorVars.WALLS[k].end;
        scanDistance = qSVG.measure(scanStart, snap);
        if (scanDistance < bestDistance) {
          best = scanStart;
          bestDistance = scanDistance;
          bestWall = k;
        }
        scanDistance = qSVG.measure(scanEnd, snap);
        if (scanDistance < bestDistance) {
          best = scanEnd;
          bestDistance = scanDistance;
          bestWall = k;
        }
      }
    }

    if (best && bestDistance <= range) {
      return {
        x: best.x,
        y: best.y,
        bestWall: bestWall,
      };
    } else {
      return false;
    }
  },

  nearVertice: ({snap, range = 10000}) => {
    let bestDistance = Infinity;
    let bestVertice;
    for (let i = 0; i < window.editorVars.WALLS.length; i++) {
      const distance1 = qSVG.gap(snap, {
        x: window.editorVars.WALLS[i].start.x,
        y: window.editorVars.WALLS[i].start.y,
      });
      const distance2 = qSVG.gap(snap, { x: window.editorVars.WALLS[i].end.x, y: window.editorVars.WALLS[i].end.y });
      if (distance1 < distance2 && distance1 < bestDistance) {
        bestDistance = distance1;
        bestVertice = {
          number: window.editorVars.WALLS[i],
          x: window.editorVars.WALLS[i].start.x,
          y: window.editorVars.WALLS[i].start.y,
          distance: Math.sqrt(bestDistance),
        };
      }
      if (distance2 < distance1 && distance2 < bestDistance) {
        bestDistance = distance2;
        bestVertice = {
          number: window.editorVars.WALLS[i],
          x: window.editorVars.WALLS[i].end.x,
          y: window.editorVars.WALLS[i].end.y,
          distance: Math.sqrt(bestDistance),
        };
      }
    }
    if (bestDistance < range * range) return bestVertice;
    else return false;
  },

  createEquationFromWall: (wall) => {
    return qSVG.createEquation(
      wall.start.x,
      wall.start.y,
      wall.end.x,
      wall.end.y
    );
  },

  roomMaker: function (Rooms) {
    if (Rooms.polygons.length == 0) {
      window.editorVars.ROOM = [];
    }

    for (let pp = 0; pp < Rooms.polygons.length; pp++) {
      let foundRoom = false;
      let roomId;
      for (let rr = 0; rr < window.editorVars.ROOM.length; rr++) {
        roomId = rr;
        let countCoords = Rooms.polygons[pp].coords.length;
        const diffCoords = qSVG.diffObjIntoArray(
          Rooms.polygons[pp].coords,
          window.editorVars.ROOM[rr].coords
        );
        if (Rooms.polygons[pp].way.length == window.editorVars.ROOM[rr].way.length) {
          if (
            qSVG.diffArray(Rooms.polygons[pp].way, window.editorVars.ROOM[rr].way).length == 0 ||
            diffCoords == 0
          ) {
            countCoords = 0;
          }
        }
        if (Rooms.polygons[pp].way.length == window.editorVars.ROOM[rr].way.length + 1) {
          if (
            qSVG.diffArray(Rooms.polygons[pp].way, window.editorVars.ROOM[rr].way).length == 1 ||
            diffCoords == 2
          ) {
            countCoords = 0;
          }
        }
        if (Rooms.polygons[pp].way.length == window.editorVars.ROOM[rr].way.length - 1) {
          if (
            qSVG.diffArray(Rooms.polygons[pp].way, window.editorVars.ROOM[rr].way).length == 1
          ) {
            countCoords = 0;
          }
        }
        if (countCoords == 0) {
          foundRoom = true;
          window.editorVars.ROOM[rr].area = Rooms.polygons[pp].area;
          window.editorVars.ROOM[rr].inside = Rooms.polygons[pp].inside;
          window.editorVars.ROOM[rr].coords = Rooms.polygons[pp].coords;
          window.editorVars.ROOM[rr].coordsOutside = Rooms.polygons[pp].coordsOutside;
          window.editorVars.ROOM[rr].way = Rooms.polygons[pp].way;
          window.editorVars.ROOM[rr].coordsInside = Rooms.polygons[pp].coordsInside;
          break;
        }
      }
      if (!foundRoom) {
        window.editorVars.ROOM.push({
          coords: Rooms.polygons[pp].coords,
          coordsOutside: Rooms.polygons[pp].coordsOutside,
          coordsInside: Rooms.polygons[pp].coordsInside,
          inside: Rooms.polygons[pp].inside,
          way: Rooms.polygons[pp].way,
          area: Rooms.polygons[pp].area,
          surface: "",
          name: "",
          color: "gradientWhite",
          showSurface: true,
          action: "add",
        });
      }
    }

    const toSplice = [];
    for (let rr = 0; rr < window.editorVars.ROOM.length; rr++) {
      let found = true;
      for (let pp = 0; pp < Rooms.polygons.length; pp++) {
        let countRoom = window.editorVars.ROOM[rr].coords.length;
        const diffCoords = qSVG.diffObjIntoArray(
          Rooms.polygons[pp].coords,
          window.editorVars.ROOM[rr].coords
        );
        if (Rooms.polygons[pp].way.length == window.editorVars.ROOM[rr].way.length) {
          if (
            qSVG.diffArray(Rooms.polygons[pp].way, window.editorVars.ROOM[rr].way).length == 0 ||
            diffCoords == 0
          ) {
            countRoom = 0;
          }
        }
        if (Rooms.polygons[pp].way.length == window.editorVars.ROOM[rr].way.length + 1) {
          if (
            qSVG.diffArray(Rooms.polygons[pp].way, window.editorVars.ROOM[rr].way).length == 1 ||
            diffCoords == 2
          ) {
            countRoom = 0;
          }
        }
        if (Rooms.polygons[pp].way.length == window.editorVars.ROOM[rr].way.length - 1) {
          if (
            qSVG.diffArray(Rooms.polygons[pp].way, window.editorVars.ROOM[rr].way).length == 1
          ) {
            countRoom = 0;
          }
        }
        if (countRoom == 0) {
          found = true;
          break;
        } else found = false;
      }
      if (!found) toSplice.push(rr);
    }

    toSplice.sort(function (a, b) {
      return b - a;
    });
    
    for (let ss = 0; ss < toSplice.length; ss++) {
      window.editorVars.ROOM.splice(toSplice[ss], 1);
    }

    clearHtmlTagById("boxRoom");
    clearHtmlTagById("boxSurface");
    clearHtmlTagById("boxArea");

    for (let rr = 0; rr < window.editorVars.ROOM.length; rr++) {

      if (window.editorVars.ROOM[rr].action == "add") {
        globalArea = globalArea + window.editorVars.ROOM[rr].area;
      }

      const pathSurface = window.editorVars.ROOM[rr].coords;
      let pathCreate = "M" + pathSurface[0].x + "," + pathSurface[0].y;
      for (let p = 1; p < pathSurface.length; p++) {
        pathCreate = pathCreate + " " + "L" + pathSurface[p].x + "," + pathSurface[p].y;
      }

      if (window.editorVars.ROOM[rr].inside.length > 0) {
        for (let ins = 0; ins < window.editorVars.ROOM[rr].inside.length; ins++) {
          pathCreate =
            pathCreate +
            " M" +
            Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords[
              Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords.length - 1
            ].x +
            "," +
            Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords[
              Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords.length - 1
            ].y;
          for (
            let free = Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords.length - 2;
            free > -1;
            free--
          ) {
            pathCreate =
              pathCreate +
              " L" +
              Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords[free].x +
              "," +
              Rooms.polygons[window.editorVars.ROOM[rr].inside[ins]].coords[free].y;
          }
        }
      }

      qSVG.create("boxRoom", "path", {
        d: pathCreate,
        fill: "url(#" + window.editorVars.ROOM[rr].color + ")",
        "fill-opacity": 1,
        stroke: "none",
        "fill-rule": "evenodd",
        class: "room",
      });

      qSVG.create("boxSurface", "path", {
        d: pathCreate,
        fill: "#ffffff",
        "fill-opacity": 1,
        stroke: "none",
        "fill-rule": "evenodd",
        class: "room",
      });

      const centroid = qSVG.polygonVisualCenter(window.editorVars.ROOM[rr]);

      if (window.editorVars.ROOM[rr].name != "") {
        const styled = { color: "#343938" };
        if (
          window.editorVars.ROOM[rr].color == "gradientBlack" ||
          window.editorVars.ROOM[rr].color == "gradientBlue"
        )
          styled.color = "white";
        qSVG.textOnDiv(window.editorVars.ROOM[rr].name, centroid, styled, "boxArea");
      }

      if (window.editorVars.ROOM[rr].name != "") centroid.y = centroid.y + 20;
      let area = (window.editorVars.ROOM[rr].area / (window.editorVars.METER * window.editorVars.METER)).toFixed(2) + " m²";
      const styled = {
        color: "#343938",
        fontSize: "12.5px",
        fontWeight: "normal",
      };
      if (window.editorVars.ROOM[rr].surface != "") {
        styled.fontWeight = "bold";
        area = window.editorVars.ROOM[rr].surface + " m²";
      }
      if (window.editorVars.ROOM[rr].color == "gradientBlack" || window.editorVars.ROOM[rr].color == "gradientBlue")
        styled.color = "white";
      if (window.editorVars.ROOM[rr].showSurface)
        qSVG.textOnDiv(area, centroid, styled, "boxArea");
    }
    if (globalArea <= 0) {
      globalArea = 0;
      document.getElementById("areaValue")?.innerHTML = "";
    } else {
      document.getElementById("areaValue")?.innerHTML = 
        `<i class=\"fa fa-map-o\" aria-hidden=\"true\"></i>
          ${(globalArea / 3600).toFixed(1)} m²
        `;
    }
  },

  wallsComputing: function (action = false) {
    clearHtmlTagById("boxwall");
    clearHtmlTagById("boxArea");

    for (let vertice = 0; vertice < window.editorVars.WALLS.length; vertice++) {
      const wall = window.editorVars.WALLS[vertice];
      if (wall.parent != null) {
        if (
          !isObjectsEquals(wall.parent.start, wall.start) &&
          !isObjectsEquals(wall.parent.end, wall.start)
        ) {
          wall.parent = null;
        }
      }
      if (wall.child != null) {
        if (
          !isObjectsEquals(wall.child.start, wall.end) &&
          !isObjectsEquals(wall.child.end, wall.end)
        ) {
          wall.child = null;
        }
      }
    }

    for (let vertice = 0; vertice < window.editorVars.WALLS.length; vertice++) {
      let interDw;
      let interUp;

      const wall = window.editorVars.WALLS[vertice];
      if (wall.parent != null) {
        if (isObjectsEquals(wall.parent.start, wall.start)) {
          const previousWall = wall.parent;
        }
        if (isObjectsEquals(wall.parent.end, wall.start)) {
          const previousWall = wall.parent;
        }
      } else {
        const S = editor.getWallNode(wall.start, wall);
        // if (wallInhibation && isObjectsEquals(wall, wallInhibation)) S = false;
        for (const k in S) {
          const eqInter = editor.createEquationFromWall(S[k].wall);
          let angleInter = 90; // TO PASS TEST
          if (action == "move") {
            angleInter = qSVG.angleBetweenEquations(eqInter.A, equation2.A);
          }
          if (
            S[k].type == "start" &&
            S[k].wall.parent == null &&
            angleInter > 20 &&
            angleInter < 160
          ) {
            wall.parent = S[k].wall;
            S[k].wall.parent = wall;
            const previousWall = wall.parent;
          }
          if (
            S[k].type == "end" &&
            S[k].wall.child == null &&
            angleInter > 20 &&
            angleInter < 160
          ) {
            wall.parent = S[k].wall;
            S[k].wall.child = wall;
            const previousWall = wall.parent;
          }
        }
      }

      if (wall.child != null) {
        if (isObjectsEquals(wall.child.end, wall.end)) {
          const nextWall = wall.child;
        } else {
          const nextWall = wall.child;
        }
      } else {
        const E = editor.getWallNode(wall.end, wall);
        // if (wallInhibation && isObjectsEquals(wall, wallInhibation)) E = false;
        for (const k in E) {
          const eqInter = editor.createEquationFromWall(E[k].wall);
          let angleInter = 90; // TO PASS TEST
          if (action == "move") {
            angleInter = qSVG.angleBetweenEquations(eqInter.A, equation2.A);
          }
          if (
            E[k].type == "end" &&
            E[k].wall.child == null &&
            angleInter > 20 &&
            angleInter < 160
          ) {
            wall.child = E[k].wall;
            E[k].wall.child = wall;
            const nextWall = wall.child;
          }
          if (
            E[k].type == "start" &&
            E[k].wall.parent == null &&
            angleInter > 20 &&
            angleInter < 160
          ) {
            wall.child = E[k].wall;
            E[k].wall.parent = wall;
            const nextWall = wall.child;
          }
        }
      }

      const angleWall = Math.atan2(
        wall.end.y - wall.start.y,
        wall.end.x - wall.start.x
      );
      wall.angle = angleWall;
      const wallThickX = (wall.thick / 2) * Math.sin(angleWall);
      const wallThickY = (wall.thick / 2) * Math.cos(angleWall);

      const eqWallUp = qSVG.createEquation(
        wall.start.x + wallThickX,
        wall.start.y - wallThickY,
        wall.end.x + wallThickX,
        wall.end.y - wallThickY
      );
      const eqWallDw = qSVG.createEquation(
        wall.start.x - wallThickX,
        wall.start.y + wallThickY,
        wall.end.x - wallThickX,
        wall.end.y + wallThickY
      );
      const eqWallBase = qSVG.createEquation(
        wall.start.x,
        wall.start.y,
        wall.end.x,
        wall.end.y
      );
      wall.equations = { up: eqWallUp, down: eqWallDw, base: eqWallBase };
      let dWay;

      // WALL STARTED
      if (wall.parent == null) {
        const eqP = qSVG.perpendicularEquation(
          eqWallUp,
          wall.start.x,
          wall.start.y
        );
        
        const interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
        const interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");

        wall.coords = [interDw, interUp];
        dWay =
          "M" +
          interUp.x +
          "," +
          interUp.y +
          " L" +
          interDw.x +
          "," +
          interDw.y +
          " ";
      } else {
        const eqP = qSVG.perpendicularEquation(
          eqWallUp,
          wall.start.x,
          wall.start.y
        );
        const previousWall = wall.parent;
        const previousWallStart = previousWall.start;
        const previousWallEnd = previousWall.end;
        
        const anglePreviousWall = Math.atan2(
          previousWallEnd.y - previousWallStart.y,
          previousWallEnd.x - previousWallStart.x
        );
        const previousWallThickX =
          (previousWall.thick / 2) * Math.sin(anglePreviousWall);
        const previousWallThickY =
          (previousWall.thick / 2) * Math.cos(anglePreviousWall);

        const eqPreviousWallUp = qSVG.createEquation(
          previousWallStart.x + previousWallThickX,
          previousWallStart.y - previousWallThickY,
          previousWallEnd.x + previousWallThickX,
          previousWallEnd.y - previousWallThickY
        );

        const eqPreviousWallDw = qSVG.createEquation(
          previousWallStart.x - previousWallThickX,
          previousWallStart.y + previousWallThickY,
          previousWallEnd.x - previousWallThickX,
          previousWallEnd.y + previousWallThickY
        );
        if (Math.abs(anglePreviousWall - angleWall) > 0.09) {
          interUp = qSVG.intersectionOfEquations(
            eqWallUp,
            eqPreviousWallUp,
            "object"
          );
          interDw = qSVG.intersectionOfEquations(
            eqWallDw,
            eqPreviousWallDw,
            "object"
          );

          if (eqWallUp.A == eqPreviousWallUp.A) {
            interUp = {
              x: wall.start.x + wallThickX,
              y: wall.start.y - wallThickY,
            };
            interDw = {
              x: wall.start.x - wallThickX,
              y: wall.start.y + wallThickY,
            };
          }

          const miter = qSVG.gap(interUp, {
            x: previousWallEnd.x,
            y: previousWallEnd.y,
          });

          if (miter > 1000) {
            interUp = qSVG.intersectionOfEquations(eqP, eqWallUp, "object");
            interDw = qSVG.intersectionOfEquations(eqP, eqWallDw, "object");
          }
        }


        if (Math.abs(anglePreviousWall - angleWall) <= 0.09) {
          interUp = qSVG.intersectionOfEquations(eqP, eqWallUp, "object");
          interDw = qSVG.intersectionOfEquations(eqP, eqWallDw, "object");
        }
        
        wall.coords = [interUp, interDw];
        
        dWay =
          "M" +
          interUp.x +
          "," +
          interUp.y +
          " L" +
          interDw.x +
          "," +
          interDw.y +
          " ";
      }

      // WALL FINISHED
      if (wall.child == null) {
        const eqP = qSVG.perpendicularEquation(eqWallUp, wall.end.x, wall.end.y);
        const interUpFINISHED = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
        const interDwFINISHED = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");

        wall.coords.push(interDwFINISHED, interUpFINISHED);
        dWay =
          dWay +
          "L" +
          interDwFINISHED.x +
          "," +
          interDwFINISHED.y +
          " L" +
          interUpFINISHED.x +
          "," +
          interUpFINISHED.y +
          " Z";
      } else {
        const eqP = qSVG.perpendicularEquation(eqWallUp, wall.end.x, wall.end.y);
        const nextWall = wall.child;
        const nextWallStart = nextWall.start;
        const nextWallEnd = nextWall.end;
        
        const angleNextWall = Math.atan2(
          nextWallEnd.y - nextWallStart.y,
          nextWallEnd.x - nextWallStart.x
        );
        const nextWallThickX = (nextWall.thick / 2) * Math.sin(angleNextWall);
        const nextWallThickY = (nextWall.thick / 2) * Math.cos(angleNextWall);

        const eqNextWallUp = qSVG.createEquation(
          nextWallStart.x + nextWallThickX,
          nextWallStart.y - nextWallThickY,
          nextWallEnd.x + nextWallThickX,
          nextWallEnd.y - nextWallThickY
        );

        const eqNextWallDw = qSVG.createEquation(
          nextWallStart.x - nextWallThickX,
          nextWallStart.y + nextWallThickY,
          nextWallEnd.x - nextWallThickX,
          nextWallEnd.y + nextWallThickY
        );

        if (Math.abs(angleNextWall - angleWall) > 0.09) {
          interUp = qSVG.intersectionOfEquations(
            eqWallUp,
            eqNextWallUp,
            "object"
          );
          interDw = qSVG.intersectionOfEquations(
            eqWallDw,
            eqNextWallDw,
            "object"
          );

          if (eqWallUp.A == eqNextWallUp.A) {
            interUp = {
              x: wall.end.x + wallThickX,
              y: wall.end.y - wallThickY,
            };
            interDw = {
              x: wall.end.x - wallThickX,
              y: wall.end.y + wallThickY,
            };
          }

          const miter = qSVG.gap(interUp, {
            x: nextWallStart.x,
            y: nextWallStart.y,
          });

          if (miter > 1000) {
            interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
            interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");
            
          }
        }

        if (Math.abs(angleNextWall - angleWall) <= 0.09) {
          interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
          interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");

        }

        wall.coords.push(interDw, interUp);

        dWay =
          dWay +
          "L" +
          interDw.x +
          "," +
          interDw.y +
          " L" +
          interUp.x +
          "," +
          interUp.y +
          " Z";
      }

      wall.graph = editor.makeWall(dWay);
      document.getElementById("boxwall")?.append(wall.graph);
    }
  },

  architect: () => {    
    editor.wallsComputing();
    const Rooms = qSVG.polygonize(window.editorVars.WALLS);
    
    clearHtmlTagById("boxRoom");
    clearHtmlTagById("boxSurface");

    return editor.roomMaker(Rooms);
  },

  showScaleBox: function () {
    if (window.editorVars.ROOM.length > 0) {

      let minX, minY, maxX, maxY;

      for (let i = 0; i < window.editorVars.WALLS.length; i++) {
        let px = window.editorVars.WALLS[i].start.x;
        let py = window.editorVars.WALLS[i].start.y;

        if (!i || px < minX) minX = px;
        if (!i || py < minY) minY = py;
        if (!i || px > maxX) maxX = px;
        if (!i || py > maxY) maxY = py;
        
        px = window.editorVars.WALLS[i].end.x;
        py = window.editorVars.WALLS[i].end.y;

        if (!i || px < minX) minX = px;
        if (!i || py < minY) minY = py;
        if (!i || px > maxX) maxX = px;
        if (!i || py > maxY) maxY = py;
      }

      const width = maxX - minX;
      const height = maxY - minY;

      const labelWidth = ((maxX - minX) / window.editorVars.METER).toFixed(2);
      const labelHeight = ((maxY - minY) / window.editorVars.METER).toFixed(2);

      let sideRight = "m" + (maxX + 40) + "," + minY;

      sideRight = sideRight + " l60,0 m-40,10 l10,-10 l10,10 m-10,-10";
      sideRight = sideRight + " l0," + height;
      sideRight = sideRight + " m-30,0 l60,0 m-40,-10 l10,10 l10,-10";

      sideRight = sideRight + "M" + minX + "," + (minY - 40);
      sideRight = sideRight + " l0,-60 m10,40 l-10,-10 l10,-10 m-10,10";
      sideRight = sideRight + " l" + width + ",0";
      sideRight = sideRight + " m0,30 l0,-60 m-10,40 l10,-10 l-10,-10";

      clearHtmlTagById("boxScale");

      qSVG.create("boxScale", "path", {
        d: sideRight,
        stroke: "#555",
        fill: "none",
        "stroke-width": 0.3,
        "stroke-linecap": "butt",
        "stroke-linejoin": "miter",
        "stroke-miterlimit": 4,
        "fill-rule": "nonzero",
      });

      let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttributeNS(null, "x", maxX + 70);
      text.setAttributeNS(null, "y", (maxY + minY) / 2 + 35);
      text.setAttributeNS(null, "fill", "#555");
      text.setAttributeNS(null, "text-anchor", "middle");
      text.textContent = labelHeight + " m";
      text.setAttribute(
        "transform",
        "rotate(270 " + (maxX + 70) + "," + (maxY + minY) / 2 + ")"
      );

      document.getElementById("boxScale")?.append(text);

      text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttributeNS(null, "x", (maxX + minX) / 2);
      text.setAttributeNS(null, "y", minY - 95);
      text.setAttributeNS(null, "fill", "#555");
      text.setAttributeNS(null, "text-anchor", "middle");
      text.textContent = labelWidth + " m";

      document.getElementById("boxScale")?.append(text);
    }
  },

  rayCastingWall: function (snap) {
    const wallList = [];
    for (let i = 0; i < window.editorVars.WALLS.length; i++) {
      const polygon = [];
      for (let pp = 0; pp < 4; pp++) {
        polygon.push({ x: window.editorVars.WALLS[i].coords[pp].x, y: window.editorVars.WALLS[i].coords[pp].y }); // FOR Z
      }
      if (qSVG.rayCasting(snap, polygon)) {
        wallList.push(window.editorVars.WALLS[i]); // Return EDGES Index
      }
    }
    if (wallList.length == 0) return false;
    else {
      if (wallList.length == 1) return wallList[0];
      else return wallList;
    }
  },

  rayCastingWalls: function (snap) {
    const wallList = [];
    for (let i = 0; i < window.editorVars.WALLS.length; i++) {
      const polygon = [];
      for (let pp = 0; pp < 4; pp++) {
        polygon.push({ x: window.editorVars.WALLS[i].coords[pp].x, y: window.editorVars.WALLS[i].coords[pp].y }); // FOR Z
      }
      if (qSVG.rayCasting(snap, polygon)) {
        wallList.push(window.editorVars.WALLS[i]); // Return EDGES Index
      }
    }
    if (wallList.length == 0) return false;
    else {
      if (wallList.length == 1) {
        return wallList[0];
      } else {
        return wallList;
      }
    }
  },

  objFromWall: function (wall) {
    console.log("wall", wall);
    const objList = [];
    for (let scan = 0; scan < window.editorVars.OBJDATA.length; scan++) {
      let search;

      if (window.editorVars.OBJDATA[scan].family == "inWall") {
        const eq = qSVG.createEquation(
          wall.start.x,
          wall.start.y,
          wall.end.x,
          wall.end.y
        );

        search = qSVG.nearPointOnEquation(eq, window.editorVars.OBJDATA[scan]);

        if (
          search.distance < 0.01 &&
          qSVG.btwn(window.editorVars.OBJDATA[scan].x, wall.start.x, wall.end.x) &&
          qSVG.btwn(window.editorVars.OBJDATA[scan].y, wall.start.y, wall.end.y)
        )
          objList.push(window.editorVars.OBJDATA[scan]);
      }
    }
    return objList;
  },

  inWallRib2: function (wall, option = false) {
    if (!option) {
      clearHtmlTagById("boxRib");
    }
    const ribMaster = [];
    const emptyArray = [];
    ribMaster.push(emptyArray);
    ribMaster.push(emptyArray);
    let distance;
    const angleTextValue = wall.angle * (180 / Math.PI);
    const objWall = editor.objFromWall(wall); // LIST OBJ ON EDGE
    ribMaster[0].push({
      wall: wall,
      crossObj: false,
      side: "up",
      coords: wall.coords[0],
      distance: 0,
    });
    ribMaster[1].push({
      wall: wall,
      crossObj: false,
      side: "down",
      coords: wall.coords[1],
      distance: 0,
    });
    for (const ob in objWall) {
      const objTarget = objWall[ob];
      objTarget.up = [
        qSVG.nearPointOnEquation(wall.equations.up, objTarget.limit[0]),
        qSVG.nearPointOnEquation(wall.equations.up, objTarget.limit[1]),
      ];
      objTarget.down = [
        qSVG.nearPointOnEquation(wall.equations.down, objTarget.limit[0]),
        qSVG.nearPointOnEquation(wall.equations.down, objTarget.limit[1]),
      ];

      distance = qSVG.measure(wall.coords[0], objTarget.up[0]) / window.editorVars.METER;
      ribMaster[0].push({
        wall: wall,
        crossObj: ob,
        side: "up",
        coords: objTarget.up[0],
        distance: distance.toFixed(2),
      });
      distance = qSVG.measure(wall.coords[0], objTarget.up[1]) / window.editorVars.METER;
      ribMaster[0].push({
        wall: wall,
        crossObj: ob,
        side: "up",
        coords: objTarget.up[1],
        distance: distance.toFixed(2),
      });
      distance = qSVG.measure(wall.coords[1], objTarget.down[0]) / window.editorVars.METER;
      ribMaster[1].push({
        wall: wall,
        crossObj: ob,
        side: "down",
        coords: objTarget.down[0],
        distance: distance.toFixed(2),
      });
      distance = qSVG.measure(wall.coords[1], objTarget.down[1]) / window.editorVars.METER;
      ribMaster[1].push({
        wall: wall,
        crossObj: ob,
        side: "down",
        coords: objTarget.down[1],
        distance: distance.toFixed(2),
      });
    }
    distance = qSVG.measure(wall.coords[0], wall.coords[3]) / window.editorVars.METER;
    ribMaster[0].push({
      wall: wall,
      crossObj: false,
      side: "up",
      coords: wall.coords[3],
      distance: distance,
    });
    distance = qSVG.measure(wall.coords[1], wall.coords[2]) / window.editorVars.METER;
    ribMaster[1].push({
      wall: wall,
      crossObj: false,
      side: "down",
      coords: wall.coords[2],
      distance: distance,
    });
    ribMaster[0].sort(function (a, b) {
      return (a.distance - b.distance).toFixed(2);
    });
    ribMaster[1].sort(function (a, b) {
      return (a.distance - b.distance).toFixed(2);
    });
    for (const t in ribMaster) {
      for (let n = 1; n < ribMaster[t].length; n++) {
        const found = true;
        let shift = -5;
        const valueText = Math.abs(
          ribMaster[t][n - 1].distance - ribMaster[t][n].distance
        );
        let angleText = angleTextValue;
        if (found) {
          if (ribMaster[t][n - 1].side == "down") {
            shift = -shift + 10;
          }
          if (angleText > 89 || angleText < -89) {
            angleText -= 180;
            if (ribMaster[t][n - 1].side == "down") {
              shift = -5;
            } else shift = -shift + 10;
          }

          const sizeText = [];

          sizeText[n] = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          const startText = qSVG.middle(
            ribMaster[t][n - 1].coords.x,
            ribMaster[t][n - 1].coords.y,
            ribMaster[t][n].coords.x,
            ribMaster[t][n].coords.y
          );
          sizeText[n].setAttributeNS(null, "x", startText.x);
          sizeText[n].setAttributeNS(null, "y", startText.y + shift);
          sizeText[n].setAttributeNS(null, "text-anchor", "middle");
          sizeText[n].setAttributeNS(null, "font-family", "roboto");
          sizeText[n].setAttributeNS(null, "stroke", "#ffffff");
          sizeText[n].textContent = valueText.toFixed(2);
          if (sizeText[n].textContent < 1) {
            sizeText[n].setAttributeNS(null, "font-size", "0.8em");
            sizeText[n].textContent = sizeText[n].textContent.substring(
              1,
              sizeText[n].textContent.length
            );
          } else sizeText[n].setAttributeNS(null, "font-size", "1em");
          sizeText[n].setAttributeNS(null, "stroke-width", "0.4px");
          sizeText[n].setAttributeNS(null, "fill", "#666666");
          sizeText[n].setAttribute(
            "transform",
            "rotate(" + angleText + " " + startText.x + "," + startText.y + ")"
          );

          document.getElementById("boxRib")?.append(sizeText[n]);
        }
      }
    }
  },
};


export {
  editor,
};
