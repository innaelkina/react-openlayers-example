import { Map } from "ol";
//import OSM from "ol/source/OSM";
import View from "ol/View";
import { defaults } from "ol/control/defaults";
import { defaults as interactionDefaults } from "ol/interaction/defaults";

// const osmBaseLayer = new TileLayer({
//   visible: true,
//   source: new OSM()
// });

export const map = new Map({
    target: 'map',
    view: new View({
      center: [0, 0],
      zoom: 2
    }),
  controls: defaults(),
  interactions: interactionDefaults({})
});
