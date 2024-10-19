import "./style.css"
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { log, texture } from "three/webgpu";
import gsap from 'gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const loader = new RGBELoader();
const hdriTexture = loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloppenheim_02_2k.hdr', // Replace with your HDRI image path
function(hdriTexture){
  hdriTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdriTexture;
});



const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create a big sphere with star texture
const starRadius = 50;
const starSegments = 64;
const starGeometry = new THREE.SphereGeometry(starRadius, starSegments, starSegments);

// Load star texture
const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load('./stars.jpg'); // Replace with your star texture path

// Create material with the star texture
const starMaterial = new THREE.MeshStandardMaterial({
  opacity:0.1,
  map: starTexture,
  side: THREE.BackSide // Render the inside of the sphere
});
starTexture.colorSpace = THREE.SRGBColorSpace;
// Create the star sphere mesh
const starSphere = new THREE.Mesh(starGeometry, starMaterial);

// Add the star sphere to the scene
scene.add(starSphere);


const radius =1.5;
const segments = 64;
const orbitRadius = 4;
const colors = [0xff0000, 0x00ff00 , 0x0000ff , 0xffff00 ]
const textures = ["./csilla/color.png","./earth/map.jpg","./venus/map.jpg","./volcanic/color.png"]
const spheres = new THREE.Group();
// const spheres1 = new THREE.Group();
const spheresMesh =[];
for(let i = 0 ; i<4 ;i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]); // Assuming you have textures named
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map:texture});
  const sphere = new THREE.Mesh(geometry, material);
  spheresMesh.push(sphere)
  const angle = (i/4) * (Math.PI*2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  sphere.position.y = -0.5;
  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres)


camera.position.z = 9;

// Throttled wheel event handler
let lastScrollTime = 0;
const throttleDelay = 2000; // 2 seconds cooldown
let scrollCount = 0;

function throttledWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastScrollTime >= throttleDelay) {

  lastScrollTime = currentTime;

  const direction = event.deltaY > 0 ? "down" : "up";
  scrollCount = (scrollCount+1)%4;
  console.log(scrollCount);
  const headings = document.querySelectorAll(".heading");
  
  gsap.to(headings, {
    duration: 1,
    y: `-=${100}%`,
    ease: "power2.inOut",
  });
  gsap.to(spheres.rotation,{
    duration:1,
    y: `-=${Math.PI /2}%`,
    ease: "power2.inOut"
  })
  if(scrollCount===0){
    gsap.to(headings, {
      duration: 1,
      y: `0`,
      ease: "power2.inOut",
    });
  }
}
}

// Add the throttled event listener
window.addEventListener('wheel', throttledWheelHandler);

function animate() {
  requestAnimationFrame(animate);
  for(let i=0;i<spheresMesh.length;i++){
    const sphere = spheresMesh[i];
    sphere.rotation.y += 0.005;
  }
  renderer.render(scene, camera);
}
animate();

// Handle window resize

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
 // Maximum zoom distance

// Update controls in the animation loop

