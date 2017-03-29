
BMSelectionField = BMField.extend().newSlots({
    type: "BMSelectionField",
    optionsPid: null,
    selectionPid: null,
    allowsEmpty: false,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
    },

})
