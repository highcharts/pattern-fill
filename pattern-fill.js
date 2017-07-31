/**
 * Highcharts pattern fill plugin
 *
 * Author:           Torstein Honsi
 *                   Stephane Vanraes
 *                   Benjamin Van Ryseghem
 * Last revision:    2015-09-07
 * License:          MIT License
 *
 * Remark:           The latest version is not compatible with earlier versions.
 *
 * Usage:            Add a 'defs' object to the options
 *                   Create a 'patterns' array under 'defs'
 *                   Each item in this array represents a pattern
 *                   To use a pattern, set the color to `url(#id-of-pattern)'
 *
 * Options for the patterns:
 * - id:             The id for the pattern, defaults to highcharts-pattern-#
 *                       with # an increasing number for each pattern without id
 * - width:          The width of the pattern, defaults to 10
 * - height:         The height of the pattern, defaults to 10
 * - path:           In SVG, the path for the pattern
 *                       (Note: this can be a string with only a path, or an
 *                       object with d, stroke, strokewidth, ...)
 * - background:     In SVG, background color to use under the pattern
 * - pattern-opacity In SVG, opacity of the pattern
 * - image:          An image source for the pattern
 * - color:          A color to be used instead of a path
 *
 * Notes:            VML does not support the path setting
 *                   If all other fills fail (no path, image or color) the
 *                       pattern will return #A0A0A0 as a color
 *                   Several patterns have been predefined, called
 *                       highcharts-default-pattern-# (numbered 0-9)
 */

/*global Highcharts */
(function() {

    'use strict';

    var idCounter = 0;

    Highcharts.wrap(Highcharts.SVGElement.prototype, 'fillSetter', function (proceed, color, prop, elem) {
        var markup,
            id,
            pattern,
            image;
        if (color && color.pattern && prop === 'fill') {
            id = 'highcharts-pattern-' + idCounter++;
            pattern = this.renderer.createElement('pattern')
                .attr({
                    id: id,
                    patternUnits: 'userSpaceOnUse',
                    width: color.width,
                    height: color.height
                })
                .add(this.renderer.defs);
                
            if (color.background) {
                this.renderer.rect({
                    x: 0,
                    y: 0,
                    width: color.width,
                    height: color.height,
                    fill: color.background
                }).add(pattern);
            }
            
            image = this.renderer.image(
                color.pattern, 0, 0, color.width, color.height
            ).add(pattern);
            
            opacity = color["pattern-opacity"];
            if (opacity && opacity >= 0 && opacity <= 1) {
                image.element.setAttribute("opacity", opacity);
            }
            
            elem.setAttribute(prop, 'url(' + this.renderer.url + '#' + id + ')');
        } else {
            return proceed.call(this, color, prop, elem);
        }
    });
    
    if (Highcharts.VMLElement) {
        Highcharts.wrap(Highcharts.Renderer.prototype.Element.prototype, 'fillSetter', function (proceed, color, prop, elem) {
                
            if (color && color.pattern && prop === 'fill') {
                // Remove previous fills
                if (elem.getElementsByTagName('fill').length) {
                    elem.removeChild(elem.getElementsByTagName('fill')[0]);                  
                }
                
                // If colors are given, use those, else use the original colors
                // of the pattern tile
                if (color.color1 && color.color2) {
                    markup = ['<hcv:', prop, ' color="', color.color1, '" color2="', 
                              color.color2, '" type="pattern" src="', color.pattern, '" />'].join('');
                } else {
                    markup = this.renderer.prepVML(['<', prop, ' type="tile" src="', color.pattern, '" />']);
                }
                
                elem.appendChild(
                    document.createElement(markup)
                );   
                
                // Work around display bug on updating attached nodes
                if (elem.parentNode.nodeType === 1) {
                    elem.outerHTML = elem.outerHTML
                }
                
            } else {
                return proceed.call(this, color, prop, elem);
            }
        });
    }
})();
