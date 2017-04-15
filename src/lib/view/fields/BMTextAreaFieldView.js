
BMTextAreaFieldView = BMFieldView.extend().newSlots({
    type: "BMTextAreaFieldView",
}).setSlots({
    init: function () {
        BMFieldView.init.apply(this)
        this.setDivClassName("BMTextAreaFieldView")
		this.keyView().setDisplay("none")
		this.valueView().setDivClassName("BMTextAreaFieldValueView")
        return this
    },
})
