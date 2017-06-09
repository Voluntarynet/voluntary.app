
BMMailMessage = BMPrivateMessage.extend().newSlots({
    type: "BMMailMessage",

}).setSlots({
    init: function () {
        BMPrivateMessage.init.apply(this)
		this.setShouldStore(true)
		
		this.addField(BMMultiField.clone().setKey("from").setNodeFieldProperty("fromContact")).setValueIsEditable(false).setValidValuesMethod("fromContactNames").setNoteMethod("fromContactPublicKey")
		this.addField(BMMultiField.clone().setKey("to").setNodeFieldProperty("toContact")).setValueIsEditable(true).setValidValuesMethod("toContactNames").setNoteMethod("toContactPublicKey")
        this.addFieldNamed("subject").setKey("subject")	
		this.addField(BMTextAreaField.clone().setKey("body").setNodeFieldProperty("body"))
        this.setStatus("")

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeBgColor("white")
    },

})
