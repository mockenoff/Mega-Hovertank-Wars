    const degToRadians = Math.PI/180.0;
    var Game = {
        _mtxOperand : new Matrix.matrix(),
        _copyArray : new Array(16),
        viewMatrix : new Matrix.matrix(),
        worldMatrix : new Matrix.matrix(),
        normalMatrix : new Matrix.matrix(),
        matrixStack : [],
        
        rTri : 0,
        Initialize : function(){
            try{
                var canvas = document.getElementById("theCanvas");
                Game.gl = canvas.getContext("experimental-webgl");
                var gl = Game.gl;
                gl.viewport(0,0,canvas.width,canvas.height);
                Game.shader = Game.InitShaders(Game.gl);
                Game.InitGeometry(Game.gl);
                gl.clearColor(0.0,0.0,1.0,1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
        
                Game.light = new Light.Initialize(new Vec.Vector(0.0,-1.0,0.0),
                                              new Color.color(0.5,0.5,0.5,1.0),
                                              new Color.color(1.0,1.0,1.0,1.0));
                Game.light.Update(Game.shader.lightingDirection,Game.shader.lightDiffuse,Game.shader.ambientColor,gl);
                
                Game.Perspective(45,canvas.width/canvas.height,0.1,10000.0);
                
                Bullets.Initialize(128);
                
                //Input
                document.onkeydown = Keyboard.KeyDown;
                document.onkeyup = Keyboard.KeyUp;
                
                setInterval(Game.Render,15);
            }catch(e){
                if(e.lineNumber){
                    alert("Game::Initialize : An error has occured at line "+e.lineNumber+" (" + e.name + "): \"" + e.message + "\"" );
                } else {
                    alert(e);
                }
            }
        },
        Update : function(){
            Game.rTri += 15.1;
            var playerPrev = new Sphere.sphere(Player.bSphere.x,Player.bSphere.y,Player.bSphere.z,Player.bSphere.radius);
            Player.Input();
            if(!Level.IsValidSphere(Player.bSphere)) { Player.bSphere = playerPrev; }
            
            for(var i=0;i<Bullets.list.length;++i){
                if(Bullets.list[i].isEnabled){
                    Vec.Add(Bullets.list[i].bSphere,Bullets.list[i].bSphere,Bullets.list[i].velocity);
                    //check to see if it's valid
                    if(Level.IsValidPoint(Bullets.list[i].bSphere)){
                        for(var j=0;j<Game.tanks.length;++j){
                            if(Game.tanks[j].isEnabled){
                                if(Sphere.SphereIntersection(Bullets.list[i].bSphere,Game.tanks[j].bSphere)){
                                    Bullets.list[i].isEnabled = false;
                                    Game.tanks[j].isEnabled = false;
				    /*if(mapped) send('1|'+gdata+'|'+up+'|'+down+'|'+left+'|'+right+'|'+w+'|'+a+'|'+s+'|'+d+'|'+space+
				'|'+Player.bSphere.x+'|'+Player.bSphere.y+'|'+Player.bSphere.z+'|'+Player.facing);*/
				    if((j+1)==1) send('2|'+gdata+'|'+0+'|'+0);
				    else if((j+1)==2) send('2|'+gdata+'|'+0+'|'+0);
				    else if((j+1)==3) send('2|'+gdata+'|'+0+'|'+0);
				    else if((j+1)==4) send('2|'+gdata+'|'+0+'|'+0);
                                    break;
                                }
                            }
                        }
                    }
                    else{
                        Bullets.list[i].isEnabled = false;
                    }
                }
            }
        },
        Render : function(){
            Game.Update();
            var gl = Game.gl;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            Game.LoadIdentity();   
            
            //Player view
            Game.Yaw(-Player.facing);
            Game.Translate(-Player.bSphere.x,-Player.bSphere.y,-Player.bSphere.z);
            Game.SetMatrices(gl,Game.shader);
            /*
            Game.PushMatrix();
            Game.Translate(-1.5,0,-7.0);
            Game.Yaw(Game.rTri);
            Geometry.Bind(Game.triangle.vBuffer,gl,Game.shader.vertexPositionAttribute,true);
            Geometry.Bind(Game.triangle.cBuffer,gl,Game.shader.vertexColorAttribute,true);
            Geometry.Bind(Game.triangle.nBuffer,gl,Game.shader.normalAttribute,true);
            Geometry.Bind(Game.triangle.iBuffer,gl,null,false);
            Game.SetMatrices(gl,Game.shader);
            Geometry.Render(Game.triangle.iBuffer,gl);
            Game.PopMatrix();
	    */
            Geometry.Bind(Game.cube.vBuffer,gl,Game.shader.vertexPositionAttribute,true);
            Geometry.Bind(Game.cube.cBuffer,gl,Game.shader.vertexColorAttribute,true);
            Geometry.Bind(Game.cube.nBuffer,gl,Game.shader.normalAttribute,true);
            Geometry.Bind(Game.cube.iBuffer,gl,null,false);
            for(var i=0;i<Bullets.list.length;++i){
                if(Bullets.list[i].isEnabled){
                    Game.PushMatrix();
                    Game.Translate(Bullets.list[i].bSphere.x,Bullets.list[i].bSphere.y,Bullets.list[i].bSphere.z);
                    Game.Pitch(Game.rTri*0.5);
                    Game.Yaw(Game.rTri);
                    Game.SetMatrices(gl,Game.shader);
                    Geometry.Render(Game.cube.iBuffer,gl);
                    Game.PopMatrix();
                }
            }
            
            for(var i=0;i<Game.tanks.length;++i){
                if(Game.tanks[i].isEnabled && Game.tanks[i].id != Player.id){
                    Game.PushMatrix();
                    //Game.Yaw(Game.tanks[i].facing);
                    Game.tanks[i].Render(gl,Game.shader);
                    Game.PopMatrix();    
                }    
            }
            
            Game.PushMatrix();
            Level.Draw(Game.level,gl,Game.shader);
            Game.PopMatrix();
        },
        InitShaders : function(gl){
            var sFragShader = "\
                varying vec3 lightWeight;\
                varying vec4 vColor;\
                void main(void){\
                    gl_FragColor = vec4(vColor.rgb*lightWeight,1.0);\
                }";
            var sVertShader = "\
                attribute vec3 vertexPosition;\
                attribute vec3 normal;\
                attribute vec4 vertexColor;\
                uniform mat4 worldMatrix;\
                uniform mat4 viewMatrix;\
                uniform mat4 normalMatrix;\
                uniform vec3 ambient;\
                uniform vec3 lightDirection;\
                uniform vec3 lightDiffuse;\
                varying vec3 lightWeight;\
                varying vec4 vColor;\
                void main(void) {\
                    gl_Position = viewMatrix * worldMatrix * vec4(vertexPosition,1.0);\
                    vColor = vertexColor;\
                    vec4 normalP = normalMatrix * vec4(normal,1.0);\
                    float lightScalar = max(dot(normalP.xyz,lightDirection),0.0);\
                    lightWeight = ambient + lightDiffuse * lightScalar;\
                    /*lightWeight = lightDiffuse * lightScalar;*/\
                }";
            var shader = new Shader.Create(gl,sFragShader,sVertShader);
            shader.vertexPositionAttribute = shader.GetAttribute("vertexPosition",gl);
            shader.vertexColorAttribute = shader.GetAttribute("vertexColor",gl);
            shader.normalAttribute = shader.GetAttribute("normal",gl);
            shader.viewMatrixAttribute = shader.GetUniform("viewMatrix",gl);
            shader.worldMatrixAttribute = shader.GetUniform("worldMatrix",gl);
            shader.normalMatrixAttribute = shader.GetUniform("normalMatrix",gl);
            shader.ambientColor = shader.GetUniform("ambient",gl);
            shader.lightingDirection = shader.GetUniform("lightDirection",gl);
            shader.lightDiffuse = shader.GetUniform("lightDiffuse",gl);
            return shader;
        },
        InitGeometry : function(gl){
            //Create buffers
            Game.triangle = new Geometry.GenerateTriangle();
            //Modify buffers
            Game.triangle.colors[0] = 1.0; Game.triangle.colors[1] = 0.0; Game.triangle.colors[2] = 0.0;
            Game.triangle.colors[4] = 0.0; Game.triangle.colors[5] = 1.0; Game.triangle.colors[6] = 0.0;
            Game.triangle.colors[8] = 0.0; Game.triangle.colors[9] = 0.0; Game.triangle.colors[10] = 1.0;
            
            //Upload buffers to graphics card
            Game.triangle.vBuffer = Geometry.GenerateBuffer(Game.triangle.vertices,3,gl,true);
            //Game.triangle.uvBuffer = Geometry.GenerateBuffer(Game.triangle.uvs,2,gl,true);
            Game.triangle.nBuffer = Geometry.GenerateBuffer(Game.triangle.normals,3,gl,true);
            Game.triangle.cBuffer = Geometry.GenerateBuffer(Game.triangle.colors,4,gl,true);
            Game.triangle.iBuffer = Geometry.GenerateBuffer(Game.triangle.indices,1,gl,false);
            
            //Create buffers
            var colors = [
                Color.Red(),
                Color.Yellow(),
                Color.Green(),
                Color.Blue(),
		Color.Turquoise(),
                Color.Purple(),
                Color.Black(),
                Color.White(),
            ];
            Game.cube = new Geometry.GenerateCube(Geometry.CubeAll,colors,0.2);
            //Modify buffers
            //Upload buffers to graphics card
            Game.cube.vBuffer = Geometry.GenerateBuffer(Game.cube.vertices,3,gl,true);
            Game.cube.nBuffer = Geometry.GenerateBuffer(Game.cube.normals,3,gl,true);
            Game.cube.cBuffer = Geometry.GenerateBuffer(Game.cube.colors,4,gl,true);
            Game.cube.iBuffer = Geometry.GenerateBuffer(Game.cube.indices,1,gl,false);
            
            //Create tanks
            var positions = [
                [250.0,0.0,0.0],
                [-250.0,0.0,0.0],
                [0.0,0.0,250.0],
                [0.0,0.0,-250.0],
                [20.0,0.0,20.0],
                [-20.0,0.0,20.0],
                [-20.0,0.0,-20.0],
                [20.0,0.0,-20.0]
            ];
	    var facing = [0,Math.PI,0.5*Math.PI,1.5*Math.PI]
            Game.tanks = new Array(4);
            for(var i=0;i<Game.tanks.length;++i){
                Game.tanks[i] = new Tank.Create(colors[i%colors.length],0.2);
                Game.tanks[i].bSphere.x = positions[i][0];
                Game.tanks[i].bSphere.y = 0.0;
                Game.tanks[i].bSphere.z = positions[i][2];
                Game.tanks[i].InitializeBuffers(gl);
                Game.tanks[i].isEnabled = true;
		Game.tanks[i].facing = facing[i];
            }
            Player.id = 1 - 1;
            Game.tanks[Player.id].isEnabled = false;
	    Player.bSphere = Game.tanks[Player.id].bSphere;
            //Create level
            Game.level = new Level.Initialize(gl);
        },
        LoadIdentity : function() { Matrix.Identity(Game.worldMatrix); },
        Translate : function(x,y,z) {
            Matrix.Translate(Game._mtxOperand,x,y,z);
            Matrix.Multiply(Game.worldMatrix,Game._mtxOperand,Game.worldMatrix);
        },
        Yaw : function(x){
            Matrix.Yaw(Game._mtxOperand,x*degToRadians);
            Matrix.Multiply(Game.worldMatrix,Game._mtxOperand,Game.worldMatrix);
        },
        Pitch : function(x){
            Matrix.Pitch(Game._mtxOperand,x*degToRadians);
            Matrix.Multiply(Game.worldMatrix,Game._mtxOperand,Game.worldMatrix);
        },
        PushMatrix : function(){
            Game.matrixStack.push(Game.worldMatrix);
            Game.worldMatrix = new Matrix.CopyConstructor(Game.worldMatrix);
        },
        PopMatrix : function(){
            if(Game.matrixStack.length > 0) { Game.worldMatrix = Game.matrixStack.pop(); }
            else { throw "Game::PopMatrix : no more matrices to pop off of stack."; }
        },
        Perspective : function(fov,aspect,near,far){ Matrix.Perspective(Game.viewMatrix,near,far,fov,aspect); },
        SetMatrices : function(gl,shader){
            Matrix.ToArray(Game._copyArray,Game.viewMatrix);
            gl.uniformMatrix4fv(shader.viewMatrixAttribute,false,new WebGLFloatArray(Game._copyArray));
            Matrix.ToArray(Game._copyArray,Game.worldMatrix);
            gl.uniformMatrix4fv(shader.worldMatrixAttribute,false,new WebGLFloatArray(Game._copyArray));
            Matrix.NormalMatrix(Game.normalMatrix,Game.worldMatrix);
            Matrix.ToArray(Game._copyArray,Game.normalMatrix);
            gl.uniformMatrix4fv(shader.normalMatrixAttribute,false,new WebGLFloatArray(Game._copyArray));
        }
    }
    var Level = {
	maxX : 500.0,
	maxZ : 500.0,
	columnWX : 50.0,
	columnWZ : 50.0,
	columnX : 150.0,
	columnZ : 150.0,
	
	Initialize : function(gl){
            var colors = [new Color.color(0.4,0,0,1.0), new Color.color(0,0.4,0.8), new Color.color(0.4,1.0,0.6),
                          new Color.color(1.0,0.2,0), new Color.color(0.6,0.4,0.2)];
            var sides = Geometry.CubeAll - Geometry.CubeTop;
            this.geometry = new Geometry.GenerateCube(sides,colors,0.2);
	    var taper = function(vertices,sx,sy,sz,ratio){
                for(var i=0;i<vertices.length;i+=3){
                    vertices[i]*=sx;
                    vertices[i+1]*=sy;
                    vertices[i+2]*=sz;
                }
            }
            for(var i=0;i<this.geometry.normals.length;++i) { this.geometry.normals[i]*=-1.0; } //Invert normals
            taper(this.geometry.vertices,Level.maxX,40.0,Level.maxZ,-0.2);
            this.columns = new Array(4);
	    this.columns[0] = new Vec.Vertex(Level.columnX,0.0,Level.columnZ);
	    this.columns[1] = new Vec.Vertex(-Level.columnX,0.0,Level.columnZ);
	    this.columns[2] = new Vec.Vertex(-Level.columnX,0.0,-Level.columnZ);
	    this.columns[3] = new Vec.Vertex(Level.columnX,0.0,-Level.columnZ);
	    //this.column = new Cube.Create([[0.6,0.4,0.4]],gl,sides-Cube.bottom,Level.columnWX,60.0,Level.columnWZ,-0.2);
            this.column = new Geometry.GenerateCube(sides-Geometry.CubeBottom,[new Color.color(0.6,0.4,0.4)],0.2);
            taper(this.column.vertices,Level.columnWX,60.0,Level.columnWZ,0.2);
   
            this.geometry.vBuffer = Geometry.GenerateBuffer(this.geometry.vertices,3,gl,true);
            this.geometry.nBuffer = Geometry.GenerateBuffer(this.geometry.normals,3,gl,true);
            this.geometry.cBuffer = Geometry.GenerateBuffer(this.geometry.colors,4,gl,true);
            this.geometry.iBuffer = Geometry.GenerateBuffer(this.geometry.indices,1,gl,false);
            this.column.vBuffer = Geometry.GenerateBuffer(this.column.vertices,3,gl,true);
            this.column.nBuffer = Geometry.GenerateBuffer(this.column.normals,3,gl,true);
            this.column.cBuffer = Geometry.GenerateBuffer(this.column.colors,4,gl,true);
            this.column.iBuffer = Geometry.GenerateBuffer(this.column.indices,1,gl,false);
            
	},
	Draw : function(level,gl,shaderProgram){
            Game.Translate(0.0,35.0,0.0);
            Game.SetMatrices(gl,shaderProgram);
            //Level
            Geometry.Bind(level.geometry.vBuffer,gl,shaderProgram.vertexPositionAttribute,true);
            Geometry.Bind(level.geometry.cBuffer,gl,shaderProgram.vertexColorAttribute,true);
            Geometry.Bind(level.geometry.nBuffer,gl,shaderProgram.normalAttribute,true);
            Geometry.Bind(level.geometry.iBuffer,gl,null,false);
            Game.SetMatrices(gl,shaderProgram);
            Geometry.Render(level.geometry.iBuffer,gl);
            //Columns
            Geometry.Bind(level.column.vBuffer,gl,shaderProgram.vertexPositionAttribute,true);
            Geometry.Bind(level.column.cBuffer,gl,shaderProgram.vertexColorAttribute,true);
            Geometry.Bind(level.column.nBuffer,gl,shaderProgram.normalAttribute,true);
            Geometry.Bind(level.column.iBuffer,gl,null,false);
            for(var i=0;i<level.columns.length;++i){
                Game.PushMatrix();
                Game.Translate(level.columns[i].x,level.columns[i].y,level.columns[i].z);
                Game.SetMatrices(gl,shaderProgram);
                Geometry.Render(level.column.iBuffer,gl);
                Game.PopMatrix();
            }
	},
	IsValidPoint : function(p){
	    //Main room
	    if(p.x > Level.maxX || p.x < -Level.maxX) { return false; }
	    if(p.z > Level.maxZ || p.z < -Level.maxZ) { return false; }
	    //Columns
	    var cps = [
		[Level.columnX,Level.columnZ],
		[Level.columnX,-Level.columnZ],
		[-Level.columnX,Level.columnZ],
		[-Level.columnX,-Level.columnZ]
		];
	    for(var i=0;i<cps.length;++i){
		if(p.x > cps[i][0]-Level.columnWX && p.x < cps[i][0]+Level.columnWX &&
		p.z > cps[i][1]-Level.columnWZ && p.z < cps[i][1]+Level.columnWZ) { return false; }
	    }
	    return true;
	},
	IsValidSphere : function(p){
	    //Main room
            /*
	    if(p.x+p.radius > Level.maxX-20.0 || p.x-p.radius < -Level.maxX+20.0) { return false; }
	    if(p.z+p.radius > Level.maxZ-20.0 || p.z-p.radius < -Level.maxZ+20.0) { return false; }
            */
            if(p.x+p.radius > Level.maxX || p.x-p.radius < -Level.maxX) { return false; }
	    if(p.z+p.radius > Level.maxZ || p.z-p.radius < -Level.maxZ) { return false; }
            
            //Columns
	    var cps = [
		[Level.columnX,Level.columnZ],
		[Level.columnX,-Level.columnZ],
		[-Level.columnX,Level.columnZ],
		[-Level.columnX,-Level.columnZ]
		];
	    for(var i=0;i<cps.length;++i){
		if(p.x+p.radius > cps[i][0]-Level.columnWX && p.x-p.radius < cps[i][0]+Level.columnWX &&
		p.z+p.radius > cps[i][1]-Level.columnWZ && p.z-p.radius < cps[i][1]+Level.columnWZ) { return false; }
	    }
	    return true;
	}
    }
    var Bullets = {
        speed : 2.5,
        list : [],
        radius : 0.5,
        FacingToVector : function(v,facing){
            var x = Math.cos(facing*degToRadians)*Bullets.speed;
            var z = Math.sin(facing*degToRadians)*Bullets.speed;
            v.x = x; v.y = 0; v.z = z;
        },
        Initialize : function(totalBullets){
            if(totalBullets < 1){ throw "Bullets::Initialize : Invalid number of bullets ("+totalBullets+")"; }
            Bullets.list = new Array(totalBullets);
            for(var i=0;i<totalBullets;++i){
                Bullets.list[i] = new Bullets.Create();
            }
        },
        Create : function(){
            this.bSphere = new Sphere.sphere(0,0,0,Bullets.radius);
            this.velocity = new Vec.Vector(0,0,0);
            this.isEnabled = false;
            this.owner = -2;
        },
        Add : function(position,facing,id){
            for(var i=0;i<Bullets.list.length;++i){
                if(!Bullets.list[i].isEnabled){
                    facing = 180 - facing;
		    Vec.Copy(Bullets.list[i].bSphere,position);
		    Bullets.list[i].bSphere.z = position.z + Math.cos(facing*degToRadians)*(Player.bSphere.radius+10.0);
		    Bullets.list[i].bSphere.x = position.x + Math.sin(facing*degToRadians)*(Player.bSphere.radius+10.0);
                    Bullets.list[i].velocity.z = Math.cos(facing*degToRadians)*Bullets.speed;
                    Bullets.list[i].velocity.x = Math.sin(facing*degToRadians)*Bullets.speed;
                    Bullets.list[i].owner = id;
                    Bullets.list[i].isEnabled = true;
                    break;
                }
            }
        }
    }
    var Keyboard = {
	w : false,
	a : false,
	s : false,
	d : false,
	q : false,
	e : false,
	space : false,
	up : false,
	right : false,
	down : false,
	left : false,
	KeyDown : function(e){
	    Keyboard.Input(e,true);
	},
	KeyUp : function(e){
	    Keyboard.Input(e,false);
	},
	Input : function(e,value){
	    switch(e.keyCode){
		case 65: Keyboard.a = value; break;
		case 87: Keyboard.w = value; break;
		case 83: Keyboard.s = value; break;
		case 68: Keyboard.d = value; break;
		case 32: Keyboard.space = value; break;
		case 38: Keyboard.up = value; break;
		case 37: Keyboard.left = value; break;
		case 40: Keyboard.down = value; break;
		case 39: Keyboard.right = value; break;
		case 81: Keyboard.q = value; break;
		case 69: Keyboard.e = value; break;
		default: break;
	    }
	},
    }
    var Player = {
	bSphere : new Sphere.sphere(0.0,0.0,7.0,6.0),
	facing : 0.0,
	moveValue : 2.25,
	rotFactor : 2.3,
	lastFired : 0,
	id : 7,
        reloadingTime : 1000,
	Input : function(){
	    
	    if(Keyboard.left){
		Player.facing -= Player.rotFactor;
            }
	    if(Keyboard.right){
		Player.facing += Player.rotFactor;
	    }
	    if(Keyboard.w){
		Player.bSphere.z -= Math.cos(Player.facing*degToRadians)*Player.moveValue;
		Player.bSphere.x += Math.sin(Player.facing*degToRadians)*Player.moveValue;
	    }
	    if(Keyboard.s){
		Player.bSphere.z += Math.cos(Player.facing*degToRadians)*Player.moveValue;
		Player.bSphere.x -= Math.sin(Player.facing*degToRadians)*Player.moveValue;
	    }
	    if(Keyboard.a){
		Player.bSphere.z += Math.cos((Player.facing+90.0)*degToRadians)*Player.moveValue;
		Player.bSphere.x -= Math.sin((Player.facing+90.0)*degToRadians)*Player.moveValue;
	    }
	    if(Keyboard.d){
		Player.bSphere.z -= Math.cos((Player.facing+90.0)*degToRadians)*Player.moveValue;
		Player.bSphere.x += Math.sin((Player.facing+90.0)*degToRadians)*Player.moveValue;
	    }
	    if(Keyboard.space){
		var now = new Date().getTime();
		if((now - Player.lastFired) > Player.reloadingTime){
		    Bullets.Add(Player.bSphere,Player.facing,Player.id);
                    Player.lastFired = now;
		    Keyboard.space = false;
		}
		
	    }
	}
    }
    var Tank = {
        Create : function(color,variance){
            var vertices = [];
            var barrel = new Array(8);
            const a = 0; const b = 1; const c = 2; const d = 3;
            const e = 4; const f = 5; const g = 6; const h = 7;
            
            //Barrel vertices
            barrel[a] = [0.0,1.5,-7.0];
            barrel[b] = [0.0,1.5,0.0];
            barrel[c] = [-0.5,1.25,-0.25];
            barrel[d] = [-0.5,1.25,-7.0];
            barrel[e] = [0.0,1.0,-7.0];
            barrel[f] = [0.0,1.0,-0.5];
            barrel[g] = [0.5,1.25,-7.0];
            barrel[h] = [0.5,1.25,-0.25];
            //var indices = [a,d,c, a,c,b, d,c,f, d,f,e, e,g,h, e,h,f, g,a,b, g,b,h, a,d,e, a,e,g];
            var indices = [a,c,d, a,b,c, d,c,f, d,f,e, e,f,h, e,h,g, g,b,a, g,h,b, a,d,e, a,e,g];
            for(var i=0;i<indices.length;++i){ vertices = vertices.concat(barrel[indices[i]]); }
            
            //Tank body vertices
            var tank = new Array(8);
            tank[a] = [-1.5,0.0,-7.0];
            tank[b] = [1.5,0.0,-7.0];
            tank[c] = [1.5,-2.0,-6.0];
            tank[d] = [-1.5,-2.0,-6.0];
            tank[e] = [-3.5,1.0,7.0];
            tank[f] = [3.5,1.0,7.0];
            tank[g] = [2.5,-2.0,6.0];
            tank[h] = [-2.5,-2.0,6.0];
            indices = [a,d,c, a,c,b, b,c,g, b,g,f, a,h,e, a,d,h, e,f,g, e,g,h, a,e,f, a,f,b]
            for(var i=0;i<indices.length;++i){ vertices = vertices.concat(tank[indices[i]]); }
        
            //Turret
            var turret = new Array(8);
            turret[a] = [0.5,2.0,1.0];
            turret[b] = [1.5,2.0,5.0];
            turret[c] = [-1.5,2.0,5.0];
            turret[d] = [-0.5,2.0,1.0];
            turret[e] = [1.5,0.5,-1.0];
            turret[f] = [2.5,1.0,6.0];
            turret[g] = [-2.5,1.0,6.0];
            turret[h] = [-1.5,0.5,-1.0];
            indices = [e,f,b, e,b,a, f,g,c, f,c,b, c,g,h, c,h,d, a,d,h, a,h,e, a,d,c, a,c,b]
            //Generate index buffer
            for(var i=0;i<indices.length;++i){  vertices = vertices.concat(turret[indices[i]]); }
            //Generate normals
            normals = [];
            var vtxa = new Vec.Vertex(0.0,0.0,0.0);
            var vtxb = new Vec.Vertex(0.0,0.0,0.0);
            var va = new Vec.Vector(0.0,0.0,0.0);
            var vb = new Vec.Vector(0.0,0.0,0.0);
            var vc = new Vec.Vector(0.0,0.0,0.0);
            for(var i=0;i<vertices.length;i+=18){
                vtxa.x = vertices[i]; vtxa.y = vertices[i+1]; vtxa.z = vertices[i+2];
                vtxb.x = vertices[i+3]; vtxb.y = vertices[i+4]; vtxb.z = vertices[i+5];
                Vec.Sub(va,vtxa,vtxb);
                vtxb.x = vertices[i+6]; vtxb.y = vertices[i+7]; vtxb.z = vertices[i+8];
                Vec.Sub(vb,vtxa,vtxb);
                Vec.CrossProduct(vc,va,vb);
                Vec.Normalize(vc,vc);
                n = [vc.x,vc.y,vc.z];
                normals = normals.concat(n,n,n, n,n,n);
            }
            var colors = [];
            if(!color.length){
                var cL = [color.r,color.g,color.b,1.0];
                var cD = [color.r*(1.0-variance),color.g*(1.0-variance),color.b*(1.0-variance),1.0];
                for(var i=0;i<vertices.length/3;i+=6){
                    colors = colors.concat(cL,cD,cD, cL,cL,cD);
                }
            }
            else{
                var cc = 0;
                for(var i=0;i<vertices.length/3;i+=6){
                    var cL = [color[cc].r,color[cc].g,color[cc].b,1.0];
                    var cD = [color[cc].r*(1.0-variance),color[cc].g*(1.0-variance),color[cc].b*(1.0-variance),1.0];
                    colors = colors.concat(cL,cD,cD, cL,cL,cD);
                    cc = (cc+1)%color.length;
                }
            }
            var iBuffer = new Array(vertices.length/3);
            for(var i=0;i<vertices.length/3;++i){ iBuffer[i] = i;}
            
            this.indices = iBuffer;
            this.vertices = vertices;
            this.colors = colors;
            this.normals = normals;
            
            if(this.vertices.length/3 != this.colors.length/4 || this.colors.length/4 != this.normals.length/3){
                throw "Tank::Create : array-length mismatch error vertices ("+
                    this.vertices.length+") colors ("+
                    this.colors.length+") normals ("+this.normals.length+")";
            }
            
            this.bSphere = new Sphere.sphere(0.0,0.0,0.0,5.0);
            this.isEnabled = false;
            this.facing = 0.0;
            this.InitializeBuffers = Tank.InitializeBuffers;
            this.Render = Tank.Render;
	    this.lastFired = new Date().getTime();
          },
          InitializeBuffers : function(gl){
            this.vBuffer = Geometry.GenerateBuffer(this.vertices,3,gl,true);
            this.nBuffer = Geometry.GenerateBuffer(this.normals,3,gl,true);
            this.cBuffer = Geometry.GenerateBuffer(this.colors,4,gl,true);
            this.iBuffer = Geometry.GenerateBuffer(this.indices,1,gl,false);
          },
          Render : function(gl,shader){
            Game.PushMatrix();
            Game.Translate(this.bSphere.x,this.bSphere.y,this.bSphere.z);
            Game.Yaw(this.facing);
            Geometry.Bind(this.vBuffer,gl,shader.vertexPositionAttribute,true);
            Geometry.Bind(this.cBuffer,gl,shader.vertexColorAttribute,true);
            Geometry.Bind(this.nBuffer,gl,shader.normalAttribute,true);
            Geometry.Bind(this.iBuffer,gl,null,false);
            Game.SetMatrices(gl,shader);
            Geometry.Render(this.iBuffer,gl);
            Game.PopMatrix();
          }
    }
    var Light = {
        Initialize : function(direction,ambient,diffuse){
            this.direction = new Vec.Vector(direction.x,direction.y,direction.z);
            Vec.Normalize(this.direction);
            this.ambient = new Color.color(ambient.r,ambient.g,ambient.b,ambient.a);
            this.diffuse = new Color.color(diffuse.r,diffuse.g,diffuse.b,diffuse.a);
            this.Update = Light.Update;
        },
        Update : function(dirAttrib,colorAttrib,ambientAttrib,gl){
            gl.uniform3f(ambientAttrib,this.ambient.r,this.ambient.g,this.ambient.b);
            gl.uniform3f(dirAttrib,this.direction.x,this.direction.y,this.direction.z);
            gl.uniform3f(colorAttrib,this.diffuse.r,this.diffuse.g,this.diffuse.b);
        }
    }
    var Texture = {
        Initialize : function(filename,gl){
            var texture = gl.createTexture();
            texture.image = new Image();
            texture.image.onload = function(){
                Texture.Load(texture,gl);
            }
            texture.image.src = filename;
            texture.Bind = Texture.Bind;
            return texture;
        },
        Load : function(texture,gl){
            gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.texImage2D(gl.TEXTURE_2D,0,texture.image,true);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D,null);
        },
        Bind : function(sampler,gl){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D,this);
            gl.uniform1i(sampler,0);
        }
    }
    var Geometry = {
        GenerateTriangle : function(){
            this.colors = [
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
            ];
            this.vertices = [
                0.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
            ];
            this.normals = [
                0.0,0.0,-1.0,
                0.0,0.0,-1.0,
                0.0,0.0,-1.0,
            ];
            this.uvs = [
                0.5,0.0,
                0.0,1.0,
                1.0,1.0
            ];
            this.indices = [
                0, 1, 2,  
            ];
        },
        CubeTop : 1,
        CubeBottom : 2,
        CubeFront : 4,
        CubeBack : 8,
        CubeRight : 16,
        CubeLeft : 32,
        CubeAll : 32+16+8+4+2+1,
        GenerateCube : function(sides,colors,variance){
            if(!colors) { colors = [new Color.color(1.0,1.0,1.0,1.0)]; }
            if(!sides) { sides = Geometry.CubeAll; }
            if(!variance) { variance = 0; }
            this.colors = [];
            this.vertices = [];
            this.normals = [];
            this.uvs = [];
            this.indices = [];
            var cc = 0;
            var cubeSides = [Geometry.CubeLeft,Geometry.CubeRight,Geometry.CubeTop,
                         Geometry.CubeBack,Geometry.CubeBottom,Geometry.CubeFront];
            var normals = [
                [1.0,0.0,0.0],
                [-1.0,0.0,0.0],
                [0.0,-1.0,0.0],
                [0.0,0.0,-1.0],
                [0.0,1.0,0.0],
                [0.0,0.0,1.0]
            ];
            var vertices = [
                [-1,1,-1, -1,-1,-1, -1,1,1, -1,1,1, -1,-1,-1, -1,-1,1],
                [1,1,-1, 1,1,1, 1,-1,-1, 1,-1,-1, 1,1,1, 1,-1,1],
                [-1,1,-1, 1,1,-1, -1,1,1, -1,1,1, 1,1,-1, 1,1,1],
                [-1,1,1, -1,-1,1, 1,1,1, 1,1,1, -1,-1,1, 1,-1,1],
                [-1,-1,-1, -1,-1,1, 1,-1,-1, 1,-1,-1, -1,-1,1, 1,-1,1],
                [-1,1,-1, -1,-1,-1, 1,1,-1, 1,1,-1, -1,-1,-1, 1,-1,-1],
            ];
            for(var i=0;i<6;++i){
                if((sides & cubeSides[i]) > 0){
                    var c = colors[cc%colors.length];
                    var acL = [c.r,c.g,c.b,1.0];
                    var acD = [c.r*(1.0-variance), c.g*(1.0-variance), c.b*(1.0-variance), 1.0];
                    
                    this.colors = this.colors.concat(acL,acD,acD, acL,acL,acD);
                    ++cc;
                    this.normals = this.normals.concat(normals[i],normals[i],normals[i], normals[i],normals[i],normals[i]);
                    this.uvs = this.uvs.concat([0,0, 0,1, 1,0, 1,0, 0,1, 1,1]);
                    var vl = this.vertices.length/3;
                    this.indices = this.indices.concat([vl,vl+1,vl+2, vl+3,vl+4,vl+5]);
                    this.vertices = this.vertices.concat(vertices[i]);
                }
            }
        },
        GenerateBuffer : function(buffer,itemSize,gl,isArrayBuffer){
            if((buffer.length % itemSize) > 0) {
                throw "Geometry::GenerateBuffer : array-length("+buffer.length+") is not divisible by "+itemSize;
            }
            var vBuffer = gl.createBuffer();
            if(isArrayBuffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER,new WebGLFloatArray(buffer),gl.STATIC_DRAW);
            } else {
                if(itemSize != 1) { throw "Geometry::GenerateBuffer : index arrays must have an item-size of 1"; }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,vBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new WebGLUnsignedShortArray(buffer),gl.STATIC_DRAW);
            }
            vBuffer.itemSize = itemSize;
            vBuffer.numItems = buffer.length/itemSize;
            return vBuffer;
        },
        Bind : function(buffer,gl,attribute,isArrayBuffer){
            if(isArrayBuffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
                gl.vertexAttribPointer(attribute,buffer.itemSize,gl.FLOAT,false,0,0);
            } else { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer); }
        },
        Render : function(indexArray,gl) { gl.drawElements(gl.TRIANGLES,indexArray.numItems,gl.UNSIGNED_SHORT,0); },
    }
    var Shader = {       
        Create : function(gl,fragmentShaderCode,vertexShaderCode){
            this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var Compile = function(shader,shaderCode,gl){
                gl.shaderSource(shader,shaderCode);
                gl.compileShader(shader);
            }
            Compile(this.fragmentShader,fragmentShaderCode,gl);
            Compile(this.vertexShader,vertexShaderCode,gl);
            this.shaderProgram = gl.createProgram();
            gl.attachShader(this.shaderProgram,this.vertexShader);
            gl.attachShader(this.shaderProgram,this.fragmentShader);
            gl.linkProgram(this.shaderProgram);
            if(!gl.getProgramParameter(this.shaderProgram,gl.LINK_STATUS)){
                throw "Shader::Create : Could not initialize shaders.";
            }
            gl.useProgram(this.shaderProgram);
            this.GetAttribute = Shader.GetAttribute;
            this.GetUniform = Shader.GetUniform;
        },
        GetAttribute : function(name,gl){
            var attrib = gl.getAttribLocation(this.shaderProgram,name);
            gl.enableVertexAttribArray(attrib);
            return attrib;
        },
        GetUniform : function(name,gl){
            return gl.getUniformLocation(this.shaderProgram,name);  
        },
    }
	
function send(msg) {
	// do something
}
var gdata = 0;