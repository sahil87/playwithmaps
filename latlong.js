const wget = require('node-wget');
const fs = require('fs');

function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }


function main() {
  let [lat, long] = [19.0926,72.9877];
  //let z = 15;

  for (let z = 0; z<=16; z++) {
    let [x,y] = [long2tile(long, z),lat2tile(lat, z)];
    console.log(`z: ${z}\tx: ${x}\t y: ${y}`);
  }
}

function downloadDeep(x, y, zOriginal, zoomLevel, leftmostx, topmosty) {
  let depth = zoomLevel - zOriginal;
  let twoPowerDepth = Math.pow(2,depth);
  let startX = x*twoPowerDepth;
  let endX = startX + twoPowerDepth - 1;
  let startY = y*twoPowerDepth;
  let endY = startY + twoPowerDepth - 1;
  console.log(`x: ${x}, depth: ${depth}; startX: ${startX}, startY: ${startY}`);

  for(let i = startX, i1=1+(x-leftmostx)*twoPowerDepth; i<=endX; i++, i1++) {
    for(let j = startY, j1=1+(y-topmosty)*twoPowerDepth; j<=endY; j++, j1++) {
      downloadMaps(i,j,zoomLevel,`${i1}-${j1}`);
    }
  }
}

const downloadMaps = async (x,y,z,newName) => {
  let rasterPath = `http://c.tile.openstreetmap.org/${z}/${x}/${y}.png`;
  let topoPath = `https://tile.mapzen.com/mapzen/terrain/v1/normal/${z}/${x}/${y}.png?api_key=mapzen-Sg9gSS`;//removed one letter
  console.log('Downloading file ' + rasterPath);
  await wgetPromise({url: rasterPath, dest: `d/street-${x}-${y}.png`});
  fs.renameSync(`d/street-${x}-${y}.png`, `d/street-${newName}.png`)
  await wgetPromise({url: topoPath, dest: `d/topo-${x}-${y}.png`});
  fs.renameSync(`d/topo-${x}-${y}.png`, `d/topo-${newName}.png`)
}

function wgetPromise({url, dest}) {
  return new Promise((resolve, reject) => {
    wget({url: url, dest: dest}, resolve);
    //resolve();
  });
}


//main();
downloadDeep(719,456,10,12, 719, 456);
downloadDeep(719,457,10,12, 719, 456);
downloadDeep(720,456,10,12, 719, 456);
downloadDeep(720,457,10,12, 719, 456);

//http://c.tile.openstreetmap.org/10/719/456.png
//https://tile.mapzen.com/mapzen/terrain/v1/normal/10/719/456.png?api_key=mapzen-Sg9gSSJ

/*
Need at Zoom 9:
x/y:  359 360
228   ✔  ✔

Need at Zoom 10:
x/y: 718 719 720 721
456   ✕  ✔   ✔  ✕
457   ✕  ✔   ✔  ✕

Zoom 11: 16
Zoom 12: 64
*/
