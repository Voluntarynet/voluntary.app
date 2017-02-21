


Message = {
    _content: "",
    _stamp: null,
    _difficulty: 1,
    
    addStamp: function() {
        var timeout = 1000*30
        this._stamp = ComputeHashCash(content, this._difficulty, timeout)
        return this._stamp != null
    },
    
    asString: function() {
        this.addStamp()
        return JSON.stringify({ content: this._content, stamp: _stamp })
    },
    
    setFromString: function(s) {
        var dict = JSON.parse(s)
        this._content = dict.content
        this._stamp = dict.stamp
    },
    
    hasValidStamp: function() {
        return VerifyHashCash(dict.content, this._difficulty)
    }
}