"use strict"

/*
	BMArchiveNode
	Way to compose 
*/

window.BMArchiveNode = BMFieldSetNode.extend().newSlots({
    type: "BMArchiveNode",
    key: null,
    didSetupFields: false,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
        //this.addAction("delete")
        this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(300)
        this.setTitle("Archive")
    },

    subtitle: function() {
        if (this.value()) {
            var b = this.value().length
            return ByteFormatter.clone().setValue(b).formattedValue()
        }
        return "N/A"
    },

    prepareForFirstAccess: function () {
        this.addStoredField(BMTextAreaField.clone().setKey("data").setValueMethod("dataString").setValueIsEditable(false).setIsMono(true))
    },

    /*
	subtitle: function() {
		return this.value().length + " bytes"
	},

    escapeHtml: function(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    },
	*/

    value: function () {
        var s = JSImporter.archive()
        if (s) {
            return s.escapeHtml()
        }
        return null
    },

    dataString: function () {
        return this.value()
    },
})

