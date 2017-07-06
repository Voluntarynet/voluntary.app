/*


*/
        
BMField = BMNode.extend().newSlots({
    type: "BMField",
    
    key: null,
    //value: "test value",

	isVisible: true,
	
	keyIsVisible: true,
	valueIsVisible: true,

	keyIsEditable: false,
	valueIsEditable: true, 
	
	canRemove: null,
	
	link: null,
	ownsLink: null,
	
	// only visible in UI
	valuePrefix: null,
	valuePostfix: null,
	
	nodeValueMethod: null,
		
	keyError: null,
	valueError: null,
	
	target: null,
	
	noteMethod: null, // fetches note from a parent node method
	
}).setSlots({
	
    init: function () {
        BMNode.init.apply(this)
		this.setViewClassName("BMFieldView")
		this.setViewClassName(null)
		//console.log("BMField viewClassName = '" + this.viewClassName() + "'")
    },    

	nodeRowViewClass: function() {
		return BMFieldView
	},
	
	target: function() {
		if (this._target) {
			return this._target
		}
		
		return this.parentNode()
	},
	
	nodeValueMethod: function() {
		// defaults to key 
		if (this._nodeValueMethod == null) {
			return this.key()
		}
		
		return this._nodeValueMethod
	},
	
	setValue: function(v) {
		//console.log("setValue '" + v + "'")
		var target = this.target()
		var setter = this.setterNameForSlot(this.nodeValueMethod())
		if (!target[setter]) {
			console.log("WARNING target = " + target.type() + " setter = '" + setter + "' missing")
		}
		target[setter].apply(target, [v])
		target.didUpdate()
		this.validate()
		
		return this
	},
	
	value: function() {
		var target = this.target()
		var getter = this.nodeValueMethod()
		//console.log("target = " + target.type() + " getter = '" + getter + "'")
		var value = target[getter].apply(target)
		return value
	},
	
	note: function() {
		var target = this.target()
		var noteGetter = this.noteMethod()
		if (target && noteGetter) {
			return target[noteGetter].apply(target)
		}
		return null
	},
	
	didUpdateView: function(aFieldView) {
		this.parentNode().didUpdateField(this)
		return this
	},
	
	visibleValue: function() {
		return this.value()
	},

	validate: function() {
		// subclasses should override if needed
		return true
	},    
	
    nodeRowLink: function() {
        return null
    },
})
