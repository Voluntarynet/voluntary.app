
LoadSpinner = {
    mainElement: function() {
        return document.getElementById("Spinner")
    },
    
    titleElement: function() {
        return document.getElementById("SpinnerTitle")
    },
    
    subtitleElement: function() {
        return document.getElementById("SpinnerSubtitle")
    },
    
    itemElement: function() {
        return document.getElementById("SpinnerItem")
    },
    
    errorElement: function() {
        return document.getElementById("SpinnerError")
    },
    
    start: function() {
        console.log("--- running spinner 2---")

        var title = this.titleElement()
        
		title.style.color = "#aaa"
		title.innerHTML = "PEER LOADING"
		
        JSImporter.pushUrlLoadingCallback((url) => {
            this.incrementItemCount()
        	this.setCurrentItem(url.split("/").pop())
        })

        JSImporter.pushErrorCallback((error) => {
        	this.setError(error)
        })        
    },
    
    isPresent: function() {
        return this.mainElement() != null
    },
    
    incrementItemCount: function() {
        var subtitle = this.subtitleElement()
    	if (subtitle) {
    		subtitle.style.color = "#666"
    		subtitle.innerHTML += "."
        }        
        return this
    },
        
    setCurrentItem: function(itemName) {
        var item = this.itemElement()
    	item.style.color = "#444"
    	item.innerHTML = itemName	
        return this
    },
    
    setError: function(error) {
        this.errorElement().innerHTML = error
        return this
    },

    removeIfPresent: function() {
        var e = this.mainElement()
        if (e) {
		    e.parentNode.removeChild(e)
	    }
		
	    delete window.LoadSpinner
    },

    setupHtml: function() {
        document.body.innerHTML = "<div id='Spinner'> \
    		<div id='SpinnerTitle' style='transition: all .6s ease-out;'></div><br> \
    		<div id='SpinnerSubtitle' style='transition: all .3s ease-out; letter-spacing: -2.5px;'></div><br> \
    		<div id='SpinnerItem' style='color: transparent; transition: all .6s ease-out;'></div><br> \
    		<div id='SpinnerError' style='color: red; transition: all .6s ease-out;'></div> \
	    </div>"
	
	    var style = this.mainElement().style
	    style.position = "relative"
        style.top = "50%"
        style.transform = "translateY(-50%)"
        style.height = "auto"
        style.width = "100%"
        style.fontFamily = "AppRegular"
        style.letterSpacing = "3px"
        style.color = "transparent"
        style.textAlign = "center"
        
        return this
    },
        
    startWhenReady: function() {
        if (window["JSImporter"]) {
            console.log("--- running spinner ---")
            this.setupHtml()
            this.start() 
        } else {
            setTimeout(() => { LoadSpinner.startWhenReady() }, 100)
        }
    },
}

LoadSpinner.startWhenReady()