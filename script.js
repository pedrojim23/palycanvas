// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado, iniciando aplicación...');

    // Crear el elemento canvas
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    console.log('Canvas creado y añadido al DOM');

    // Inicializar la aplicación PlayCanvas
    var app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas)
    });

    // Configurar la escena
    app.start();
    console.log('Aplicación PlayCanvas iniciada');

    // Ajustar el tamaño del canvas
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    // Crear una entidad de cámara
    var camera = new pc.Entity();
    camera.addComponent("camera", {
        clearColor: new pc.Color(0, 0, 0, 0)
    });
    app.root.addChild(camera);

    // Crear una entidad de luz
    var light = new pc.Entity();
    light.addComponent("light", {
        type: "directional",
        color: new pc.Color(1, 1, 1),
        castShadows: true
    });
    light.setEulerAngles(45, 30, 0);
    app.root.addChild(light);

    // Crear el objeto 3D (en este caso, un cubo)
    var box = new pc.Entity();
    box.addComponent("render", {
        type: "box"
    });
    box.setLocalScale(0.1, 0.1, 0.1);
    app.root.addChild(box);
    console.log('Entidades de cámara, luz y cubo creadas');

    // Función para iniciar la sesión AR
    function startAR() {
        console.log('Iniciando sesión AR...');
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                if (supported) {
                    navigator.xr.requestSession('immersive-ar', {
                        requiredFeatures: ['hit-test']
                    }).then(onSessionStarted);
                } else {
                    console.log('AR no soportado en este dispositivo');
                }
            });
        } else {
            console.log('WebXR no soportado en este navegador');
        }
    }

    // Función para manejar el inicio de la sesión AR
    function onSessionStarted(session) {
        console.log('Sesión AR iniciada');
        app.xr.start(camera.camera, pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR);
        
        session.addEventListener('select', onSelect);
    }

    // Función para manejar la selección del usuario (colocar el objeto)
    function onSelect(event) {
        console.log('Evento de selección AR detectado');
        const frame = event.frame;
        const referenceSpace = app.xr.referenceSpace;
        
        if (frame.getHitTestResults) {
            const hitTestResults = frame.getHitTestResults(session.requestHitTestSource({space: referenceSpace}));
            if (hitTestResults.length) {
                const hitPose = hitTestResults[0].getPose(referenceSpace);
                box.setPosition(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
                console.log('Objeto colocado en la posición:', box.getPosition());
            }
        }
    }

    // Función para rotar el objeto
    function rotateObject(dx, dy) {
        box.rotate(dy, dx, 0);
    }

    // Función para cambiar el color del objeto
    function changeColor(color) {
        var material = box.render.material;
        material.diffuse.set(color.r, color.g, color.b);
        material.update();
        console.log('Color del objeto cambiado a:', color);
    }

    // Agregar un botón para iniciar AR
    var button = document.createElement('button');
    button.textContent = 'Iniciar AR';
    button.addEventListener('click', startAR);
    document.body.appendChild(button);
    console.log('Botón de inicio AR creado');

    // Manejar eventos táctiles para la rotación
    var lastX, lastY;
    canvas.addEventListener('touchstart', function(e) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', function(e) {
        var dx = e.touches[0].clientX - lastX;
        var dy = e.touches[0].clientY - lastY;
        rotateObject(dx * 0.01, dy * 0.01);
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    });

    // Agregar botones para cambiar el color
    var colors = [
        { name: 'Rojo', value: new pc.Color(1, 0, 0) },
        { name: 'Verde', value: new pc.Color(0, 1, 0) },
        { name: 'Azul', value: new pc.Color(0, 0, 1) }
    ];

    colors.forEach(function(color, index) {
        var colorButton = document.createElement('button');
        colorButton.textContent = color.name;
        colorButton.style.top = `${50 + index * 40}px`;
        colorButton.addEventListener('click', function() {
            changeColor(color.value);
        });
        document.body.appendChild(colorButton);
    });
    console.log('Botones de color creados');

    // Actualizar la aplicación
    app.on("update", function (dt) {
        // Aquí puedes agregar lógica adicional si es necesario
    });

    // Manejar cambios de tamaño de ventana
    window.addEventListener('resize', function () {
        app.resizeCanvas();
    });

    console.log('Configuración de la aplicación completada');
});