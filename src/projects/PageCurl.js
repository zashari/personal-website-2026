// The turning page of the /home work book, drawn in three.js so it can really bend. Book.jsx keeps every page as
// live HTML; only while a leaf is in the air does it hide that leaf and ask this to draw it instead, from images of
// its two pages (rasterised once by Book.jsx).
//
// Units are CSS px. The camera reproduces the book's CSS perspective (distance and perspective-origin), so a page
// lying flat lands on exactly the pixels the HTML page covers, and the hand-over at either end of a turn is seamless.
//
// The bend: a page leaves the spine at angle theta and curls by a constant curvature c along its width, so the point
// at s (0 at the spine, 1 at the free edge) points along phi(s) = theta - c * s and sits at the integral of
// (cos phi, sin phi) from 0 to s: an arc of a circle. c peaks mid-turn and is 0 at rest, so the page lies flat at both
// ends; theta is kept so that every phi stays within [0, pi] and the page never dips below the book.
import {
  Camera,
  CanvasTexture,
  DoubleSide,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';

const SEGMENTS = 64; // across the page; the page is straight top to bottom, so one row is enough
const CURL = 1.15; // curvature at mid-turn, in radians over the page width

const VERTEX = `
uniform float uTheta;
uniform float uCurl;
uniform vec2 uSpine;
uniform vec2 uPage;
varying vec2 vUv;
varying float vPhi;

void main() {
  vUv = uv;
  float s = uv.x;
  float phi = uTheta - uCurl * s;
  vec2 xz = abs(uCurl) < 1e-4
    ? vec2(cos(uTheta), sin(uTheta)) * s
    : vec2(sin(uTheta) - sin(phi), cos(phi) - cos(uTheta)) / uCurl;
  vPhi = phi;
  vec3 p = vec3(uSpine.x + xz.x * uPage.x, uSpine.y + uv.y * uPage.y, xz.y * uPage.x);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;

// The front is the right page of the spread being left, the back the left page of the next (mirrored, since it is
// seen from behind). Each side is lit by how squarely it faces the reader, so the page darkens as it stands up.
const FRAGMENT = `
uniform sampler2D uFront;
uniform sampler2D uBack;
varying vec2 vUv;
varying float vPhi;

void main() {
  float facing = cos(vPhi);
  vec3 colour;
  float light;
  if (gl_FrontFacing) {
    colour = texture2D(uFront, vUv).rgb;
    light = 0.58 + 0.42 * max(facing, 0.0);
  } else {
    colour = texture2D(uBack, vec2(1.0 - vUv.x, vUv.y)).rgb;
    light = 0.58 + 0.42 * max(-facing, 0.0);
  }
  gl_FragColor = vec4(colour * light, 1.0);
}`;

export default class PageCurl {
  constructor(canvas) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new Scene();
    this.camera = new Camera();
    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: DoubleSide,
      uniforms: {
        uTheta: { value: 0 },
        uCurl: { value: 0 },
        uSpine: { value: new Vector2() },
        uPage: { value: new Vector2(1, 1) },
        uFront: { value: null },
        uBack: { value: null },
      },
    });
    this.mesh = new Mesh(new PlaneGeometry(1, 1, SEGMENTS, 1), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.textures = [];
    this.drawn = false;
  }

  // stage: the canvas size; book: the book's box inside it; perspective and origin as the book's CSS computes them.
  layout({ stage, book, perspective, origin }) {
    this.renderer.setSize(stage.width, stage.height, false);
    const ox = book.left + origin.x;
    const oy = book.top + origin.y;
    // World: x right and y up from the perspective origin on the book's plane, z toward the reader.
    const near = 10;
    const k = near / perspective;
    this.camera.position.set(0, 0, perspective);
    this.camera.updateMatrixWorld();
    this.camera.projectionMatrix.makePerspective(
      -ox * k,
      (stage.width - ox) * k,
      oy * k,
      -(stage.height - oy) * k,
      near,
      perspective * 4
    );
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
    const u = this.material.uniforms;
    u.uSpine.value.set(book.left + book.width / 2 - ox, oy - (book.top + book.height));
    u.uPage.value.set(book.width / 2, book.height);
  }

  setLeaf(index, front, back) {
    this.textures[index]?.forEach((t) => t.dispose());
    const make = (canvas) => {
      const texture = new CanvasTexture(canvas);
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      return texture;
    };
    this.textures[index] = [make(front), make(back)];
  }

  has(index) {
    return Boolean(this.textures[index]);
  }

  // Draws leaf `index` turned by t (0 flat on the right, 1 flat on the left). Returns false when it cannot.
  draw(index, t) {
    const pair = this.textures[index];
    if (!pair) return false;
    const c = CURL * Math.sin(Math.PI * t);
    const u = this.material.uniforms;
    u.uCurl.value = c;
    u.uTheta.value = Math.min(Math.max(Math.PI * t + c / 2, c), Math.PI);
    u.uFront.value = pair[0];
    u.uBack.value = pair[1];
    this.renderer.render(this.scene, this.camera);
    this.drawn = true;
    return true;
  }

  clear() {
    if (!this.drawn) return;
    this.renderer.clear();
    this.drawn = false;
  }

  dispose() {
    this.textures.forEach((pair) => pair?.forEach((t) => t.dispose()));
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
