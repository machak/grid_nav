/**
	@author m.j.milicevic
	ported script from jsquery..not really tested.. ;-) 
*/
var backButton = {
	e: { hash: '', type: 'init'},
	addEvent: function(type,fn){
		if(type == 'backbutton' && (!this.events || !this.events.backbutton)){
				this.addEvent('domready',backButton.init.bind(backButton));
		}
		return this._addEvent(type,fn);
	},
    init: function(){
        this.makeIframe();
		if(!window.ie){this.checker.periodical(250, this);}
		this.current = 'mooiscool';
		window.addHistory = this.add.bind(this);
    },
    makeIframe: function(){
        if(window.ie){
			var iframe = new Element('iframe',{'id':'moobbfr'}).setStyle('display','none').injectInside(document.body);			
			iframe = $('moobbfr').contentWindow.document;
            iframe.open();
            iframe.close();
            iframe.location.hash = location.hash;
        }
    },
    add: function(hash)
    {
		this.current = hash;
		var newhash = '#' + hash;
		location.hash = newhash;		
        if(window.ie){
			var iframe = $('moobbfr').contentWindow.document;
            iframe.open();
			iframe.close();
            iframe.location.hash = newhash;
        }
    },    
    checker: function() 
    {	
		var hash;
        if(window.ie){
			var iframe = $('moobbfr').contentWindow.document;
			var current_hash = iframe.location.hash;
			if((hash = current_hash.substring(1)) != this.current) {
				location.hash = current_hash;
			    this.trigger(hash);              
            }
        }
        else {
			if((hash = location.hash.substring(1)) != this.current)
	            this.trigger(hash);		   	        
	     }        
     },
	trigger: function(hash) {
		this.current = hash;
		//if(window.ie)location.hash = hash;
		hash =='' ? void(0):this.execute(this.current);
	},
	execute: function(hash) {
		this.e.hash = hash;
		Element.prototype.fireEvent.call(window, 'backbutton', [Object.extend({},this.e)]);
		Object.extend(this.e,{hash: hash, type: 'backbutton' });
	}
}
window.extend({
	_addEvent: window.addEvent,
	addEvent: backButton.addEvent
});