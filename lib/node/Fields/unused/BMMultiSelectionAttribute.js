
BMMultiSelectionField = BMField.extend().newSlots({
    type: "BMMultiSelectionField",
    optionsPid: null,
    selectionPids: null,
    allowsEmpty: true,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
    },

})
