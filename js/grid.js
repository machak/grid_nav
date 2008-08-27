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

var GridManager = new Class({
	initialize:function (){
		this.grids = [];
		document.addEvent('keyup',this.onKey.bind(this));	
		window.addEvent('backbutton', this.back.bind(this));
	},
	activate: function(name){
		this.get(name).run();
	},
	back:function(e){		
		return this.hash(e.hash);
	},
	hash:function(url){
		var res = this.grids.filter(function(g){return g.get(url) !=null;},this);
		if(res[0]){
			if(!res[0].active)this.get(res[0].name).run();
			res[0].activate(url);
			return true;
		}
		return false;
	},
/*
		up:function(g){
		this.grids.each(function(i){i.setZ(1)},this);
		g.setZ(99);
	},
*/
	add:function(o){
		var g = new Grid(this,o);
		this.grids.push(g);        
		g.hide();
	},
	get:function(name){
		var g = this.grids.getFirst('name', name);
		if(this.active && this.active != g) this.active.hide();
		this.active = g;
		g.show();
		return g;
	},	
	onKey:function(e){
		e = new Event(e);
		var up = e.key == 'up' || e.key == 'left';
		var down = e.key == 'down' || e.key == 'right';
		if(this.active && (up || down)){
			if(!this.active.active){this.active.run();return;}
			var p = this.active.active;
			if(down && p.prev) p.prev.activate() 
			else if(p.next)p.next.activate();
		}		
	}
});


var Page = new Class({
	initialize: function(grid, obj){	
		this.offX = this.offY = this.row = this.column = this.idx = 0;
		this.loaded = false;
		this.speed = 250;
		this.trans =  Fx.Transitions.Quad.easeOut;
		this.url = obj && obj.url; 
		this.name = obj && obj.name; 
		this.dummy = !this.url;
		this.grid = grid;
		this.wrapper = new Element('div',{'class':'grid-page'}).inject(this.grid.wrapper);
		this.wrapper.addEvent('click', this.activate.bind(this,[true]));
		this.wrapper.addEvent('mouseenter', this.unfade.bind(this));
		this.wrapper.addEvent('mouseleave', this.fade.bind(this));
		if(this.url){
			this.loader = new Element('div',{'class':'grid-page-loader'}).inject(this.wrapper);
			new Element('img',{'src':'img/waiting.gif'}).inject(this.loader);
			this.loader.center(this.wrapper).hide();			
			//this.title = new Element('div',{'class':'grid-page-title'}).inject(this.wrapper);
			this.nav = new Element('div',{'class':'grid-page-nav'}).inject(this.wrapper);
			//this.body = new Element('div',{'class':'grid-page-body'}).inject(this.wrapper);	
			this.body = new Element('div').inject(this.wrapper);	
		}
		else{this.wrapper.hide();}
		this.grid.onPageAdd(this);
		this.fade();
	},
	load:function(){
		if(!this.url || this.loaded){return;}
		this.loader.show();
		this.ajax = new Ajax(this.url, {
			method: 'get',
			onComplete: this.onLoad.bind(this),
			onFailure: this.onFail.bind(this)
		}).request();
	},
	onFail:function(){
		this.loaded = true;
		this.loader.hide();
	},
	activate: function(h){
		this.active = true;
		this.load();
		this.wrapper.setStyles({cursor:'default'});
		this.grid.onPageActive(this);
		if(h){window.addHistory(this.url);}
	},
	deactivate: function(){		
		this.active = false;
		this.fade();
	},
	size: function(){
		return this.wrapper.size();
	},
	pos: function(){
		return this.wrapper.pos();
	},
	unfade: function(e){
		if(!this.dummy){this.wrapper.effects({duration:this.speed,transition:this.trans}).start({'opacity':[1]});}
	},
	fade: function(e){
		if(!(this.active || this.dummy)){
			this.wrapper.setStyles({cursor:window.ie?'hand':'pointer'});
			this.wrapper.effects({duration:this.speed,transition: this.trans}).start({'opacity':[0.6]});
		}
	},
	onLoad:function(txt){		
		var kids = new DOMParser().parseFromString(txt, "text/xml").childNodes;	
		outer:for(var i=0; i < kids.length; i++){
			if(kids[i].nodeName == 'page'){
				for(var x=0; x < kids[i].childNodes.length;x++){
					if(kids[i].childNodes[x].nodeName=='body'){
						this.body.innerHTML = kids[i].childNodes[x].firstChild.nodeValue;break outer;
					}
				}
			}
		}		
		this.loader.hide();
		this.loaded = true;
	}	
});

var Nav = new Class({
	initialize:function(grid){
		this.grid = grid;	
		this.pages = this.grid.lpages;
		this.items = [];
		this.pages.each(function(p){this.items.push({page:p,url:p.url,name:p.name});},this);
		this.pages.map(this.create, this);
	},
	create:function(p){
		p.ul = new Element('ul',{'class':'grid-page-ul'}).inject(p.nav);
		this.items.map(function(i){
			p.li = new Element('li',{'class':'grid-page-ul-li'});
			p.a = new Element('a',{'href':i.url});
			p.li.inject(p.ul);
			p.a.inject(p.li).setHTML(i.name);
			p.a.addEvent('click', function (e){new Event(e).stop();this.activate(true);}.bind(i.page));
		});
	}
});

var Grid = new Class({
	initialize: function(o,opt){
		this.owner = o;
		this.name = opt.name; 
		this.pages = [], 
		this.urls = opt.pages;
		this.speed = 500;
		this.columns = opt.columns;
		this.spacing = opt.spacing;
		this.wrapper = new Element('div',{'class':'grid'}).inject(document.body);
		this.urls.each(function(u){this.add(u);},this);
		this.lpages = this.pages.filter(function(p){return !p.dummy;},this);
		this.lpages.each(function(p,i){
				if(i==0){
					p.prev= this.lpages[this.lpages.length-1];
					p.next = this.lpages[i+1];
				}else if(i==this.lpages.length-1){
					p.next = this.lpages[0];
					p.prev = this.lpages[i-1];
				}else{
					p.next = this.lpages[i+1];
					p.prev = this.lpages[i-1];
				}
			},this);

		this.nav = new Nav(this);
		window.addEvent('resize', this.onResize.bind(this));
	},
	run: function(){
		this.lpages.getFirst('dummy', false).activate();
	},
	setZ: function(z){
		this.wrapper.setStyle('z-index',z);
	},
	hide: function(){
		this.wrapper.setStyle('display','none'); 
	},
	show: function(){
		this.wrapper.setStyle('display','block'); 
	},
	onResize: function(){
		if(this.active){this.slideX();}
	},
	activate: function(x){
		var page = (typeof x == 'string') ? this.get(x) : this.pages[x];
		if(page && page != this.active){page.activate();}		
	},
	get:function(url){
		return  this.pages.getFirst('url', url);
	},
	add: function(obj){
		this.pages.push(new Page(this, obj));
	},
	onPageActive: function(page){
		this.pages.each(function(p){if(p != page){p.deactivate();}});	
		this.active = page;
		this.slideX();	
		//this.owner.up(this);
	},
	getX:function(){
		return (window.getWidth() - this.active.size().x)/2  - this.active.offX; 
	},
	getY:function(){
		return (window.getHeight() - this.active.size().y)/2 - this.active.offY; 
	},
	slideX:function(){
		var x = new Fx.Style(this.wrapper, 'top', {duration: this.speed, transition: this.active.trans, onComplete:this.slideY.bind(this)});
		x.start(this.wrapper.pos().y, this.getY());
	},
	slideY:function(){
		var y = new Fx.Style(this.wrapper, 'left', {duration:  this.speed, transition: this.active.trans, onComplete:this.loadVisible.bind(this)});
		y.start(this.wrapper.pos().x, this.getX());
	},
	loadVisible: function()
	{
		this.active.unfade();
		this.pages.each(function(p){if(p.wrapper.onScreen()){p.load();}});	
	},
	onPageAdd: function(p)
	{				
		var i = this.pages.length;
		if(i>0){		
			var pp = this.pages[i-1];
			p.idx = i;
			p.row  = Math.floor(i/this.columns);
			if((p.column  = i % this.columns) == 0){
				p.wrapper.setStyle('left', 0);
			}
			else{
				p.offX = this.spacing + pp.pos().x + pp.size().x;	
				p.wrapper.setStyle('left', p.offX);				
			}
			if(p.row > 0){
				p.offY = this.spacing + this.pages[i - this.columns].pos().y + this.pages[i - this.columns].size().y;
				p.wrapper.setStyle('top', p.offY);
			}
		}
	}
});