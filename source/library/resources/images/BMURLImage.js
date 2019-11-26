"use strict"

/*

    BMURLImage

*/

BMNode.newSubclassNamed("BMURLImage").newSlots({
    path: "",
    dataURL: "",
}).setSlots({

    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
        return this
    },

    title: function() {
        return this.path().fileName()
    },

    subtitle: function() {
        return this.path().pathExtension()
    },

    setPath: function(aPath) {
        if (this._path !== aPath) {
            this._path = aPath
            this.loadDataURL()
        }
        return this
    },

    loadDataURL: function() {
        if (this.isDebugging()) {
            this.debugLog(".loadDataURL() " + this.path())
        }

        const request = new XMLHttpRequest();
        request.open("get", this.path());
        request.responseType = "blob";
        request.onload = () => { this.loadedRequest(request) };
        request.send();
        return this
    },

    loadedRequest: function(request) {

        if (this.isDebugging()) {
            this.debugLog(".loadedRequest() ", request)
        }

        const fileReader = new FileReader();

        fileReader.onload = () => {
            const dataURL = fileReader.result
            this.setDataURL(dataURL);

            if (this.isDebugging()) {
                this.debugLog(" setDataURL() ", dataURL)
            }

        };

        fileReader.readAsDataURL(request.response); 
        
        return this
    },

    didFetchDataURL: function(dataURL) {
        this.setDataURL(dataURL);
        
        /*
        // now just to show that passing to a canvas doesn't hold the same results
        var canvas = document.createElement("canvas");
        canvas.width = myImage.naturalWidth;
        canvas.height = myImage.naturalHeight;
        canvas.getContext("2d").drawImage(myImage, 0, 0);
        */

        return this
    },

}).initThisProto()
