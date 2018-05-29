"use strict"

window.PanelView = DivView.extend().newSlots({
    type: "PanelView",
    titleView: null,
    subtitleView: null,
}).setSlots({
    init: function () {
        this.setTitleView(DivView.clone().setDivClassName("PanelTitleView"))
        this.setSubtitleView(DivView.clone().setDivClassName("PanelSubtitleView"))
		
        return this
    },


})
