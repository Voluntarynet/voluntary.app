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
	
	nodeFieldProperty: null,
	
	valueDivClassName: null,
	
	keyError: null,
	valueError: null,
	
	target: null,
	
	noteMethod: null,
	
}).setSlots({
	
    init: function () {
        BMNode.init.apply(this)
		this.setViewClassName("BMFieldView")
		//this.setNodeRowViewClass(BMFieldView)
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
	
	nodeFieldProperty: function() {
		// defaults to key 
		if (this._nodeFieldProperty == null) {
			return this.key()
		}
		
		return this._nodeFieldProperty
	},
	
	setValue: function(v) {
		//console.log("setValue '" + v + "'")
		var target = this.target()
		var setter = this.setterNameForSlot(this.nodeFieldProperty())
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
		var getter = this.nodeFieldProperty()
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
