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
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
		this.setViewClassName("BMFieldView")
    },    
	
	setValue: function(v) {
		var setter = this.setterNameForSlot(this.nodeFieldProperty())
		//console.log("this.parentNode() = " + this.parentNode().type() + " setter = '" + setter + "'")
		this.parentNode()[setter].apply(this.parentNode(), [v])
		return this
	},
	
	value: function() {
		var getter = this.nodeFieldProperty()
		//console.log("this.parentNode() = " + this.parentNode().type() + " getter = '" + getter + "'")
		var value = this.parentNode()[getter].apply(this.parentNode())
		return value
	},
    



})
