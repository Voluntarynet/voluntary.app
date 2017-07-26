
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

		this._errorCallback = (error) => {
        	this.setError(error)
        }
        JSImporter.pushErrorCallback(this._errorCallback)        
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
		console.log("LoadSpinner error " + error)
        this.errorElement().innerHTML = error
        return this
    },

    removeIfPresent: function() {
        var e = this.mainElement()
        if (e) {
		    e.parentNode.removeChild(e)
	    }
		
		JSImporter.removeErrorCallback(this._errorCallback)
		
	    delete window.LoadSpinner
    },

    setupHtml: function() {
        document.body.innerHTML = "<div id='Spinner'> \
    		<div id='SpinnerTitle' style='transition: all .6s ease-out;'></div><br> \
    		<div id='SpinnerSubtitle' style='transition: all .3s ease-out; letter-spacing: -2.5px;'></div><br> \
    		<div id='SpinnerItem' style='color: transparent; transition: all .6s ease-out;'></div><br> \
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
        
		window.onerror = (errorMsg, url, lineNumber, column, errorObj) => {
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

        return this
    },

/*
	stringForError: function(error) {
		var lines = error.stack.split("\n")
		var firstLine = lines.removeFirst()
		var out = []
		var indent = "    "
		
		lines.forEach(function (line) {
				if (line.contains("at file")) {
					out.push(["....", line.after("at ").split("/").pop()])
				} else {
					var line = line.split("at ").pop()
					var obj = line.split(".")[0]
					var method = line.split(".").pop().split(" (")[0]
					var path = line.split("(").pop().split(")")[0]
					var filePart = path.split("/").pop()
					var file = filePart.before(":")
					if (file == null) { 
						file = "???.js:??:?"
					}
					var className = file.split(".js")[0]
					var location = filePart.after(":")
					out.push([className + " " + method + "()      ", file + ":" + location])
				}
		})
		
		var s = firstLine + "\n"
		var m = out.maxValue(function(entry) { return entry[0].length })
		out.forEach(function (entry) {
			s += indent + entry[0] + " ".repeat(m + 1 - entry[0].length) + entry[1] + "\n"
		})
		
		return s
	},
      */
  
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