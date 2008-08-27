/**
* Copyright (c) 2008, m.j.milicevic <me at machak.com>
*
* Permission to use, copy, modify, distribute and sell this software
* and its documentation for any purpose is hereby granted without fee,
* provided that the above copyright notice appears in all copies and
* that both that copyright notice and this permission notice appear
* in supporting documentation.  Silicon Graphics makes no
* representations about the suitability of this software for any
* purpose.  It is provided "as is" without express or implied warranty.
*/
Array.extend({
	getFirst:function(prop, val)
	{
		var a = this.filter(function(i){
			return i[prop] == val;
		});
		if(a.length > 0) 
			return a[0];
		return null;
	}
});
Element.extend({
    hide: function(){
        this.style.visibility = 'hidden';
    },    
    show: function(){
         this.style.visibility = 'visible';
    },
	center: function(elm){
		this.setStyle('top', (elm.size().y - this.size().y)/2);
		this.setStyle('left', (elm.size().x - this.size().x)/2);
		return this;
    },
	size: function(){
		return this.getSize().size;
	},
	pos: function(){
		return this.getPosition();
	},
	onScreen: function(){
		return !( 
		this.pos().x > window.getWidth() 	||
        this.pos().x + this.size().x < 0	||
        this.pos().y  > window.getHeight()	||
        this.pos().y + this.size().y  < 0 
        );
	}
});
if (typeof DOMParser == "undefined") {
   DOMParser = function () {}

   DOMParser.prototype.parseFromString = function (str, contentType) {
      if (typeof ActiveXObject != "undefined") {
         var d = new ActiveXObject("MSXML.DomDocument");
         d.loadXML(str);
         return d;
      } else if (typeof XMLHttpRequest != "undefined") {
         var req = new XMLHttpRequest;
         req.open("GET", "data:" + (contentType || "application/xml") +
                         ";charset=utf-8," + encodeURIComponent(str), false);
         if (req.overrideMimeType) {
            req.overrideMimeType(contentType);
         }
         req.send(null);
         return req.responseXML;
      }
   }
}
/*
if (typeof DOMParser == "undefined"){
	DOMParser = function () {};
	DOMParser.prototype.parseXML = function (txt, contentType){
		if (ActiveXObject != "undefined"){
			var doc = new ActiveXObject("MSXML.DomDocument");
			doc.loadXML(txt);
			return doc;
		}
		else if (typeof XMLHttpRequest != "undefined"){
			var req = new XMLHttpRequest;
			req.open("GET", "data:" + (contentType || "application/xml") + ";charset=utf-8," + encodeURIComponent(txt), false);
			if (req.overrideMimeType){
				req.overrideMimeType(contentType);
			}
			req.send(null);
			return req.responseXML;
		}
	}
}
*/


