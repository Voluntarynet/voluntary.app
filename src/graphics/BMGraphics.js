
"use strict"

// BMStorableNode
// BMFieldSetNode
window.BMGraphics = BMFieldSetNode.extend().newSlots({
    type: "BMGraphics",
	debug: false,
    shared: null,
    altScrollbars: true,
	scrollbarCssElement: null,
}).setSlots({
    init: function () {
        if (BMGraphics._shared) {
            throw new Error("multiple instances of " + this.type() + " singleton")
        }
		
        BMStorableNode.init.apply(this)
		
        //this.setPid("_graphics")
        this.setTitle("Graphics")
		this.setSubtitle("Current Theme: ")
		this.setNodeMinWidth(200)
        
		
		var scrollbarToggle = BMBoolField.clone().setKey("altScrollbars").setValueIsEditable(true);

		this.addStoredField(scrollbarToggle)
		
		//Toggle Hook
		BMFieldSetNode.didUpdateField = function(aField) {
			if (aField.key() == "altScrollbars") {
				aField.parentNode().toggleAltScrollbars()
			}
		}

        this.watchIdentities()
    },
	
	toggleAltScrollbars: function() {
		//Activate stylesheet or theme or something
	},

    loadFinalize: function() {
        //this.updateIdsBloomFilter()
    },

    watchIdentities: function() {
        if (!this._idsObservation) {
	        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    },

    shared: function() {   
        var thisClass = BMGraphics
        if (!thisClass._shared) {
            thisClass._shared = this.clone();
        }
        return thisClass._shared;
    },

    
    subtitle: function() {
        var parts = []


        return parts.join(", ")
    },
})
