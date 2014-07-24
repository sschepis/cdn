function GravityModel(p, cb) {
  this.points = [];
  this.timeIndex = 0;
  this.bufferahead = 10;
  this.points[0] = p;
  this.running = false;
  this.cb = cb;
  return this;
}

GravityModel.spawnGravityWorker = function(inp, callback) {
        var p = new Parallel(inp);
          p.spawn(function (data) {
                  var newpositions = [];
                  var GRAVITATIONAL_CONSTANT = 0.000000000006674;
                  function applyGravity(inputs) {
                      var points = inputs.points;
                      for(var j = 0; j < points.length; j++) {
                        var aparticle = points[j];
                        newpositions[j] = {
                          x : aparticle.x, y : aparticle.y, z : aparticle.z,
                          velocity : {
                            x : aparticle.velocity.x,
                            y : aparticle.velocity.y,
                            z : aparticle.velocity.z
                          }, acceleration : { x : 0, y : 0, z : 0 },
                          mass : aparticle.mass
                        };
                        for(var i = 0; i < points.length; i++) {
                          if(i != j) {
                            var another = points[i];                    
                            var r12 = [ another.x - aparticle.x,
                                       another.y - aparticle.y,
                                       another.z - aparticle.z ];
                            var massProduct = aparticle.mass * another.mass;
                            var sv = {
                              x : aparticle.x - another.x,
                              y : aparticle.y - another.y,
                              z : aparticle.z - another.z,
                            };
                            var distanceSquared = sv.x * sv.x + sv.y * sv.y + sv.z * sv.z;
                            if( distanceSquared < this.mass ) distanceSquared = aparticle.mass;
                            var force = ( GRAVITATIONAL_CONSTANT * massProduct ) / distanceSquared;
                            newpositions[j].acceleration.x += r12[0] * force * inputs.step;
                            newpositions[j].acceleration.y += r12[1] * force * inputs.step;
                            newpositions[j].acceleration.z += r12[2] * force * inputs.step;
                          }
                        }
                        newpositions[j].velocity.x += newpositions[j].acceleration.x;
                        newpositions[j].velocity.y += newpositions[j].acceleration.y;
                        newpositions[j].velocity.z += newpositions[j].acceleration.z;

                        newpositions[j].x += newpositions[j].velocity.x;
                        newpositions[j].y += newpositions[j].velocity.y;
                        newpositions[j].z += newpositions[j].velocity.z;
                      }
                      return newpositions;
                  }
                  var ret = applyGravity(data);
                  return ret;
          }
        ).then(function (out) {
            callback(null, out);
        });
};

GravityModel.prototype.start = function(step) {
  var self = this;
  var _run = function() {  
    if(self.points.length - self.timeIndex < self.bufferahead ) {
      GravityModel.spawnGravityWorker({ 
        points : self.points[self.points.length - 1],
        step : step
      }, function(err, data) {
        self.points[self.points.length] = data;
        self.cb(self);
        setTimeout(_run, 0);
      });    
    } else setTimeout(_run, 10);
  };
  if(!this.running)
    setTimeout(_run, 0);
};

GravityModel.prototype.consume = function() {
  if(this.timeIndex >= this.points.length)
    return null;
  var out = this.points[this.timeIndex-1];
  this.points[this.timeIndex-1] = null;
  this.timeIndex += 1;
  return out;
};