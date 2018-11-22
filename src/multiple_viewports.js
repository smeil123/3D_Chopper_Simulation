function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.enable(gl.DEPTH_TEST);
	init_vbo(gl);

	var	w = canvas.width;
	var	h = canvas.height;
  	var currentAngle = 0.0;

    var loc_MVP = gl.getUniformLocation(gl.program, 'uMVP');
	var	MVP = new Matrix4();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



	// 주기적으로 호출하는 부분
	var tick = function(){
	    currentAngle = animate(currentAngle); // angle값 계산
	    // handleKeys(); // 키입력값으로 angle,transpose값을 계산
	    modelMatrix = draw(gl,w,h,currentAngle,MVP,loc_MVP);
	    // 웹브라우저가 1초에 60번정도 호출해준다(단, 현재페이지가 보이지 않는경우에는 호출되지 않는다)
	    requestAnimationFrame(tick,canvas); // tick을 주기적으로 호출
	};
	tick();

}

function init_vbo(gl)
{
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
    var attribs = new Float32Array([
		0.7,  0.7,  0.7,     1.0,  1.0,  1.0,  // v0 White
	    -0.7,  0.7,  0.7,     1.0,  0.0,  1.0,  // v1 Magenta
	    -0.7, -0.7,  0.7,     1.0,  0.0,  0.0,  // v2 Red
	     0.7, -0.7,  0.7,     1.0,  1.0,  0.0,  // v3 Yellow
	     0.7, -0.7, -0.7,     0.0,  1.0,  0.0,  // v4 Green
	     0.7,  0.7, -0.7,     0.0,  1.0,  1.0,  // v5 Cyan
	    -0.7,  0.7, -0.7,     0.0,  0.0,  1.0,  // v6 Blue
	    -0.7, -0.7, -0.7,     0.0,  0.0,  0.0,   // v7 Black
	    // 프로펠러 
		 2.0,  1.0,  0.4,     0.0, 0.0, 1.0,	//v0
		-2.0,  1.0,  0.4,     1.0, 1.0, 1.0,	//v1
		-2.0,  0.7,  0.4,     1.0, 0.0, 0.0,	//v2
		 2.0,  0.7,  0.4,     0.0, 0.0, 1.0,	//v3		
		 2.0,  0.7, -0.4,     0.0, 1.0, 0.0,	//v4		
		 2.0,  1.0, -0.4,     0.0, 1.0, 0.0,	//v5		
		-2.0,  1.0, -0.4,     1.0, 0.0, 0.0,	//v6
		-2.0,  0.7, -0.4,     1.0, 0.0, 0.0,	//v7
		// 바닥
	    -5.0,  0.0, -4.0,     1.0, 0.0, 0.0,
		 5.0,  0.0, -4.0,     0.0, 1.0, 0.0,
		 5.0,  0.0,  4.0,     0.0, 0.0, 1.0,
		-5.0,  0.0,  4.0,     1.0, 1.0, 1.0,		
	]);
	
	//  v2------v3
	// Indices of the vertices
	// 12개의 triangle을 정의
	var indices = new Uint8Array([
	    0, 1, 2,   0, 2, 3,    // front
	    0, 3, 4,   0, 4, 5,    // right
	    0, 5, 6,   0, 6, 1,    // up
	    1, 6, 7,   1, 7, 2,    // left
	    7, 4, 3,   7, 3, 2,    // down
	    4, 7, 6,   4, 6, 5,     // back
	    
	    0+8, 1+8, 2+8,   0+8, 2+8, 3+8,    // front
	    0+8, 3+8, 4+8,   0+8, 4+8, 5+8,    // right
	    0+8, 5+8, 6+8,   0+8, 6+8, 1+8,    // up
	    1+8, 6+8, 7+8,   1+8, 7+8, 2+8,    // left
	    7+8, 4+8, 3+8,   7+8, 3+8, 2+8,    // down
	    4+8, 7+8, 6+8,   4+8, 6+8, 5+8,     // back
	 ]);

	// Create a buffer object
    var vbo = gl.createBuffer();
	var indexBuffer = gl.createBuffer();
	if (!vbo || !indexBuffer) {
	  return -1;
	}

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
    
    FSIZE = attribs.BYTES_PER_ELEMENT;

    var loc_Position = gl.getAttribLocation(gl.program, 'aPosition');
	gl.vertexAttribPointer(loc_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
	gl.enableVertexAttribArray(loc_Position);

    var loc_Color = gl.getAttribLocation(gl.program, 'aColor');
	gl.vertexAttribPointer(loc_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
	gl.enableVertexAttribArray(loc_Color);

	// Write the indices to the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return;
}
var FSIZE;
function draw(gl,w,h,currentAngle,MVP,loc_MVP){
  //z축을 기준으로 currentAngle만큼 회전
	gl.clear(gl.COLOR_BUFFER_BIT);

	//왼쪽 viewport
	gl.viewport(0, 0, w/2, h);

	// 헬리콥터
  	// angle = 30, near = 1, far = 100
  	MVP.setPerspective(30, w/(2*h), 1, 100);

  	// calculate the view matrix and projection matrix
  	// eye point / look-at point/ up direction
  	// eye point z를 가까이하면 오브젝트와 가까워진다
	MVP.lookAt(0, 12, 19, 0, 3.4, 0, 0, 1, 0);
	MVP.translate(0,5,0);

	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
	//몸통
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
	// 프로펠러
	var p_modelMatrix = new Matrix4();
	p_modelMatrix.set(MVP);
	p_modelMatrix.rotate(currentAngle,0,1,0);
	gl.uniformMatrix4fv(loc_MVP,false,p_modelMatrix.elements);	
	//gl.drawArrays(gl.TRIANGLE_FAN,12,4);
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 36);

	// 바닥
  	MVP.setPerspective(30, w/(2*h), 1, 100);
	MVP.lookAt(0, 12, 19, 0, 3.4, 0, 0, 1, 0);
	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
	gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);

  // //헬리콥터 몸체
  // if(change_angle){
  //   modelMatrix.rotate(bodyAngle,0,0,1);
  //   change_angle = false;
  // }else if(change_trans){
  //   modelMatrix.translate(0,current_ty,0);    
  //   change_trans = false;
  //  }	

  	//오른쪽 viewport ---------------
	gl.viewport(w/2, 0, w/2, h);
	MVP.setPerspective(30, 1, 1, 100);
  	MVP.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);

	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);

	return MVP;
}

var g_last = Date.now();
var ANGLE_STEP = 45.0;
function animate(angle){
  var now = Date.now();
  var elapsed = now - g_last; //바로 직전에 그린때와 시간차이를 구해서 angle을 계산
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 100.0;
  return newAngle %= 360;
}
