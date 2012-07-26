UC.Room = Ember.Object.extend({
	
});


UC.Messages = Ember.Object.create({
	"messages": Ember.A([]),
	"lastUpdate": moment().subtract('days', 1).format("YYYY-MM-DD HH:mm:ss"),
	"current": Ember.A([]),
	"lastTwitterUpdateString": Array(),
	"lastTwitterUpdateRefresh": Array(),
});

UC.Groups = Ember.Object.extend({
	
});

UC.Message = Ember.Object.create({
	
});

UC.Participants = Ember.Object.create({
	"participants": Ember.A([]),
	"current": Ember.A([]),
	"status": Ember.A([]),
	"currentStatus": Ember.A([]),
	"lastCalUpdate" : moment("2012-01-01", "YYYY-MM-DD").subtract('days', 1).format("YYYY-MM-DD HH:mm:ss"),
	"calendars": Array(),
	"sections": Array(),
	
});


UC.User = Ember.Object.create({
	
});

UC.UserView = Ember.View.extend({
	templateName: 'userview',
	//tagName: 'input',
	val: function(){
		return UC.User.name;
	},
	ch: function(d){
		console.log('new nick: '+d.target.value);
		UC.User.name = d.target.value;
		console.log(UC.User.name);
	}

});


UC.Rooms = Ember.Object.create({
	"rooms": Ember.A([]),
	"messagesInRoomId": Ember.A([]),
});

UC.CurrentRoom = Ember.Object.create({
//	"rooms": Ember.A([])
	"name": 'All',
	"ident": 'all'
});

UC.RoomListView = Ember.View.extend({
	templateName: 'roomlistview',
	changeRoom: function(event){
//		console.log(UC.CurrentRoom.name);
//		console.log(event);
//		console.log('id of clicked: '+event.context.ident);
//		console.log('name of clicked:'+event.context.name);
		UC.CurrentRoom.set('name', event.context.name);
		UC.CurrentRoom.set('ident', event.context.ident);
//		console.log(UC.CurrentRoom.name);
		
		SC.routes.set('location', event.context.ident);
		
//		UC.getMSG();
//		UC.searchTwitter('#'+event.context.name);
	}
});

UC.ParticipantsView = Ember.View.extend({
	templateName: 'participantsview'	
});	

UC.ParticipantsNumber = Ember.View.extend({
	templateName: 'participantsnumber'	
});	

UC.RoomNameView = Ember.View.extend({
	templateName: 'roomnameview',
	tagName: 'a',
	classNames: ['current']
});
UC.ChatView = Ember.View.extend({
	templateName: 'chatview',
	inAll: function(){
		return UC.CurrentRoom.get('ident') == 'all';
	}
});
UC.ScrollBottom = true;
UC.AutoScroll = false;
UC.PubElements;

function removeOlderThan(sec, cal){
	UWAP.store.remove({"type": "msg", "timestamp": { $lt : moment().subtract('seconds', sec).format("YYYY-MM-DD HH:mm:ss")} },
			function(d){
//		console.log('deleted older messages - '+d);
		}, function(err){ console.log(err);});
	if(cal){
		UWAP.store.remove({"type": "cal", "timestamp": { $lt : moment().subtract('seconds', sec).format("YYYY-MM-DD HH:mm:ss")} },
				function(d){
//			console.log('deleted older messages - '+d);
			}, function(err){ console.log(err);});
	}
}

function loggedin(user) {
//	console.log("Logged in.");
//	console.log(user);
	//$("div#out").prepend('<p>Logged in as <strong>' + user.name + '</strong> (<tt>' + user.userid + '</tt>)</p>');
//	$("input#smt").attr('disabled', 'disabled');
	
	var r;
	UC.Rooms.rooms.pushObject({name: "FEIDE", ident: "!public"});
	if(user.groups) {
		groups = user.groups;
	
		for(var key in user.groups) {
			r={name: user.groups[key], ident: key};
			UC.Rooms.rooms.pushObject(r);
			UC.Rooms.messagesInRoomId[key] = Ember.A([]);
//			UC.searchTwitter('#'+user.groups[key]);
		}
		SC.routes.add(':room', UC, UC.roomChange);
		UC.Groups = user.groups;
//		console.log(UC.Groups);
//		console.log('room1: '+UC.Rooms.rooms[0].ident);
		
	}
//	console.log(user);
	UC.User = {name: user.name, status: 'active', ident: user.mail };
//	var uView = new UC.UserView;
//	uView.appendTo('.user_username');
	
	var rView = new UC.RoomListView;
	rView.appendTo('.roomlist');
//	$('.user_username').html(user.name);
//	alert(UC.User.name);
	var cnView = new UC.RoomNameView;
	
	cnView.appendTo('.breadcrumbs');
	
	var partView = new UC.ParticipantsView;
	partView.appendTo('#participants');
		
	UC.getMSG();
	
	chatView = new UC.ChatView;
	chatView.appendTo('#chatoutput');
//	UWAP.store.remove({ "type": "msg"});
	removeOlderThan(3600);
	$("input#chatmsg").focus();//.bind("change", UC.msgInputted);
	$("input#usernameinput").attr('value', UC.User.name);

	$("input#statusinput").attr('value', UC.User.status);
//	var chat = new Chat($("div#chatcontainer"), groups, 'all');
	UC.startLoop();
	UC.getLastVisits();
	
	
	window.addEventListener('focus', function() {
//	    console.log('focused');
	});

	window.addEventListener('blur', function() {
//		console.log('not focused');
	});
	UC.initScheduler();
	UC.getStoredCalendars();
//	$('#chatoutput').tinyscrollbar('bottom');
}
var userScroll = false;  
$("document").ready(function() {
	
	UWAP.auth.require(loggedin);
	$('.dropdown-toggle').dropdown();
//	$("div#chatoutput").change(UC.fixScroll());
 

	function mouseEvent(e) { 
		userScroll = true; 
	} 

	// reset flag on back/forward 
//	$.history.init(function(hash){ 
//		userScroll = false; 
//	}); 

	$('div#chatoutput').keydown(function(e) { 
		if(e.which == 33        // page up 
				|| e.which == 34     // page dn 
				|| e.which == 32     // spacebar
				|| e.which == 38     // up 
				|| e.which == 40     // down 
				|| (e.ctrlKey && e.which == 36)     // ctrl + home 
				|| (e.ctrlKey && e.which == 35)     // ctrl + end 
		) { 
			userScroll = true; 
		} 
	}); 

	// detect user scroll through mouse
	// Mozilla/Webkit 
	if(window.addEventListener) {
		document.getElementById('chatoutput').addEventListener('DOMMouseScroll', mouseEvent, false); 
	}

	//for IE/OPERA etc 
	document.getElementById('chatoutput').onmousewheel = mouseEvent; 


	// to reset flag when named anchors are clicked
	$('a[href*=#]').click(function() { 
		userScroll = false;
	}); 

	// detect browser/user scroll
//	$(document).scroll( function(){  
//		console.log('Scroll initiated by ' + (userScroll == true ? "user" : "browser"));
//	});
	
	
	
	
	var tempScrollTop =0;
	var currentScrollTop = 0;
	$("div#chatoutput").scroll(function(event){
//		console.log(event);
//		console.log(userScroll);
		var scEl = $("#chatoutput")[0];
		if(!UC.AutoScroll){
			UC.ScrollBottom = false;
		}
		if(!UC.ScrollBottom && !userScroll){
			UC.ScrollBottom = true;
			UC.fixScroll();
		}
		UC.AutoScroll = false;
		currentScrollTop = scEl.scrollTop;
//		console.log('top: '+scEl.scrollTop+', height: '+scEl.scrollHeight+' and offsetheight: '+scEl.offsetHeight);
		if( scEl.scrollTop >= (scEl.scrollHeight - scEl.offsetHeight))
		{
//			console.log('scroll is at the bottom');
			UC.ScrollBottom = true;
		}
		if (tempScrollTop < currentScrollTop ){}
		//scrolling down
		else if (tempScrollTop > currentScrollTop ){}
		//scrolling up
		else{
			
		}
//		console.log(tempScrollTop+' scrollto '+currentScrollTop+' scrollHeight:'+$("#chatoutput")[0].scrollHeight);
		tempScrollTop = currentScrollTop;
		
	});
	filedrag();
	
//	$('.nav-tabs').button();
//	$('.btn').button('toggle');

});
UC.ShowingSchedule = false;

Handlebars.registerHelper('link', function(text, url) {
	  text = Handlebars.Utils.escapeExpression(text);
	  url  = Handlebars.Utils.escapeExpression(url);

	  var result = '<a href="' + url + '">' + text + '</a>';

	  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('code', function(msg) {
//	  console.log(this.msg);
//	  code= code.toString();
	  msg = Handlebars.Utils.escapeExpression(this.msg);
//	  url  = Handlebars.Utils.escapeExpression(url);

	  var result = '<pre class="prettyprint codemsg">' + msg + '</pre>';

	  return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('imageHelper', function() {
//	  console.log(this.msg);
//	  code= code.toString();
//	  msg = Handlebars.Utils.escapeExpression(this.msg);
//	  url  = Handlebars.Utils.escapeExpression(url);

	  var result = '<img class="uploadimg" src="'+this.image+'"></img>';

	  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('textarea', function() {
//	  console.log(this.msg);
//	  code= code.toString();
//	  msg = Handlebars.Utils.escapeExpression(this.msg);
//	  url  = Handlebars.Utils.escapeExpression(url);

	  var result = '<textarea rows="5" cols="100%" class="codeinputarea" onchange="UC.msgInputted(\'/code"+this+"\')"></textarea>';

	  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('partisan', function(){
	var result = new Handlebars.SafeString(this);
//	console.log(UC.Participants.current);
//	console.log(result.toString());
	var tempInt = $.inArray(result.toString(), UC.Participants.current);
//	console.log(tempInt);
	UC.updatePartNO();
	if(tempInt>-1 || UC.CurrentRoom.ident == 'all'){
		tempInt = $.inArray(result.toString(), UC.Participants.participants);
		if(UC.Participants.status[tempInt] == 'active'){
			result = '<p class="green">'+result+'</p>';
		}
		else if(UC.Participants.status[tempInt] == 'passive'){
			result = '<span class="orange">'+result+'</span>';
		}
		else {

			result = '<span class="blue">'+result+'</span>';
		}
		return new Handlebars.SafeString(result);
	}
	else{
		
	}
	
});

Handlebars.registerHelper('imageurlhelper', function(){
//	console.log(this.imageurl);
	var image = '<img src='+Handlebars.Utils.escapeExpression(this.imageurl)+'><img>';
//	console.log(image);
	return new Handlebars.SafeString(image);
});

Handlebars.registerHelper('fixScroll', function(){
//	UC.fixScroll();
	
});

Handlebars.registerHelper('timestamphelper', function(){
	
});

Handlebars.registerHelper('createTop', function(){
//	console.log('createTop');
	var result = '';
	if(this.isCode){
		result+='<image height="20px" width="20px" src="images/page_mysql.png"></image><b>'+this.nick;+'</b>';

		if(UC.CurrentRoom.ident == 'all'){
			result+=' in '+UC.getRoomNames(this['uwap-acl-read']).join(', ');

		}
		else{
			
		}
		result+='<span style="float:right;">'+UC.getTimeAgo(this.timestamp)+'</span><br />';
	}
	else if(this.tweet){
		result+='<image height="20px" width="20px" src="images/twitter-bird-light-bgs.png"></image> <b>'+this.from_user;+'</b>';
		if(UC.CurrentRoom.ident == 'all'){
			result+=' in '+UC.getRoomNames(this['uwap-acl-read']).join(', ');

		}
		else{
			
		}
		result+='<span style="float:right;">'+UC.getTimeAgo(this.timestamp)+'</span><br />';
	
	}
	else if(this.nickChange){

		result+='<image height="20px" width="20px" src="images/shield.png"></image><b>'+this.old+' is now known as '+this.new+'</b>';

		if(UC.CurrentRoom.ident == 'all'){
//			result+=' in '+UC.getRoomNames(this['uwap-acl-read']).join(', ');

		}
		else{
			
		}
		result+='<span style="float:right;">'+UC.getTimeAgo(this.timestamp)+'</span><br />';
	}
	else if(this.statusChange){

		result+='<image height="20px" width="20px" src="images/shield.png"></image><b>'+this.nick+' has changed his status to '+this.new +'</b>';

		if(UC.CurrentRoom.ident == 'all'){
//			result+=' in '+UC.getRoomNames(this['uwap-acl-read']).join(', ');

		}
		else{
			
		}
		result+='<span style="float:right;">'+UC.getTimeAgo(this.timestamp)+'</span><br />';
	}
	else if(this.isImageUrl || this.isImageFile){

		result+='<image height="20px" width="20px" src="images/computer_desktop.png"></image><b>'+this.nick;+'</b>';

		if(UC.CurrentRoom.ident == 'all'){
			result+=' in '+UC.getRoomNames(this['uwap-acl-read']).join(', ');

		}
		else{
			
		}
		result+='<span style="float:right;">'+UC.getTimeAgo(this.timestamp)+'</span><br />';
	}
	else{
		result+='<image height="20px" width="20px" src="images/comments.png"></image><b>'+this.nick;+'</b>';

		if(UC.CurrentRoom.ident == 'all'){
			result+=' in '+UC.getRoomNames(this['uwap-acl-read']).join(', ');

		}
		else{
			
		}
		result+='<span style="float:right;">'+UC.getTimeAgo(this.timestamp)+'</span><br />';
	}
	//need icons for: chat, tweet, code, image, status/nick change, picasa
	//has: twitter-bird-light-bgs.png from twitter.com, and shield.png comment.png,page_mysql.png page_javascript.png, computer_desktop.png comments.png from findicons.com, 
	return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('createRoom', function(){
	var result = '';
//	console.log('creating sidebar-room: '+this.ident);
	if(this.ident == UC.CurrentRoom.ident){
		result+='<span ><b>'+this.name+'</b></span>';
	}
	else if(UC.hasUnread(this.ident)){
//		console.log('hasUnread 2.0: '+this.ident);
		result+='<span  class="green">'+this.name+'</span>';
	}
	else{
		result+='<span >'+this.name+'</span>';
	}
	return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('imagefile', function(){
//	console.log(this.imageurl);
	var image = '<img src='+Handlebars.Utils.escapeExpression(this.imageurl)+'><img>';
//	console.log(image);
	return new Handlebars.SafeString(image);
});

(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.innerHeight();
    }
})(jQuery);