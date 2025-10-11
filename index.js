import * as THREE from 'three'; // three จากที่กำหนดใน importmap
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { M3D, createLabel2D, FPS } from './utils-module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener("DOMContentLoaded", main);

function main() {
	// ใช้ M3D ที่นำเข้ามา
	document.body.appendChild(M3D.renderer.domElement);
	document.body.appendChild(M3D.cssRenderer.domElement);

	M3D.renderer.setClearColor(0x333333); // กำหนดสีพื้นหลังของ renderer (canvas)
	M3D.renderer.setPixelRatio(window.devicePixelRatio); // ปรับความละเอียดของ renderer ให้เหมาะสมกับหน้าจอ
	M3D.renderer.shadowMap.enabled = true; // เปิดใช้งาน shadow map
	M3D.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // กำหนดประเภทของ shadow map
	M3D.renderer.physicallyCorrectLights = true; // เปิดใช้งานการคำนวณแสงแบบฟิสิกส์
	M3D.renderer.outputEncoding = THREE.sRGBEncoding; // กำหนดการเข้ารหัสสีของ renderer
	M3D.renderer.setAnimationLoop(animate); // ตั้งค่า animation loop

	// เตรียมวัตถุที่จะเพิ่มในฉากที่นี่
	// TODO: วาดฉากทิวทัศน์ 3D ด้วย Three.js
	// ต้องมีครบ 6 อย่าง: ภูเขา, พระอาทิตย์, ท้องนา, ต้นไม้, บ้าน/กระท่อม, แม่น้ำ
	// องค์ประกอบอื่น ๆ เพิ่มเติมได้ตามต้องการ (เช่น ท้องฟ้า, ก้อนเมฆ ฯลฯ)

	
	// สถิติ (Stats)
	const stats = new Stats(); // สร้าง Stats เพื่อตรวจสอบประสิทธิภาพ
	document.body.appendChild(stats.dom); // เพิ่ม Stats ลงใน body ของ HTML

	// GUI (ตัวปรับแต่ง)
	const gui = new GUI(); // สร้าง GUI สำหรับปรับแต่งค่าต่างๆ 

	// เพิ่มพื้นราบสีเขียวอย่างง่ายเพื่อให้ฉากมีพื้นเห็นได้
	const groundGeo = new THREE.PlaneGeometry(200, 200);
	const groundMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 1 });
	const ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	M3D.scene.add(ground);


	// แสงต่าง ๆ ในฉาก

	const amblight = new THREE.AmbientLight(0x404040, 1.0); // แสงเติมทั่วฉาก (intensity ปรับได้)
	M3D.scene.add(amblight);

	const sunLight = new THREE.DirectionalLight(0xfff7b2, 1); // แสงทิศทาง (เหมือนดวงอาทิตย์)
	sunLight.position.set(40, 30, 10);
	sunLight.castShadow = true;
	sunLight.shadow.mapSize.set(1024, 1024);
	M3D.scene.add(sunLight);

	// --- เพิ่มดวงอาทิตย์ตรงกลางฟ้า (Sphere + PointLight)
	const sunGroup = new THREE.Group();
	const sunGeo = new THREE.SphereGeometry(12, 64, 32);
	const sunMat = new THREE.MeshBasicMaterial({ color: 0xffee88 }); // ใช้ MeshBasicMaterial ให้สว่างเสมอ
	const sunMesh = new THREE.Mesh(sunGeo, sunMat);
	sunMesh.position.set(0, 100, 100);
	sunGroup.add(sunMesh);

	const sunPoint = new THREE.PointLight(0xfff7b2, 1.0, 200);
	sunPoint.position.set(0, 100, 100);
	M3D.scene.add(sunGroup);
	M3D.scene.add(sunPoint);

	const mountainGroup = new THREE.Group();
	M3D.scene.add(mountainGroup);

	// แทนที่ภูเขาโคนด้วยก้อนสี่เหลี่ยมใหญ่ครึ่งพื้น (ซ้าย)
	const blockGeo = new THREE.BoxGeometry(100, 20, 200); // กว้าง 100 สูง 20 ลึก 200 (ครึ่งพื้นที่)
	const blockMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 1 }); // สีน้ำตาล (saddle brown)
	const block = new THREE.Mesh(blockGeo, blockMat);
	block.position.set(-50, 10, 0); // วางไว้ทางซ้าย และยกขึ้นครึ่งหนึ่งของความสูง
	block.castShadow = true;
	block.receiveShadow = true;
	mountainGroup.add(block);

//โหลด3D	
function addGLTFModel({ path, position, scale, rotationY = 1 }) { //ให้รับพารามิเตอร์เป็น path, position, scale, rotationY 
  const loader = new GLTFLoader();
  loader.load(
    path,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(...position);
      model.scale.set(...scale);
      model.rotation.y = rotationY;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      model.castShadow = true;
      M3D.scene.add(model);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error('An error happened while loading the model:', error);
    }
  );
}

addGLTFModel({
	path: './3D/pokemon_pikachu_house.glb', // use actual file in 3D/ folder
  position: [22, 0, -80],
  scale: [12, 12, 12],
  rotationX: Math.PI,
});
addGLTFModel({
	path: './3D/stylized_sakura_tree.glb', // use actual file in 3D/ folder
  position: [77, -40, -20],
  scale: [55, 55, 55],
  rotationX: Math.PI,
});
addGLTFModel({
	path: './3D/green_field.glb', // use actual file in 3D/ folder
   position: [26, 2, 57],
  scale: [3, 8, 5],
  rotationY: Math.PI,
});
addGLTFModel({
	path: './3D/camp_fire.glb', // use actual file in 3D/ folder
   position: [26, 0, -25],
  scale: [3, 3, 3],
  rotationY: Math.PI,
});
	
	// --- เพิ่มแม่น้ำฝั่งตรงข้ามภูเขา (ทางขวา) ---------------------------
	// ใช้กล่องแบนยาวเป็นแม่น้ำเพื่อความเรียบง่าย
	const riverGeo = new THREE.BoxGeometry(20, 0.2, 200);
	const riverMat = new THREE.MeshStandardMaterial({ color: 0x3366ff, roughness: 0.2, transparent: true, opacity: 0.9 });
	const river = new THREE.Mesh(riverGeo, riverMat);
	river.position.set(60, 0.1, 0); // วางทางขวาของฉาก (ฝั่งตรงข้ามบล็อก)
	river.receiveShadow = false;
	M3D.scene.add(river);

	function animate() {
		M3D.controls.update(); // อัปเดต controls
		stats.update(); // อัปเดต Stats
		FPS.update(); // อัปเดต FPS

	// อัปเดตสถานะของวัตถุที่นี่
	// TODO: อัปเดตสถานะของวัตถุต่างๆ ที่ต้องการในแต่ละเฟรม (เช่น การเคลื่อนที่, การหมุน ฯลฯ)


		// เรนเดอร์ (render) ฉากและกล้อง
		M3D.renderer.render(M3D.scene, M3D.camera); // เรนเดอร์ฉาก
		M3D.cssRenderer.render(M3D.scene, M3D.camera); // เรนเดอร์ CSS2DRenderer
		console.log(`FPS: ${FPS.fps}`); // แสดงค่า FPS ในคอนโซล
	}
}