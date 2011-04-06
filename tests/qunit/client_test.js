/*
** client.php JavaScript unit tests with QUnit
*/

var canvas = document.getElementById("theCanvas");
var gl = canvas.getContext("experimental-webgl");

// Test the Light object
test('Light object', function() {
	var vc0 = new Vec.Vector(9, 0, 0);
	var lt0 = new Light.Initialize(vc0, Color.Red(), Color.Blue());
	same(lt0.direction.x, 1, 'Make new Light object at {9, 0, 0} with Color.Red() and Color.Blue()');
})

// Test the Geometry object
test('Geometry object', function() {
	var gt0 = new Geometry.GenerateTriangle();
	equals(gt0.indices[0], 0, 'Make default Triangle Geometry object');
	var gc0 = new Geometry.GenerateCube();
	var gc1 = new Geometry.GenerateCube(Geometry.CubeAll, Color.color(1.0, 1.0, 1.0, 1.0), 0);
	same(gc0, gc1, 'Make default Cube Geometry object');
})

// Test the Shader object
test('Shader object', function() {
	var sh0 = new Shader.Create(gl, 0, 0);
	ok(sh0.vertexShader != null, 'Make Shader object');
})

// Test the Tank object
test('Tank object', function() {
	var ta0 = new Tank.Create(Color.Red(), 0);
	ok(ta0 != null, 'Create a Red Tank object');
})

// Test the Player object
test('Player object', function() {
	Keyboard.right = true;
	Player.Input();
	equals(Player.facing, 2.3, 'Player Input function');
	Keyboard.right = false;
})

// Test the Keyboard object
test('Keyboard object', function() {
	var e = new Object();
	e.keyCode = 39;
	equals(Keyboard.right, false, 'Default Keyboard object');
	Keyboard.KeyDown(e);
	equals(Keyboard.right, true, 'Keyboard KeyDown function');
	Keyboard.KeyUp(e);
	equals(Keyboard.right, false, 'Keyboard KeyUp function');
})

// Test the Bullet object
test('Bullet object', function() {
	Bullets.Initialize(1);
	var pos = new Vec.Vector(1, 2, 3);
	ok(Bullets.list[0] != null, 'Initialize the Bullet object');
	Bullets.Add(pos, 10, 5);
	ok(Bullets.list[0].isEnabled == true && Bullets.list[0].owner == 5, 'Add a bullet to the list by ID 5');
})

// Test the Level object
test('Level object', function() {
	var pt0 = new Object();
	pt0.x = 0; pt0.y = 0; pt0.z = 0;
	ok(Level.IsValidPoint(pt0), '{0,0,0} is a valid point in the Level');
	pt0.x = -10000; pt0.y = -10000; pt0.z = -10000;
	ok(!Level.IsValidPoint(pt0), '{-10000,-10000,-10000} is NOT a valid point in the Level');
	var sp0 = new Sphere.sphere(0, 0, 0, 3);
	ok(Level.IsValidSphere(sp0), 'Sphere of radius 3 at {0,0,0} is valid in the Level');
	sp0 = new Sphere.sphere(-10000, -10000, -10000, 3);
	ok(!Level.IsValidSphere(sp0), 'Sphere of radius 3 at {-10000,-10000,-10000} is valid in the Level');
})

// Test the Game object
test('Game object', function() {
	var mx0 = new Matrix.matrix();
	Game.Translate(0, 0, 0);
	same(mx0, Game.worldMatrix, 'Translate Game worldMatrix with (0,0,0)');
	Game.Yaw(0);
	same(mx0, Game.worldMatrix, 'Yaw Game worldMatrix by 0');
	Game.Pitch(0);
	same(mx0, Game.worldMatrix, 'Pitch Game worldMatrix by 0');
	Game.PushMatrix();
	equals(Game.matrixStack.length, 1, 'Push worldMatrix with PushMatrix()');
	Game.PopMatrix();
	equals(Game.matrixStack.length, 0, 'Pop worldMatrix with PopMatrix()');
})