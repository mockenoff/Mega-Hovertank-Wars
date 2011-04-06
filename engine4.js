//Max's 3D Javascript Library Mk IV
//Version 1.0: Array-based vectors, polygon-based rendering engine
//Version 2.0: Object-based vectors, quad-based rendering engine
//Version 3.0: Made changes to run in WebGL
//Version 4.0: More changes to run in WebGL (Fixed Matrix.Perspective finally)
//----====((((Object Routines))))====-------------------------------------------
function entity(quads,position,radius){
	this.quads = quads;
	this.position = position;
	this.rotation = new Vec.Vector(0.0,0.0,0.0);
	this.mtx = new Matrix.matrix();
	this.mtxParent;
	Matrix.Translate(this.mtx,position.x,position.y,position.z);
	if(radius == undefined){
		this.boundingSphere = new sphere(position.x,position.y,position.z,maxDist(position,quads));
	}else{
		this.boundingSphere = new sphere(position.x,position.y,position.z,radius);
	}
}

//Input/Output: ent, an entity object whos quads attribute will be modified by mtx
//Input: mtx, a matrix to transform the quads in ent by
function entityStaticTransform(ent,mtx){
	for(var i=0;i<ent.quads.length;++i){
		/*Matrix.Transform(ent.quads[i].p0,mtx,ent.quads[i].p0);
		Matrix.Transform(ent.quads[i].p1,mtx,ent.quads[i].p1);
		Matrix.Transform(ent.quads[i].p2,mtx,ent.quads[i].p2);
		Matrix.Transform(ent.quads[i].p3,mtx,ent.quads[i].p3);
		Matrix.Transform(ent.quads[i].normal,mtx,ent.quads[i].normal);
		Vec.Normalize(ent.quads[i].normal,ent.quads[i].normal);*/
		Quad.Transform(ent.quads[i],mtx,ent.quads[i]);
	}
}

//Input/Output: polyList a list of quads that will store the world-transformed vertices
//Input: start, where in polyList we should start writing to
//Input: ent, the entity we are transforming and copying to polyList
//Input: parentMatrix, the current world matrix (in case of additive transformations)
function entityWorldTransform(polyList,start,ent,parentMatrix){
	var mtx = new Matrix.matrix();
	ent.mtxParent = parentMatrix;
	Matrix.Rotation(ent.mtx,ent.rotation.x,ent.rotation.y,ent.rotation.z);
	Matrix.Translate(mtx,ent.position.x,ent.position.y,ent.position.z);
	
	if(parentMatrix != undefined){	//multiply by parent matrix if it's defined (for additive transformations)
		Matrix.Multiply(mtx,mtx,parentMatrix);
	}
	Matrix.Multiply(ent.mtx,ent.mtx,mtx);
	
	for(var i=0;i<ent.quads.length;++i){
		if(polyList[i+start] != undefined){ }
		else{ polyList[i+start] = new Quad.CopyConstructor(ent.quads[i]); }
		Quad.Transform(polyList[i+start],ent.mtx,ent.quads[i]);
		/*	
		Matrix.Transform(polyList[i+start].p0, ent.mtx, ent.quads[i].p0);
		Matrix.Transform(polyList[i+start].p1, ent.mtx, ent.quads[i].p1);
		Matrix.Transform(polyList[i+start].p2, ent.mtx, ent.quads[i].p2);
		Matrix.Transform(polyList[i+start].p3, ent.mtx, ent.quads[i].p3);
		Matrix.Transform(polyList[i+start].normal, ent.mtx, ent.quads[i].normal);
		Vec.Normalize(polyList[i+start],polyList[i+start]);
		colorCopy(polyList[i+start].color,ent.quads[i].color);
		Matrix.Transform(polyList[i+start].centroid,ent.mtx,ent.quads[i].entroid);*/
	}
}

//Get the maximum distance from position of any point in the quad-list
function maxDist(pos,quadList){
	var maxmax = 0.0;
	var delta = new vector(0.0,0.0,0.0);
	for(var i=0;i<quadList;++i){
		vecSub(delta,pos,quadList.p0);
		var magmag = Vec.MagnitudeSquared(delta);
		if(Math.abs(magmag) > maxmax) { maxmax = Math.abs(magmag); }
	}
	return Math.sqrt(maxmax);
}

//----====((((Matrix Routines))))====-------------------------------------------
  //Get a new matrix
  var Matrix = {
	matrix : function(){
  	  this.m11 = 1.0; this.m12 = 0.0; this.m13 = 0.0; this.m14 = 0.0;
  	  this.m21 = 0.0; this.m22 = 1.0; this.m23 = 0.0; this.m24 = 0.0;
  	  this.m31 = 0.0; this.m32 = 0.0; this.m33 = 1.0; this.m34 = 0.0;
  	  this.m41 = 0.0; this.m42 = 0.0; this.m43 = 0.0; this.m44 = 1.0;
  },
	CopyConstructor : function(m){
		this.m11 = m.m11; this.m12 = m.m12; this.m13 = m.m13; this.m14 = m.m14;
		this.m21 = m.m21; this.m22 = m.m22; this.m23 = m.m23; this.m24 = m.m24;
		this.m31 = m.m31; this.m32 = m.m32; this.m33 = m.m33; this.m34 = m.m34;
		this.m41 = m.m41; this.m42 = m.m42; this.m43 = m.m43; this.m44 = m.m44;
	},
  //Set out to identity matrix
  //m(row)(column)
  Identity : function(out){
  	  out.m11 = 1.0; out.m12 = 0.0; out.m13 = 0.0; out.m14 = 0.0;
  	  out.m21 = 0.0; out.m22 = 1.0; out.m23 = 0.0; out.m24 = 0.0;
  	  out.m31 = 0.0; out.m32 = 0.0; out.m33 = 1.0; out.m34 = 0.0;
  	  out.m41 = 0.0; out.m42 = 0.0; out.m43 = 0.0; out.m44 = 1.0;
  },
  
  //Set out to a translation matrix by [x,y,z]
  //ALL VERTICES MUST BE DEFINED WITH A 1.0 for w OTHERWISE THIS WILL NOT WORK
  //ALL VECTORS (Normals) MUST BE DEFINED WITH A 0.0 for w 
  /*	  1.0, 0.0, 0.0, 0.0,
  	  	  0.0, 1.0, 0.0, 0.0,
  	  	  0.0, 0.0, 1.0, 0.0,
  	  	  x, y, z, 1.0*/
  Translate : function(out,x,y,z){
  	  Matrix.Identity(out);
  	  out.m41=x;
  	  out.m42=y;
  	  out.m43=z;
  },
  
  //Set out to a scale matrix in the x,y,z directions
  /*	x, 0.0, 0.0, 0.0,
  	  	0.0, y, 0.0, 0.0,
  	  	0.0, 0.0, z, 0.0,
  	  	0.0, 0.0, 0.0, 1.0*/
  Scale : function(out,x,y,z){
  	  Matrix.Identity(out);
  	  out.m11 = x;
  	  out.m22 = y;
  	  out.m33 = z;
  },
  
  //Set out to a x-axis rotation matrix
  /*  	1.0, 0.0, 0.0, 0.0,
  	  	  0.0, c, -s, 0.0,
  	  	  0.0, s, c, 0.0,
  	  	  0.0, 0.0, 0.0, 1.0*/
  Pitch : function(out,x){
  	  var c = Math.cos(x);
  	  var s = Math.sin(x);
  	  Matrix.Identity(out);
  	  out.m22 = c;
  	  out.m23 = -s;
  	  out.m32 = s;
  	  out.m33 = c;
  },
  /*
   const invRadians = Math.PI / 180.0;
      var m = Matrix.I(4);
      var c = Math.cos(y*invRadians);
      var s = Math.sin(y*invRadians);
      m.elements[0][0] = c;
      m.elements[0][2] = s;
      m.elements[2][0] = -s;
      m.elements[2][2] = c;
      Game.MultMatrix(m);*/
  //Set out to a y-axis rotation matrix
  /*	c, 0.0, s, 0.0,
  	  	  0.0, 1.0, 0.0, 0.0,
  	  	  -s, 0.0, c, 0.0,
  	  	  0.0, 0.0, 0.0, 1.0*/
  Yaw : function(out,y){
  	  Matrix.Identity(out);
  	  var c = Math.cos(y);
  	  var s = Math.sin(y);
  	  
	  out.m11 = c;
  	  out.m13 = s;
  	  out.m31 = -s;
  	  out.m33 = c;
  },
  
  //Set out to a z-axis rotation matrix
  /*	c, -s, 0.0, 0.0,
  	  	  s, c, 0.0, 0.0,
  	  	  0.0, 0.0, 1.0, 0.0,
  	  	  0.0, 0.0, 0.0, 1.0*/
  Roll : function(out,z){
  	  var c = Math.cos(z);
  	  var s = Math.sin(z);
  	  Matrix.Identity(out);
  	  out.m11 = c;
  	  out.m12 = -s;
  	  out.m21 = s;
  	  out.m22 = c;
  },
  
  //Combined x,y,z rotations
  Rotation : function(out,x,y,z){
	var cx = Math.cos(x);
	var sx = Math.sin(x);
	var cy = Math.cos(y);
	var sy = Math.sin(y);
	var cz = Math.cos(z);
	var sz = Math.sin(z);
	
	out.m11 = cx*cy;
	out.m21 = cx*sy*sz-sx*cz;
	out.m31 = cx*sy*cz+sx*sz;
	out.m41 = 0.0;
	
	out.m12 = sx*cy;
	out.m22 = sx*sy*sz+cx*cz;
	out.m32 = sx*sy*cz-cx*sz;
	out.m42 = 0.0;
	
	out.m13 = -sy;
	out.m23 = cy*sz;
	out.m33 = cy*cz;
	out.m43 = 0.0;
	
	out.m14 = 0.0;
	out.m24 = 0.0;
	out.m34 = 0.0;
	out.m44 = 1.0;
  },
  
  //Multiply two matrices together and store the results in 'out'
  Multiply : function(out,a,b){
  	  var m11 = a.m11*b.m11 + a.m12*b.m21 + a.m13*b.m31 + a.m14*b.m41;
  	  var m12 = a.m11*b.m12 + a.m12*b.m22 + a.m13*b.m32 + a.m14*b.m42;
  	  var m13 = a.m11*b.m13 + a.m12*b.m23 + a.m13*b.m33 + a.m14*b.m43;
  	  var m14 = a.m11*b.m14 + a.m12*b.m24 + a.m13*b.m34 + a.m14*b.m44;
  	  
  	  var m21 = a.m21*b.m11 + a.m22*b.m21 + a.m23*b.m31 + a.m24*b.m41;
  	  var m22 = a.m21*b.m12 + a.m22*b.m22 + a.m23*b.m32 + a.m24*b.m42;
  	  var m23 = a.m21*b.m13 + a.m22*b.m23 + a.m23*b.m33 + a.m24*b.m43;
  	  var m24 = a.m21*b.m14 + a.m22*b.m24 + a.m23*b.m34 + a.m24*b.m44;
  	  
  	  var m31 = a.m31*b.m11 + a.m32*b.m21 + a.m33*b.m31 + a.m34*b.m41;
  	  var m32 = a.m31*b.m12 + a.m32*b.m22 + a.m33*b.m32 + a.m34*b.m42;
  	  var m33 = a.m31*b.m13 + a.m32*b.m23 + a.m33*b.m33 + a.m34*b.m43;
  	  var m34 = a.m31*b.m14 + a.m32*b.m24 + a.m33*b.m34 + a.m34*b.m44;
  	  
  	  var m41 = a.m41*b.m11 + a.m42*b.m21 + a.m43*b.m31 + a.m44*b.m41;
  	  var m42 = a.m41*b.m12 + a.m42*b.m22 + a.m43*b.m32 + a.m44*b.m42;
  	  var m43 = a.m41*b.m13 + a.m42*b.m23 + a.m43*b.m33 + a.m44*b.m43;
  	  var m44 = a.m41*b.m14 + a.m42*b.m24 + a.m43*b.m34 + a.m44*b.m44;
  	  
  	  out.m11 = m11; out.m12 = m12; out.m13 = m13; out.m14 = m14;
  	  out.m21 = m21; out.m22 = m22; out.m23 = m23; out.m24 = m24;
  	  out.m31 = m31; out.m32 = m32; out.m33 = m33; out.m34 = m34;
  	  out.m41 = m41; out.m42 = m42; out.m43 = m43; out.m44 = m44;
  },
  
  //Transform a vector based on a matrix
  //Vector: [x,y,z,w] (4x1)
  //Matrix: 4x4 Matrix
  //Out: Vector' (transformed vector)
  Transform : function(out,m,v){
  	  var x = v.x*m.m11 + v.y*m.m21 + v.z*m.m31 + v.w*m.m41;
  	  var y = v.x*m.m12 + v.y*m.m22 + v.z*m.m32 + v.w*m.m42;
  	  var z = v.x*m.m13 + v.y*m.m23 + v.z*m.m33 + v.w*m.m43;
  	  var w = v.x*m.m14 + v.y*m.m24 + v.z*m.m34 + v.w*m.m44;
  	  out.x = x;
  	  out.y = y;
  	  out.z = z;
  	  out.w = w;
  },
  
  
  //Create a projection matrix
  //Out: out (matrix to hold the projection matrix)
  //In: near (near-clip plane)
  //In: far (far-clip plane)
  //In: fov (field of view)
  //In: aspect (aspect ratio of the window)
  /*
  e 	0 			0 				0
  0 	e/aspect 	0 				0
  0 	0 			-(far+near)*fn 	-(2*far*near)*fn
  0 	0 			-1.0 			0*/ 
  /*Perspective : function(out,near,far,fov,aspect){
  	  var e = 1.0/Math.tan(fov/2.0);
  	  var fn = 1.0/(far-near);
  	  Matrix.Identity(out);
  	  out.m11 = e;
  	  out.m22 = e/aspect;
  	  out.m33 = -(far+near)*fn;
  	  out.m34 = -(2*far*near)*fn;
  	  out.m43 = -1.0;
  	  out.m44 = 0.0;
  },*/
  
  //Perspective : function(out,near,far,fov,aspect){
  Perspective : function(out,near,far,fov,aspect){
	var ymax = near*Math.tan(fov*Math.PI/360.0);
	var ymin = -ymax;
	var xmax = ymax*aspect;
	var xmin = -xmin;
	
	var deltaX = 2*xmax; //ymin = -ymax; ymax - ymin -> ymax - -(ymax) -> ymax + ymax = 2 * ymax
	var deltaY = 2*ymax;
	var deltaZ = far-near;
	
	var a = 2*near/deltaX;
	var b = 2*near/deltaY;
	var c = -(far+near)/deltaZ;
	var d = (-2*far*near)/deltaZ;
	
	out.m11 = a;	out.m12 = 0;	out.m13 = 0;	out.m14 = 0;
	out.m21 = 0;	out.m22 = b;	out.m23 = 0;	out.m24 = 0;
	out.m31 = 0;	out.m32 = 0;	out.m33 = c;	out.m34 = -1.0;
	out.m41 = 0;	out.m42 = 0;	out.m43 = d;	out.m44 = 0;
  },
  /*
  //Create a perspective matrix
  //Out: ...
  //In: focal point (usually near)
  function mtxPerspective(out,focal){
  	  return [1.0, 0.0, 0.0, 0.0,
  	  	  0.0, 1.0, 0.0, 0.0,
  	  	  0.0, 0.0, 0.0, 0.0,
  	  0.0, 0.0, -1.0/focal, 1.0];
  }*/
  //The normal matrix is the inverse, transpose of the the model-view matrix
  NormalMatrix : function(out,mvm){
	//m11 m22 m33 + m12 m23 m31 + m13 m21 m32 - m11 m23 m32 - m12 m 21 m33 - m13 m22 m31
	
	var determinant = mvm.m11*mvm.m22*mvm.m33 + //m11 m22 m33 +
				mvm.m12*mvm.m23*mvm.m31 + //m12*m23*m31 +
				mvm.m13*mvm.m21*mvm.m32 - //m13 m21 m32 -
				mvm.m11*mvm.m23*mvm.m32 - //m11 m23 m32 -
				mvm.m12*mvm.m21*mvm.m33 -//m12 m21 m33 -
				mvm.m13*mvm.m22*mvm.m31; //m13m22m31
	var invDet = 1.0/determinant;
	var m11 = invDet * (mvm.m22*mvm.m33-mvm.m23*mvm.m32);
	var m21 = invDet * (mvm.m13*mvm.m32-mvm.m12*mvm.m33);
	var m31 = invDet * (mvm.m12*mvm.m23-mvm.m13*mvm.m22);
	var m12 = invDet * (mvm.m23*mvm.m31-mvm.m21*mvm.m33);
	var m22 = invDet * (mvm.m11*mvm.m33-mvm.m13*mvm.m31);
	var m32 = invDet * (mvm.m13*mvm.m21-mvm.m11*mvm.m23);
	var m13 = invDet * (mvm.m21*mvm.m32-mvm.m22*mvm.m31);
	var m23 = invDet * (mvm.m12*mvm.m31-mvm.m11*mvm.m32);
	var m33 = invDet * (mvm.m11*mvm.m22-mvm.m12*mvm.m21);
	out.m11 = m11; out.m12 = m12; out.m13 = m13; out.m14 = 0;
	out.m21 = m21; out.m22 = m22; out.m23 = m23; out.m24 = 0;
	out.m31 = m31; out.m32 = m32; out.m33 = m33; out.m34 = 0;
	out.m41 = 0; out.m42 = 0; out.m43 = 0; out.m44 = 1.0;
  },
  Camera : function(out,position,right,up,look){
  	  out.m11 = right.x; out.m12 = right.y; out.m13 = right.z; out.m14 = 0.0;
  	  out.m21 = up.x; out.m22 = up.y; out.m23 = up.z; out.m24 = 0.0;
  	  out.m31 = look.x; out.m32 = look.y; out.m33 = look.z; out.m34 = 0.0;
  	  out.m41 = -position.x; out.m42 = -position.y; out.m43 = -position.z; out.m44 = 1.0;
  },
  ToArray : function(out,mtx){
	out[0] = mtx.m11;	out[1] = mtx.m12;	out[2] = mtx.m13;	out[3] = mtx.m14;
	out[4] = mtx.m21;	out[5] = mtx.m22;	out[6] = mtx.m23;	out[7] = mtx.m24;
	out[8] = mtx.m31;	out[9] = mtx.m32;	out[10] = mtx.m33;	out[11] = mtx.m34;
	out[12] = mtx.m41;	out[13] = mtx.m42;	out[14] = mtx.m43;	out[15] = mtx.m44;
  },
  ToString : function(mtx){
	return "|" + mtx.m11 + ", " + mtx.m12 + ", " + mtx.m13 + ", " + mtx.m14 + "|\n" +
		"|" + mtx.m21 + ", " + mtx.m22 + ", " + mtx.m23 + ", " + mtx.m24 + "|\n" +
		"|" + mtx.m31 + ", " + mtx.m32 + ", " + mtx.m33 + ", " + mtx.m34 + "|\n" +
		"|" + mtx.m41 + ", " + mtx.m42 + ", " + mtx.m43 + ", " + mtx.m44 + "|\n";
  }
}
  
  
  //----====((((Vector Routines))))====-----------------------------------------
  var Vec = {
	Vector : function(x,y,z){
		this.x = x; this.y = y; this.z = z; this.w = 0.0;
	},
	Vertex : function(x,y,z){
		this.x = x; this.y = y; this.z = z; this.w = 1.0;
	},
	VectorCopy : function(out,v){
		out.x = v.x; out.y = v.y; out.z = v.z; out.w = 0.0;
	},
	VertexCopy : function(out,v){
		out.x = v.x; out.y = v.y; out.z = v.z; out.w = 1.0;
	},
	CopyConstructor : function(v){
		this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w;	
	},
	Copy : function(out,v){
		out.x = v.x; out.y = v.y; out.z = v.z; out.w = v.w;
	},
	DotProduct : function(a,b){
		return a.x*b.x + a.y*b.y + a.z*b.z;
	},
	MagnitudeSquared : function(v){
		return v.x*v.x + v.y*v.y + v.z*v.z;
	},
	Magnitude : function(v){
		return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
	},
	ScalarMultiply : function(out,s,v){
		out.x = s*v.x; out.y = s*v.y; out.z = s*v.z;	
	},
	Normalize : function(v){
		var n = 1.0/this.Magnitude(v);
		this.ScalarMultiply(v,n,v);
	},
	Add : function(out,a,b){
		out.x = a.x+b.x; out.y = a.y+b.y; out.z = a.z+b.z;
	},
	Sub : function(out,a,b){
		out.x = a.x-b.x; out.y = a.y-b.y; out.z = a.z-b.z;
	},
	CrossProduct : function(out,a,b){
		var x = a.y*b.z - a.z*b.y;
		var y = a.z*b.x - a.x*b.z;
		var z = a.x*b.y - a.y*b.x;
		out.x = x;
		out.y = y;
		out.z = z;
	}
  }
  //----====((((Quad routines))))====-------------------------------------------
  var Quad = {
	quad : function(p0,p1,p2,p3,normal,color){
	  this.p0 = p0;
  	  this.p1 = p1;
  	  this.p2 = p2;
  	  this.p3 = p3;
  	  this.normal = normal;
  	  this.color = color;
	  this.centroid = new Vec.Vertex(0.0,0.0,0.0);
	  Quad.Centroid(this.centroid,this);
	},
	Default : function(){
		this.p0 = new Vec.Vertex(-1.0,1.0,0.0);
		this.p1 = new Vec.Vertex(1.0,1.0,0.0);
		this.p2 = new Vec.Vertex(1.0,-1.0,0.0);
		this.p3 = new Vec.Vertex(-1.0,-1.0,0.0);
		this.normal = new Vec.Vector(0.0,0.0,1.0);
		this.color = new Color.color(1.0,1.0,1.0,1.0);
		this.centroid = new Vec.Vertex(0.0,0.0,0.0);
		Quad.Centroid(this.centroid,this);
	},
	Copy : function(out,q){
		Vec.VertexCopy(out.p0,q.p0);
		Vec.VertexCopy(out.p1,q.p1);
		Vec.VertexCopy(out.p2,q.p2);
		Vec.VertexCopy(out.p3,q.p3);
		Vec.VectorCopy(out.normal,q.normal);
		Color.Copy(out.color,q.color);
		Vec.VertexCopy(out.centroid,q.centroid);
	},
	CopyConstructor : function(q){
		this.p0 = new Vec.CopyConstructor(q.p0);
		this.p1 = new Vec.CopyConstructor(q.p1);
		this.p2 = new Vec.CopyConstructor(q.p2);
		this.p3 = new Vec.CopyConstructor(q.p3);
		this.normal = new Vec.CopyConstructor(q.normal);
		this.color = new Color.color(q.color.r,q.color.g,q.color.b,q.color.a);
		this.centroid = new Vec.CopyConstructor(q.centroid);
	},
	
	NoReference : function(p0,p1,p2,p3,normal,color){
		this.p0 = new Vec.CopyConstructor(p0);
		this.p1 = new Vec.CopyConstructor(p1);
		this.p2 = new Vec.CopyConstructor(p2);
		this.p3 = new Vec.CopyConstructor(p3);
		this.normal = new Vec.CopyConstructor(normal);
		this.color = new Color.CopyConstructor(color);
		this.centroid = new Vec.Vertex(0.0,0.0,0.0);
		Quad.Centroid(this.centroid,this);
	},
	Centroid : function(out,q){
  	  Vec.VectorCopy(out,q.p0); //center point is (q0+q1+q2+q3)/4
  	  Vec.Add(out,out,q.p1);
  	  Vec.Add(out,out,q.p2);
  	  Vec.Add(out,out,q.p3);
  	  Vec.ScalarMultiply(out,0.25,out); //divide the whole thing by 4
	},
	Transform : function(out,mtx,qd){
		Matrix.Transform(out.p0,mtx,qd.p0);
		Matrix.Transform(out.p1,mtx,qd.p1);
		Matrix.Transform(out.p2,mtx,qd.p2);
		Matrix.Transform(out.p3,mtx,qd.p3);
		Matrix.Transform(out.normal,mtx,qd.normal);
		Matrix.Transform(out.centroid,mtx,qd.centroid);
		Vec.Normalize(out.normal,out.normal);
		Color.Copy(out.color,qd.color);
	},
	//convert a quad into four sub-divisions of that quad
	Subdivide : function(out0,out1,out2,out3,q){
		//0 a 1
		//b c d
		//3 e 2
		//[0,a,c,b],[a,1,d,c],[b,c,e,3],[c,d,2,e]
		Color.Copy(out0.color,q.color);
		Color.Copy(out1.color,q.color);
		Color.Copy(out2.color,q.color);
		Color.Copy(out3.color,q.color);
		
		Vec.VectorCopy(out0.normal,q.normal);
		Vec.VectorCopy(out1.normal,q.normal);
		Vec.VectorCopy(out2.normal,q.normal);
		Vec.VectorCopy(out3.normal,q.normal);
	
		var a = new Vec.Vertex((q.point0.x+q.point1.x)/2.0,(q.point0.y+q.point1.y)/2.0,(q.point0.z+q.point1.z)/2.0);
		var b = new Vec.Vertex((q.point0.x+q.point3.x)/2.0,(q.point0.y+q.point3.y)/2.0,(q.point0.z+q.point3.z)/2.0);
		var c = new Vec.Vertex(0.0,0.0,0.0);
		Quad.Centroid(c,q);
		var d = new Vec.Vertex((q.point1.x+q.point2.x)/2.0,(q.point1.y+q.point2.y)/2.0,(q.point1.z+q.point2.z)/2.0);
		var e = new Vec.Vertex((q.point3.x+q.point2.x)/2.0,(q.point3.y+q.point2.y)/2.0,(q.point3.z+q.point2.z)/2.0);
	
		//out0
		Vec.VertexCopy(out0.point0,q.point0);
		Vec.VertexCopy(out0.point1,a);
		Vec.VertexCopy(out0.point2,c);
		Vec.VertexCopy(out0.point3,b);
	
		//out1
		Vec.VertexCopy(out1.point0,a);
		Vec.VertexCopy(out1.point1,q.point1);
		Vec.VertexCopy(out1.point2,d);
		Vec.VertexCopy(out1.point3,c);
	
		//out2
		Vec.VertexCopy(out2.point0,c);
		Vec.VertexCopy(out2.point1,d);
		Vec.VertexCopy(out2.point2,q.point2);
		Vec.VertexCopy(out2.point3,e);
	
		//out3
		Vec.VertexCopy(out3.point0,b);
		Vec.VertexCopy(out3.point1,c);
		Vec.VertexCopy(out3.point2,e);
		Vec.VertexCopy(out3.point3,q.point3);
	},
	GenerateNormal : function(q){
		var a = new Vec.Vector(q.p1.x-q.p0.x, q.p1.y-q.p0.y, q.p1.z-q.p0.z);
		var b = new Vec.Vector(q.p3.x-q.p0.x, q.p3.y-q.p0.y, q.p3.z-q.p0.z);
		var normal = new Vec.Vector(0.0,0.0,0.0);
		Vec.CrossProduct(normal,b,a);
		Vec.Normalize(normal);
		q.normal = normal;
	}
  }
 
  //----====((((Sphere Routines))))====-----------------------------------------
  //Create a new sphere
  var Sphere = {
	_tempVector : new Vec.Vector(0.0,0.0,0.0),
	sphere : function(x,y,z,radius){
		this.x = x;
		this.y = y;
		this.z = z;
		this.radius = radius;
	},
	SphereIntersection : function(A,B){
		//var sepAxis = new Vec.Vector(A.x-B.x,A.y-B.y,A.z-B.z);
		Vec.Sub(Sphere._tempVector,A,B);
		var radiiSum = A.radius+B.radius;
		if(Vec.MagnitudeSquared(Sphere._tempVector) < (radiiSum*radiiSum)) { return true; }
		else { return false; }
	},
	PointIntersection : function(s,p){
		Vec.Sub(Sphere._tempVector,s,p);
		if(Vec.MagnitudeSquared(Sphere._tempVector) < s.radius*s.radius) { return true; }
		else { return false; }
	}
  }
  
  //----====((((Color Routines))))====------------------------------------------
  var Color = {
	color : function(r,g,b,a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	},
	Copy : function(out,c){
		out.r = c.r;
		out.g = c.g;
		out.b = c.b;
		out.a = c.a;
	},
	CopyConstructor : function(c){
		this.r = c.r;
		this.g = c.g;
		this.b = c.b;
		this.a = c.a;
	},
	Multiply : function(out,s,c){
		out.r = s*c.r;
		out.g = s*c.g;
		out.b = s*c.b;
		out.a = c.a;
	},
	ToString : function(c){
		return 'rgb('+Math.floor(c.r*255.0)+','+Math.floor(c.g*255.0)+','+Math.floor(c.b*255.0)+')';
	},
	Red : function(){ return new Color.color(1.0, 0.0, 0.0, 0.0); },
	Green : function() { return new Color.color(0.0, 1.0, 0.0, 0.0); },
	Blue : function() { return new Color.color(0.0, 0.0, 1.0, 0.0); },
	Purple : function() { return new Color.color(1.0, 0.0, 1.0, 0.0); },
	Turquoise : function() { return new Color.color(0.0, 1.0, 1.0, 0.0); },
	Yellow : function() { return new Color.color(1.0, 1.0, 0.0, 0.0); },
	White : function() { return new Color.color(1.0, 1.0, 1.0,0.0); },
	Black : function() { return new Color.color(0.0, 0.0, 0.0,0.0); }
  }

  //----====((((Plane Routines))))====------------------------------------------
  function plane(normal,point){
  	  this.a = normal.x;
  	  this.b = normal.y;
  	  this.c = normal.z;
  	  this.d = -(normal.x*point.x + normal.y*point.y + normal.z*point.z);
  }
  
  function planeGetNormal(out,plane0){
  	  out.x = plane0.a;
  	  out.y = plane0.b;
  	  out.z = plane0.c;
  }
  
  function planeVectorIntersection(plane0,point,point2){
  	  var delta = new vector(point.x-point2.x,point.y-point2.y,point.z-point2.z);
  	  var d = plane0.a*delta.x + plane0.b*delta.y + plane0.c*delta.z;
  	  if(d != 0.0){	//vector is not parallel to the plane
  	  	  var t = -(plane0.a*point.x + plane0.b*point.y + plane0.c*point.z + plane0.d)/d;
  	  	  vecScalarMultiply(delta,t,delta);
  	  	  vecSub(delta,point2,delta);
  	  	  return delta;
  	  }else{ return new vector(point.x,point.y,point.z); }
  }
  
  //Determine whether a point is 'outside' (the side where the normal points) or 'inside'
  function planeIsOutside(plane0,point){
  	  if(plane0.a*point.x + plane0.b*point.y + plane0.c*point.z >= plane0.d) { return true; }
  	  else { return false; }
  }
  
  function planeQuadIntersection(plane0,quad0){
  	  var t0 = planeIsOutside(plane0,quad0.p0);
  	  var t1 = planeIsOutside(plane0,quad0.p1);
  	  var t2 = planeIsOutside(plane0,quad0.p2);
  	  var t3 = planeIsOutside(plane0,quad0.p3);
  	  if(t0 == t1 && t2==t3 && t0==t2) { return false; }
  	  else { return true; }
  }
  
  //Return whether this quad is behind the plane (useful in culling)
  function planeIsInFrontOfQuad(plane0,quad0){
	var t0 = planeIsOutside(plane0,quad0.p0);
	var t1 = planeIsOutside(plane0,quad0.p1);
	var t2 = planeIsOutside(plane0,quad0.p2);
	var t3 = planeIsOutside(plane0,quad0.p3);
	if(t0 || t1 || t2 || t3) { return true;}
	else { return false }
  }
  
  //If the quad is split, it will modify quad1, and modify 'quad' appropriately
  //return values:
  // 0 : clipped
  // 1 : clipped and added polygon
  // 2 : all points are in front of the plane
  // 3 : all points are behind the plane
  function planeQuadClip(plane0,quad0,quad1){
  	  var t0 = planeIsOutside(plane0,quad0.p0);
  	  var t1 = planeIsOutside(plane0,quad0.p1);
  	  var t2 = planeIsOutside(plane0,quad0.p2);
  	  var t3 = planeIsOutside(plane0,quad0.p3);
  	  
  	  //Count the number of points that are outside the plane
  	  //('inside' would mean that the point is behind us)
  	  var outside = 0;
  	  if(t0 == true) { outside+=1; }
  	  if(t1 == true) { outside+=2; }
  	  if(t2 == true) { outside+=4; }
  	  if(t3 == true) { outside+=8; }

  	  switch(outside){
  	  case 0: return 3; break; //all points are behind the plane
  	  //only 1 vertice is outside
  	  case 1: 
  	  	  quad0.p1 = planeVectorIntersection(plane0,quad0.p0,quad0.p1);
  	  	  quad0.p2 = planeVectorIntersection(plane0,quad0.p0,quad0.p3);
  	  	  vecCopy(quad0.p3,quad0.p0);
  	  	  return 0;
		break;
  	  case 2:
  	  	  quad0.p0 = planeVectorIntersection(plane0,quad0.p1,quad0.p0);
  	  	  quad0.p2 = planeVectorIntersection(plane0,quad0.p1,quad0.p2);
  	  	  vecCopy(quad0.p3,quad0.p0);
  	  	  return 0;
		break;
  	  case 4:
  	  	  quad0.p1 = planeVectorIntersection(plane0,quad0.p2,quad0.p1);
  	  	  quad0.p3 = planeVectorIntersection(plane0,quad0.p2,quad0.p3);
  	  	  vecCopy(quad0.p0,quad0.p3);
  	  	  return 0;
		break;
  	  case 8:
  	  	  quad0.p0 = planeVectorIntersection(plane0,quad0.p3,quad0.p0);
  	  	  quad0.p2 = planeVectorIntersection(plane0,quad0.p3,quad0.p2);
  	  	  vecCopy(quad0.p1,quad0.p0);
  	  	  return 0;
		break;
  	  //two vertices are outside
  	  case 3: //0,1
  	  	  quad0.p3 = planeVectorIntersection(plane0,quad0.p0,quad0.p3);
  	  	  quad0.p2 = planeVectorIntersection(plane0,quad0.p1,quad0.p2);
  	  	  return 0;
		break;
  	  //case 5: //0,2 (!?)
  	  case 6: //1,2
  	  	  quad0.p0 = planeVectorIntersection(plane0,quad0.p1,quad0.p0);
  	  	  quad0.p3 = planeVectorIntersection(plane0,quad0.p2,quad0.p3);
  	  	  return 0;
		break;
  	  case 9: //0,3
  	  	  quad0.p1 = planeVectorIntersection(plane0,quad0.p0,quad0.p1);
  	  	  quad0.p2 = planeVectorIntersection(plane0,quad0.p3,quad0.p2);
  	  	  return 0;
		break;
  	  //case 10: //1,3 (!?)
  	  case 12: //2,3
  	  	  quad0.p0 = planeVectorIntersection(plane0,quad0.p3,quad0.p0);
  	  	  quad0.p1 = planeVectorIntersection(plane0,quad0.p2,quad0.p1);
  	  	  return 0;
  	  	  break;
  	  //three vertices are outside
  	  case 7: //0,1,2 -> 3 is behind
  	  	  var ap = planeVectorIntersection(plane0,quad0.p0,quad0.p3);
  	  	  var bp = planeVectorIntersection(plane0,quad0.p2,quad0.p3);
  	  	  //polygon
  	  	  Vec.Copy(quad1.p0,quad0.p0);
  	  	  Vec.Copy(quad1.p1,ap);
  	  	  Vec.Copy(quad1.p2,quad0.p1);
  	  	  Vec.Copy(quad1.p3,quad1.p0);
  	  	  //quad
  	  	  quad0.p0 = ap;
  	  	  quad0.p3 = bp;
  	  	  return 1;
		break;
  	  case 11: //0,1,3 -> 2 is behind
  	  	  var ap = planeVectorIntersection(plane0,quad0.p3,quad0.p2);
  	  	  var bp = planeVectorIntersection(plane0,quad0.p1,quad0.p2);
  	  	  //polygon
  	  	  vecCopy(quad1.p0,quad0.p0);
  	  	  vecCopy(quad1.p1,quad0.p3);
  	  	  vecCopy(quad1.p2,ap);
  	  	  vecCopy(quad1.p3,quad1.p0);
  	  	  //quad
  	  	  quad0.p2 = bp;
  	  	  quad0.p3 = ap;
  	  	  return 1;
		break;
  	  case 13: //0,2,3 -> 1 is behind
  	  	  var ap = planeVectorIntersection(plane0,quad0.p2,quad0.p1);
  	  	  var bp = planeVectorIntersection(plane0,quad0.p0,quad0.p1);
  	  	  //polygon
  	  	  Vec.Copy(quad1.p0,quad0.p3);
  	  	  Vec.Copy(quad1.p1,quad0.p2);
  	  	  Vec.Copy(quad1.p2,ap);
  	  	  Vec.Copy(quad1.p3,quad1.p0);
  	  	  //quad
  	  	  quad0.p1 = bp;
  	  	  quad0.p2 = ap;
  	  	  return 1;
		break;
  	  case 14: //1,2,3 -> 0 is behind
  	  	  var ap = planeVectorIntersection(plane0,quad.p1,quad0.p0);
  	  	  var bp = planeVectorIntersection(plane0,quad0.p3,quad0.p0);
  	  	  //polygon
  	  	  Vec.Copy(quad1.p0,quad0.p2);
  	  	  Vec.Copy(quad1.p1,quad0.p1);
  	  	  Vec.Copy(quad1.p2,ap);
  	  	  Vec.Copy(quad1.p3,quad1.p0);
  	  	  //quad
  	  	  quad.p0 = bp;
  	  	  quad.p1 = ap;
		  return 1;
  	  case 15:
  	  default: return 2; break; //all points are in front of the camera
  	  }
	  return 3;
  }
  
