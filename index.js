import * as THREE from 'three'; // three จากที่กำหนดใน importmap
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { M3D, createLabel2D, FPS } from './utils-module.js';

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

	// --- แสงพื้นฐานเพื่อให้วัสดุแบบ Standard มองเห็นได้ ----------
	// HemisphereLight สำหรับแสงนุ่มจากท้องฟ้า/พื้นดิน
	const hemi = new THREE.HemisphereLight(0x88aaff, 0x444422, 0.45);
	M3D.scene.add(hemi);

	// AmbientLight สำหรับแสงเติมทั่วฉาก
	const ambient = new THREE.AmbientLight(0xffffff, 0.25);
	M3D.scene.add(ambient);

	// DirectionalLight สำหรับเงาและแสงเน้น
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
	dirLight.position.set(10, 20, 10);
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.set(1024, 1024);
	// ตัวเลือก: ปรับขอบเขตของ shadow camera ให้ครอบคลุมพื้นที่ฉาก
	const d = 50;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	M3D.scene.add(dirLight);


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