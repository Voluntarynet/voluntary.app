"use strict"

/*
    
    GameApp



*/

DomView.newSubclassNamed("ThreeJSView").newSlots({
    scene: null,
    camera: null,
    renderer: null,
}).setSlots({

    init: function() {
        DomView.init.apply(this)
        this.setup()
    },

    createElement: function() {
        // we want to use the renderer's element for the view,
        // so we set that up first
        // where is the renderer attached to the scene???
        this.setup()
        return this.renderer().domElement
    },

    setup: function() {
        this.setupScene()
        this.setupCamera()
        this.setupRenderer()
    },

    setupScene: function() {
        const scene = new THREE.Scene();
        this.setScene(scene)
        return this
    },

    setupCamera: function() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.setCamera(camera)

        camera.position.set(30,30,0);
        camera.up = new THREE.Vector3(0,0,1);
        camera.lookAt(new THREE.Vector3(0,0,0));
        return this
    },

    setupRenderer: function() {
        const renderer = new THREE.WebGLRenderer();
        this.setRenderer(renderer)
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.hide()
        //document.body.appendChild( renderer.domElement );
        return this
    },

    fitParentView: function() {
        const pv = this.parentView()
        assert(pv)
        this.renderer().setSize(pv.clientWidth(), pv.clientHeight());
        //this.renderer().setSize(window.innerWidth, window.innerHeight);
        return this
    },
    
    hide: function() {
        renderer.domElement.style.visibility = "hidden";
        return this
    },

    unhide: function() {
        renderer.domElement.style.visibility = "visible";
        return this
    },

    // --- helpers ---

    screenPositionForPoint: function(inVec) {
        const r = this.renderer()
        const w = r.domElement.clientWidth;
        const h = r.domElement.clientHeight;
        const v1 = new THREE.Vector3().set(inVec.x, inVec.y, inVec.z) // TODO: copy?
        const v = v1.project(this.camera());
        v.x = Math.round( (v.x + 1) / 2 * w);
        v.y = Math.round(-(v.y - 1) / 2 * h);
        v.z = 0;
        return v;
    },
    

}).initThisProto()
