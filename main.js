import * as THREE from 'three';
import { gsap } from 'gsap';
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const video1 = document.createElement('video');
video1.src = './video1.mp4';
video1.loop = true;
video1.muted = true;
video1.autoplay = true;
video1.play();

const video2 = document.createElement('video');
video2.src = './video2.mp4';
video2.loop = true;
video2.muted = true;
video2.autoplay = true;
video2.play();
const scrollMessage = document.createElement('div');
scrollMessage.textContent = 'Scroll to Reveal';
scrollMessage.style.position = 'absolute';
scrollMessage.style.top = '50%';
scrollMessage.style.left = '50%';
scrollMessage.style.transform = 'translate(-50%, -50%)';
scrollMessage.style.color = 'white';
scrollMessage.style.fontFamily = 'Copperplate, serif';
scrollMessage.style.fontSize = '24px';
scrollMessage.style.background = 'rgba(0, 0, 0, 0.5)';
scrollMessage.style.padding = '10px 20px';
scrollMessage.style.borderRadius = '8px';
scrollMessage.style.textAlign = 'center';
scrollMessage.style.zIndex = '1000';
scrollMessage.style.pointerEvents = 'none';

document.body.appendChild(scrollMessage);

const texture1 = new THREE.VideoTexture(video1);
const texture2 = new THREE.VideoTexture(video2);

const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    //hello
    fragmentShader: `
    uniform sampler2D t1;
    uniform sampler2D t2;
    uniform float imageprogress;
    uniform vec2 u_resolution;
    uniform float u_time;
    varying vec2 vUv;

    // Optional distortion functions (can keep or remove depending on desired effect)
    vec2 mirrorRepeat(vec2 uv) {
        return abs(mod(uv, 2.0) - 1.0);
    }

    vec2 sineDistortion(vec2 uv, float time) {
        float frequency = 0.5;
        float amplitude = 0.009;
        uv.x += amplitude * sin(frequency * uv.y + time);
        uv.y += amplitude * sin(frequency * uv.x + time);
        return uv;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv = sineDistortion(uv, u_time);
        float foldAngle = imageprogress * 3.141592653589793; // from 0 to PI
        float pivot = 0.5;
        float x = uv.x - pivot;
        float rotatedX = x * cos(foldAngle);
        uv.x = rotatedX + pivot;
        float blend = smoothstep(0.7, 1.0, imageprogress);
        vec2 offsetUV1 = mirrorRepeat(uv);
        vec2 offsetUV2 = mirrorRepeat(uv);
        vec4 T1 = texture2D(t1, offsetUV1);
        vec4 T2 = texture2D(t2, offsetUV2);
        float shading = 1.0 - abs(cos(foldAngle));
        T1.rgb *= (0.5 + 0.5 * shading);
        vec4 outputColor = mix(T1, T2, blend);
        gl_FragColor = outputColor;
    }
    `
    ,
    uniforms: {
        t1: { value: texture1 },
        t2: { value: texture2 },
        imageprogress: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(w, h) },
        u_time: { value: 0.0 }
    }
});

const geometry = new THREE.PlaneGeometry(2, 2);
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

let progress = 0.0;
let targetProgress = 0.0;
const threshold = 0.9;
let scrollTimeout;
const revertDelay = 2000;

async function updatePage() {
    const container = document.getElementById('page-container');
    if (progress < 0.5) {
        const { default: renderPage1 } = await import('./Page1.js');
        renderPage1(container);
    } else {
        const { default: renderPage2 } = await import('./Page2.js');
        renderPage2(container);
    }
}

function animateProgress() {
    if (Math.abs(targetProgress - progress) > 0.001) {
        progress += (targetProgress - progress) * 0.01;
        material.uniforms.imageprogress.value = progress;
        updatePage();
        requestAnimationFrame(animateProgress);
    }
}

function delayedRevert() {
    scrollTimeout = setTimeout(() => {
        if (progress > 0.0 && progress < 1.0) {
            targetProgress = progress < threshold ? 0.0 : 1.0;
            animateProgress();
        }
    }, revertDelay);
}

function normalizeWheel(event) {
    let normalized = event.deltaY;
    if (event.deltaMode === 1) {
        normalized *= 33;
    } else if (event.deltaMode === 0) {
        normalized *= 0.5;
    }
    return normalized;
}


function onScroll(event) {
    // Remove the scroll message
    if (scrollMessage) {
        gsap.to(scrollMessage, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => scrollMessage.remove(),
        });
    }

    const delta = normalizeWheel(event) * 0.08;
    targetProgress = THREE.MathUtils.clamp(targetProgress + delta, 0.0, 1.0);

    event.preventDefault();
    clearTimeout(scrollTimeout);

    if (targetProgress > threshold && targetProgress < 1.0) {
        targetProgress = 1.0;
    } else if (targetProgress < threshold && targetProgress > 0.0) {
        targetProgress = 0.0;
    }

    animateProgress();
    delayedRevert();
}


window.addEventListener('wheel', onScroll, { passive: false });

function animate(time) {
    material.uniforms.u_time.value = time * 0.001;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    material.uniforms.u_resolution.value.set(w, h);
});
