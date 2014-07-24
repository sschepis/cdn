//******************************************************
// depends: glMatrix
var sqrt = Math.sqrt,
    cos = Math.cos,
    sin = Math.sin,
    abs = Math.abs,
    atan2 = Math.atan2,
    log = Math.log,
    random = Math.random,
    PI = Math.PI,
    sqr = function(v){return v*v;},
    particles = [],
    drawScale = 1,
    emitters = [],
    forces  = [],
    maxParticles = 100,
    emissionRate = 1; 

// randomize vec values +- r units
vec2.random = function(v,r) {
  v[0] += (Math.random() * r * 2) - r;
  v[1] += (Math.random() * r * 2) - r;
  return v;
};
vec2.createAndInit = function(x, y) {
  var v = vec2.create();
  v[0] = x;
  v[1] = y;
  return v;
};
vec2.fromAngle = function(angle, magnitude) {
  return vec2.createAndInit(
    magnitude * cos(angle), 
    magnitude * sin(angle));
};
vec2.angle = function(v, angle, magnitude) {
  if(angle) {
    if(!magnitude) {
      magnitude = angle;
      angle = v;
    }
  }
  if(angle && magnitude)
    return vec2.fromAngle(angle, magnitude);
  if(!v) return 0;
  else return atan2(v[1], v[0]);
};
vec2.magnitude = function (v) {
  return sqrt(sqr(v[0]) + sqr(v[1]));
};

//******************************************************
// A thing with mass, position, and velocity - like your mom
function Particle(pt, vc, ac, mass) {
  // TODO bust out colors as options
  // also use
  var c = [
    'rgba(255,255,255,',
    'rgba(0,150,255,',
    'rgba(255,255,128,',
    'rgba(255,132,32,',
    'rgba(255,255,255,',
  ];
  this.pos = pt;
  this.vc = vc;
  this.ac = ac;
  this.mass = mass || 2;
  this.alive = true;
  this.color = c[~~(Math.random() * (c.length-1))];
}
Particle.prototype = {
  move : function () {
    vec2.add(this.vc, this.vc, this.ac);
    vec2.add(this.pos, this.pos, this.vc);
  },
  reactToForces : function (fields) {
    // iterate over static fields first
    var totalAccelerationX = 0, totalAccelerationY = 0;
    //console.log('react-0:' + JSON.stringify(this.ac, null, 4));
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var vectorX = field.pos[0] - this.pos[0];
      var vectorY = field.pos[1] - this.pos[1];
      var distance = vec2.distance(this.pos, field.pos); 
      var force = Math.sqrt(this.mass * field.mass / distance * distance);
      totalAccelerationX += vectorX * G(force);
      totalAccelerationY += vectorY * G(force);
    }
    this.ac = vec2.createAndInit(totalAccelerationX, totalAccelerationY);
    //console.log('react-1:' + JSON.stringify(this.ac, null, 4));
    // iterate over all other alive particles
    totalAccelerationX = 0, totalAccelerationY = 0;
    for (var i = 0; i < particles.length; i++) {
      var field = particles[i];
      if(field === this || !field.alive) continue;
      var vectorX = field.pos[0] - this.pos[0];
      var vectorY = field.pos[1] - this.pos[1];
      var distance = vec2.distance(this.pos, field.pos); 
      if(distance <= 2 / drawScale ) {
        if(this.mass >= field.mass) {
          var massRatio = this.mass / field.mass;
          if(Math.random() * massRatio <= 1) {
            this.breakApart();
            this.alive = false;
          } 
          else 
            this.grow(field.mass);
          field.alive = false;
          this.nova = true;
          delete this.size;
        } 
        else this.alive = false;
      }
      if(this.alive) {
        var force = (Math.sqrt(this.mass * field.mass) / (distance * distance));
        totalAccelerationX += vectorX * G(force);
        totalAccelerationY += vectorY * G(force);
      }
    }
    vec2.add(this.ac, this.ac, vec2.createAndInit(totalAccelerationX, totalAccelerationY));
    //console.log('react-2:' + JSON.stringify(this.ac, null, 4));
  },
  grow : function (amt) {
    if(!amt) amt = 1;
    this.mass += amt;
  },
  breakApart : function(minSize) {
    if(!minSize) minSize = 1;
    var remainingMass = this.mass;
    while(remainingMass > 0) {
      var np = new Particle(vec2.random(vec2.clone(this.pos),this.mass), vec2.createAndInit(0,0));
      np.mass = 1 + Math.random() * (remainingMass - 1);
      particles.push(np);
      np.mass = np.mass < minSize ? minSize : np.mass;
      remainingMass -= np.mass;
    }
    this.alive = false;
  }
};

//******************************************************
//This certainly doesn't *sub*mit to particles, that's for sure
function ParticleEmitter(pos, vc, ang) {
  // to do config options for emitter - random, static, show emitter, emitter color, etc
  this.pos = pos; 
  this.vc = vc; 
  this.ang = ang || 0.09; 
  this.color = "#999"; 
}
ParticleEmitter.prototype.emit = function() {
  var angle = vec2.angle(this.vc) + this.ang - (Math.random() * this.ang * 2);
  var magnitude = vec2.magnitude(this.vc);
  var position = vec2.clone(this.pos);
  var rndMod = vec2.createAndInit(
    ~~((Math.random() * 100) - 50) * drawScale,
    ~~((Math.random() * 100) - 50) * drawScale
  );
  vec2.add(position, position, rndMod);
  var velocity = vec2.fromAngle(angle, magnitude);
  console.log('emit:' + JSON.stringify(position, null, 4));
  return new Particle(position, velocity);
};

//******************************************************
// Use it, Luke
// to do collapse functionality into particle
function Force(pos, m) {
  this.pos = pos;
  this.mass = m;
}
Force.prototype.mass = function(m) {
  this.mass = m || 100;
  this.color = m < 0 ? "#f00" : "#0f0";
}
