//Real Time Face Detection in p5.js from https://www.youtube.com/watch?v=3yqANLRWGLo

let faceapi;
let detections = [];

let video;
let canvas;

let min = 63
let max = 89

let minStress = 51
let maxStress = 75

let val = (max+min)/2
let stressVal = (maxStress+minStress)/2
let heartRate = 0
const mood = document.getElementById("mood");
const pulse = document.getElementById("pulse");
const stress = document.getElementById("stress");

function getRandomInt(max) {
    return Math.round(Math.random() * max);
}

function beat(emotion){
  let elem = getRandomInt(1) ? 1 : -1

  switch (emotion){
    case "normal":
      min = 70;
      max = 80;
      break;
    case "happy":
      min = 68;
      max = 72;
      break;
    case "anger":
      min = 75;
      max = 90;
      break;
    case "sad":
      min = 68;
      max = 80;
      break;
    case "disgusted":
      min = 63;
      max = 70;
      break;
    case "surprised":
      min = 75;
      max = 30;
      break;
    case "fear":
      min = 75;
      max = 90;
      break;
  }

  if(val+elem >= min && val+elem <= max){
      val+=elem
  }else{
    val = (min+max)/2
  }
  if (val >= heartRate+5 || val<=heartRate-4 ) {
    heartRate=val
  }
  // console.log(val,heartRate);
  return heartRate
}

function stressRange(emotion){
let elem = getRandomInt(1) ? 1 : -1

switch (emotion){
  case "normal":
    minStress = 70;
    maxStress = 80;
    break;
  case "happy":
    minStress = 68;
    maxStress = 72;
    break;
  case "anger":
    minStress = 75;
    maxStress = 90;
    break;
  case "sad":
    minStress = 68;
    maxStress = 80;
    break;
  case "disgusted":
    minStress = 63;
    maxStress = 70;
    break;
  case "surprised":
    minStress = 75;
    maxStress = 30;
    break;
  case "fear":
    minStress = 75;
    maxStress = 90;
    break;
}

if(stressVal+elem >= minStress && stressVal+elem <= maxStress){
  stressVal+=elem
}else{
  stressVal = (maxStress+minStress)/2
}
// console.log(val,heartRate);
return stressVal
}

function calulateBP(emotion){
  if( detections.length>0){
    pulse.innerText = beat(emotion)+" bpm";
    stress.innerText = stressRange(emotion)+"/100";

  }else{
    pulse.innerText = 0+" bpm";
    stress.innerText = 0+"/100";
    heartRate = 0;
    val = (max+min)/2
  }
}

function setup() {
  canvas = createCanvas(350, 262.5);
  canvas.id("canvas");

  video = createCapture(VIDEO);// Create video
  video.id("video");
  video.size(350, 262.5);

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  //Initialize the model
  faceapi = ml5.faceApi(video, faceOptions, faceReady);
}

function faceReady() {
  faceapi.detect(gotFaces);// Start detecting faces: 顔認識開始
}

// Get faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;//Now all the data in this detections: 
  // console.log(detections);

  if (detections.length<=0){
    pulse.innerText = "- bpm";
    stress.innerText ="- /100";
    mood.innerText = "----------";
  }

  clear();//Draw transparent background
  // drawBoxs(detections);//Draw detection box:
  drawLandmarks(detections);//// Draw all the face points
  drawExpressions(detections, 20, 250, 14);//Draw face expression

  faceapi.detect(gotFaces);// Call the function again here
}

function drawBoxs(detections){
  if (detections.length > 0) {//If at least 1 face is detected: 
    for (f=0; f < detections.length; f++){
      let {_x, _y, _width, _height} = detections[f].alignedRect._box;
      stroke(44, 169, 225);
      strokeWeight(1);
      noFill();
      rect(_x, _y, _width, _height);
    }
  }
}

function drawLandmarks(detections){
  if (detections.length > 0) {//If at least 1 face is detected
    for (f=0; f < detections.length; f++){
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(44, 169, 225);
        strokeWeight(3);
        point(points[i]._x, points[i]._y);
      }
    }
  }
}


function drawExpressions(detections, x, y, textYSpace){
  if(detections.length > 0){//If at least 1 face is detected
    let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
    textFont('Helvetica Neue');
    textSize(14);
    noStroke();
    fill(44, 169, 225);

    // text("neutral:       " + nf(neutral*100, 2, 2)+"%", x, y);
    // text("happiness: " + nf(happy*100, 2, 2)+"%", x, y+textYSpace);
    // text("anger:        " + nf(angry*100, 2, 2)+"%", x, y+textYSpace*2);
    // text("sad:            "+ nf(sad*100, 2, 2)+"%", x, y+textYSpace*3);
    // text("disgusted: " + nf(disgusted*100, 2, 2)+"%", x, y+textYSpace*4);
    // text("surprised:  " + nf(surprised*100, 2, 2)+"%", x, y+textYSpace*5);
    // text("fear:           " + nf(fearful*100, 2, 2)+"%", x, y+textYSpace*6);

    let emotion = moodDetect(neutral,happy,angry,sad,disgusted,surprised,fearful);
    calulateBP(emotion)
    mood.innerHTML = emotion.toUpperCase()
    // text("mood:           " + emotion, x, y+textYSpace*7);


  }else{//If no faces is detected
    // text("neutral: ", x, y);
    // text("happiness: ", x, y + textYSpace);
    // text("anger: ", x, y + textYSpace*2);
    // text("sad: ", x, y + textYSpace*3);
    // text("disgusted: ", x, y + textYSpace*4);
    // text("surprised: ", x, y + textYSpace*5);
    // text("fear: ", x, y + textYSpace*6);
  }
}

function moodDetect(neutral,happy,angry,sad,disgusted,surprised,fearful){
  if(neutral == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "normal"
  }else if(happy == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "happy"
  }else if(angry == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "angry"
  }else if(sad == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "sad"
  }else if(disgusted == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "disgusted"
  }else if(surprised == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "surprised"
  }else if(fearful == Math.max(neutral,happy,angry,sad,disgusted,surprised,fearful)){
    return "fearful"
  }
}