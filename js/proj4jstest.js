/*

This file is part of TomTom-Live-Traffic-Api-Example

Copyright (c) 2012, Bobbie Smulders

Contact:  mail@bsmulders.com

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/
var projWGS84 = new Proj4js.Proj('WGS84');
var projEPSG900913 = new Proj4js.Proj('EPSG:900913');

var source = new Proj4js.Proj('EPSG:900913');
var dest = new Proj4js.Proj('WGS84');

// 6795993.482654,552897.457337,6840785.58123,625971.256377
var a = 6795993.482654 // bottom-left latitude
var b = 552897.457337 // bottom-left longitude
var c = 6840785.58123 // top-right latitude
var d = 625971.256377 // top-right longitude
console.log('a: ' + a);
console.log('b: ' + b);
console.log('c: ' + c);
console.log('d: ' + d);

var p1 = new Proj4js.Point(b, a);
var p2 = new Proj4js.Point(d, c);

Proj4js.transform(source, dest, p1);
Proj4js.transform(source, dest, p2);

var bllat = p1.y;
var bllong = p1.x;
var trlat = p2.y;
var trlong = p2.x;

console.log('Bottom-left latitude: ' + bllat);
console.log('Bottom-left longitude: ' + bllong);
console.log('Top-right latitude: ' + trlat);
console.log('Top-right longitude: ' + trlong);

p1 = new Proj4js.Point(bllong, bllat);
p2 = new Proj4js.Point(trlong, trlat);

Proj4js.transform(dest, source, p1);
Proj4js.transform(dest, source, p2);

a = p1.y;
b = p1.x;
c = p2.y;
d = p2.x;

console.log('a: ' + a);
console.log('b: ' + b);
console.log('c: ' + c);
console.log('d: ' + d);