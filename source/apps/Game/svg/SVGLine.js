

class SVGCircle extends ObjectBase {
    init() {
        super.init()
        this.newSlot("element", null);
        this.newSlot("position", new THREE.Vector3())
        this.newSlot("x", 0);
        this.newSlot("y", 0);
        this.newSlot("radius", 10);
        this.newSlot("fill", "white");
        this.createElement()
    }
    
    setX(v) {
        this._x = v;
        this.element().setAttributeNS(null,"cx", v);
        return this
    }
    
    setY(v) {
        this._y = v;
        this.element().setAttributeNS(null,"cy", v);
        return this
    }
    
    setRadius(v) {
        this._radius = v
        this.element().setAttributeNS(null,"r", v);
        return this
    }
    
    setFill(v) {
        this._fill = v;
        this.element().setAttributeNS(null,"fill", v);
        return this
    }
    
    createElement() {
        var svgNS = "http://www.w3.org/2000/svg";  
        var e = document.createElementNS(svgNS, "circle"); //to create a circle. for rectangle use "rectangle"
        //e.setAttributeNS(null,"id","mycircle");
        e.setAttributeNS(null,"cx", this.x());
        e.setAttributeNS(null,"cy", this.y());
        e.setAttributeNS(null,"r", this.radius());
        e.setAttributeNS(null,"fill", this.fill());
        e.setAttributeNS(null,"stroke","none");
        e.style.position = "absolute"
        this.setElement(e)
        document.getElementById("mySVG").appendChild(e);
        return this
    }     
    

    mapToScreen() {
        const w = window.renderer.domElement.clientWidth;
        const h = window.renderer.domElement.clientHeight;
        const p = this.position()
        const v1 = new THREE.Vector3().set(p.x, p.y, p.z)
        const v = v1.project(window.camera);

        v.x = Math.round( (v.x + 1) / 2 * w);
        v.y = Math.round(-(v.y - 1) / 2 * h);
        this.setX(v.x)
        this.setY(v.y)
        return this;
    }
    

    show() {
        const v = this.position()
        console.log("3d position: " + v.x + ", " + v.y + ", " + v.z)
        console.log("  screen xy: " + this.x() + ", " + this.y())
        return this
    }

}

