/*


*/
        
BMField = BMNode.extend().newSlots({
    type: "BMField",
    
    key: null,
    //value: "test value",

	isVisible: null,
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
	
}).setSlots({
	
    init: function () {
        BMNode.init.apply(this)
		//this.setViewClassName("BMFieldView")
		this.setViewClassName(null)
		
		//console.log("BMField viewClassName = '" + this.viewClassName() + "'")
    },    
	
	target: function() {
		if (this._target) {
			return this._target
		}
		
		return this.parentNode()
	},
	
	setValue: function(v) {
		console.log("setValue '" + v + "'")
		var target = this.target()
		var setter = this.setterNameForSlot(this.nodeFieldProperty())
		//console.log("target = " + target.type() + " setter = '" + setter + "'")
		target[setter].apply(target, [v])
		target.didUpdate()
		return this
	},
	
	value: function() {
		var target = this.target()
		var getter = this.nodeFieldProperty()
		//console.log("target = " + target.type() + " getter = '" + getter + "'")
		var value = target[getter].apply(target)
		return value
	},
	
	visibleValue: function() {
		return this.value()
	},

	validate: function() {
		// subclasses should override if needed
		return true
	},    
})
