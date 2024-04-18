document.querySelector('.dropdown .dropbtn').addEventListener('click', function() {
  var dropdownContent = document.querySelector('.dropdown-content');
  if (dropdownContent.style.display === 'block') {
      dropdownContent.style.display = 'none';
  } else {
      dropdownContent.style.display = 'block';
  }
});
const canvas = document.getElementById("canvas");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
let context = canvas.getContext("2d");
context.fillStyle = "white";
context.fillRect(0,0,canvas.width,canvas.height);

let draw_color = "black";
let draw_width = "2";
let is_drawing =false;
var pencilflow=false;
var bucketflow=false;
var eraserflow =false;
var magnifyflow =false;
var textflow=false;
var colorpickerflow=false;
var bucketflow = false;
const clr1 = document.getElementById('color1')
function change_color(element){
  draw_color=element.style.background;
  clr1.style.backgroundColor=element.style.background;
}
canvas.addEventListener("touchstart",start,false);
canvas.addEventListener("touchmove",draw,false);
canvas.addEventListener("mousedown",start,false);
canvas.addEventListener("mousemove",draw,false);
canvas.addEventListener("touchend",stop,false);
canvas.addEventListener("mouseup",stop,false);
canvas.addEventListener("mouseout",stop,false);

let defaultBorderColor = '';
let defaultBackgroundColor = '';
var temp_width = draw_width;

const input_bar = document.getElementById('ranging');
input_bar.addEventListener('mousemove', function() {
    // Get the value of the input range
    const value = parseInt(input_bar.value);
    const cursorDot = document.querySelector("[data-cursor-dot]");
    cursorDot.style.width=`${value}px`;
    cursorDot.style.height=`${value}px`;
    draw_width = value;
 
});


function resetTools() {
  // Reset all tool functionalities
  draw_width = "2";
  draw_color = "black";
  is_drawing = false;
  clr1.style.backgroundColor="black"

  // Reset all tool button appearances
  const toolImages = document.querySelectorAll('.tools img');
  toolImages.forEach(image => {
      image.style.border = '';
      image.style.backgroundColor = '';
  });
  input_bar.value=2;
  // Reset all tool flow states
  pencilflow = false;
  bucketflow = false;
  eraserflow = false;
  magnifyflow = false;
  textflow = false;
  colorpickerflow = false;

  // Revert cursor style
  document.body.style.cursor = "default";

  // Hide cursor dot
  const cursorDot = document.querySelector("[data-cursor-dot]");
  if (cursorDot) {
      cursorDot.style.display = "none";
  }
}


const eraserImage = document.getElementById("eraser");
var eraserClicked = false;
function RemoveEraser() {
  document.body.style.cursor = "default";
  
  const cursorDot = document.querySelector("[data-cursor-dot]");
  window.addEventListener("mousemove",function(e){
    cursorDot.style.display="none";
  }
)}

const pencilImage = document.getElementById("pencil");
pencilImage.addEventListener('click', function() {
// Reset other tools
resetTools();

if (this.style.border === '') {
  defaultBorderColor = this.style.border;
  defaultBackgroundColor = this.style.backgroundColor;
  this.style.border = '2px solid skyblue';
  this.style.backgroundColor = 'rgb(164, 223, 240)';
  draw_width = "0.05";
  pencilflow = true;
  RemoveEraser();
} else {
  this.style.border = defaultBorderColor;
  this.style.backgroundColor = defaultBackgroundColor;
  draw_width = temp_width;
  pencilflow = false;
}
});


// Initialize the visited set
var visited = new Set();

function getPixelColor(event) {
  // Get the coordinates of the mouse click relative to the canvas
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  // Get the pixel data of the clicked point
  var imageData = context.getImageData(x, y, 1, 1);
  var data = imageData.data;
  return data;
}
function getPixelValueByName(colorName) {
  // Create a temporary canvas element
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d');

  // Try setting the pixel color using the provided name
  try {
    context.fillStyle = colorName;
    context.fillRect(0, 0, 1, 1);

    // Get the image data and extract the RGB values
    const imageData = context.getImageData(0, 0, 1, 1);
    const data = imageData.data;
    return [data[0], data[1], data[2]];
  } catch (error) {
    console.error(`Invalid color name: ${colorName}`);
    return null;
  }
}
function isSimilarColor(color1, color2, tolerance) {
  // Check difference for each color component (red, green, blue)
  return (
    Math.abs(color1[0] - color2[0]) <= tolerance &&
    Math.abs(color1[1] - color2[1]) <= tolerance &&
    Math.abs(color1[2] - color2[2]) <= tolerance
  );
}
function FillColor(x, y, tempColor, toBeFilledColor, tolerance = 0) {
  const key = `${x},${y}`;
  if ((isSimilarColor(tempColor, toBeFilledColor, tolerance))) {
    return;
  }

  const queue = [{ x, y }];
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    visited.add(`${x},${y}`);
    context.fillStyle = `rgb(${toBeFilledColor[0]}, ${toBeFilledColor[1]}, ${toBeFilledColor[2]})`;
    context.fillRect(x, y-104.5, 1, 1);

    const neighbors = [
      { dx: -1, dy: 0 },  
      { dx: 1, dy: 0 },   
      { dx: 0, dy: -1 },  
      { dx: 0, dy: 1 },   
      { dx: -1, dy: -1 }, 
      { dx: 1, dy: -1 },  
      { dx: -1, dy: 1 },  
      { dx: 1, dy: 1 },   
      { dx: -2, dy: 0 },  
      { dx: 2, dy: 0 },   
      { dx: 0, dy: -2 },  
      { dx: 0, dy: 2 },   
      { dx: -1, dy: -2 },
      { dx: 1, dy: -2 },  
      { dx: -1, dy: 2 },  
      { dx: 1, dy: 2 }   
    ];
    
    for (let i = 0; i < neighbors.length; i++) {
      const neighborX = x + neighbors[i].dx;
      const neighborY = y + neighbors[i].dy;

      if (neighborX >= 0 && neighborX < canvas.width && neighborY >= 0 && neighborY < canvas.height) {
        const neighborKey = `${neighborX},${neighborY}`;
        if (!visited.has(neighborKey)) {
          const neighborColor = getPixelColor({ clientX: neighborX, clientY: neighborY });
          if (isSimilarColor(neighborColor, tempColor, tolerance)) {
            queue.push({ x: neighborX, y: neighborY });
            visited.add(neighborKey);
          }
        }
      }
    }
  }
}



const bucketImage = document.getElementById('bucket');
bucketImage.addEventListener('click', function() {
  resetTools();
  // Reset the visited set
  RemoveEraser();
  visited.clear();

  if (this.style.border === '') {
    defaultBorderColor = this.style.border;
    defaultBackgroundColor = this.style.backgroundColor;
    this.style.border = '2px solid skyblue';
    this.style.backgroundColor = 'rgb(164, 223, 240)';
    bucketflow = true;

    window.addEventListener('click', function(e) {
      var temp = getPixelColor(e);

      FillColor(e.clientX, e.clientY,temp, getPixelValueByName(draw_color)); // Example: Fill white pixels with red color
    })
  } else {
    this.style.border = defaultBorderColor;
    this.style.backgroundColor = defaultBackgroundColor;
    draw_width = temp_width;
    bucketflow = false;
  }
})



function AddEraser() {
  document.body.style.cursor = "none";

  const cursorDot = document.querySelector("[data-cursor-dot]");
  window.addEventListener("mousemove",function(e){
    cursorDot.style.display="block";
    const posX=e.clientX;
    const posY=e.clientY;
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
  }
)}

eraserImage.addEventListener('click', function() {
  resetTools();
  if (this.style.border === '') {
    defaultBorderColor = this.style.border;
    defaultBackgroundColor = this.style.backgroundColor;
    this.style.border = '2px solid skyblue';
    this.style.backgroundColor = 'rgb(164, 223, 240)';
    draw_color = "white";
    draw_width="0.05"
    eraserflow = true;
    eraserClicked=true;
} else {
  this.style.border = defaultBorderColor;
  this.style.backgroundColor = defaultBackgroundColor;
  draw_color = temp_color;
  eraserflow = false;
}
if(eraserflow==true){
  AddEraser(); 
}
});

const textImage = document.getElementById('customButton');
textImage.addEventListener('click',function(){
  resetTools();
  if(this.style.border===''){
    defaultBorderColor = this.style.border;
    defaultBackgroundColor = this.style.backgroundColor;
    this.style.border = '2px solid skyblue';
    this.style.backgroundColor = 'rgb(164, 223, 240)';
    canvas.style.cursor='crosshair';
    draw_color = "white";
    const dottedRectangle = document.createElement('div');
    dottedRectangle.className='dotted-rectangle';
    textImage.appendChild(dottedRectangle);
    
  }
})


function start(event){
  is_drawing = true;
  context.beginPath();
  context.moveTo(event.clientX-canvas.offsetLeft,event.clientY-canvas.offsetTop);
  event.preventDefault();
}
function draw(event){
  if(is_drawing){
      context.lineTo(event.clientX-canvas.offsetLeft,event.clientY-canvas.offsetTop);
      if(eraserImage.style.border!==''){
        context.strokeStyle="white"
      }
      else{
        context.strokeStyle = draw_color;
      }
      context.lineWidth = draw_width;
      context.stroke();
  }
  event.preventDefault();
}
function stop(event){
  if(is_drawing){
      context.stroke();
      context.closePath();
      is_drawing=false;
  }
  event.preventDefault();
}

document.addEventListener("DOMContentLoaded", function () {
  const customButton = document.getElementById('customButton');
  const dottedRectangle = document.createElement('div');
  dottedRectangle.className = 'dotted-rectangle';
  customButton.appendChild(dottedRectangle);

  let isDrawing = false;
  let startX, startY;

  window.addEventListener('mousedown', function (e) {
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
    updateDottedRectangle(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
  });

  customButton.addEventListener('mouseup', function () {
    isDrawing = false;
    document.removeEventListener('mousemove', onMouseMove);
    dottedRectangle.style.display = 'none';
  });

  function onMouseMove(e) {
    if (!isDrawing) return;
    updateDottedRectangle(e.clientX, e.clientY);
  }

  function updateDottedRectangle(x, y) {
    const buttonRect = customButton.getBoundingClientRect();
    const offsetX = Math.min(startX, x) - buttonRect.left;
    const offsetY = Math.min(startY, y) - buttonRect.top;
    const width = Math.abs(x - startX);
    const height = Math.abs(y - startY);
    
    dottedRectangle.style.display = 'block';
    dottedRectangle.style.left = offsetX + 'px';
    dottedRectangle.style.top = offsetY + 'px';
    dottedRectangle.style.width = width + 'px';
    dottedRectangle.style.height = height + 'px';
  }
});

