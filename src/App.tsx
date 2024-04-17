import { useEffect, useRef, useState } from "react";
import "./styles.css";
import "ol/ol.css";
import { Feature, Map } from "ol";
import { map } from "./map";
import TileLayer from "ol/layer/Tile";
import XYZ from 'ol/source/XYZ';
import './sidebar.css';
import { fromLonLat } from "ol/proj";
import { Coordinate, createStringXY } from "ol/coordinate";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Vector from "ol/layer/Vector";
import SourceVector from "ol/source/Vector";
import { LineString, Point } from "ol/geom";
import Stroke from "ol/style/Stroke";
import MousePosition from "ol/control/MousePosition";


const london = fromLonLat([-0.12755, 51.507222]);
const moscow = fromLonLat([37.6178, 55.7517]);

export function useMap() {
  const mapRef = useRef<Map>();
  if (!mapRef.current) {
    mapRef.current = map;
    mapRef.current.addLayer(new TileLayer({
      source: new XYZ({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' // http://192.168.2.148/osm/{z}/{x}/{y}.png
      })
    }));
    AddMarker();
    AddLine();
  }
  return mapRef.current;
}

const iconFeature = new Feature({
  geometry: new Point(london),
  name: 'Somewhere near Nottingham',
});

const mousePosition = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  // className: 'custom-mouse-position',
  // target: document.getElementById('mouse-position'),
});

function AddMarker() {
  var markers = new Vector({
    source: new SourceVector({
      features: [iconFeature]
    }),
    style: new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'https://openlayers.org/en/latest/examples/data/icon.png'
      })
    })
  });
  map.addLayer(markers);
  
  var marker = new Feature(new Point(moscow));
  markers.getSource()?.addFeature(marker);

  map.addControl(mousePosition);
}

function AddLine() {
  var coords = [
    [-0.12755, 51.507222],
    [37.6178, 55.7517]
  ];
  var lineString = new LineString(coords);
  // transform to EPSG:3857
  lineString.transform('EPSG:4326', 'EPSG:3857');
  
  // create the feature
  var feature = new Feature({
    geometry: lineString,
    name: 'Line'
  });
  
  var lineStyle = new Style({
    stroke: new Stroke({
      color: '#ffcc33',
      width: 10
    })
  });
  
  var source = new SourceVector({
    features: [feature]
  });
  var vector = new Vector({
    source: source,
    style: [lineStyle]
  });
  map.addLayer(vector);
}

export default function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useMap();
  useEffect(() => {
    if (mapRef.current) {
      map.setTarget(mapRef.current);
      map.updateSize();
    }
  }, [map]);

  const [sattellite, setSattellite] = useState(false);

  function handleOnSetView() {
    map.getView().animate({
      center: london,
      duration: 2000,
      zoom: 10
    });
  }
  function handleOnFlyTo() {
    flyTo(moscow, function () {});
  }

  function flyTo(location: Coordinate, done: { (): void; (arg0: any): void; }) {
    const view = map.getView();

    const duration = 2000;
    let parts = 2;
    let called = false;
    function callback(complete: any) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        done(complete);
      }
    }
    view.animate(
      {
        center: location,
        duration: duration,
      },
      callback,
    );
    view.animate(
      {
        zoom: 3,
        duration: duration / 2,
      },
      {
        zoom: 10,
        duration: duration / 2,
      },
      callback,
    );
  }

  function switchUrl() {
    const layers = [...map.getLayers().getArray()]
    layers.forEach((layer) => map.removeLayer(layer))

    if (sattellite)
      map.addLayer(new TileLayer({
        source: new XYZ({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' // http://192.168.2.148/osm/{z}/{x}/{y}.png
        })
      }));
    else
      map.addLayer(new TileLayer({
        source: new XYZ({
          url: 'http://mt{0-3}.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'
        })
      }));
    
    AddMarker();
    AddLine();
    setSattellite(!sattellite);
  }

  return (
    <div className="App">
      <div className="map-container">
        <div id="map" ref={mapRef}></div>
        <div className="sidebar">
          <p>
            <button onClick={handleOnSetView}>
              Перенестись в Лондон
            </button>
          </p>
          <p>
            <button onClick={handleOnFlyTo}>
              Слетать в Москву
            </button>
          </p>
          <p>
            <button onClick={switchUrl}>
              Переключить карту
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}