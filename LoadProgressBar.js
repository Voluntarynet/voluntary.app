
LoadProgressBar = {
    type: function() { return "LoadProgressBar" },
    _error = null,
    
    // --- elements ------------------------------------------------

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
    
    // --- start ------------------------------------------------

    canStart: function() {
        return window["JSImporter"] != null
    },
    
    startWhenReady: function() {
        if (this.canStart()) {
            this.start() 
        } else {
            setTimeout(() => { LoadProgressBar.startWhenReady() }, 100)
        }
    },
    
    start: function() {
        this.setupHtml()
        this.initTitle()
        this.registerForWindowError()
        this.registerForImports()
        return this
    },
    
    setupHtml: function() {
        document.body.innerHTML = "<div id='Spinner'> \
    		<div id='SpinnerTitle' style='transition: all .6s ease-out;'></div><br> \
    		<div id='SpinnerSubtitle' style='transition: all .3s ease-out; letter-spacing: -2.5px;'></div><br> \
    		<div id='SpinnerItem' style='color: transparent; transition: all 0.3s ease-out;'></div><br> \
    		<div id='SpinnerError' style='color: red; transition: all .6s ease-out; text-align: center; width: 100%;'></div> \
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
    
    initTitle: function() {
        var title = this.titleElement()
		title.style.color = "#aaa"
		title.innerHTML = "PEER LOADING"
		return this        
    },
    
    // --- callabcks ------------------------------------------------

    registerForImports: function() {
        this._importerUrlCallback = (url) => { this.didImportUrl(url) }
        JSImporter.pushUrlLoadingCallback(this._importerUrlCallback)

		this._importerErrorCallback = (error) => { this.setError(error) }
        JSImporter.pushErrorCallback(this._importerErrorCallback)
        
        return this
    },
    
    unregisterForImports: function() {
      	JSImporter.removeUrlCallback(this._importerUrlCallback)
      	JSImporter.removeErrorCallback(this._importerErrorCallback)
        return this
    },
    
    didImportUrl: function(url) {        
        this.incrementItemCount()
    	this.setCurrentItem(url.split("/").pop())
    	return this
    },

	registerForWindowError: function() {
		this._windowErrorCallback = (errorMsg, url, lineNumber, column, errorObj) => {
			this.titleElement().innerHTML = "ERROR"
			var s = "" + errorMsg 
			
			if (url) {
				s += ' in ' + url.split("/").pop() + ' Line: ' + lineNumber  //+ ' Column: ' + column 
			}
			
			/*
			if (errorObj) {
				s += '<br><br>' +  this.stringForError(errorObj).split("\n").join("<br>")
			}
			*/
			
		    this.setError(s)
		    return false;
		}
		
		window.onerror = this._windowErrorCallback
    },
    
    unregisterForWindowError: function() {
		if (window.onerror == this._windowErrorCallback) {
		    delete window.onerror
		}
    },
    
    /*
    isPresent: function() {
        return this.mainElement() != null
    },
    */
    
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
        item.style.opacity = 0
        item.style.color = "#444"
    	item.currentValue = itemName	
    	item.innerHTML = itemName	
    	setTimeout(() => { 
    	    if (item.currentValue == item.innerHTML) {
    	        item.style.opacity = 1
	        }
    	}, 0)
        return this
    },
    
    setError: function(error) {
        this._error = error
		//console.warn("LoadProgressBar setError " + error)
        this.errorElement().innerHTML = error
        return this
    },
    
    error: function() {
        return this._error
    },
    
    removeMainElement: function() {
      var e = this.mainElement()
        if (e) {
		    e.parentNode.removeChild(e)
	    }        
    },

    stop: function() {
        this.removeMainElement()
		this.unregisterForImports()
		this.unregisterForWindowError()
	    delete window[this.type()]
	    return this
    },
}

LoadProgressBar.startWhenReady()
