import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const root = ReactDOM.createRoot(document.getElementById("app"));

root.render(<App />);

window.editorVars = {
  WALLS: [],
  ROOM: [],
  OBJDATA: [],
  HISTORY: [],
  lineIntersection: undefined,
  binder: undefined,
  lengthTemp: undefined,
  METER: 60,

  // wallSize: 20,
  // partitionSize: 8,
  // drag: "off",
  // action: 0,
  // magnetic: 0,
  // construc: 0,
  // Rcirclebinder: 8,
  // mode: "select_mode",
  // modeOption: null,
  // taille: document.getElementById("lin"),
  // taille_w: document.getElementById("lin")?.clientWidth,
  // taille_h: document.getElementById("lin")?.clientHeight,

  // offset: {
  //   top: document.getElementById("lin")?.clientTop,
  //   left: document.getElementById("lin")?.clientLeft,
  // },

  // grid: 20,
  // showRib: true,
  // showArea: true,
  // grid_snap: "off",
  // colorbackground: "#ffffff",
  // colorline: "#fff",
  // colorroom: "#f0daaf",
  // colorWall: "#666",
  // pox: 0,
  // poy: 0,
  // segment: 0,
  // xpath: 0,
  // ypath: 0,
  // width_viewbox: document.getElementById("lin")?.clientWidth,
  // height_viewbox: document.getElementById("lin")?.clientHeight,
  // ratio_viewbox: (document.getElementById("lin")?.clientHeight || 0) / (document.getElementById("lin")?.clientWidth || 0),
  // originX_viewbox: 0,
  // originY_viewbox: 0,
  // zoom: 9,
  // factor: 1,
};

if (module.hot) {
  module.hot.dispose(function (data) {
    // module is about to be replaced.
    // You can save data that should be accessible to the new asset in `data`
    data.updated = Date.now();
  });

  module.hot.accept(function (getParents) {
    // module or one of its dependencies was just updated.
    // data stored in `dispose` is available in `module.hot.data`
    let { updated } = module.hot.data;
  });
}

navigator.serviceWorker.register(new URL("service-worker.js", import.meta.url));
