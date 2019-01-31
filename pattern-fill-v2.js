/**
 * Highcharts pattern fill plugin
 *
 * Author:         Torstein Honsi
 *                 Stephane Vanraes
 * Last revision:  2015-05-04
 * License:        MIT License
 *
 * Remark:         The latest version is not compatible with earlier versions.
 *
 * Usage:          Add a 'defs' object to the options
 *                 Create a 'patterns' array under 'defs'
 *                 Each item in this array represents a pattern
 *                 To use a pattern, set the color to `url(#id-of-pattern)'
 *                 @example
 *                 series: [ {
 *                   type: 'column',
 *                   data: [1, 2, 3],
 *                   color: 'url(#highcharts-default-pattern-9)'
 *                 }]
 *
 * Options for the patterns:
 * - id:           The id for the pattern, defaults to highcharts-pattern-# with # an increasing number for each pattern without id
 * - width:        The width of the pattern, defaults to 10
 * - height:       The height of the pattern, defaults to 10
 * - path:         In SVG, the path for the pattern
 *                 (Note: this can be a string with only a path, or an object with d, stroke, strokewidth, ...)
 * - image:        An image source for the pattern
 * - color:        A color to be used instead of a path
 *
 * Notes:          VML does not support the path setting
 *                 If all other fills fail (no path, image or color) the pattern will return #A0A0A0 as a color
 *                 Several patterns have been predefined, called highcharts-default-pattern-# (numbered 0-9)
 *
 */

/*global Highcharts */
(function(Highcharts) {

    'use strict';

    var idCounter = 0,
        wrap = Highcharts.wrap,
        each = Highcharts.each;

    var HighchartsPatterns = [
        'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
        'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
        'M 3 0 L 3 10 M 8 0 L 8 10',
        'M 0 3 L 10 3 M 0 8 L 10 8',
        'M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7',
        'M 3 3 L 8 3 L 8 8 L 3 8 Z',
        'M 5 5 m -4 0 a 4 4 0 1 1 8 0 a 4 4 0 1 1 -8 0',
        'M 10 3 L 5 3 L 5 0 M 5 10 L 5 7 L 0 7',
        'M 2 5 L 5 2 L 8 5 L 5 8 Z',
        'M 0 0 L 5 10 L 10 0'
    ];

    //// SVG RENDERER
    Highcharts.SVGRenderer.prototype.addPattern = function(id, options) {
        var id = id || ('highcharts-pattern-' + idCounter++),
            pattern = this.createElement('pattern').attr({
                id: id,
                patternUnits: 'userSpaceOnUse',
                width: options.width || 10,
                height: options.height || 10
            }).add(this.defs);

        // get id
        pattern.id = pattern.element.id;

        if (options.path) {
            var path = options.path;
            this.createElement('path').attr({
                'd': path.d || path,
                'stroke': path.stroke || '#343434',
                'stroke-width': path.strokeWidth || 2,
                'fill': path.fill || 'transparent'
            }).add(pattern);
            pattern.color = options.color;
        } else if (options.image) {
            this.image(options.image, 0, 0, options.width, options.height).add(pattern);
        } else if (options.color) {
            var w = options.width || 10,
                h = options.height || 10;

            this.createElement('path').attr({
                'd': 'M 0 0 L 0 ' + h + ' L ' + w + ' ' + h + ' L ' + w + ' 0 Z',
                'fill': options.color,
                'stroke-width': 0
            }).add(pattern);
        }
        return pattern;
    };

    if (Highcharts.VMLElement) {

        Highcharts.VMLRenderer.prototype.addPattern = function(id, options) {
            var patterns = this.patterns || {};

            id = id || ('highcharts-pattern-' + idCounter++);
            patterns[id] = options;
            this.patterns = patterns;
        };

        Highcharts.wrap(Highcharts.VMLRenderer.prototype.Element.prototype, 'fillSetter', function(proceed, color, prop, elem) {
            if (typeof color === 'string' && color.substring(0, 5) === 'url(#') {
                var id = color.substring(5, color.length - 1),
                    pattern = this.renderer.patterns[id],
                    markup;

                if (pattern.image) {
                    // Remove Previous fills                    
                    if (elem.getElementsByTagName('fill').length) {
                        elem.removeChild(elem.getElementsByTagName('fill')[0]);
                    }

                    markup = this.renderer.prepVML(['<', prop, ' type="tile" src="', pattern.image, '" />']);
                    console.log(markup);
                    elem.appendChild(document.createElement(markup));

                    // Work around display bug on updating attached nodes
                    if (elem.parentNode.nodeType === 1) {
                        elem.outerHTML = elem.outerHTML;
                    }

                } else if (pattern.color) {
                    proceed.call(this, pattern.color, prop, elem);
                } else {
                    proceed.call(this, '#A0A0A0', prop, elem);
                }
            } else {
                proceed.call(this, color, prop, elem);
            }
        });
    }

    //// ADD PATTERNS TO THE DEFS
    Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function(proceed) {
        proceed.apply(this);

        var chart = this,
            renderer = chart.renderer,
            options = chart.options,
            colors = options.colors,
            patterns = options.defs && options.defs.patterns;

        addPredefinedPatterns(renderer);

        if (patterns) {
            each(patterns, function(pattern) {
                renderer.addPattern((pattern.id || undefined), {
                    path: pattern.path,
                    image: pattern.image,
                    color: pattern.color,
                    width: pattern.width,
                    height: pattern.height
                });
            });
        }

    });

    // PREDEFINED PATTERNS
    function addPredefinedPatterns(renderer) {
        var colors = Highcharts.getOptions().colors;

        each(HighchartsPatterns, function(pattern, i) {
            renderer.addPattern('highcharts-default-pattern-' + i, {
                path: pattern,
                color: colors[i]
            });
        });
    }

})(Highcharts);
