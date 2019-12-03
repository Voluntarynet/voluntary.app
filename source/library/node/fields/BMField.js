"use strict"

/*

    BMField

    A BMStorageNode that has a key, value, and valueMethod (among other properties),
    that's useful for automatically constructing a UI to interact with properties of a parent Node.
    
*/
        

window.BMField = class BMField extends BMSummaryNode {
    
    initPrototype () {
        this.newSlots({
            isVisible: true,
            isEnabled: true,
        
            // key
            key: "key",
            keyIsVisible: true,
            keyIsEditable: false,
        
            // value
            value: null,
            valueIsVisible: true,
            valueIsEditable: true, 
                
            link: null,
            ownsLink: null,
            
            // only visible in UI
            valuePrefix: null,
            valuePostfix: null,
            
            valueMethod: null,
            noteMethod: null, // fetches note from a parent node method
                
            keyError: null,
            valueError: null,
            
            target: null,
        
            //nodeSummaryShowsKey: false,
            //nodeSummaryShowsValue: false,
        })

  
        this.slotNamed("key").setShouldStore(true)
        this.slotNamed("keyIsVisible").setShouldStore(true)
        this.slotNamed("keyIsEditable").setShouldStore(true)

        this.slotNamed("value").setShouldStore(true)
        this.slotNamed("valueIsVisible").setShouldStore(true)
        this.slotNamed("valueIsEditable").setShouldStore(true)

        this.slotNamed("valuePrefix").setShouldStore(true)
        this.slotNamed("valuePostfix").setShouldStore(true)

        //this.protoAddStoredSlot("nodeSummaryShowsKey")
        //this.protoAddStoredSlot("nodeSummaryShowsValue")
    }

    duplicate () {
        const newObject = this.__proto__.clone().copySlotValuesFrom(this) 
        return newObject
    }

    copySlotValuesFrom (otherObject) {
        this.slots().ownForEachKV((slotName, mySlot) => {
            const otherSlot = otherObject.slotNamed(slotName)
            const v = otherSlot.onInstanceGetValue(otherObject)
            mySlot.onInstanceSetValue(this, v)
        })
        return this
    }

    init () {
        super.init()
        this.setShouldStore(true)
        //this.setNodeRowStyles(BMViewStyles.shared().sharedBlackOnWhiteStyle())
        //this.setNodeRowStyles(BMViewStyles.shared().sharedWhiteOnBlackStyle())
        //this.customizeNodeRowStyles().setToBlackOnWhite()
        return this
    }

    initNodeInspector () {
        super.initNodeInspector()
        //this.addInspectorField(BMBooleanField.clone().setKey("Summary shows key").setValueMethod("nodeSummaryShowsKey").setValueIsEditable(true).setTarget(this))
        //this.addInspectorField(BMBooleanField.clone().setKey("Summary shows value").setValueMethod("nodeSummaryShowsValue").setValueIsEditable(true).setTarget(this))
        return this
    }

    /*
    target () {
        assert(!Type.isNull(this._target)) 

        if (this._target) {
            return this._target
        }
		
        return this.parentNode() // we can't do this because we want to support free floating Fields
    }
    */

    /*
    setKey (newValue) {
        this._key = newValue
        return this
    }
    */
    
    setValue (newValue) { // called by View on edit
        const oldValue = this._value
        this.didUpdateSlot("value", oldValue, newValue)
        this._value = newValue

        if (this.target() && this.valueMethod()) {
            this.setValueOnTarget(newValue)
        }
        
        this.didUpdateNode()

        return this
    }

    setValueOnTarget (v) { // called by View on edit
        //console.log("setValue '" + v + "'")
        const target = this.target()
        const setter = this.setterNameForSlot(this.valueMethod())

        v = this.normalizeThisValue(v)
        
        if (target[setter]) {
            target[setter].apply(target, [v])
            target.didUpdateNode()
            this.validate()
        } else {
            console.warn(this.type() + " target " + target.type() + " missing slot '" + setter + "'")
        }
		
        return this
    }
	
    normalizeThisValue (v) {
	    return v
    }
	
    value () {
        if (this.target()) {
            this._value = this.getValueFromTarget()
        }
        return this._value
    }

    getValueFromTarget () {
        const target = this.target()
        const slotName = this.valueMethod()

        //console.log("target = " + target.type() + " getter = '" + getter + "'")
        if (target[slotName]) {
            const value = target[slotName].apply(target)
            return value
        } else {
            console.warn(this.type() + " target " + target.type() + " missing slot '" + slotName + "'")
        }

        return null
    }
	
    note () {
        const target = this.target()
        const slotName = this.noteMethod()

        if (target && slotName) {
            if (target[slotName]) {
                return target[slotName].apply(target)
            } else {
                console.warn(this.type() + " target " + target.type() + " missing note getter slot '" + slotName + "'")
            }
        }
        return null
    }
	
    didUpdateView (aFieldView) {
        this.scheduleSyncToStore()
        
        let parentNode = this.parentNode()
        if (!parentNode) {
            parentNode = this.target()
        }

        if (parentNode.didUpdateField) {
            parentNode.didUpdateField(this)
        }
        
        return this
    }
	
    visibleValue () {
        return this.value()
    }

    validate () {
        // subclasses should override if needed
        return true
    }
	
    nodeRowLink () {
        return null
    }

    summaryKey () {
        return this.key()
    }

    summaryValue () {
        return this.value()
    }

    /*
    summary () {
        return super.summary()
    }
    */

    /*
    summary () {
        let parts = []

        if (this.nodeSummaryShowsKey()) {
            parts.push(this.key())
        }

        if (this.nodeSummaryShowsValue()) {
            parts.push(this.value())
        }

        return parts.join(this.nodeSummaryJoiner())
    }
    */

    setNodeSummaryShowsKey () {
    }

    setNodeSummaryShowsValue () {
    }
    
}.initThisClass()
