let canvasWidth = 600;
let canvasHeight = 600;

let boxSizeX = canvasWidth / 2;
let boxSizeY = canvasWidth / 4;
let boxSizeZ = canvasWidth / 5;

let numberOfCurves = 7;
let numberOfLinesPerCurve = 60;
let numberOfLinesPerSegment = numberOfLinesPerCurve / 3;

let curveControlPoint1 = [];
let curveControlPoint2 = [];

let pointOnCurve = new Array(numberOfCurves);

let pointCurveEndsAt = [];

let maxAlpha = 255;
let minAlpha = 30;
let alphaSequence = [];
let alphaSequenceDelayBetweenCurves = 120;

let greenEndPoints = [];
let redEndPoints = [];

function setup() {
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  
  // for each of the curves
  
  let i = 0;
  let j = 0;
  
  for (let i = 0; i < numberOfCurves; i++) {

    // setting up 2 curve control points for each curve
    
    curveControlPoint1[i] = { 
      x: random(1) * boxSizeX, 
      y: random(1) * boxSizeY, 
      z: random(1) * boxSizeZ 
    }
    curveControlPoint2[i] = { 
      x: random(1) * boxSizeX, 
      y: random(1) * boxSizeY, 
      z: random(1) * boxSizeZ 
    }

    // setting up and end point for each curve
    
    pointCurveEndsAt[i] = int(random(numberOfLinesPerCurve / 3) + (numberOfLinesPerCurve / 3 * 2)) - 5;

    // calculating each point on each curve

    pointOnCurve[i] = new Array(numberOfLinesPerCurve); 
    j = 0;
    for (segment = 0; segment < 3; segment ++) {
      for (q = 0; q <= 1; q += 1 / numberOfLinesPerSegment) {
        if (segment == 0) {
          pX = curvePoint(0, 0, curveControlPoint1[i].x, curveControlPoint2[i].x, q);
          pY = curvePoint(0, 0, curveControlPoint1[i].y, curveControlPoint2[i].y, q);
          pZ = curvePoint(0, 0, curveControlPoint1[i].z, curveControlPoint2[i].z, q);
        }
        if (segment == 1) {
          pX = curvePoint(0, curveControlPoint1[i].x, curveControlPoint2[i].x, boxSizeX, q);
          pY = curvePoint(0, curveControlPoint1[i].y, curveControlPoint2[i].y, boxSizeY, q);
          pZ = curvePoint(0, curveControlPoint1[i].z, curveControlPoint2[i].z, boxSizeZ, q);
        }
        if (segment == 2) {
          pX = curvePoint(0, curveControlPoint2[i].x, boxSizeX, boxSizeX, q);
          pY = curvePoint(0, curveControlPoint2[i].y, boxSizeY, boxSizeY, q);
          pZ = curvePoint(0, curveControlPoint2[i].z, boxSizeZ, boxSizeZ, q);
        }
        pointOnCurve[i][j] = {
          x: boxSizeX-pX,
          y: boxSizeY-pY,
          z: boxSizeZ-pZ
        };
        j++;
      }
    }
  }

  pointOnCurve[i][j-1] = {
    x: 0,
    y: 0,
    z: 0
  };

  // only the last curve ends reaches the target, the corner of the box

  pointCurveEndsAt[0] = numberOfLinesPerCurve;

  // calculating alpha sequence, that will be attributed to the lines in the curves
  
  alphaSequenceLength = numberOfCurves * alphaSequenceDelayBetweenCurves + numberOfCurves * numberOfLinesPerCurve * 2;
  alphaSequenceInitLength = numberOfCurves * alphaSequenceDelayBetweenCurves;
  alphaSequencePhase = 0;
  for (i = 0; i < alphaSequenceLength; i++) {
    switch (alphaSequencePhase) {
      case 0: 
        if (i < alphaSequenceInitLength) {
          alphaSequence[i] = 0;
          break;
        } else {
          alphaSequencePhase++;
        }
      case 1:
        alphaSequence[i] = int((cos((i - alphaSequenceInitLength)/PI/16) * (maxAlpha/2-minAlpha/2) + (maxAlpha/2+minAlpha/2)));          
        if (alphaSequence[i] <= minAlpha) {
          alphaSequencePhase++;
        }
        break;
      case 2:
        alphaSequence[i] = minAlpha;
        break;
    }
  }
  
  console.log(pointCurveEndsAt);
}

function draw() {

  background("black");

  rotateY(frameCount * 0.01);

  stroke('white');
  strokeWeight(0.3);  
  noFill();
  box(boxSizeX, boxSizeY, boxSizeZ);
  
  translate(-boxSizeX / 2, -boxSizeY / 2, -boxSizeZ / 2);
  
  for (i = 0; i < numberOfCurves; i++) {
    for(j = 0; j <= (pointCurveEndsAt[i] - 2); j++) {
      
      // calculate alpha
      currentLineAlpha = alphaSequence[(numberOfLinesPerCurve + i * alphaSequenceDelayBetweenCurves - j + frameCount)% alphaSequence.length];

      let point1 = pointOnCurve[i][j];
      let point2 = pointOnCurve[i][j+1];
      
      // draw line
      if ((currentLineAlpha != 0) ) {
        stroke(255, currentLineAlpha);
        strokeWeight(2);  
        line(point1.x, point1.y, point1.z, point2.x, point2.y, point2.z);
      }

      if (
        (j == (pointCurveEndsAt[i] - 2)) &&
        (currentLineAlpha == maxAlpha)
      ) {
        if (pointCurveEndsAt[i] == numberOfLinesPerCurve) {
          greenEndPoints.push(point2);
        } else {
          redEndPoints.push(point2);
        }
      }
    }    
  }

  for (p = 0; p < redEndPoints.length; p++) {
    stroke('red');
    push();
    translate(redEndPoints[p].x, redEndPoints[p].y, redEndPoints[p].z);     sphere(3);
    pop();
  }
  for (p = 0; p < greenEndPoints.length; p++) {
    stroke('green');
    push();
    translate(greenEndPoints[p].x, greenEndPoints[p].y, greenEndPoints[p].z);
    sphere(3);
    pop();
  }
}