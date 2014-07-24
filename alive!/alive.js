/**
 * Created by sschepis on 7/13/14.
 */
/** @namespace */
var $$ = $$ || {};

$$.alive = (function () {
    /**
     * _cellString
     * @param _cells
     * @returns {string}
     * @private
     */
    var _cellString = function (_cells) {
        var ret = '';
        if (_cells == 0) ret = 'none';
        if ((_cells & 1) === 1) ret += (ret.length ? ' ' : '') + '1';
        if ((_cells & 2) === 2) ret += (ret.length ? ' ' : '') + '2';
        if ((_cells & 4) === 4) ret += (ret.length ? ' ' : '') + '3';
        if ((_cells & 8) === 8) ret += (ret.length ? ' ' : '') + '4';
        if ((_cells & 16) === 16) ret += (ret.length ? ' ' : '') + '5';
        if ((_cells & 32) === 32) ret += (ret.length ? ' ' : '') + '6';
        if ((_cells & 64) === 64) ret += (ret.length ? ' ' : '') + '7';
        if ((_cells & 128) === 128) ret = 'all';
        if ((_cells & 255) === 255) ret = 'any';
        return '[' + ret + '] ';
    };

    /**
     * _getCellsValue
     * @param whichcells
     * @param thecells
     * @returns {number}
     * @private
     */
    var _getCellStates = function(whichcells, thecells) {
        function _diceRoll() {
            var n = ~~(Math.random() * thecells.length) - 1;
            var ar = [], o = 0;
            for(var i=0;i<thecells.length;i++)
                ar[i] = thecells[i].state;
            $$.utils.common.shuffleArray(ar);
            for(var i=0;i<n;i++)
                o += ar[i];
            return o;
        }
        var ret = [];
        if  (whichcells == 0) return ret;
        if ((whichcells & 1)   === 1)   ret += thecells[0];
        if ((whichcells & 2)   === 2)   ret += thecells[1];
        if ((whichcells & 4)   === 4)   ret += thecells[2];
        if ((whichcells & 8)   === 8)   ret += thecells[3];
        if ((whichcells & 16)  === 16)  ret += thecells[4];
        if ((whichcells & 32)  === 32)  ret += thecells[5];
        if ((whichcells & 64)  === 64)  ret += thecells[6];
        if ((whichcells & 128) === 128) ret = _getCellStates(127, thecells);
        if ((whichcells & 255) === 255) ret = _diceRoll();
        return ret;
    };

    /**
     * _zeropad
     * @param s
     * @param l
     * @returns {string}
     * @private
     */
    var _zeropad = function(s, l) {
        var out = '' + s;
        var rmlen = l - out.length;
        if (out.length > l) return out;
        for (var i = 0; i < rmlen; i++)
            out = '0' + out;
        return out;
    };
    var _def = {
        /**
         * Condition
         * @param options
         * @constructor
         */
        Condition: function (options) {
            var self = this;
            options = options || {
                cells : 0,
                optype : 0,
                evalvalue : {
                    cells : undefined,
                    value : undefined
                }
            };
            this.cells = options.cells || 0; // 0 any, bit 8 all, bits 1-7 cells 1-7
            this.optype = options.optype || 0;
            this.evalvalue = options.evalvalue || {
                cells: undefined,
                value: undefined
            };

            /**
             * toString
             * @returns {string}
             */
            this.toString = function () {
                var out = _cellString(self.cells);
                switch (self.optype) {
                    case 0:
                        out += 'is empty ';
                        break;
                    case 1:
                        out += 'contains food ';
                        break;
                    case 2:
                        out += 'contains ';
                        break;
                    case 3:
                        out += 'contains ';
                        break;
                    case 4:
                        out += 'being mated ';
                        break;
                    case 5:
                        out += 'being preyed ';
                        break;
                    case 6:
                        out += 'being attacked ';
                        break;
                    case 7:
                        out += 'NOOP ';
                        break;
                    default:
                        out = 'NOOP';
                        break;
                }
                out += self.evalvalue.value;
                return out;
            };

            /**
             * val
             * @returns {number}
             */
            this.val = function (e) {
                if (e) {
                    self.cells = (e & 255);
                    self.optype = (e & (15 << 8)) >> 8;
                    self.evalvalue.cells = (e & (255 << 12)) >> 12;
                    self.evalvalue.value = (e & (255 << 20)) >> 20;
                }
                var v = self.cells // 8 bits
                    + (self.optype << 8) // 4 bits
                    + ((self.evalvalue.cells ? self.evalvalue.cells : 0) << 12) // 8 bits
                    + ((self.evalvalue.value ? self.evalvalue.value : 0) << 20); // 8 bits
                return v;
            };

            /**
             * passes
             * @param cells
             * @returns {*}
             */
            this.passes = function(cells) {
                var _cel = _getCellStates(self.cells, cells), eres;
                switch (self.optype) {
                    case 0:
                        eres = (_cel === 0);
                        break;
                    case 1:
                        eres = (_cel === 1);
                        break;
                    case 2:
                        eres = (_cel === 2);
                        break;
                    case 3:
                        eres = (_cel === 3);
                        break;
                    case 4:
                        eres = (_cel === 1);
                        break;
                    case 5:
                        eres = (_cel === 2);
                        break;
                    case 6:
                        eres = (_cel === 3);
                        break;
                    case 7:
                        eres = (_cel === 0);
                        break;
                    default:
                        eres = true;
                        break;
                }
                return eres;
            };
            if(options.val)
                this.val(options.val);
        },

        /**
         * Rule
         * @param options
         * @constructor
         */
        Rule: function (options) {
            var self = this;
            options = options || {
                expressed: true,
                ruleset : undefined,
                conditions: [],
                expressionConditions : [],
                repressionConditions : [],
                optype: 0,
                operand: {
                    cells: undefined,
                    value: undefined
                }
            };
            this.ruleset    = options.ruleset || undefined;
            this.expressed  = options.expressed  || true;
            this.conditions = options.conditions || [];
            this.expressionConditions = options.expressionConditions || [];
            this.repressionConditions = options.repressionConditions || [];
            this.optype     = options.optype || 0;
            this.operand    = options.operand || {
                cells : undefined,
                value : undefined
            };
            this.energy = options.energy || 0;

            /**
             * ruleVal
             * @returns {*}
             */
            this.ruleVal = function () {
                return self.optype
                    + ((self.operand.cells ? self.operand.cells : 0) << 4)
                    + ((self.operand.value ? self.operand.value : 0) << 12)
                    + ((self.expressed ? 1 : 0) << 20);
            };

            /**
             * ruleToken
             * @returns {string|*}
             */
            this.ruleToken = function () {
                var r = self.ruleVal();
                if(self.expressed) r -= 1 << 20;
                r = r.toString(4);
                r = r.replace(/0/g,'A').replace(/1/g,'B').replace(/2/g,'C').replace(/3/g,'D');
                return r;
            };

            /**
             * val
             * @returns {*[]}
             */
            this.val = function (e) {
                if (e) {
                    self.optype = (e[0] & 15);
                    self.operand.cells = (e[0] & (255 << 4)) >> 4;
                    self.operand.value = (e[0] & (255 << 12)) >> 12;
                    self.expressed = (e[0] & (1 << 20)) >> 20;
                    self.conditions = [];
                    self.expressionConditions = [];
                    self.repressionConditions = [];
                    var ar, ndx = 0;
                    for (var i = 1; i < e.length; i++) {
                        if (e[i] === 4294967295) {
                            ndx++;
                            continue;
                        }
                        if     (ndx === 0) ar = self.conditions;
                        else if(ndx === 1) ar = self.expressionConditions;
                        else if(ndx === 2) ar = self.repressionConditions;
                        ar[ar.length] = new _def.Condition({val:e[i]});
                    }
                }
                var v = self.ruleVal();
                var o = [v];
                for (var c in self.conditions) {
                    c = self.conditions[c];
                    o[o.length] = c.val();
                }
                o[o.length] = 4294967295;
                for (var c in self.expressionConditions) {
                    c = self.expressionConditions[c];
                    o[o.length] = c.val();
                }
                o[o.length] = 4294967295;
                for (var c in self.repressionConditions) {
                    c = self.repressionConditions[c];
                    o[o.length] = c.val();
                }
                return o;
            };

            /**
             * toString
             * @returns {string}
             */
            this.toString = function () {
                var out = this.ruleToken() + ':\n\tif ';
                for (var i = 0; i < self.conditions.length; i++) {
                    out += self.conditions[i].toString();
                    if (self.conditions.length - 1 > i)
                        out += ' and ';
                }
                out += ' then ';
                switch (self.optype) {
                    case 0:
                        out += 'move into';
                        break;
                    case 1:
                        out += 'grow into';
                        break;
                    case 2:
                        out += 'move from';
                        break;
                    case 2:
                        out += 'atrophy from';
                        break;
                    case 3:
                        out += 'eat';
                        break;
                    case 4:
                        out += 'mate';
                        break;
                    case 5:
                        out += 'spawn';
                        break;
                    case 6:
                        out += 'NOOP';
                        break;
                    case 7:
                        out += 'NOOP';
                        break;
                    default:
                        out = 'NOOP';
                        break;
                }
                if(self.expressionConditions.length > 0) {
                    out += '\n\t\texpress if ';
                    for (var i = 0; i < self.expressionConditions.length; i++) {
                        out += self.expressionConditions[i].toString();
                        if (self.expressionConditions.length - 1 > i)
                            out += ' and ';
                    }
                } else out += '\n\t\talways express.';
                if(self.repressionConditions.length > 0) {
                    out += '\n\t\trepress if ';
                    for (var i = 0; i < self.repressionConditions.length; i++) {
                        out += self.repressionConditions[i].toString();
                        if (self.repressionConditions.length - 1 > i)
                            out += ' and ';
                    }
                } else out += '\n\t\tnever repress.';

                return out + '\n';
            };

            /**
             * apply
             * @param cells
             * @returns {*}
             */
            this.apply = function(cells) {
                // express if conditions pass
                var passes_conditions = null;
                for(var c in self.expressionConditions) {
                    c = self.expressionConditions[c];
                    var p = c.passes(cells);
                    if(passes_conditions != null) passes_conditions = passes_conditions && p;
                    else passes_conditions = p;
                    if(!passes_conditions) break;
                }
                if(passes_conditions)
                    self.expressed = true;


                // repress if conditions pass
                passes_conditions = null;
                for(var c in self.repressionConditions) {
                    c = self.repressionConditions[c];
                    var p = c.passes(cells);
                    if(passes_conditions != null) passes_conditions = passes_conditions && p;
                    else passes_conditions = p;
                    if(!passes_conditions) break;
                }
                if(passes_conditions)
                    self.expressed = false;

                // don't apply an unexpressed rule
                if(!self.expressed) return false;

                // if all conditions pass
                passes_conditions = null;
                for(var c in self.conditions) {
                    c = self.conditions[c];
                    var p = c.passes(cells);
                    if(passes_conditions != null) passes_conditions = passes_conditions && p;
                    else passes_conditions = p;
                    if(!passes_conditions) return false;
                }
                //console.log('rule ' + self.ruleToken() + ' passed');

                // then modify cell[0] appropriately
                var _val = 0, _cel = 0, ret = false;
                if(self.operand.cells) _cel = _getCellStates(self.operand.cells, cells);
                if(self.operand.value) _val = self.operand.value;
                switch (self.optype) {
                    // move into
                    case 0:
                        if(cells[0].state === 0)
                            cells[0].state = 0;
                        break;

                    // grow into
                    case 1:
                        cells[0].state += 1;
                        break;

                    // move from
                    case 2:
                        cells[0].state -= 1;
                        break;

                    // atrophy from
                    case 3:
                        cells[0].state += _cel;
                        break;

                    // eat
                    case 4:
                        cells[0].state -= _cel;
                        break;

                    // mate
                    case 5:
                        cells[0].state = _cel;
                        break;

                    // inc
                    case 6:
                        cells[0].state = _cel;
                        break;

                    // dec
                    case 7:
                        break;

                    default:
                        break;
                }
                var  ngn = (cells[0].state !== 0);
                for(var ng=1;ng<cells.length;ng++) {
                    ngn = ngn && (cells[ng].state===0);
                }
                if(ngn===true) {
                    cells[0] = 0;
                    return 0;
                }
                return ret;
            };
            if(options.val)
                this.val(options.val);
        },

        /**
         * Cell
         * @param options
         * @constructor
         */
        Cell: function (options) {
            var self = this;
            options = options || {
                rules: [],
                energy: 255,
                states: [0],
                position: 0
            };
            this.rules = options.rules || [];
            this.position = options.position || 0;
            this.neighbors = options.neighbors || undefined;
            this.energy = options.energy || 255;

            /**
             * toString
             * @returns {string}
             */
            this.cellToken = function () {
                var o = '';
                for(var n in self.rules) {
                    n = self.rules[n];
                    o += n.ruleToken();
                }
                return o;
            };

            /**
             * toString
             * @returns {string}
             */
            this.toString = function () {
                var out = this.cellToken() + ': energy ' + self.energy + '\n';
                for (var r in self.rules) {
                    r = self.rules[r];
                    out += r.toString();
                }
                return out;
            };

            /**
             * genome
             * @param s
             * @returns {string}
             */
            this.genome = function (s) {
                var o = '';
                var v = self.val();
                for (n in v) {
                    n = v[n];
                    o += _zeropad((n).toString(2), 32);
                    if (s) o += ' ';
                }
                return o;
            };

            /**
             * cellVal
             * @returns {*}
             */
            this.cellVal = function () {
                return self.energy + (1 << 15);
            };

            /**
             * val
             * @param e
             * @returns {*[]}
             */
            this.val = function (e) {
                if (e) {
                    self.energy = e[0] - (1 << 15);
                    var ar = [];
                    for (var i = 1; i < e.length; i++) {
                        var _val = e[i];
                        if(_val === 0) {
                            if(ar.length > 1) {
                                self.rules[self.rules.length] = new $$.alive.Rule({val:ar});
                                ar = [];
                            }
                            continue;
                        }
                        ar[ar.length] = _val;
                    }
                    if(ar.length > 1)
                        self.rules[self.rules.length] = new $$.alive.Rule({val:ar});
                }
                var o = [self.cellVal()];
                for (var r in self.rules) {
                    r = self.rules[r];
                    var rl = r.val();
                    for (var rr in rl) {
                        rr = rl[rr];
                        o[o.length] = rr;
                    }
                    o[o.length] = 0;
                }
                return o;
            };

            /**
             * applyRules
             * @param cells
             * @returns {*}
             */
            this.applyRules = function(n) {
                var cells = self.neighbors ?self.neighbors : n;
                var ret = false;
                for(var r in self.rules) {
                    if(self.energy === 0) break;
                    r = self.rules[r];
                    r.energy = self.energy;
                    ret = r.apply(cells);
                    self.energy = r.energy;
                }
                self.energy -= 1;
                if(self.energy < 0) self.energy = 0;
                return ret;
            };

            this.isAlive = function() {
                return self.energy > 0;
            };

            /**
             * mutate
             */
            this.mutate = function(rate) {
                if(~~(Math.random() * ( 1 / rate )) + 1 === 1) {
                    var cellVal = self.val();
                    var type = ~~(Math.random() * 2);

                    // flip a bit
                    if(type===0) {
                        var theBit = 1 << ~~(Math.random()*30);
                        var ndx;
                        do {
                            ndx = ~~(Math.random()*cellVal.length-1);
                        } while(cellVal[ndx] === 0 && cellVal[ndx] === 4294967295);
                        if(( cellVal[ndx] & theBit ) === theBit)
                            cellVal[ndx] -= theBit;
                        else
                            cellVal[ndx] += theBit;
                    }

                    // remove a segment
                    else if(type===1) {
                        var out = [];
                        var rndx = ~~(Math.random()*cellVal.length-1);
                        for(var i = 0; i < cellVal.length; i++) {
                            if(i != rndx) out[out.length] = cellVal[i];
                        }
                        cellVal = out;
                    }

                    // break a boundary
                    else {
                        do {
                            ndx = ~~(Math.random()*cellVal.length-1);
                        } while(cellVal[ndx] !== 0 && cellVal[ndx] !== 4294967295);
                        var theBit = 1 << ~~(Math.random()*30);
                        if(cellVal[ndx] !== 0) cellVal[ndx] -= theBit;
                        else cellVal[ndx] += theBit;
                    }

                    self.val(cellVal);
                }
            };

            /**
             * cellVal
             * @returns {*}
             */
            this.clone = function (mutationRate) {
                if(!mutationRate) mutationRate === 0;
                return new _def.Cell({ val : self.val() });
            };

            if(options.val)
                this.val(options.val);
        },

        /**
         * World
         * @param options
         * @constructor
         */
        World : function(options) {
            var self = this;
            options = options | {
                width : 800,
                height : 600,
                looped : true,
                cells : [],
                food : []
            };
            this.food   = options.food || [];
            this.cells  = options.cells || [];
            this.width  = options.width || 800;
            this.height = options.height || 600;
            this.looped = options.looped || true;
            this.generation = 0;

            /**
             *
             * @param c
             * @returns {*}
             */
            this.translateCoords = function(c) {
                if(this.looped) {
                    if(c.x < 0) c.x = self.width - c.x;
                    if(c.x >= self.width) c.x = c.x - self.width;
                    if(c.y < 0) c.y = self.height - c.y;
                    if(c.y >= self.height) c.y = c.y - self.height;
                }
                return c;
            };
            function _getArrData(x,y,ar) {
                if(ar[x] && !ar[x][y]) {
                    return ar ? ar[(self.width * y) + x - 1] : undefined;
                }
                return ar ? ( ar[x] ? ar[x][y] : undefined ) : undefined;
            }

            /**
             *
             * @param x
             * @param y
             * @returns {{food: *, cell: *}}
             */
            this.getDataAtXY = function(x,y) {
                var tc = self.translateCoords({x:x,y:y});
                x = tc.x, y = tc.y;
                return {
                    food : _getArrData(x, y, self.food),
                    cell : _getArrData(x, y, self.cells)
                }
            };

            /**
             *
             * @param x
             * @param y
             * @param data
             */
            this.setDataAtXY = function(x,y,data) {
                var tc = self.translateCoords({x:x,y:y});
                x = tc.x, y = tc.y;

                if(data.food) {
                    if(!self.food[x]) self.food[x] = [];
                    self.food[x][y] = data.food;
                }
                if(data.cell) {
                    if(!self.cells[x]) self.cells[x] = [];
                    self.cells[x][y] = data.cell;
                }
            };

            /**
             *
             * @returns {number}
             */
            this.length = function() {
                return self.width * self.height;
            };

            /**
             *
             * @param index
             * @returns {{food: *, cell: *}}
             */
            this.getDataAtIndex = function(index) {
                var x = (index % self.width);
                var y = ~~(index / self.width);
                return {
                    food : _getArrData(x, y, self.food),
                    cell : _getArrData(x, y, self.cells)
                }
            };

            /**
             * setDataAtIndex
             * @param index
             * @param data
             */
            this.setDataAtIndex = function(index, data) {
                var x = (index % self.width);
                var y = ~~(index / self.width);
                if(data.food) {
                    if(!self.food[x]) self.food[x] = [];
                    self.food[x][y] = data.food;
                }
                if(data.cell) {
                    if(!self.cells[x]) self.cells[x] = [];
                    self.cells[x][y] = data.cell;
                }
            };

            /**
             * getXYFromIndex
             * @param index
             * @param data
             * @returns {{x: number, y: number}}
             */
            this.getXYFromIndex = function(index, data) {
                var x = (index % self.width);
                var y = ~~(index / self.width);
                data = { x : x, y : y };
                return data;
            };

            /**
             * getIndexFromXY
             * @param x
             * @param y
             * @param data
             * @returns {*}
             */
            this.getIndexFromXY = function(x, y) {
                var index = x + ( y * self.width );
                return index;
            };

            /**
             * regenerateCell
             */
            this.regenerateProtocell = function() {
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

            };

            /**
             * getCellCoordsByXY
             * @param x
             * @param y
             * @returns {*[]}
             */
            this.getCellCoordsByXY = function(x, y) {
                var tc = self.translateCoords({x:x, y:y});
                x = tc.x; y = tc.y;
                var px = x-1, nx = x+1, py = y-1, ny = y+1;
                var pc = self.translateCoords({x:px, y:py}),
                    nc = self.translateCoords({x:nx, y:ny});
                return [
                    [ x, y ],
                    [x, pc.y],
                    [nc.x, pc.y],
                    [nc.x, y],
                    [nc.x, nc.y],
                    [x, nc.y],
                    [pc.x, nc.y],
                    [pc.x, y],
                    [pc.x, pc.y]
                ];
            };

            /**
             * getCellsByXY
             * @param x
             * @param y
             * @returns {*[]}
             */
            this.getCellsByXY = function(x, y) {
                var ac = self.getCellCoordsByXY(x, y);
                return [
                    this.getDataAtXY(ac[0][0], ac[0][1]),
                    this.getDataAtXY(ac[1][0], ac[1][1]),
                    this.getDataAtXY(ac[2][0], ac[2][1]),
                    this.getDataAtXY(ac[3][0], ac[3][1]),
                    this.getDataAtXY(ac[4][0], ac[4][1]),
                    this.getDataAtXY(ac[5][0], ac[5][1]),
                    this.getDataAtXY(ac[6][0], ac[6][1]),
                    this.getDataAtXY(ac[7][0], ac[7][1]),
                    this.getDataAtXY(ac[8][0], ac[8][1])
                ];
            };

            this.getCellStatesByXY = function(x, y ) {
                var ac = self.getCellsByXY(x, y);
                return [
                    ac[0]?ac[0].cell:ac[0].cell.state,
                    ac[1]?ac[1].cell:ac[1].cell.state,
                    ac[2]?ac[2].cell:ac[2].cell.state,
                    ac[3]?ac[3].cell:ac[3].cell.state,
                    ac[4]?ac[4].cell:ac[4].cell.state,
                    ac[5]?ac[5].cell:ac[5].cell.state,
                    ac[6]?ac[6].cell:ac[6].cell.state,
                    ac[7]?ac[7].cell:ac[7].cell.state,
                    ac[8]?ac[8].cell:ac[8].cell.state,
                ];
            };

            this.getCellsByIndex = function(index) {
                var xy = self.getXYFromIndex(index);
                return self.getCellsByXY(xy.x, xy.y);
            };

            this.getCellCoordsByIndex = function(index) {
                var xy = self.getXYFromIndex(index);
                return self.getCellCoordsByXY(xy.x, xy.y);
            };

            this.getCellIndexesByIndex = function(index) {
                var co = self.getCellCoordsByIndex(index);
                return [
                    index,
                    self.getIndexFromXY(co[0][0], co[0][1]),
                    self.getIndexFromXY(co[1][0], co[1][1]),
                    self.getIndexFromXY(co[2][0], co[2][1]),
                    self.getIndexFromXY(co[3][0], co[3][1]),
                    self.getIndexFromXY(co[4][0], co[4][1]),
                    self.getIndexFromXY(co[5][0], co[5][1]),
                    self.getIndexFromXY(co[6][0], co[6][1]),
                    self.getIndexFromXY(co[7][0], co[7][1]),
                    self.getIndexFromXY(co[8][0], co[8][1])
                ]
            };

            this.getCellStatesByIndex = function(index) {
                var xy = self.getXYFromIndex(index);
                return self.getCellStatesByXY(xy.x, xy.y);
            };

            this.initCellStates = function() {
                for(var cnt=0;cnt<this.length();cnt++) {
                    var data = self.getDataAtIndex(cnt);
                    data.cell = { state : 0 };
                }
            };

            this.seed = function() {
                for(var cnt=0;cnt<800;cnt++) {
                    this.food[~~(Math.random()*this.length())] = 32;
                }
            };

            /**
             * init
             */
            this.init = function() {
                this.initCellStates();
                this.seed();
            };

            /**
             * turn
             */
            this.turn = function() {
                var toProcess = [],
                    anyToProcess = false,
                    l = self.length();

                // mark the cells which need processing
                for(var i=0;i<l;i++) {
                    var data = self.getDataAtIndex(i);
                    if (data.cell) {
                            var cs = self.getCellIndexesByIndex(i);
                            for (var c in cs) {
                                c = cs[c];
                                toProcess[c] = true;
                                anyToProcess = true;
                            }
                    }
                }

                // if the cell is alive
                if(anyToProcess===true && self.protocell.isAlive()) {
                    // new cell states for this turn
                    var newStates = [];
                    // regenerate eaten food and apply rules to cells
                    // which need to be processed
                    for (var j=0;j<l;j++) {
                        var data = self.getDataAtIndex(j);
                        // regenerate food
                        if(data.food < 0) {
                            if(data.food === -1) data.food = 32;
                            else data.food += 1;
                            self.setDataAtIndex(j, data);
                        }
                        // apply rules to cells to process
                        if(toProcess[j] === true) {
                            var cells = self.getCellsByIndex(j);
                            self.protocell.applyRules(cells);
                            newStates[j] = cells[0].state;
                        }
                    }

                    // assign all the new cell states and
                    // process any eaten food for this turn
                    var keys = Object.keys(newStates);
                    for(var h in keys) {
                        h = keys[h];
                        var data = self.getDataAtIndex(h);
                        if(data.cell && data.cell.state === 0
                            && newStates[h] !== 0
                            && data.food > 0) {
                            self.protocell.energy += data.food;
                            data.food = -100; // regen in 100 gens
                        }
                        data.cell = { state : newStates[h] };
                        self.setDataAtIndex(h, data);
                    }
                }
                self.generation++;
            };

            /**
             * draw
             * @param ctx
             */
            this.draw = function(ctx) {
                function RGB2Color(r,g,b) {
                    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
                }

                function byte2Hex(n) {
                    var nybHexString = "0123456789ABCDEF";
                    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
                }

                function makeColorGradient(frequency1, frequency2, frequency3, phase1,phase2,phase3,center,width,len,show) {
                    if (len == undefined) len = 50;
                    if (center == undefined) center = 128;
                    if (width == undefined) width = 127;
                    if (show == undefined) show = false;
                    var o = [];
                    for (var i = 0; i < len; ++i) {
                        var red = Math.sin(frequency1*i + phase1) * width + center;
                        var grn = Math.sin(frequency2*i + phase2) * width + center;
                        var blu = Math.sin(frequency3*i + phase3) * width + center;
                        if(i>6&&i<len-10) {
                            o.push([red,grn,blu]);
                            if(show)document.write( '<font color="' 
                                + RGB2Color(red,grn,blu) 
                                + '">&#9608;</font>');
                        }
                    }
                    return o;
                }
                if(!self.tcc) self.tcc = makeColorGradient(.1,.1,.1,0,2,4,128,127,50);
                if(!self.colorCenter) self.colorCenter = 17;

                var w = self.width,
                    h = self.height;

                function setPixel(x, y, data) {
                    var id = ctx.createImageData(1, 1);
                    if(data.cell || data.food) {
                        if(data.cell.state && data.cell.state != 0) {
                            var value = data.cell.state / 4;
                            var ac = self.tcc[self.colorCenter + (value > 0 ? -value : value)];
                            var d  = id.data;
                            d[0]   = ac[0];
                            d[1]   = ac[1];
                            d[2]   = ac[2];
                            d[3]   = 1;
                        } else if (data.food) {
                            var d  = id.data;
                            d[0]   = 0;
                            d[1]   = 255;
                            d[2]   = 32;
                            d[3]   = 0.1;                            
                        }
                    }
                    ctx.putImageData( id, x, y );
                }
                for (var j=0;j<w;j++) {
                    for (var k=0;k<h;k++) {
                        var data = self.getDataAtXY(j, k);
                        if(data.food && data.cell)
                            setPixel(j, k, data);
                    }
                }
            };
        }
    };

    /**
     * COMP_TYPE
     * @type {{ZERO: number, NONZERO: number, POS: number, NEG: number, GT: number, LT: number, EQ: number}}
     */
    _def.Condition.COMP_TYPE = {
        ZERO: 0,
        NONZERO: 1,
        POS: 2,
        NEG: 3,
        GT: 4,
        LT: 5,
        EQ: 6
    };

    /**
     * OP_TYPE
     * @type {{ZERO: number, INC: number, DEC: number, ADD: number, SUB: number, ADD_CEIL: number, SUB_FLOOR: number, SET: number}}
     */
    _def.Rule.OP_TYPE = {
        ZERO: 0,
        INC: 1,
        DEC: 2,
        ADD: 3,
        SUB: 4,
        ADD_CEIL: 5,
        SUB_FLOOR: 6,
        SET: 7
    };
    return _def;
})();