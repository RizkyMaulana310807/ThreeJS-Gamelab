
// Rotatation control
const gui = new dat.GUI();

function setRotation(x, y, z){
    coneMesh.rotation.x = x;
    coneMesh.rotation.y = y;
    coneMesh.rotation.z = z;
};

const rotationParams = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
};

const folderRotation = gui.addFolder("Rotation");
folderRotation.add(rotationParams, "rotationX", 0, Math.PI * 2).onChange((value) => setRotation(value, rotationParams.rotationY, rotationParams.rotationZ));
folderRotation.add(rotationParams, "rotationY", 0, Math.PI * 2).onChange((value) => setRotation(rotationParams.rotationX, value, rotationParams.rotationZ));
folderRotation.add(rotationParams, "rotationZ", 0, Math.PI * 2).onChange((value) => setRotation(rotationParams.rotationX, rotationParams.rotationY, value));


// Scale control
function setScale(x, y, z){
  coneMesh.scale.set(x, y, z);  
}
const scaleParams = {
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
};

const folderScale = gui.addFolder("Scale");
folderScale.add(scaleParams, "ScaleX", 0.1, 2).onChange((value) => setScale(value, scaleParams.scaleY, scaleParams.scaleZ));
folderScale.add(scaleParams, "ScaleY", 0.1, 2).onChange((value) => setScale(scaleParams.scaleX, value, scaleParams.scaleZ));
folderScale.add(scaleParams, "ScaleZ", 0.1, 2).onChange((value) => setScale(scaleParams.scaleX, scaleParams.scaleY, value));




//camera control

function updateCameraPosition(){
    camera.position.set(cameraParams.cameraPosition.x, cameraParams.cameraPosition.y, cameraParams.cameraPosition.z);
}

const cameraParams = {
    cameraPosition: { x: 0, y: 0, z: 5}
};


const folderCamera = gui.addFolder("Camera");
folderCamera.add(cameraParams.cameraPosition, "x", -10, 10).onChange(updateCameraPosition);
folderCamera.add(cameraParams.cameraPosition, "y", -10, 10).onChange(updateCameraPosition);
folderCamera.add(cameraParams.cameraPosition, "z", 0, 20).onChange(updateCameraPosition);