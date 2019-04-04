
    class DemoApp extends ObjectBase {
        init() {
            super.init()
            this.setup()
        }
        
        setup () {
            window.scene = new THREE.Scene();
            window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
            camera.position.set(30,30,0);
            camera.up = new THREE.Vector3(0,0,1);
            camera.lookAt(new THREE.Vector3(0,0,0));
            
            window.renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.domElement.style.visibility = "hidden"; 
            document.body.appendChild( renderer.domElement );
        }

        run () {
            const p = new THREE.Vector3().set(20, 20, 30)
            this._c1 = SVGCircle.clone().setX(p.x).setY(p.y).setFill("red").show()
        
            this._c2 = SVGCircle.clone().setFill("white")
            this._c2.position().set(p.x, p.y, p.z)
            this._c2.mapToScreen()
            this._c2.show()
        
            //this.startTimer()
        }
        
        startTimer() {
            this._timerId = setInterval(() => {
                this.nextStep()
            }, 1000/30)            
        }
        
        stopTimer() {
            clearInterval(this._timerId);
        }
        
        nextStep() {
            const p = this._c2.position()
            p.set(p.x + 1, p.y, p.z + 1) 
            this._c2.mapToScreen()
            this._c2.show()            
        }
    }
