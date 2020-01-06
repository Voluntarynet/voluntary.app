"use strict"

/*

    SvgIconView

    A view to render scalable SVG within a view that can be 
    synced to match the color of the parent view's text color by
    getting the computed color and applying it to the fill or stroke of the
    svg views.

    TODO: support disabled/uneditable color style?


    Example use:

    SvgIconView.clone().setIconName("add")

*/


window.SvgIconView = class SvgIconView extends DomStyledView {
    
    initPrototype () {
        this.newSlot("doesMatchParentColor", false)
        this.newSlot("svgString", "")
        this.newSlot("url", null)
        this.newSlot("iconName", null)
        this.newSlot("fillColor", "white")
        this.newSlot("strokeColor", "white")
    }

    init () {
        super.init()
        this.turnOffUserSelect()
        this.setOverflow("hidden")

        this.setPosition("absolute")
        this.setTop(0)
        this.setLeft(0)

        this.setPadding(0)
        this.setMargin(0)
        
        this.setOverflow("hidden")
        this.setTransition("all 0.2s")
        this.setIconName("add")
        
        return this
    }

    setIconName (name) {
        const svg = this.svgDict()[name]

        if (svg) {
            this.setSvgString(svg)
        } else {
            throw new Error("can't find icon '" + name + "'") 
        }

        return this
    }

    setSvgString (s) {
        this._svgString = s
        this.setInnerHTML(s)
        this.updateAppearance()
        const style = this.svgElement().style
        style.position = "absolute"
        style.top = "0px"
        style.left = "0px"
        return this
    }

    svgElement () {
        return this.element().childNodes[0]
    }

    // didUpdateSlot

    didUpdateSlotFillColor (oldValue, newValue) {
        this.updateAppearance()
    }

    didUpdateSlotStrokeColor (oldValue, newValue) {
        this.updateAppearance()
    }

    // svg icon

    updateAppearance () {
        // sent by superview when it changes or syncs to a node
        // so we can update our appearance to match changes to the parent view's style

        const e = this.element()

        if (this.doesMatchParentColor()) {
            if (this.parentView()) {
                const color = this.parentView().getComputedCssAttribute("color")
                Element_setStyleIncludingDecendants(e, "fill", color)
                Element_setStyleIncludingDecendants(e, "stroke", color)
            }
        } else {
            Element_setStyleIncludingDecendants(e, "fill", this.fillColor())
            Element_setStyleIncludingDecendants(e, "stroke", this.strokeColor())
        }

        Element_setStyleIncludingDecendants(e, "transition", this.transition())

        return this
    }

    /*
    setupBackground () {
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
    }

    asyncLoad () {
        // can't do this on a file:// because of cross site request error
        const url = this.pathForIconName(this.iconName())
        const rawFile = new XMLHttpRequest();
        rawFile.open("GET", url, false);
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4) {
                if(rawFile.status === 200 || rawFile.status === 0) {
                    const data = rawFile.responseText;
                    this.setSvgString(data)
                }
            }
        }
        rawFile.send(null);
    }
    */

    // svgDict is a hack to work around the (very frustrating) cross site restriction on 
    // loading files 

    svgDict () {
        const dict = {}
    
        dict.add = `<svg width="100%" height="100%" viewBox="0 0 401.994 401.994"><path d="M394,154.175c-5.331-5.33-11.806-7.994-19.417-7.994H255.811V27.406c0-7.611-2.666-14.084-7.994-19.414
        C242.488,2.666,236.02,0,228.398,0h-54.812c-7.612,0-14.084,2.663-19.414,7.993c-5.33,5.33-7.994,11.803-7.994,19.414v118.775
        H27.407c-7.611,0-14.084,2.664-19.414,7.994S0,165.973,0,173.589v54.819c0,7.618,2.662,14.086,7.992,19.411
        c5.33,5.332,11.803,7.994,19.414,7.994h118.771V374.59c0,7.611,2.664,14.089,7.994,19.417c5.33,5.325,11.802,7.987,19.414,7.987
        h54.816c7.617,0,14.086-2.662,19.417-7.987c5.332-5.331,7.994-11.806,7.994-19.417V255.813h118.77
        c7.618,0,14.089-2.662,19.417-7.994c5.329-5.325,7.994-11.793,7.994-19.411v-54.819C401.991,165.973,399.332,159.502,394,154.175z"
        /></svg>
        `

        dict.close = `<svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 174.239 174.239" style="enable-background:new 0 0 174.239 174.239;" xml:space="preserve">
        <path d="M146.537,1.047c-1.396-1.396-3.681-1.396-5.077,0L89.658,52.849c-1.396,1.396-3.681,1.396-5.077,0L32.78,1.047
       c-1.396-1.396-3.681-1.396-5.077,0L1.047,27.702c-1.396,1.396-1.396,3.681,0,5.077l51.802,51.802c1.396,1.396,1.396,3.681,0,5.077
       L1.047,141.46c-1.396,1.396-1.396,3.681,0,5.077l26.655,26.655c1.396,1.396,3.681,1.396,5.077,0l51.802-51.802
       c1.396-1.396,3.681-1.396,5.077,0l51.801,51.801c1.396,1.396,3.681,1.396,5.077,0l26.655-26.655c1.396-1.396,1.396-3.681,0-5.077
       l-51.801-51.801c-1.396-1.396-1.396-3.681,0-5.077l51.801-51.801c1.396-1.396,1.396-3.681,0-5.077L146.537,1.047z"/>
       </svg>
        `

        dict.left = `<svg width="100%" height="100%" viewBox="0 0 512 512">
        <path d="M 416.00,416.00l-96.00,96.00L 64.00,256.00L 320.00,0.00l 96.00,96.00L 
        256.00,256.00L 416.00,416.00z" ></path>
        </svg>
        `

        /*
        dict["close-white"] = `<svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 174.239 174.239">
        <path d="M146.537,1.047c-1.396-1.396-3.681-1.396-5.077,0L89.658,52.849c-1.396,1.396-3.681,1.396-5.077,0L32.78,1.047
        c-1.396-1.396-3.681-1.396-5.077,0L1.047,27.702c-1.396,1.396-1.396,3.681,0,5.077l51.802,51.802c1.396,1.396,1.396,3.681,0,5.077
        L1.047,141.46c-1.396,1.396-1.396,3.681,0,5.077l26.655,26.655c1.396,1.396,3.681,1.396,5.077,0l51.802-51.802
        c1.396-1.396,3.681-1.396,5.077,0l51.801,51.801c1.396,1.396,3.681,1.396,5.077,0l26.655-26.655c1.396-1.396,1.396-3.681,0-5.077
        l-51.801-51.801c-1.396-1.396-1.396-3.681,0-5.077l51.801-51.801c1.396-1.396,1.396-3.681,0-5.077L146.537,1.047z" fill="#FFFFFF"/>
        </svg>
        `
        */

        dict["right-gray"] = `<svg width="100%" height="100%" viewBox="0 0 306 306">
        <polygon points="94.35,0 58.65,35.7 175.95,153 58.65,270.3 94.35,306 247.35,153" fill="#888"/>
        </svg>
        `

        dict.repost = `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <path style="fill:#030104;" d="M24.9,66V39.9H35L17.5,20L0,39.9h10.1V70c0,5.523,4.476,10,10,10H65L52.195,66H24.9z M89.9,60.1V30
        c0-5.523-4.477-10-10-10H35l12.804,14h27.295v26.1H65L82.5,80L100,60.1H89.9z"/>
        </svg>   
        `

        dict["heart-black-filled"] = `
        <svg width="100%" height="100%" viewBox="0 0 51.997 51.997">
        <path d="M51.911,16.242C51.152,7.888,45.239,1.827,37.839,1.827c-4.93,0-9.444,2.653-11.984,6.905
	    c-2.517-4.307-6.846-6.906-11.697-6.906c-7.399,0-13.313,6.061-14.071,14.415c-0.06,0.369-0.306,2.311,0.442,5.478
	    c1.078,4.568,3.568,8.723,7.199,12.013l18.115,16.439l18.426-16.438c3.631-3.291,6.121-7.445,7.199-12.014
        C52.216,18.553,51.97,16.611,51.911,16.242z"/>
        </svg>
        `

        dict["outer-checkbox"] = `<svg height='100%' width='100%' viewBox='0 0 16 16'>
        <circle stroke-width='1' cx=7 cy=7 r=6 />
        </svg>`
   
        dict["inner-checkbox"] = `<svg height='100%' width='100%' viewBox='0 0 16 16'>
        <circle stroke-width='1' cx=7 cy=7 r=4 />
        </svg>`
        
        return dict
    }

}.initThisClass()
