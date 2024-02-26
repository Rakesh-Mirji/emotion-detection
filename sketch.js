const min = 63
const max = 89
var val = (max+min)/2
var heartRate=0
var pulse = document.getElementById("pulse")

function beat(){
  function getRandomInt(max) {
      return Math.round(Math.random() * max);
  }
  let elem = getRandomInt(1) ? 1 : -1
  if(val+elem >= min && val+elem <= max){
      val+=elem
  }
  if (val >= heartRate+5 || val<=heartRate-4 ) {
    heartRate=val
  }
  // console.log(val,heartRate);
  return heartRate
}
function calulateBP(){
  if( myFaces.length>0){
    pulse.innerText = beat();

  }else{
    pulse.innerText = 0;
    heartRate = 0;
    val = (max+min)/2
  }
}



// A choice for number of keypoints: 7,33,68,468

// === bare minimum 7 points ===
// var VTX = VTX7;

// === important facial feature 33 points ===
// var VTX = VTX33;

// === standard facial landmark 68 points ===
// var VTX = VTX68;

// === full facemesh 468 points ===
var VTX = VTX468;


// select the right triangulation based on vertices
var TRI;
if (VTX == VTX7){
  TRI = TRI7;
}else if (VTX == VTX33){
  TRI = TRI33;
}else if (VTX == VTX68){
  TRI = TRI68;
}else{
  TRI = TRI468;
}

var facemeshModel = null; // this will be loaded with the facemesh model
                          // WARNING: do NOT call it 'model', because p5 already has something called 'model'

var videoDataLoaded = false; // is webcam capture ready?

var statusText = "Loading facemesh model...";

var myFaces = []; // faces detected in this browser
                  // currently facemesh only supports single face, so this will be either empty or singleton

var capture; // webcam capture, managed by p5.js


// Load the MediaPipe facemesh model assets.
facemesh.load().then(function(_model){
  _model.pipeline.maxFaces=1
  console.log("model initialized.")
  statusText = "Model loaded."
  facemeshModel = _model;
  console.log(_model);
})


function setup() {
  createCanvas(600, 450);

  capture = createCapture(VIDEO); 
  // capture.elt.width = 600;
  // capture.elt.height = 450;
  console.log(capture.elt.style);

  // this is to make sure the capture is loaded before asking facemesh to take a look
  // otherwise facemesh will be very unhappy
  capture.elt.onloadeddata = function(){
    console.log("video initialized");
    videoDataLoaded = true;
  }
  
  capture.hide();
}


// draw a face object returned by facemesh
function drawFaces(faces,filled){
  for (var i = 0; i < faces.length; i++){
    const keypoints = faces[i].scaledMesh;

    // for (var j = 0; j < keypoints.length; j++) {
    //   const [x, y, z] = keypoints[j];
    //   circle(x,y,5);
    //   push();
    //   strokeWeight(1);
    //   text(j,x,y);
    //   pop()
    // }

    for (var j = 0; j < TRI.length; j+=3){
      var a = keypoints[TRI[j  ]];
      var b = keypoints[TRI[j+1]];
      var c = keypoints[TRI[j+2]];
      if (filled){
        var d = [(a[0]+b[0]+c[0])/6, (a[1]+b[1]+c[1])/6];
        var color = get(...d);
        fill(color);
        noStroke();
      }
      triangle(
        a[0],a[1],
        b[0],b[1],
        c[0],c[1],
      )
    }
  }
}

// reduces the number of keypoints to the desired set 
// (VTX7, VTX33, VTX68, etc.)
function packFace(face,set){
  var ret = {
    scaledMesh:[],
  }
  // console.log("Upper Lips : ",face.annotations.lipsUpperInner,face.annotations.lipsUpperOuter);
  // console.log("Lower Lips : ",face.annotations.lipsLowerInner,face.annotations.lipsLowerOuter);
  for (var i = 0; i < set.length; i++){
    var j = set[i];
    ret.scaledMesh[i] = [
      face.scaledMesh[j][0],
      face.scaledMesh[j][1],
      face.scaledMesh[j][2],
    ]
  }
  return ret;
}

function draw() {
  strokeJoin(ROUND); //otherwise super gnarly
  
  if (facemeshModel && videoDataLoaded){ // model and video both loaded, 
    
    facemeshModel.estimateFaces(capture.elt).then(function(_faces){
      // we're faceling an async promise
      // best to avoid drawing something here! it might produce weird results due to racing
      
      myFaces = _faces.map(x=>packFace(x,VTX)); // update the global myFaces object with the detected faces

      // console.log(myFaces);
      if (!myFaces.length){
        // haven't found any faces
        statusText = "Show some faces!"
      }else{
        // display the confidence, to 3 decimal places
        statusText = "Confidence: "+ (Math.round(_faces[0].faceInViewConfidence*1000)/1000);
        
      }
    })
  }

  calulateBP()
  background(200);
  
  // first draw the debug video and annotations
  push();
  // scale(0.5); // downscale the webcam capture before drawing, so it doesn't take up too much screen sapce
  // console.log(capture.elt.width, capture.height)
  image(capture, 0, 0, capture.width, capture.height);
  console.log(capture.width,capture.height);
  noFill();
  // scale(1)
  stroke(0,150, 255, 100);
  drawFaces(myFaces); // draw my face skeleton
  pop();

}

