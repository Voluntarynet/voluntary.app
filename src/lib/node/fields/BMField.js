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
		this.setViewClassName("BMFieldView")
    },    
	
	target: function() {
		if (this._target) {
			return this._target
		}
		
		return this.parentNode()
	},
	
	setValue: function(v) {
		var target = this.target()
		var setter = this.setterNameForSlot(this.nodeFieldProperty())
		//console.log("this.parentNode() = " + this.parentNode().type() + " setter = '" + setter + "'")
		target[setter].apply(target, [v])
		return this
	},
	
	value: function() {
		var target = this.target()
		var getter = this.nodeFieldProperty()
		//console.log("this.parentNode() = " + this.parentNode().type() + " getter = '" + getter + "'")
		var value = target[getter].apply(target)
		return value
	},
    
})
