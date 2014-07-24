
var creature = [33023,1051142,926462,4294967295,824095,4294967295,648598,0,1049473,255208,4294967295,112402,4294967295,418212,0,1051569,971110,4294967295,516570,4294967295,357769,0,1050070,562909,4294967295,472263,4294967295,107490,0,1050354,55019,4294967295,664113,4294967295,648303,0,1048625,413832,4294967295,238269,4294967295,991776,0,1051542,136870,4294967295,127860,4294967295,968618,0,1049490,1016497,4294967295,664581,4294967295,312952,0,1051201,684346,4294967295,705963,4294967295,377510,0,1052197,676235,4294967295,586825,4294967295,845319,0,1051796,529053,4294967295,541551,4294967295,264023,0,1050210,819673,4294967295,1008816,4294967295,226149,0,1051635,99312,4294967295,942434,4294967295,213405,0,1048775,13339,4294967295,1011992,4294967295,368655,0,1051841,569712,4294967295,156859,4294967295,762143,0,1049298,882571,4294967295,1000037,4294967295,876581,0,1050359,791335,4294967295,205138,4294967295,938454,0,1048615,123648,4294967295,397997,4294967295,538600,0,1050966,807635,4294967295,1033389,4294967295,472359,0,1051111,582483,4294967295,480143,4294967295,966824,0,1051665,197075,4294967295,997297,4294967295,612058,0,1051009,742244,4294967295,239414,4294967295,804377,0,1050007,173932,4294967295,222921,4294967295,364923,0,1049953,315914,4294967295,193763,4294967295,808687,0,1048993,954654,4294967295,509775,4294967295,807471,0,1052052,542271,4294967295,966704,4294967295,477054,0,1050837,317065,4294967295,831621,4294967295,270552,0,1049441,971213,4294967295,861726,4294967295,516855,0,1050177,82607,4294967295,787779,4294967295,939010,0,1049284,451056,4294967295,259476,4294967295,444266,0,1051671,20793,4294967295,213198,4294967295,931529,0,1051920,996095,4294967295,734212,4294967295,45996,0];
(function() {
    var z = 11.1;
    var r = 1.1547005383792515290182975610039;
    var r2 = Math.pow(r, 2);
    var a = (1 + r2) / r2;
    var b = z / r2;
    var c = ((1 - 4.0 * r2) / (4.0 * r2)) * (Math.pow(z, 2));
    var x = (-b + Math.sqrt(Math.pow(b, 2) - (4.0 * a * c))) / (2.0 * a);
    var y = ((2.0 * x) + z) / (2.0 * r);
    var width = ((2.0 * x) + z);
    var height = (2.0 * y);

    HT.Hexagon.Static.WIDTH = width;
    HT.Hexagon.Static.HEIGHT = height;
    HT.Hexagon.Static.SIDE = z;
})();

function RGB2Color(r,g,b)
{
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n)
{
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function makeColorGradient(frequency1, frequency2, frequency3, phase1,phase2,phase3,center,width,len,show)
{
    if (len == undefined)
        len = 50;
    if (center == undefined)
        center = 128;
    if (width == undefined)
        width = 127;
    if (show == undefined)
        show = false;
    var o = [];
    for (var i = 0; i < len; ++i)
    {
        var red = Math.sin(frequency1*i + phase1) * width + center;
        var grn = Math.sin(frequency2*i + phase2) * width + center;
        var blu = Math.sin(frequency3*i + phase3) * width + center;

        if(i>6&&i<len-10) {
            //o.push([red,grn,blu]);
            o.push(RGB2Color(red,grn,blu));
            if(show)document.write( '<font color="' + RGB2Color(red,grn,blu) + '">&#9608;</font>');
        }
    }
    return o;
}
var tcc = makeColorGradient(.1,.1,.1,0,2,4,128,127,50);
var colorCenter = 17;


/**
 * draws this Hexagon to the canvas
 * @this {HT.Hexagon}
 */
HT.Hexagon.prototype.draw = function (ctx, force) {
    if(!this.selected)
        ctx.strokeStyle = "grey";
    else
        ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.Points[0].X, this.Points[0].Y);
    for(var i = 1; i < this.Points.length; i++) {
        var p = this.Points[i];
        ctx.lineTo(p.X, p.Y);
    }
    ctx.closePath();
    ctx.stroke();

    var opacity = this.state ? Math.abs(this.state ? this.state * 3: 0) / 10 : 0.3;
    opacity = opacity > 1 ? 1 : opacity;
    var lx = Math.abs(this.Points[0].X - this.MidPoint.X);
    var ly = Math.abs(this.Points[0].Y - this.MidPoint.Y);
    var dis = Math.sqrt(lx * lx + ly * ly);

    var col;
    var tc = this.state > 0 ?  colorCenter - ~~(this.state / 4) :
        colorCenter + Math.abs(~~(this.state / 4));
    tc = tc < 0 ? 0 : tc;
    tc = tc >= tcc.length ? tcc.length - 1 : tc;
    tc = tcc[tc];
    // if(this.state!=0||force) col = 'rgba(' + tc[0] + ',' + tc[1] + ','+tc[2]+',' + opacity + ')';
    if(this.state!=0||force) col = tc;

    if(col) {
        ctx.beginPath();
        ctx.arc(this.MidPoint.X, this.MidPoint.Y, dis -5, 0, 2 * Math.PI, false);
        ctx.fillStyle = col;
        ctx.fill();
    }
};

/**
 * AppController
 * @constructor
 */
function AppController() {
    var self = this;
    this._isPaused = false;
    this._generation = 0;
    this.millisPerFrame = 0;
    this.updateGrid = true;
    this.generateNewRules = false;
    this.restartSim = false;
    this.minimumVisibleState = -127;
    this.maximumVisibleState = 127;
    this.lastFrameTime = new Date().getTime();
    this.hexGridCanvas = null;
    this.isAlive = true;
    this.grid = new HT.Grid(800, 600);
    this.canvas = document.getElementById("hexCanvas");
    this.ctx = this.canvas.getContext('2d');
   // this.world = new $$.alive.World();

    Object.defineProperty(this, "generation", {
        get: function () {
            return self._generation;
        },
        set: function (value) {
            self._generation = value;
            $('#generation').html(self._generation + '');
        },
        writeable: true,
        enumerable: true,
        configurable: true
    });
}

/**
 * drawHexGrid
 */
AppController.prototype.drawHexGrid = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.hexGridCanvas, 0, 0);
    for (var h = 0; h < this.grid.Hexes.length; h++) {
        if (this.updateGrid
            && this.grid.Hexes[h].getstate() >= this.minimumVisibleState
            && this.grid.Hexes[h].getstate() <= this.maximumVisibleState)
            this.grid.Hexes[h].draw(this.ctx, false);
    }
};

/**
 * gridIndex
 * @param n
 * @returns {*}
 */
AppController.prototype.gridIndex = function(n) {
    if(n < 0) n = this.grid.Hexes.length - n;
    if(n >= this.grid.Hexes.length)
        n = n - this.grid.Hexes.length;
    return n;
};

/**
 * setupStats
 */
AppController.prototype.setupStats = function() {
    // Align top-left
    window.statsFPS = new Stats();
    window.statsFPS.setMode(0); // 0: fps, 1: ms
    window.statsFPS.domElement.style.position = 'absolute';
    window.statsFPS.domElement.style.left = '0px';
    window.statsFPS.domElement.style.top = '0px';
    document.body.appendChild(window.statsFPS.domElement);
};

/**
 * datGui
 */
AppController.prototype.datGui = function() {
    var gui = new dat.GUI({ closed: false });
    gui.add(this, 'minimumVisibleState', -1024, 1024).step(1);
    gui.add(this, 'maximumVisibleState', -1024, 1024).step(1);
    gui.add(this, 'updateGrid', false);
    gui.add(this, 'millisPerFrame', 0, 5000);
    gui.remember(this);
    gui.width = 320;
};

/**
 *
 */
AppController.prototype.regenerateRules = function () {
    this.generateNewRules = true;
    this.generation = 0;
    this.isAlive = true;
};

/**
 *
 */
AppController.prototype.restartEvolution = function () {
    this.restartSim = true;
    this.generation = 0;
    this.isAlive = true;
};

/**
 *
 */
AppController.prototype.playPause = function () {
    if (this._isPaused) {
        $('.glyphicon-play')
            .removeClass('glyphicon-play')
            .addClass('glyphicon-pause');
    } else {
        $('.glyphicon-pause')
            .removeClass('glyphicon-pause')
            .addClass('glyphicon-play');
    }
    this._isPaused = !this._isPaused;
};

/**
 *
 */
AppController.prototype.createSeed = function() {
    var start = 646;
    this.grid.Hexes[start].setstate(1);
    this.protocell.energy = 1024;
};

/**
 * getCells
 */
AppController.prototype.getCellIndexes = function(index) {
    return [
        index,
        this.gridIndex(index - 47),
        this.gridIndex(index - 23),
        this.gridIndex(index + 24),
        this.gridIndex(index + 47),
        this.gridIndex(index + 23),
        this.gridIndex(index - 24)
    ];
};

/**
 * getCells
 */
AppController.prototype.getCellStates = function(index) {
    var ii = this.getCellIndexes(index);
    return [
        { state: this.grid.Hexes[ii[0]].getstate(), food: this.grid.Hexes[ii[0]].food },
        { state: this.grid.Hexes[ii[1]].getstate(), food: this.grid.Hexes[ii[1]].food },
        { state: this.grid.Hexes[ii[2]].getstate(), food: this.grid.Hexes[ii[2]].food },
        { state: this.grid.Hexes[ii[3]].getstate(), food: this.grid.Hexes[ii[3]].food },
        { state: this.grid.Hexes[ii[4]].getstate(), food: this.grid.Hexes[ii[4]].food },
        { state: this.grid.Hexes[ii[5]].getstate(), food: this.grid.Hexes[ii[5]].food },
        { state: this.grid.Hexes[ii[6]].getstate(), food: this.grid.Hexes[ii[6]].food }
    ];
};

/**
 * restart
 */
AppController.prototype.restart = function() {
    for (var h = 0; h < this.grid.Hexes.length; h++) {
        this.grid.Hexes[h].setstate(0);
        if(h>500&&h<this.grid.Hexes.length-500)
            this.grid.Hexes[h].food = 32;
    }
    self.aliveCellCount = 0;
    this.createSeed();
};

/**
 * newRules
 */
AppController.prototype.newRules = function() {

    function rndN(n) {
        return ~~(Math.random() * (1 << n));
    }
    var rules = [];
    for(var x = 0;x < 64; x++) {
        var r = new $$.alive.Rule({
            optype : rndN(3),
            conditions : [new $$.alive.Condition({
                cells  : rndN(8),
                optype : rndN(3),
                evalvalue : {
                    cells : rndN(8),
                    value : 0
                }
            })],
            expressionConditions : [ new $$.alive.Condition({
                cells : rndN(8),
                optype : rndN(3),
                evalvalue : {
                    cells : rndN(8),
                    value : 0
                }
            })],
            repressionConditions : [ new $$.alive.Condition({
                cells : rndN(8),
                optype : rndN(3),
                evalvalue : {
                    cells : rndN(8),
                    value : 0
                }
            })],
            expressed : true,
            operand : {
                cells : rndN(8),
                value : 0
            }
        });
        rules.push(r);
    }
    this.protocell = new $$.alive.Cell({ rules: rules });
   // this.world.protocell = this.protocell;

    $('#rule').text(JSON.stringify(this.protocell.val()));

    this.restart();
};

/**
 * run
 */
AppController.prototype.run = function () {
    var self = this;
    $('#restart').click(function () {
        self.restartEvolution();
    });
    $('#regenerate').click(function () {
        self.regenerateRules();
    });
    $('#playpause').click(function () {
        self.playPause();
    });

    function loop(delay) {
        delay = delay ? delay : 0;
        setTimeout(function () {
            window.statsFPS.end();
            requestAnimationFrame(go);
        }, delay);
    }

    function go() {
        // init stats collection
        window.statsFPS.begin();

        // just loop if paused
        if (self._isPaused)
            return loop(10);


        // compute which cells to process - only alive cells and
        // immediate neighbors get computed
        var toProcess = [], anyToProcess;
        for (var h = 0; h < self.grid.Hexes.length; h++) {
            if( self.grid.Hexes[h].getstate() !== 0 ) {
                var cs = self.getCellIndexes(h);
                for(var c in cs) {
                    c = cs[c];
                    toProcess[c] = true;
                    anyToProcess = true;
                }
            }
        }

        self.isAlive = self.protocell.isAlive() && anyToProcess;

        if(self.isAlive) {
            console.log('energy: ' + self.protocell.energy);

            // compute new states for cells which are marked for processing
            var newStates = [], stateSum;
            for (var h = 0; h < self.grid.Hexes.length; h++) {
                if(h>500&&h<self.grid.Hexes.length-500) {
                    var food = self.grid.Hexes[h].food;
                    if(food < 0) {
                        if(food === -1) food = 32;
                        else food += 1;
                        self.grid.Hexes[h].food = food;
                    }
                }
                if(toProcess[h] === true) {
                    var cellStates = self.getCellStates(h);
                    self.protocell.applyRules(cellStates);
                    newStates[h] = cellStates[0].state;
                }
            }

            // update hex grid with new states
            var k = Object.keys(newStates);
            for(var h in k) {
                h = k[h];
                if(self.grid.Hexes[h].getstate() === 0
                    && newStates[h] !== 0
                    && self.grid.Hexes[h].food > 0) {
                    self.protocell.energy += self.grid.Hexes[h].food;
                    self.grid.Hexes[h].food = -100; // regen in 100 gens
                }
                self.grid.Hexes[h].setstate(newStates[h]);
                stateSum += newStates[h];
            }

            // increment generation counter
            self.generation += 1;
        }

      //  self.world.turn();
      //  self.world.draw();

        self.drawHexGrid();

        // generate new rules
        if (self.generateNewRules === true) {
            self.newRules();
            self.generateNewRules = false;
        }

        // restart with current rules
        if (self.restartSim === true) {
            self.restart();
            self.restartSim = false;
        }

        // check if there's still time to wait given specified target time interval
        var nowTime = new Date().getTime(), timeOut = 0;
        if (nowTime - self.lastFrameTime < self.millisPerFrame && self.updateGrid) {
            timeOut = self.millisPerFrame - (nowTime - self.lastFrameTime);
        }

        if(!self.isAlive) {
            $('#info').text('HE\'S DEAD, JIM!\n'
                + JSON.stringify(self.protocell, null, 4));
            if(self.generation < 200)
                self.generateNewRules = true;
            else
                $('#restart').click();
            self.generation = 0;
        } else
            $('#info').text(self.protocell.energy);

        if(self.generation > 500)
            $('#restart').click();

        // wait to call another animation frame until we have reached target wait
        setTimeout(function () {
            self.lastFrameTime = new Date().getTime();
            requestAnimationFrame(go);
        }, timeOut);

        // end stats window & gather
        window.statsFPS.end();
    }
    self.hexGridCanvas = $$.utils.canvas.renderToCanvas(790, 600, function (ctxoff) {
        for (var h = 0; h < self.grid.Hexes.length; h++)
            self.grid.Hexes[h].draw(ctxoff);
    });

    this.datGui();
    this.setupStats();
    this.drawHexGrid();
    this.newRules();

    this.generation = 0;
    go();


};

app = new AppController();

//$(document).ready(function () {
//    app.run();
//});

var w = new $$.alive.World();

var testcells = [
    1,
    1,
    1,
    1,
    1,
    1,
    1
];

function rndN(n) {
    return ~~(Math.random() * (1 << n));
}
var rules = [];
for(var x = 0;x < 10; x++) {
    var r = new $$.alive.Rule({
        optype : rndN(3),
        conditions : [new $$.alive.Condition({
            cells  : rndN(8),
            optype : rndN(3),
            evalvalue : {
                cells : rndN(8),
                value : 0
            }
        })],
        expressionConditions : [ new $$.alive.Condition({
            cells : rndN(8),
            optype : rndN(3),
            evalvalue : {
                cells : rndN(8),
                value : 0
            }
        })],
        repressionConditions : [ new $$.alive.Condition({
            cells : rndN(8),
            optype : rndN(3),
            evalvalue : {
                cells : rndN(8),
                value : 0
            }
        })],
        expressed : true,
        operand : {
            cells : rndN(8),
            value : 0
        }
    });
    rules.push(r);
}

var _canvas = document.getElementById("hexCanvas");
var _ctx = _canvas.getContext('2d');

var cell = new $$.alive.Cell({ rules: rules });
w.protocell = cell;

w.cells[400] = [];w.cells[400][300] = {
    cell : {
        state : 1
    }
};
w.init();
w.turn();
w.draw(_ctx);

//cell.applyRules(testcells);

console.log(cell.toString());
console.log(cell.genome());

console.log(JSON.stringify(testcells, null, 4));

