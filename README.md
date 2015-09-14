pattern-fill
============

Highcharts plugin for creating pattern fills in any area, like area charts, chart backgrounds, plot bands or columns.

## Usage
In version 2, add a `defs` object to the options. Create a `patterns` array under `defs`. Each item in this array represents a pattern. To use a pattern, set the color to `url(#id-of-pattern)'. Version 1 worked with oldIE, but the downside is that image files are required for the patterns.

```js
    defs: {
        patterns: [{
            'id': 'custom-pattern',
            'path': {
                d: 'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
	            stroke: Highcharts.getOptions().colors[0],
    	        strokeWidth: 3
            }
        }]
    },
```

## Demos
* [Pie with default patterns](http://jsfiddle.net/highcharts/gqg618eb/)
* [Map with default patterns](http://jsfiddle.net/highcharts/3m1hjja6/)
* [Custom pattern](http://jsfiddle.net/highcharts/jzy1unsv/)
* [Version 1, oldIE compatible](http://jsfiddle.net/highcharts/ErU8H/)
 
## Compatibility
Versions 1.x are compatible with Highcharts 3. Versions 2.x are compatible with Highcharts 4.
 
## Options for version 1:
`pattern`
  The URL for a pattern image file
`width`
  The width of the image file
`height`
  The height of the image file
`color1`
  In oldIE, bright colors in the pattern image are replaced by this color. Not yet implemented in SVG.
`color2`
  In oldIE, dark colors are replaced by this. 
