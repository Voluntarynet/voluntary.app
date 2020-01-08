"use strict"

/*
    
    GameApp



*/

window.ThreeJSView = class ThreeJSView extends DomView {
    
    initPrototype () {
        this.newSlot("scene", null)
        this.newSlot("camera", null)
        this.newSlot("renderer", null)
    }

    init () {
        super.init()
        this.setup()
    }

    createElement () {
        // we want to use the renderer's element for the view,
        // so we set that up first
        // where is the renderer attached to the scene???
        this.setup()
        return this.renderer().domElement
    }

    setup () {
        this.setupScene()
        this.setupCamera()
        this.setupRenderer()
    }

    setupScene () {
        const scene = new THREE.Scene();
        this.setScene(scene)
        return this
    }

    setupCamera () {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.setCamera(camera)

        camera.position.set(30,30,0);
        camera.up = new THREE.Vector3(0,0,1);
        camera.lookAt(new THREE.Vector3(0,0,0));
        return this
    }

    setupRenderer () {
        const renderer = new THREE.WebGLRenderer();
        this.setRenderer(renderer)
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.hide()
        //document.body.appendChild( renderer.domElement );
        return this
    }

    fitParentView () {
        const pv = this.parentView()
        assert(pv)
        this.renderer().setSize(pv.clientWidth(), pv.clientHeight());
        //this.renderer().setSize(window.innerWidth, window.innerHeight);
        return this
    }
    
    hide () {
        renderer.domElement.style.visibility = "hidden";
        return this
    }

    unhide () {
        renderer.domElement.style.visibility = "visible";
        return this
    }

    // --- helpers ---

    screenPositionForPoint (inVec) {
        const r = this.renderer()
        const w = r.domElement.clientWidth;
        const h = r.domElement.clientHeight;
        const v1 = new THREE.Vector3().set(inVec.x, inVec.y, inVec.z) // TODO: copy?
        const v = v1.project(this.camera());
        v.x = Math.round( (v.x + 1) / 2 * w);
        v.y = Math.round(-(v.y - 1) / 2 * h);
        v.z = 0;
        return v;
    }
    

}.initThisClass()
