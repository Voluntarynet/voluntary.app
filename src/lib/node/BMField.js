    /*


    */  
        
        
BMField = BMNode.extend().newSlots({
    type: "BMField",
    
    name: null,
    value: null,

	isVisible: null,
	nameIsVisible: null,
	valueIsVisible: null,

	canEditName: false,
	canEditValue: false, 
	
	canRemove: null,
	
	link: null,
	ownsLink: null,
	
	// only visible in UI
	valuePrefix: null,
	valuePostfix: null,
	
}).setSlots({
    init: function () {
        BMNode.init.apply(this)

    },    
    
    title: function() {
        return this.name()
    },
    
    setTitle: function(aTitle) {
        return this.setName(aTitle)
    },    
    
    nodeTitleIsEditable: function() {
        return this.canEditName()
    },
    

    items: function() {
        if (this.value().items) {
            return this.value().items()
        }
        
        return []
    },


})
