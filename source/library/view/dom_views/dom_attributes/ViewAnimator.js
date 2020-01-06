
"use strict"

/*

    ViewAnimator
         

*/

window.ViewAnimator = class ViewAnimator extends ProtoClass {
    initPrototype () {
        this.newSlot("startValue", 0)
        this.newSlot("targetValue", 0)
        this.newSlot("viewProperty", "")
        this.newSlot("duration", 200).setComment("milliseconds")
        this.newSlot("easing", "linear")
        this.newSlot("view", null)
    }

    init() {
        super.init()
    }

    currentValue() {
        const view = this.view()
        return view[this.viewProperty()].apply(view)
    }

    start() {
        this.setStartValue(this.currentValue())
        this.setStartTime(new Date().getTime())
        this.nextFrame()
        return this
    }

    timeRatioDone() {
        const now = new Date().getTime();
        return Math.min(1, ((now - this.startTime()) / this.duration()));
    }

    setterName() {
        if (!this._setterName) {
            this._setterName = this.viewProperty().asSetter()
        }
        return this._setterName
    }

    setValue(v) {
        view[this.setterName()].apply(view, [v])
        return this
    }

    nextFrame() {
        const tr = this.timeRatioDone()
        const newValue = Math.ceil((this.timeRatioDone() * (this.currentValue() - this.startValue())) + this.startValue());
        this.setValue(newValue)

        if (tr !== 1) {
            requestAnimationFrame(() => { this.nextFrame() })
        } else {
            this.didComplete()
        }
        return this
    }

    didComplete() {

    }

    /*
    EasingsFunctions() {
        linear(t) {
            return t;
        }
        easeInQuad(t) {
            return t * t;
        }
        easeOutQuad(t) {
            return t * (2 - t);
        }
        easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
        easeInCubic(t) {
            return t * t * t;
        }
        easeOutCubic(t) {
            return (--t) * t * t + 1;
        }
        easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        easeInQuart(t) {
            return t * t * t * t;
        }
        easeOutQuart(t) {
            return 1 - (--t) * t * t * t;
        }
        easeInOutQuart(t) {
            return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        }
        easeInQuint(t) {
            return t * t * t * t * t;
        }
        easeOutQuint(t) {
            return 1 + (--t) * t * t * t * t;
        }
        easeInOutQuint(t) {
            return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
        }
    }
    */
}.initThisClass()


