"use strict"

/*

    SVGContainerView

*/


window.SVGContainerView = DomView.extend().newSlots({
    type: "SVGContainerView",
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.setElementType("svg");

        return this
    },
})

/*

    <svg id="mySVG" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width=100% height=100%>
        <!--
        <circle cx="30" cy="20" r="0.4" fill="rgba(255, 255, 255, 0.8)"/>
        -->
    </svg>
*/