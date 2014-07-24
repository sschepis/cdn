/** @namespace */
var $$ = $$ || {};

/**
 * $$.hex.grid
 */
$$.hex = (function () {
    return {
        /**
         *
         * @param z
         * @param r
         * @returns {{width: *, height: number, side: *}}
         */
        metricsForSideLengthAndRatio : function (z, r) {
            if(!z) z = 11.1;
            if(!r) r = 1.1547005383792515290182975610039;

            var r2 = Math.pow ( r, 2 );
            var a = ( 1 + r2 ) / r2;
            var b = z / r2;
            var c = ( ( 1 - 4.0 * r2 ) / ( 4.0 * r2 ) ) * ( Math.pow ( z, 2 ) );
            var x = ( -b + Math.sqrt ( Math.pow ( b, 2 ) - ( 4.0 * a * c) ) ) / ( 2.0 * a );
            var y = ( ( 2.0 * x ) + z ) / ( 2.0 * r );
            var width  = ( ( 2.0 * x ) + z );
            var height = ( 2.0 * y );
            return {
                width  : width,
                height : height,
                side   : z
            };
        },
        /**
         *
         * @param x
         * @param y
         * @constructor
         */
        Point : function(x, y) {
            this.x = x;
            this.y = y;
        },
        /**
         *
         * @param x
         * @param y
         * @param width
         * @param height
         * @constructor
         */
        Rectangle : function(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        },

        /**
         *
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @constructor
         */
        Line : function(x1, y1, x2, y2) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        },

        /**
         *
         * @param id
         * @param x
         * @param y
         * @constructor
         */
        Hexagon : function(id, x, y) {
            this.points = [];//Polygon Base
            var x1 = null;
            var y1 = null;
            this.state = 0;
            if(HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal) {
                x1 = (HT.Hexagon.Static.WIDTH - HT.Hexagon.Static.SIDE)/2;
                y1 = (HT.Hexagon.Static.HEIGHT / 2);
                this.Points.push(new HT.Point(x1 + x, y));
                this.Points.push(new HT.Point(x1 + HT.Hexagon.Static.SIDE + x, y));
                this.Points.push(new HT.Point(HT.Hexagon.Static.WIDTH + x, y1 + y));
                this.Points.push(new HT.Point(x1 + HT.Hexagon.Static.SIDE + x, HT.Hexagon.Static.HEIGHT + y));
                this.Points.push(new HT.Point(x1 + x, HT.Hexagon.Static.HEIGHT + y));
                this.Points.push(new HT.Point(x, y1 + y));
            }
            else {
                x1 = (HT.Hexagon.Static.WIDTH / 2);
                y1 = (HT.Hexagon.Static.HEIGHT - HT.Hexagon.Static.SIDE)/2;
                this.Points.push(new HT.Point(x1 + x, y));
                this.Points.push(new HT.Point(HT.Hexagon.Static.WIDTH + x, y1 + y));
                this.Points.push(new HT.Point(HT.Hexagon.Static.WIDTH + x, y1 + HT.Hexagon.Static.SIDE + y));
                this.Points.push(new HT.Point(x1 + x, HT.Hexagon.Static.HEIGHT + y));
                this.Points.push(new HT.Point(x, y1 + HT.Hexagon.Static.SIDE + y));
                this.Points.push(new HT.Point(x, y1 + y));
            }

            this.Id = id;

            this.x = x;
            this.y = y;
            this.x1 = x1;
            this.y1 = y1;

            this.TopLeftPoint = new HT.Point(this.x, this.y);
            this.BottomRightPoint = new HT.Point(this.x + HT.Hexagon.Static.WIDTH, this.y + HT.Hexagon.Static.HEIGHT);
            this.MidPoint = new HT.Point(this.x + (HT.Hexagon.Static.WIDTH / 2), this.y + (HT.Hexagon.Static.HEIGHT / 2));

            this.P1 = new HT.Point(x + x1, y + y1);

            this.selected = false;
        }
    };
})();
