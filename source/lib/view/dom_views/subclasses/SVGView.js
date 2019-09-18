"use strict"

/*

    SVGView

    A view to render scalable SVG within a view that can be 
    synced to match the color of the parent view's text color by
    getting the computed color and applying it to the fill or stroke of the
    svg views.

    TODO: support disabled/uneditable color style?

*/



DomStyledView.newSubclassNamed("SVGView").newSlots({
    fillMatchesParentColor: true,
    strokeMatchesParentColor: true,
    svgString: "",
    url: null,
    iconName: "add",
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block")
        this.turnOffUserSelect()
        this.setOverflow("hidden")
        this.setPosition("absolute")
        this.setTop(0)
        this.setLeft(0)

        this.setOverflow("hidden")
        //this.asyncLoad()
        this.setSvgString(this.addSvgIconString())
        return this
    },

    setSvgString: function(s) {
        this._svgString = s
        this.setInnerHTML(s)
        return this
    },

    addSvgIconString: function() {
        return `
        <svg width="100%" height="100%" viewBox="0 0 401.994 401.994"><path d="M394,154.175c-5.331-5.33-11.806-7.994-19.417-7.994H255.811V27.406c0-7.611-2.666-14.084-7.994-19.414
		C242.488,2.666,236.02,0,228.398,0h-54.812c-7.612,0-14.084,2.663-19.414,7.993c-5.33,5.33-7.994,11.803-7.994,19.414v118.775
		H27.407c-7.611,0-14.084,2.664-19.414,7.994S0,165.973,0,173.589v54.819c0,7.618,2.662,14.086,7.992,19.411
		c5.33,5.332,11.803,7.994,19.414,7.994h118.771V374.59c0,7.611,2.664,14.089,7.994,19.417c5.33,5.325,11.802,7.987,19.414,7.987
		h54.816c7.617,0,14.086-2.662,19.417-7.987c5.332-5.331,7.994-11.806,7.994-19.417V255.813h118.77
		c7.618,0,14.089-2.662,19.417-7.994c5.329-5.325,7.994-11.793,7.994-19.411v-54.819C401.991,165.973,399.332,159.502,394,154.175z"
		/></svg>
        `
    },
	
    // svg icon

    updateAppearance: function () {
        // sent by superview when it changes or syncs to a node
        // so we can update our appearance to match changes to the parent view's style

        if (this.parentView()) {
            const color = this.parentView().getComputedCssAttribute("color")
            const e = this.element()

            e.style.transition = "all 0.2s"

            if (this.fillMatchesParentColor()) {
                Element_setStyleIncludingDecendants(e, "fill", color)
            }            
            
            if (this.strokeMatchesParentColor()) {
                Element_setStyleIncludingDecendants(e, "stroke", color)
            }
        }

        return this
    },

    /*
    setupBackground: function() {
        // can't use this because we can't walk and set the fill/stroke style on the svg elements 
        // if it's a background image

        const url = this.pathForIconName(this.iconName())

        this.setBackgroundImageUrlPath(url)
        this.setBackgroundSizeWH(16, 16) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.makeBackgroundNoRepeat()
        Element_setStyleIncludingDecendants(this.element(), "fill", "white")
        Element_setStyleIncludingDecendants(this.element(), "stroke", "white")
        Element_setStyleIncludingDecendants(this.element(), "color", "white")
    },

    asyncLoad: function() {
        // can't do this because of cross site security error

        const url = this.pathForIconName(this.iconName())

        const rawFile = new XMLHttpRequest();
        rawFile.open("GET", url, false);
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4) {
                if(rawFile.status === 200 || rawFile.status === 0) {
                    let data = rawFile.responseText;
                    this.setSvgString(data)
                }
            }
        }
        rawFile.send(null);
    },
    */
})
