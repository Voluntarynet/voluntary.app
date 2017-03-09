
/// String

String.prototype.capitalizeWords = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { 
        return a.toUpperCase(); 
    });
};

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

/// Array

Array.prototype.itemsBefore = function(item) {
    var index = this.indexOf(item);
    if (index != -1) {
        return this.slice(0, index);
    }  
    return this
};

Array.prototype.union = function(a) 
{
    var r = this.slice(0);
    a.forEach(function(i) { if (r.indexOf(i) < 0) r.push(i); });
    return r;
};

Array.prototype.diff = function(a)
{
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/// Object

Object.prototype.slotNames = function() {
  var keys = [];
  for (var k in this) {
    if (this.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return keys;
}

Object.prototype.slotValues = function() {
  var values = [];
  for (var k in this) {
    if (this.hasOwnProperty(k)) {
      values.push(this[k]);
    }
  }
  return values;
}


// Objective-C like associations

Object.prototype._globalAssocationWeakMap = new WeakMap()

Object.prototype.associationDict = function() {
    var map = Object.prototype._globalAssocationWeakMap
    
    if (!map.has(this)) {
        map.set(this, {})
    }
    
    return map.get(this)
}


/// Proto

ideal.Proto.uniqueId = function () {
    return this._uniqueId
}

// Extra

function ShowStack() {
    console.log( new Error().stack );
}


function escapeHtml() {
    return this.replace(/[&<>"'\/]/g, function (s) {
      var entityMap = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': '&quot;',
          "'": '&#39;',
          "/": '&#x2F;'
        };

      return entityMap[s];
    });
}

if (typeof(String.prototype.escapeHtml) !== 'function') {
    String.prototype.escapeHtml = escapeHtml;
}

function GUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}