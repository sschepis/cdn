
//******************************************************
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

drawScale = 4;
maxParticles = 200; 
emissionRate = 4; 
emitters = [
  new ParticleEmitter(
    new Vector(
      canvasWidth / 2 * drawScale+ 400, 
      canvasHeight / 2 * drawScale + 400
    ), Vector.fromAngle(-5, -5), 1
  ),
  new ParticleEmitter(
    new Vector(
      canvasWidth / 2 * drawScale - 400, 
      canvasHeight / 2 * drawScale-400
    ), Vector.fromAngle( 5, -5), 1
  )
];
forces  = [
  new Force(
    new Vector(
      (canvasWidth / 2 * drawScale),
      (canvasHeight / 2 * drawScale)
    ), 200000000)
];

function G(data) {
  return data * 0.00667384;
}

function loop() {
  clear();
  update();
  draw();
  queue();
}
 
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
    
function addNewParticles() {
  if (particles.length > maxParticles) return;
  for (var i = 0; i < emitters.length; i++) {
    for (var j = 0; j < emissionRate; j++) {
      var p = emitters[i].emit();
      particles.push(p);
    }
  }
}

var totalParticlesCreated = 0;
function addStaticParticles() {
  if (particles.length > maxParticles) return;
  for (var i = 0; i < emitters.length; i++) {
    for (var j = 0; j < emissionRate; j++) {
      var p = emitters[i].emit();
      totalParticlesCreated++;
      p.pos.x = ~~(Math.random() * canvasWidth * drawScale);
      p.pos.y = ~~(Math.random() * canvasHeight * drawScale);
      p.ac.x = p.ac.y = p.vc.x = p.vc.y = 0;
      p.mass = ~~(Math.random() * 100);
      particles.push(p);
    }
  }
}

function plotParticles(boundsX, boundsY) {
  var currentParticles = [];
  for (var i = 0; i < particles.length; i++) {
    var particle = particles[i];
    var pos = particle.pos;
    
    // this clips offscreen particles
    if (!particle.alive
       || pos.x < 0
       || (pos.x / drawScale) > boundsX
       || pos.y < 0
       || (pos.y / drawScale) > boundsY) continue;

     // this buffers the grid with l,w buffers on all sides
    if (!particle.alive
       || pos.x < -boundsX
       || pos.x > 2 * boundsX * drawScale
       || pos.y < -boundsY
       || pos.y > 2 * boundsY * drawScale) continue;   

    // this loops them in an infinite space
    if (pos.x < 0) pos.x = boundsX * drawScale;
    if ((pos.x / drawScale) > boundsX) pos.x = 0;
    if (pos.y < 0) pos.y = boundsY * drawScale;
    if ((pos.y / drawScale) > boundsY) pos.y = 0;

    particle.pos = pos;
    if (!particle.alive ) continue;
    
    particle.reactToForces(forces);
    particle.move();
    currentParticles.push(particle);
  }
  particles = currentParticles;
}

function draw() { 
  // For each particle
  
    for (var i = 0; i < forces.length; i++) {
    var p = forces[i];
    var position = p.pos;
    var opacity = 1;
    ctx.beginPath();
      
    ctx.fillStyle = 'rgba(255,255,255, 1)';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            15 / drawScale, 0, Math.PI*2, true); 
    ctx.fill();
      
    ctx.fillStyle = 'rgba(255,255,255, 0.3)';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            25 / drawScale, 0, Math.PI*2, true); 
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255, 0.1)';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            50 / drawScale, 0, Math.PI*2, true); 
    ctx.fill();      
    ctx.closePath();
  }
  
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var position = p.pos;
    if(!p.size) p.size = Math.floor(p.mass / 100);
    var opacity = p.mass / 100;
    opacity = opacity < 0.1 ? 0.1 : opacity;
    
    ctx.beginPath();
    
    var actualSize = p.size / drawScale;
    actualSize = actualSize < 1 ? 1 : actualSize;
    actualSize *= p.nova ? 4 : 1; 
    ctx.fillStyle = p.color + opacity + ')';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            actualSize , 0, Math.PI*2, true); 
    ctx.fill();

    var actualSize = p.size / drawScale;
    actualSize = actualSize < 1 ? 1 : actualSize;
    actualSize *= 2; 
    actualSize *= p.nova ? 4 : 1; 
    ctx.fillStyle = p.color + 0.2 + ')';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            actualSize , 0, Math.PI*2, true); 
    ctx.fill();
    
    var actualSize = p.size / drawScale;
    actualSize = actualSize < 1 ? 1 : actualSize;
    actualSize *= 4; 
    actualSize *= p.nova ? 4 : 1; 
    if(p.nova === true) p.nova = false;
    ctx.fillStyle = p.color + 0.1 + ')';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            actualSize , 0, Math.PI*2, true); 
    ctx.fill();

    var actualSize = p.size / drawScale;
    actualSize = actualSize < 1 ? 1 : actualSize;
    actualSize *= 10; 
    actualSize *= p.nova ? 4 : 1; 
    if(p.nova === true) p.nova = false;
    ctx.fillStyle = p.color + 0.03 + ')';
    ctx.arc(position.x / drawScale, 
            position.y / drawScale, 
            actualSize , 0, Math.PI*2, true); 
    ctx.fill();
    
    ctx.closePath();
  }
}

function update() {
  addNewParticles();
  plotParticles(canvas.width, canvas.height);
}
 
function queue() {
  window.requestAnimationFrame(loop);
}

$('canvas').mousedown(function(e){
  forces.push(new Force(new Vector(e.pageX * drawScale, e.pageY * drawScale), 1000000));
});
$('canvas').mouseup(function(e){

});


loop();
