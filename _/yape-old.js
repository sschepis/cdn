//******************************************************
// Yet Another Particle Engine
var sqrt = Math.sqrt,
    cos = Math.cos,
    sin = Math.sin,
    abs = Math.abs,
    atan2 = Math.atan2,
    log = Math.log,
    random = Math.random,
    PI = Math.PI,
    sqr = function(v){return v*v;};

//-------------------------------------------------------
// Vectors, and not the kind you put stuff in
function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}
Vector.prototype = {
  add : function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  },
  subtract : function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  },
  multiply : function(another) {
    this.x /= another.x;
    this.y /= another.y;
    this.z /= another.z;
    return this;
  },
  divide : function(another) {
    this.x /= another.x;
    this.y /= another.y;
    this.z /= another.z;
    return this;
  },
  scale : function(factor) {
    this.x *= factor;
    this.y *= factor;  
    this.z *= factor;  
    return this;      
  },
  magnitude : function () {
    return sqrt(sqr(this.x) + sqr(this.y));
  },
  angle : function (angle, magnitude) {
    if(angle && magnitude)
      return Vector.fromAngle(angle, magnitude);
    return atan2(this.y, this.x);
  },
  clone : function() {
    return new Vector(this.x, this.y, this.z);
  },
  equals : function(another) {
    return this.x === another.x 
        && this.y === another.y
        && this.z === another.z;
  }
};
Vector.fromAngle = function (angle, magnitude) {
  return new Vector(
    magnitude * cos(angle), 
    magnitude * sin(angle),
    magnitude * sin(angle));
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
  this.pos = pt || new Vector(0, 0);
  this.vc = vc || new Vector(0, 0);
  this.ac = ac || new Vector(0, 0);
  this.mass = mass || 2;
  this.alive = true;
  this.color = c[~~(Math.random() * c.length)];
}
Particle.prototype.move = function () {
  this.vc.add(this.ac);
  this.pos.add(this.vc);
};
Particle.prototype.reactToForces = function (fields) {
  var totalAccelerationX = 0;
  var totalAccelerationY = 0;
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var vectorX = field.pos.x - this.pos.x;
    var vectorY = field.pos.y - this.pos.y;
    var distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    var force = (Math.sqrt(this.mass * field.mass) / (distance * distance));
    totalAccelerationX += vectorX * G(force);
    totalAccelerationY += vectorY * G(force);
  }
  this.ac = new Vector(totalAccelerationX, totalAccelerationY);
  
  totalAccelerationX = 0;
  totalAccelerationY = 0;
  for (var i = 0; i < particles.length; i++) {
    var field = particles[i];
    if(field === this) continue;
    var vectorX = field.pos.x - this.pos.x;
    var vectorY = field.pos.y - this.pos.y;
    var distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    
    if(distance <= 2 / drawScale ) {
      if(this.mass >= field.mass) {
        this.grow(field.mass);
        field.alive = false;
        this.nova = true;
        delete this.size;
      } else {
        this.alive = false;
      }
    }
    if(this.alive) {
      var force = (Math.sqrt(this.mass * field.mass) / (distance * distance));
      totalAccelerationX += vectorX * G(force);
      totalAccelerationY += vectorY * G(force);
    }
  }
  this.ac.add(new Vector(totalAccelerationX, totalAccelerationY));
};
Particle.prototype.grow = function (amt) {
  if(!amt) amt = 1;
  this.mass += amt;
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
  var angle = this.vc.angle() + 
      this.ang - (Math.random() * this.ang * 2);
  var magnitude = this.vc.magnitude();
  var position = this.pos.clone();
        position.add(
        new Vector(
          ~~((Math.random() * 100) - 50) * drawScale,       
          ~~((Math.random() * 100) - 50) * drawScale
        ));
  var velocity = Vector.fromAngle(angle, magnitude);
  return new Particle(position,velocity);
};

//******************************************************
// Use it, Luke
// to do collapse functionality into particle
function Force(pos, m) {
  this.pos = pos;
  this.mass(m);
}
Force.prototype.mass = function(m) {
  this.mass = m || 100;
  this.color = m < 0 ? "#f00" : "#0f0";
}
