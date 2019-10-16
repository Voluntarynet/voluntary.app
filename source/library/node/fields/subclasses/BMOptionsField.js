"use strict"

/*

    BMOptionsField 
    
*/

BMField.newSubclassNamed("BMOptionsField").newSlots({
    validValues: [],
    options: [],
    validValuesMethod: null,
}).setSlots({
    init: function () {
        BMField.init.apply(this)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setKeyIsEditable(true)
        this.setValueIsEditable(false)

        this.setTitle("title")
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        //this.setNodeCanEditSubtitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)



        //this.setViewClassName("BMOptionsFieldView")
    },
})
