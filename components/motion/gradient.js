// Flowing simplex-noise gradient adapted from the supplied Velaris component.
const vertexSource = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3  u_colors[4];
uniform vec3  u_bg;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;
  p.x *= ratio;

  float t = u_time * 0.1;

  float n1 = snoise(p * 0.4 + vec2(t * 0.2, -t * 0.3));
  float n2 = snoise(p * 0.55 + vec2(-t * 0.15, t * 0.25) + n1 * 0.25);
  float n3 = snoise(p * 0.75 + vec2(t * 0.1, -t * 0.2) + n2 * 0.2);

  vec3 col = u_bg;
  
  float dist = length(p) * 1.5;
  float vignette = 1.0 - smoothstep(0.3, 1.2, dist);
  
  col = mix(col, u_colors[0], smoothstep(-0.2, 0.5, n1) * 0.85);
  col = mix(col, u_colors[1], smoothstep(-0.1, 0.6, n2) * 0.7);
  col = mix(col, u_colors[2], smoothstep(-0.3, 0.4, n3) * 0.6);
  col = mix(col, u_colors[3], smoothstep(0.0, 0.7, n1 * n2) * 0.5);

  float glow = smoothstep(0.8, 0.0, dist) * 0.3;
  col = mix(col, u_colors[1], glow * 0.3);

  col = mix(u_bg, col, 0.35 + vignette * 0.65);

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.1;

  gl_FragColor = vec4(col, 1.0);
}
`;

function rgb(hex) {
 return [1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255);
}

function createPipeline(gl) {
 const shaders=[];
 let program;
 let buffer;
 try {
  for(const [type,source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]){
   const shader=gl.createShader(type);
   if(!shader) throw new Error('Shader unavailable');
   shaders.push(shader);
   gl.shaderSource(shader,source);
   gl.compileShader(shader);
   if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
  }
  program=gl.createProgram();
  if(!program) throw new Error('Program unavailable');
  shaders.forEach(shader=>gl.attachShader(program,shader));
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Program linking failed');
  gl.useProgram(program);
  buffer=gl.createBuffer();
  if(!buffer) throw new Error('Buffer unavailable');
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  return {
   res:gl.getUniformLocation(program,'u_resolution'),
   time:gl.getUniformLocation(program,'u_time'),
   grain:gl.getUniformLocation(program,'u_grain'),
   colors:gl.getUniformLocation(program,'u_colors[0]'),
   bg:gl.getUniformLocation(program,'u_bg')
  };
 } catch {
  if(buffer) gl.deleteBuffer(buffer);
  if(program) gl.deleteProgram(program);
  return null;
 } finally {
  shaders.forEach(shader=>gl.deleteShader(shader));
 }
}

export function initLivingGradients() {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-living-gradient]').forEach(section=>{
  const canvas=section.querySelector('canvas');
  const seed=section.dataset.livingGradient==='statement'?42:7;
  let gl;
  let pipeline;
  let initialized=false;
  let visible=false;
  let lost=false;
  let frame=0;
  let lastTime=0;
  let elapsed=0;

  const stop=()=>{
   cancelAnimationFrame(frame);
   frame=0;
   lastTime=0;
  };
  const fallback=()=>{
   stop();
   canvas.hidden=true;
   section.dataset.gradientState='fallback';
  };
  const draw=()=>{
   if(!pipeline||lost||!canvas.width||!canvas.height) return;
   gl.uniform1f(pipeline.time,(reduced.matches?0:elapsed)*2+seed);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  };
  const render=timestamp=>{
   frame=0;
   if(!visible||document.hidden||reduced.matches||lost||!pipeline) return;
   if(!lastTime||timestamp-lastTime>=1000/30){
    if(lastTime) elapsed+=Math.min((timestamp-lastTime)/1000,.1);
    lastTime=timestamp;
    draw();
   }
   frame=requestAnimationFrame(render);
  };
  const resume=()=>{
   if(pipeline&&visible&&!document.hidden&&!reduced.matches&&!lost&&!frame) frame=requestAnimationFrame(render);
  };
  const palette=()=>{
   if(!pipeline||lost) return;
   const style=getComputedStyle(section);
   gl.uniform3fv(pipeline.bg,new Float32Array(rgb(style.getPropertyValue('--gradient-background').trim())));
   gl.uniform3fv(pipeline.colors,new Float32Array([1,2,3,4].flatMap(index=>rgb(style.getPropertyValue(`--gradient-color-${index}`).trim()))));
   gl.uniform1f(pipeline.grain,.18);
   draw();
  };
  const resize=()=>{
   if(!pipeline||lost) return;
   const rect=section.getBoundingClientRect();
   const scale=Math.min(devicePixelRatio||1,1.25,1600/Math.max(rect.width,1));
   const width=Math.max(1,Math.round(rect.width*scale));
   const height=Math.max(1,Math.round(rect.height*scale));
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
   gl.viewport(0,0,width,height);
   gl.uniform2f(pipeline.res,width,height);
   draw();
  };
  const initialize=()=>{
   if(initialized) return;
   initialized=true;
   try {gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});} catch {fallback();return;}
   if(!gl){fallback();return;}
   pipeline=createPipeline(gl);
   if(!pipeline){fallback();return;}
   palette();
   resize();
   section.dataset.gradientState='ready';
   if('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
   else window.addEventListener('resize',resize);
   new MutationObserver(palette).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  };

  if('IntersectionObserver' in window){
   new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){initialize();draw();resume();} else stop();
   },{rootMargin:'120px'}).observe(section);
  } else {visible=true;initialize();resume();}
  reduced.addEventListener('change',()=>{stop();draw();resume();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else resume();});
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',resume);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;fallback();});
  canvas.addEventListener('webglcontextrestored',()=>{
   lost=false;
   pipeline=createPipeline(gl);
   if(!pipeline){fallback();return;}
   palette();
   resize();
   canvas.hidden=false;
   section.dataset.gradientState='ready';
   resume();
  });
 });
}
