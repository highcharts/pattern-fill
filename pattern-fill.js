/**
 * Highcharts pattern fill plugin
 *
 * Author:         Torstein Hønsi
 * Last revision:  2013-02-06
 * License:        MIT License
 *
 * Options:
 * - pattern:      The URL for a pattern image file
 * - width:        The width of the image file
 * - height:       The height of the image file
 * - color1:       In oldIE, bright colors in the pattern image are replaced by this color. 
 *                 Not yet implemented in SVG.
 * - color2:       In oldIE, dark colors are replaced by this. 
 */
(function() {
    var idCounter = 0;
    
    Highcharts.wrap(Highcharts.Renderer.prototype, 'color', function(proceed, color, elem, prop) {
        var markup;
        if (color && color.pattern && prop === 'fill') {
            // SVG renderer
            if (this.box.tagName == 'svg') {
                var id = 'highcharts-pattern-'+ idCounter++;
                var pattern = this.createElement('pattern')
                        .attr({
                            id: id,
                            patternUnits: 'userSpaceOnUse',
                            width: color.width,
                            height: color.height
                        })
                        .add(this.defs),
                    image = this.image(
                        color.pattern, 0, 0, color.width, color.height
                    )
                    .add(pattern);
                return 'url(' + this.url + '#' + id + ')';
            
            // VML renderer
            } else {
                
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
                    markup = this.prepVML(['<', prop, ' type="tile" src="', color.pattern, '" />']);
                }
                
                elem.appendChild(
                    document.createElement(markup)
                );   
               
                // Work around display bug on updating attached nodes
                if (elem.parentNode.nodeType === 1) {
                    elem.outerHTML = elem.outerHTML
                }
            }
            
        } else {
            return proceed.call(this, color, elem, prop);
        }
    });    
})();
