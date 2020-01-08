"use strict"

/*

    BMTheme

*/

window.BMTheme = class BMTheme extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setShouldStore(true)

        this.setNodeCanEditTitle(true)

        this.setTitle("Untitled Theme")
        this.setNodeMinWidth(270)
        this.setupSubnodes()
        this.setCanDelete(true)

        setTimeout(() => { 
            //console.log("theme as json: ", JSON.stringify(this.asJSON())) 
        }, 1000)
    }

    loadFinalize () {
        super.loadFinalize()
        // called after all objects loaded within this event cycle
        this.setupSubnodes()
    }

    setupSubnodes () {
        // setup with all view classes
        
        let viewClasses = DomView.allDescendantProtos()

        viewClasses = viewClasses.select((viewClass) => {
            return viewClass.hasOwnProperty("styles")
        }).select((viewClass) => { return !viewClass.styles().isEmpty() })

        //console.log("viewClasses:", viewClasses)
        let themeClasses = viewClasses.map((childProto) => {
            return BMThemeClass.clone().setTitle(childProto.type());
        })

        this.copySubnodes(themeClasses);
        return this
    }

}.initThisClass()
