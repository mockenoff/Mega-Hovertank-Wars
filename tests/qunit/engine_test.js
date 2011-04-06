/*
** engine4.js unit tests with QUnit
*/

// Initialized Data
var pl0 = new Object();
var pt0 = new Object();
var pt1 = new Object();
var pt2 = new Object();
var pt3 = new Object();
var qd0 = new Object();
var nm0 = new Object();

// Test the Matrix object
test('Matrix object', function() {
	var mx0 = new Matrix.matrix();
	var mx1 = new Matrix.matrix();
	Matrix.Identity(mx1);
	same(mx0, mx1, 'Make the default Matrix object (identity matrix)');
	Matrix.Translate(mx0, 1, 2, 3);
	ok(mx0.m41 == 1 && mx0.m42 == 2 && mx0.m43 == 3, 'Matrix Translate object function');
	Matrix.Scale(mx0, 1, 2, 3);
	ok(mx0.m11 == 1 && mx0.m22 == 2 && mx0.m33 == 3, 'Matrix Scale object function');
	Matrix.Pitch(mx0, 0);
	same(mx0, mx1, 'Matrix Pitch object function');
	Matrix.Yaw(mx0, 0);
	same(mx0, mx1, 'Matrix Yaw object function');
	Matrix.Roll(mx0, 0);
	same(mx0, mx1, 'Matrix Roll object function');
	Matrix.Rotation(mx0, 0, 0, 0);
	same(mx0, mx1, 'Matrix Rotation object function');
	Matrix.Multiply(mx0, mx1, mx0);
	same(mx0, mx1, 'Matrix Multiply object function');
	var vc0 = new Vec.Vector(1, 1, 1);
	var vc1 = new Vec.Vector(1, 1, 1);
	Matrix.Transform(vc0, mx0, vc0);
	same(vc0, vc1, 'Matrix Transform object function (by {1, 1, 1, 1} vector)');
	var ar0 = new Array(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	var ar1 = new Array();
	Matrix.ToArray(ar1, mx0);
	same(ar0, ar1, 'Matrix ToArray object function');
})

// Test the Vec object
test('Vec object', function() {
	var vc0 = new Vec.Vector(0, 0, 0);
	ok(vc0.x == 0 && vc0.y == 0 && vc0.z == 0, 'Make a {0,0,0} vector');
	var vc1 = new Vec.Vector(1, 1, 1);
	Vec.VectorCopy(vc1, vc0);
	same(vc1, vc0, 'Copy Vector objects');
	var vx0 = new Vec.Vertex(0, 0, 0);
	ok(vx0.x == 0 && vx0.y == 0 && vx0.z == 0, 'Make a {0,0,0} vertex');
	var vx1 = new Vec.Vertex(1, 1, 1);
	Vec.VertexCopy(vx1, vx0);
	same(vx1, vx0, 'Copy Vertex objects');
	equals(Vec.DotProduct(vc0, vc1), 0, 'Get dot product of two Vectors');
	vc1 = new Vec.Vector(1, 2, 3);
	equals(Vec.MagnitudeSquared(vc1), 14, 'Get magnitude squared of {1, 2, 3}');
	equals(Vec.Magnitude(vc1), Math.sqrt(14), 'Get magnitude of {1, 2, 3}');
	vc0 = new Vec.Vector(2, 4, 6);
	Vec.ScalarMultiply(vc1, 2, vc1);
	same(vc1, vc0, 'Scalar multiply {1, 2, 3} by 2');
	Vec.Normalize(vc1);
	equals(vc1.w, 0, 'Normalize vector of {2, 4, 6}');
	vc1 = new Vec.Vector(1, 2, 3);
	Vec.Sub(vc0, vc0, vc1);
	same(vc1, vc0, 'Subtract {1, 2, 3} from {2, 4, 6}');
	Vec.Add(vc0, vc0, vc1);
	vc1 = new Vec.Vector(2, 4, 6);
	same(vc1, vc0, 'Add {1, 2, 3} to {1, 2, 3}');
	Vec.CrossProduct(vc1, vc0, vc1);
	vc0 = new Vec.Vector(0, 0, 0);
	same(vc1, vc0, 'Cross product of {2, 4, 6} and {2, 4, 6}');
})

// Test the Quad object
test('Quad object', function() {
	reset();
	var qu0 = new Quad.Default();
	equals(qu0.p0.x, -1, 'Make the default Quad object');
	var qu1 = new Quad.quad(pt0, pt1, pt2, pt3, nm0, Color.Red());
	Quad.Copy(qu1, qu0);
	equals(qu1.p0.x, -1, 'Copy the default to another Quad object');
	var mx0 = new Matrix.matrix();
	Quad.Transform(qu1, mx0, qu0);
	equals(qu1.p0.x, -1, 'Transform the Quad by the default Matrix object');
	Quad.GenerateNormal(qu0);
	equals(qu0.p0.x, -1, 'Generate normal of the default Quad object');
})

// Test the Sphere object
test('Sphere object', function() {
	reset();
	var sp0 = new Sphere.sphere(0, 0, 0, 3);
	ok(sp0.x == 0 && sp0.y == 0 && sp0.z == 0 && sp0.radius == 3, 'Make Sphere object at {0,0,0} with radius 3');
	var sp1 = new Sphere.sphere(0, 0, 0, 3);
	ok(Sphere.SphereIntersection(sp0, sp1), 'Sphere intersection true');
	sp1.x = 9; sp1.y = 9; sp1.z = 9;
	ok(!Sphere.SphereIntersection(sp0, sp1), 'Sphere intersection false');
	ok(Sphere.PointIntersection(sp0, pt0), 'Sphere middle point intersection true');
	pt0.x = 2;
	ok(Sphere.PointIntersection(sp0, pt0), 'Sphere edge point intersection true');
	ok(!Sphere.PointIntersection(sp1, pt0), 'Sphere point intersection false');
})

// Test the Color object
test('Color object', function() {
	var clr = new Color.color(1.0, 0.0, 0.0, 0.0);
	ok(clr.r == 1.0 && clr.g == 0.0 && clr.b == 0.0 && clr.a == 0.0, 'Make Color object of rgba(1.0,0.0,0.0,0.0)');
	var clr2 = new Color.color(0.0, 0.0, 0.0, 0.0);
	Color.Copy(clr2, clr);
	ok(clr2.r == 1.0 && clr2.g == 0.0 && clr2.b == 0.0 && clr2.a == 0.0, 'Copy Color object');
	Color.Multiply(clr2, 2.0, clr);
	ok(clr2.r == 2.0 && clr2.g == 0.0 && clr2.b == 0.0 && clr2.a == 0.0, 'Multiply Color object');
	equals('rgb(255,0,0)', Color.ToString(clr), 'Convert Color object to string');
	same(clr, Color.Red(), 'Red color');
	clr.r = 0.0; clr.g = 1.0;
	same(clr, Color.Green(), 'Green color');
	clr.g = 0.0; clr.b = 1.0;
	same(clr, Color.Blue(), 'Blue color');
	clr.r = 1.0;
	same(clr, Color.Purple(), 'Purple color');
	clr.r = 0.0; clr.g = 1.0;
	same(clr, Color.Turquoise(), 'Turquoise color');
	clr.b = 0.0; clr.r = 1.0;
	same(clr, Color.Yellow(), 'Yellow color');
	clr.b = 1.0;
	same(clr, Color.White(), 'White color');
	clr.r = 0.0; clr.g = 0.0; clr.b = 0.0;
	same(clr, Color.Black(), 'Black color');
})

// Test the plane() function
test('plane()', function() {
	reset();
	nm0.x = 1;
	var obj = new plane(nm0, pt1);
	ok(obj.a == 1 && obj.b == 0 && obj.c == 0 && obj.d == -1, 'Make plane out of normal {1,0,0} and {1,1,1}');
})

// Test the planeGetNormal() function
test('planeGetNormal()', function() {
	reset();
	var obj = new Object();
	planeGetNormal(obj, pl0);
	ok(obj.x == pl0.a && obj.y == pl0.b && obj.z == pl0.c, 'Get normal of {0,0,0,0} into obj');
})

// Test the planeIsOutside() function
test('planeIsOutside()', function() {
	reset();
	ok(planeIsOutside(pl0, pt0), '{0,0,0,0} is outside of {0,0,0}');
	pl0.d = 1;
	ok(!planeIsOutside(pl0, pt0), '{0,0,0,1} is NOT outside of {0,0,0}');
})

// Test the planeQuadIntersection() function
test('planeQuadIntersection()', function() {
	reset();
	ok(!planeQuadIntersection(pl0, qd0), '{0,0,0,0} does NOT intersect with [{0,0,0}, {1,1,1}, {2,2,2}, {3,3,3}]');
	pl0.a = 1; pl0.d = 2;
	ok(planeQuadIntersection(pl0, qd0), '{0,0,0,1} does intersect with [{0,0,0}, {1,1,1}, {2,2,2}, {3,3,3}]');
})

// Test the planeIsInFrontOfQuad() function
test('planeIsInFrontOfQuad()', function() {
	reset();
	ok(planeIsInFrontOfQuad(pl0, qd0), '{0,0,0,0} is in front of [{0,0,0}, {1,1,1}, {2,2,2}, {3,3,3}]');
	pl0.d = 1;
	ok(!planeIsInFrontOfQuad(pl0, qd0), '{0,0,0,1} is NOT in front of [{0,0,0}, {1,1,1}, {2,2,2}, {3,3,3}]');
})

// Test the planeQuadClip() function
test('planeQuadClip()', function() {
	reset();
	var qd1 = qd0;
	equals(planeQuadClip(pl0, qd0, qd1), 2, 'All points of [{0,0,0}, {1,1,1}, {2,2,2}, {3,3,3}] are in front of {0,0,0,0}');
	pl0.d = 2;
	equals(planeQuadClip(pl0, qd0, qd1), 3, 'All points of [{0,0,0}, {1,1,1}, {2,2,2}, {3,3,3}] are behind {0,0,0,1}');
})

function reset() {
	pl0.a = 0; pl0.b = 0; pl0.c = 0; pl0.d = 0;
	pt0.x = 0; pt0.y = 0; pt0.z = 0;
	pt1.x = 1; pt1.y = 1; pt1.z = 1;
	pt2.x = 2; pt2.y = 2; pt2.z = 2;
	pt3.x = 3; pt3.y = 3; pt3.z = 3;
	qd0.p0 = pt0; qd0.p1 = pt1; qd0.p2 = pt2; qd0.p3 = pt3;
	nm0.x = 0; nm0.y = 0; nm0.z = 0;
}