var UC = Ember.Application.create ({
	ready: function(){
		this._super();
		
	},
	startLoop: function(){
		setInterval("UC.getMSG()", 10000);
		setInterval("prettyPrint()", 1000);
		setInterval("UC.updateParticipants()", 10000);
		setInterval("UC.participate()", 7000);
		setInterval("UC.getStoredCalendars()", 10000);
//		setInterval("try {$('#chatoutput')[0].tinyscrollbar();}catch(err){console.log(err);}", 1000);
	},
	getMSG: function(){
		var pastUpdate =UC.Messages.lastUpdate;
		UC.Messages.lastUpdate = moment().format("YYYY-MM-DD HH:mm:ss");
//		console.log(pastUpdate);
//		console.log(UC.Messages.lastUpdate);
		UWAP.store.queryList({type: "msg", "timestamp": { $gt : pastUpdate}}, UC.msgGotten);
	},
	msgGotten: function(d){
//		console.log('messages gotten... do stuff');
//		
		$.each(d, function(i, msg) {
//			UC.Messages.messages.pushObject(msg);	
			UC.insertMSG(msg);
		});
		UC.populateRoom();
		UC.fixScroll();
	},
	msgInputted: function(d){
		$('input#chatmsg').attr('value', '');
		$('input#chatmsg').focus();
//		console.log('message:'+d);
		if(d.substring(0,1)=='/'){
//			console.log('command');
			var commArray = d.split(' ');
			switch(commArray[0]){
			case "/nick": UC.nickChanged(commArray[1]); $("input#usernameinput").attr('value', commArray[1]); break;
			case "/status": UC.statusChanged(commArray[1]); $("input#statusinput").attr('value', commArray[1]); break;
			case "/tweet": var tweet = ''; 
			i=1;
			while(i<commArray.length-1){
				tweet+=commArray[i]+' ';
				i++;
			}
			tweet+=commArray[i];
			var tName = UC.CurrentRoom.name;
			if(tName == 'All'){
				tName = 'FEIDE';
			}
//			console.log(tweet);
//			$.post('https://api.twitter.com/1/statuses/update.json', 'status='+tweet+'&trim_user=true&include_entities=true', UC.tweetCallback );
			UWAP.data.get('https://api.twitter.com/1/statuses/update.json', 
					{handler: 'twitter', method: 'post', data: { status: tweet+' #'+tName, trim_user: "true", include_entities: "true"} }, UC.tweetCallback);
			var msgobj = {
				"tweet": true,
				"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
				"from_user": 'Tweet sent with hashtag: ',
				"text": tweet
			
			};
			var tempArray = new Array();
			if (UC.CurrentRoom.name == "All"){
				tempArray.push('!public');
				msgobj["uwap-acl-read"] = tempArray;
				msgobj.from_user += '#FEIDE';
			} else {			
				tempArray.push(UC.CurrentRoom.ident);
				msgobj["uwap-acl-read"] = tempArray;
				msgobj.from_user += '#'+UC.CurrentRoom.name;
			}
			UC.Messages.current.pushObject(msgobj);
			break;
			case "/html": 
				var html = '';
				i=1;
				while(i<commArray.length){
					html+=commArray[i]+' ';
					i++;
				} break;
			case "/code":
				var code = '';
				i=1;
				while(i<commArray.length-1){
					code+=commArray[i]+' ';
					i++;
				}
				code+=commArray[i];
				
				
				var msgobj = {
						"type": "msg",
						"msg": code,
						"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
						"nick": UC.User.name,
						"isCode": true
				};
				var tempArray = new Array();
				if (UC.CurrentRoom.name == "All"){
					tempArray.push('!public');
					msgobj["uwap-acl-read"] = tempArray;
				} else {			
					tempArray.push(UC.CurrentRoom.ident);
					msgobj["uwap-acl-read"] = tempArray;
				}
				UWAP.store.save(msgobj, function(d){
//					console.log('saved by the: '+d);
//					UC.getMSG();
				});
				
				msgobj.msg = "(Sending...)  "+code;
				UC.Messages.current.pushObject(msgobj);
//				console.log(msgobj); 
				break;
			case "/prettify": prettyPrint(); break;
			case "/codeinput": UC.makeCodeInput(); break;
			case "/imageurl": 
				var msgobj = {
					"type":"msg",
					"isImageURL": true,
					"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
					"nick": UC.User.name,
					"imageurl": commArray[1],
				};
				var tempArray = new Array();
				if (UC.CurrentRoom.name == "All"){
					tempArray.push('!public');
					msgobj["uwap-acl-read"] = tempArray;
				} else {			
					tempArray.push(UC.CurrentRoom.ident);
					msgobj["uwap-acl-read"] = tempArray;
				}
				UWAP.store.save(msgobj, function(d){
//					console.log('saved by the: '+d);
//					UC.getMSG();
				});
				
				msgobj.nick = "(Sending...)  "+msgobj.nick;
				UC.Messages.current.pushObject(msgobj);
//				console.log(msgobj); 
				break;
			case "/imagefile":
				var img = '';
				i=1;
				while(i<commArray.length-1){
					img+=commArray[i]+' ';
					i++;
				}
				img+=commArray[i];
//				console.log('imagefilecase');
				var msgobj = {
						"type": "msg",
						"isImageFile": true,
						"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
						"nick": UC.User.name,
						"imageurl": img,
				};
				var tempArray = new Array();
				if (UC.CurrentRoom.name == "All"){
					tempArray.push('!public');
					msgobj["uwap-acl-read"] = tempArray;
				} else {			
					tempArray.push(UC.CurrentRoom.ident);
					msgobj["uwap-acl-read"] = tempArray;
				}
				UWAP.store.save(msgobj, function(d){
//					console.log('saved by the: '+d);
//					UC.getMSG();
				}, function(err){console.log(err);});
				
				msgobj.nick = "(Sending...)  "+msgobj.nick;
				UC.Messages.current.pushObject(msgobj);
//				console.log(msgobj); 
				break;
			}
			
		}else{
			
		
		var msgobj = {
				"type": "msg",
				"msg": d,
				"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
				"nick": UC.User.name
		};
		var tempArray = new Array();
		if (UC.CurrentRoom.name == "All"){
			tempArray.push('!public');
			msgobj["uwap-acl-read"] = tempArray;
		} else {			
			tempArray.push(UC.CurrentRoom.ident);
			msgobj["uwap-acl-read"] = tempArray;
		}
		UWAP.store.save(msgobj, function(d){
//			console.log('saved by the: '+d);
//			UC.getMSG();
		});
		
		msgobj.msg = "(Sending...)  "+d;
		UC.Messages.current.pushObject(msgobj);
//		console.log(msgobj);
		}
		UC.fixScroll();
		
	},
	makeCodeInput: function(){
		var msgobj = {
				"type": "msg",
				"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
				"codeInput": true
		};
		var tempArray = new Array();
		if (UC.CurrentRoom.name == "All"){
		} else {			
			tempArray.push(UC.CurrentRoom.ident);
			msgobj["uwap-acl-read"] = tempArray;
		}
		UC.Messages.messages.unshiftObject(msgobj);
		UC.populateRoom();
	},
	nickChanged: function(newValue){
		var tempArray = new Array();
		
		var msgobj = {
				"type": "msg",
				"old": UC.User.name,
				"new": newValue,
				"nickChange": true,
				"timestamp": moment().format("YYYY-MM-DD HH:mm:ss")
		}
		$.each(UC.Rooms.rooms, function(i, r){
//			console.log(r);
			tempArray.push(r.ident);
		});
		msgobj["uwap-acl-read"] = tempArray;
		UWAP.store.save(msgobj, function(d){
//			console.log('saved nickChange '+d);
//			UC.getMSG();
		});
		msgobj.old = "(Sending...) "+msgobj.old,
		UC.Messages.current.pushObject(msgobj);
		UC.User.name = newValue;
	},
	statusChanged: function(newValue){
		var tempArray = new Array();
		var msgobj = {
				"type": "msg",
				//"old": UC.User.name,
				"new": newValue,
				"nick": UC.User.name,
				"statusChange": true,
				"timestamp": moment().format("YYYY-MM-DD HH:mm:ss")
		};
		$.each(UC.Rooms.rooms, function(i, r){
//			console.log(r);
			tempArray.push(r.ident);
		});
//			tempArray = UC.Rooms.rooms;
			msgobj["uwap-acl-read"] = tempArray;
		
		UWAP.store.save(msgobj, function(d){
//			console.log('saved statusChange '+d);
//			UC.getMSG();
		});
		msgobj.nick = "(Sending...) "+msgobj.nick,
		UC.Messages.current.pushObject(msgobj);
		UC.User.status = newValue;
	},
	searchTwitter: function(what){
		if($.inArray(what, UC.Messages.lastTwitterUpdateString)>-1){
			UWAP.data.get('http://search.twitter.com/search.json'+UC.Messages.lastTwitterUpdateRefresh[$.inArray(what, UC.Messages.lastTwitterUpdateString)], null, UC.twitterSearchCallback);
		}
		else{
			UWAP.data.get('http://search.twitter.com/search.json?q='+escape(what)+'&rpp=5&include_entities=true&result_type=mixed', null, UC.twitterSearchCallback);
		}
	},
	tweetCallback: function(d){
//		console.log('tweetcallback:');
//		console.log(d);
		
	},
	twitterSearchCallback: function (d){
		UC.Messages.lastTwitterUpdateString[unescape(d.query)]=moment().format('YYYY-MM-DD HH:mm:ss');
		if($.inArray(unescape(d.query), UC.Messages.lastTwitterUpdateString)==-1){
			UC.Messages.lastTwitterUpdateString.push(unescape(d.query));
		}
		UC.Messages.lastTwitterUpdateRefresh[$.inArray(unescape(d.query), UC.Messages.lastTwitterUpdateString)] = d.refresh_url;
//		console.log('roomname of this search should be: '+unescape(d.query.split(escape('#'))[1]));
		var tempRooms = Array(); //UC.Rooms.rooms.filterProperty(unescape(d.query.split(escape('#'))[1]), 'name');
		UC.Rooms.rooms.forEach(function(item, index, enumerable){
				if(item.name == unescape(d.query.split(escape('#'))[1])){
					tempRooms.push(item);
				}
				
		});
//		console.log('tempRooms: ');
//		console.log(tempRooms);
		$.each(d.results, function(i, tweet){
			tweet.timestamp = moment(tweet.created_at).format('YYYY-MM-DD HH:mm:ss');
			tweet.tweet = true;
//			console.log('a tweet needs some rooms');
			tweet["uwap-acl-read"]= Array();
			$.each(tempRooms, function(i2, tRoom){
//				console.log('this is a room');
				tweet["uwap-acl-read"].push(UC.Rooms.rooms.objectAt(UC.Rooms.rooms.indexOf(tempRooms[i2])).ident);
			});
//			console.log('the tweet has its rooms');
			
			var i = 0;
			while(i<UC.Messages.messages.length && UC.Messages.messages.objectAt(i).timestamp<tweet.timestamp){
				i++;
			}
			UC.Messages.messages.insertAt(i, tweet);
		});
		UC.populateRoom();
	},
	insertMSG: function(msg){
		var i = 0;
		while(i<UC.Messages.messages.length && UC.Messages.messages.objectAt(i).timestamp<msg.timestamp){
			i++;
		}
		UC.Messages.messages.insertAt(i, msg);
		
	},
	roomChange: function(d){
//		console.log('roomChange');
		UC.ScrollBottom = true;
		if(d.room == ''){

		} else{
//			console.log('setting ident of currentroom');
//			console.log(UC.CurrentRoom.ident);
//			UC.CurrentRoom.set('name')
			UC.CurrentRoom.set('ident', d.room);
//			console.log(UC.CurrentRoom.ident);
			var nowMom = moment().format('YYYY-MM-DD HH:mm:ss');
			$.each(UC.Rooms.rooms, function (i, r){
				if(r.ident == d.room || r.ident == 'all'){
					UC.Rooms.rooms.objectAt(i).lastVisit = nowMom;//('lastVisit', nowMom);
				}
				if(r.ident == d.room){
					UC.CurrentRoom.set('name', r.name);
				}
			});
//			console.log(UC.Rooms.rooms);
			var thisRoom = UC.CurrentRoom.get('ident');
			UWAP.store.save({type: 'roomVisit', room: thisRoom,
				timestamp: nowMom}, 
				function(){ 
//					console.log('roomvisit saved.. delete old');
				UWAP.store.remove({type: 'roomVisit', room: thisRoom, "timestamp": { $lt : nowMom}}, function(){}, function(err){console.log(err);});			

				}, 
				function(err){console.log(err);});
			UC.searchTwitter('#'+UC.CurrentRoom.name);	
			}
//			console.log(UC.Messages.current);
			UC.populateRoom();
			UC.populateCalendars();
//			console.log(UC.Messages.current);
			UC.participate();
			UC.fixScroll();
			UC.createMessageHeader();
			$('.roomlist').html('');
			var rView = new UC.RoomListView;
			rView.appendTo('.roomlist');
//			UC.getMSG();
		
		
		
	},
	createMessageHeader: function(){
		if(UC.CurrentRoom.get('ident') == 'all'){
			$('h3#msgHead').html('MESSAGES IN ALL ROOMS');			
		}
		else if(UC.CurrentRoom.get('ident') == '!public'){
			$('h3#msgHead').html('MESSAGES FOR EVERYONE IN FEIDE');		
		}
		else{
			$('h3#msgHead').html('MESSAGES IN '+UC.CurrentRoom.get('name'));	
		}
		
	},
	fixScroll: function() {
//		console.log($('div#chatoutput').hasScrollBar());
		if(UC.ScrollBottom){
			UC.AutoScroll = true;
//			console.log($("div#chatoutput")[0].scrollTop);
		//if($("div#chatoutput")[0].scrollTop) == $('div#chatoutput')[0].scrollHeight)
			$("div#chatoutput").animate({
				scrollTop: $('div#chatoutput')[0].scrollHeight}
			);

//			console.log($("div#chatoutput")[0].scrollTop);
			UC.ScrollBottom = true;
			
		}
		
	},
	populateRoom: function(){
		UC.Messages.current.clear();
		if(UC.CurrentRoom.ident == 'all'){
//			console.log('room is all, populating current=messages');
//			console.log(UC.Messages.messages);
//			console.log(UC.Messages.current);
			UC.Messages.current.pushObjects(UC.Messages.messages);
			$.each(UC.Rooms.rooms, function(i2, r){
				UC.Rooms.rooms.objectAt(i2).hasUnread = false;
				UC.Rooms.rooms.objectAt(i2).lastVisit = moment().format("YYYY-MM-DD HH:mm:ss");
			});
//			console.log(UC.Messages.current);
		}
		else{
			var readArray = Array();
			$.each(UC.Rooms.rooms, function(i2, r){
				if(!r.hasUnread){
					readArray.push(i2);
				}
			});
//			console.log('room is not all.. populating');
			
			UC.Messages.messages.forEach(function(item, index, enumerable){
//				console.log('inside each... should check if currentroom');
//				console.log('current ident is '+UC.CurrentRoom.get('ident'));
//				console.log('this message uwap-acl-read: ');
//				console.log(item["uwap-acl-read"]); 
				var tempItem = UC.Messages.messages.objectAt(index);
//				item.publicRoom = false;
				if(item["uwap-acl-read"]== undefined){
//					UC.Messages.messages.objectAt(index).currentRoom = false;
//					console.log('msg public');
				}
				else if($.inArray(UC.CurrentRoom.get('ident'), item["uwap-acl-read"])>-1){
//					console.log('msg is in this room');
					UC.Messages.current.pushObject(tempItem);
					$.each(UC.Rooms.rooms, function(i2, r){
						if($.inArray(UC.Rooms.rooms.objectAt(i2).ident, item["uwap-acl-read"])>-1){
							UC.Rooms.rooms.objectAt(i2).hasUnread = false;
							UC.Rooms.rooms.objectAt(i2).lastVisit = moment().format("YYYY-MM-DD HH:mm:ss");
						}
					});
					
				}
				else{
//					console.log('msg in different room');
					$.each(UC.Rooms.rooms, function(i2, r){
						if($.inArray(UC.Rooms.rooms.objectAt(i2).ident, item["uwap-acl-read"])>-1){
							if(!UC.Rooms.rooms.objectAt(i2).lastVisit || UC.Rooms.rooms.objectAt(i2).lastVisit < item.timestamp){
								UC.Rooms.rooms.objectAt(i2).hasUnread = true;
							}
							
						}
					});		
				}
//				tempEA.shiftObject(item);
			});
		}
//		$.each(UC.Messages.messages, function (i, cm){
//			UC.Messages.current.objectAt(i).read = true;			
//		});
		
		
		
		
	},
	showHelp: function(){
		var helpText="<br /><b>Commands: </b><br /> '/nick newNick' changes your nick to newNick<br /> '/status newStatus' changes your status to newStatus<br /> '/code someCode' " +
				"makes someCode prettier<br />" +
				"'/tweet someTweet' attempts to tweet someTweet" +
				"";
		var msgobj = {
				"type": "msg",
				"help": helpText,
				"showHelp": true,
				"timestamp": moment().format("YYYY-MM-DD HH:mm:ss")
		}
		var tempArray = new Array();
		if (UC.CurrentRoom.name == "All"){
		} else {			
			tempArray.push(UC.CurrentRoom.ident);
			msgobj["uwap-acl-read"] = tempArray;
		}
		UC.Messages.messages.unshiftObject(msgobj);
		UC.populateRoom();
	},
	msgBoxChange: function(index){
		switch(index){
		case "message": 
//			console.log('selected normal message'); 
		$('img#msgSelImg').prop('src', 'images/comments.png');
		$('div#inputter').html('<input style="border-radius: 5px; border: 1px solid #ccc; width: 97%; font-size: 110%" type="text" id="chatmsg" name="chatmsg" onchange="UC.msgInputted(this.value)" value="" style="" />');
		
		break;
		case "code": 
//			console.log('selected code'); 
		$('img#msgSelImg').prop('src', 'images/page_mysql.png');
		$('div#inputter').html('<textarea rows="5" style="border-radius: 5px; border: 1px solid #ccc; width: 100%; font-size: 110%" class="codeinput" onchange="UC.msgInputted(\'/code \'+this.value); UC.msgBoxChange(\'message\');"></textarea>');
		break;
		case "tweet": 
//			console.log('selected tweet');
		$('img#msgSelImg').prop('src', 'images/twitter-bird-light-bgs.png');
		$('div#inputter').html('<input style="border-radius: 5px; border: 1px solid #ccc; width: 97%; font-size: 110%" type="text" id="chatmsg" name="chatmsg" onchange="UC.msgInputted(\'/tweet \'+this.value)" value="" style="" />');
		break;
		case "imageurl": 
//			console.log('selected imageurl');
		$('img#msgSelImg').prop('src', 'images/computer_desktop.png');
		$('div#inputter').html('<input style="border-radius: 5px; border: 1px solid #ccc; width: 97%; font-size: 110%" type="text" id="chatmsg" name="chatmsg" onchange="UC.msgInputted(\'/imageurl \'+this.value); UC.msgBoxChange(\'message\');" value="" style="" />');
		break;
		case "imagefile": 
//			console.log('selected imageurl');
		$('img#msgSelImg').prop('src', 'images/computer_desktop.png');
		$('div#inputter').html('<input style="float:left;" type="file" id="fileselect" name="fileselect[]" multiple="multiple" /><span style="float:right; vertical-align: middle;"> (or drag and drop into messages)</span>');
		fileSelect();
		break;
		}
	},
	updateParticipants: function(){
		UWAP.store.queryList({"type": "participate"}, UC.participantsGotten, function(err) {console.log(err);});
	},
	participate: function(){
		var thisMoment = moment().format("YYYY-MM-DD HH:mm:ss");
//		console.log(thisMoment);
		var msgobj = {
				"type":"participate", "timestamp": thisMoment, "nick": UC.User.name, "status": UC.User.status
				
		};
		var tempArray = new Array();
		$.each(UC.Rooms.rooms, function(i, r){
			tempArray.push(r.ident);	
		});
		
		msgobj["inRooms"] = tempArray;
		
		UWAP.store.save(msgobj, function(){
//			console.log('saved...lets remove');
			UWAP.store.remove({"type":"participate", "timestamp": { $lt : thisMoment}}, function(){}, function(err){console.log(err);});
		});
	},
	participantsGotten: function(d) {
//		UC.Participants.participants.clear();
//		console.log(d);
		var oldParts = Ember.A([]); //UC.Participants.participants;
		$.each(UC.Participants.participants, function(i, p){
			oldParts.unshiftObject(p);
		});
//		console.log(oldParts);
		UC.Participants.participants.clear();
		UC.Participants.status.clear();
		UC.Participants.current.clear();
		
		$.each(d, function(i, p){
			if($.inArray(p.nick, UC.Participants.participants) >-1) {
//				console.log(p.nick+" again");
			}else{
//				console.log(p.timestamp+' vs '+moment().subtract('seconds', 10).format("YYYY-MM-DD HH:mm:ss"));
				if(p.timestamp>moment().subtract('seconds', 10).format("YYYY-MM-DD HH:mm:ss")){
					UC.Participants.participants.unshiftObject(p.nick);
					UC.Participants.status.unshiftObject(p.status);
//					console.log(p.nick+' seems to have joined');
//					console.log(UC.Participants.participants);
//					console.log(UC.Participants.status);
					$.each(p.inRooms, function(i, r){
//						console.log(r);
						if(r==UC.CurrentRoom.ident){
							UC.Participants.current.unshiftObject(p.nick);
							UC.Participants.currentStatus.unshiftObject(p.status);
						}
					});
				}
			}
			if($.inArray(p.nick, oldParts) >-1) {
				
			}else{
//				console.log(p.nick+' seems to have joined');
				UC.checkSectionID(p['uwap-userid']);
			}
			
		});
//		console.log(oldParts);
		$.each(oldParts, function(i, p){
			if($.inArray(p, UC.Participants.participants) >-1) {
//				console.log(p+" was here before");
			}else{
//				UC.Participants.participants.unshiftObject(p.nick);
//				console.log(p+' seems to have left');
			}
		});
		
	},
	updatePartNO: function(){
		var derString;
		if(UC.CurrentRoom.ident == 'all'){
			if(UC.Participants.participants.length == 1){
				derString = "1 online participant";
			}
			else{
				derString = UC.Participants.participants.length+" online participants";
			}
		}
		else{
			if(UC.Participants.current.length == 1){
				derString = "1 online participant";
			}
			else{
				derString = UC.Participants.current.length+" online participants";
			}
//			console.log(derString);
		}
		$('.participantCount').html(derString);
	},
	getRoomNames: function(uwap){
		var roomNames = Array();
//		console.log(uwap);
		if(uwap){
			$.each(uwap, function(i, u){
				UC.Rooms.rooms.forEach(function(item, index, enumerable){
					if(item.ident == u){ //unescape(d.query.split(escape('#'))[1])){
						roomNames.push(item.name);
					}				
				});
			});
		}
//		console.log(roomNames);
		return roomNames;
	},
	getTimeAgo: function(fromTime){
		var fromNow = moment(fromTime, "YYYY-MM-DD HH:mm:ss").fromNow();
		return fromNow;
		
	},
	hasUnread: function(roomIdent){
//		console.log('checking if '+roomIdent+' has any unread messages');
		$.each(UC.Rooms.rooms, function(i2, r){
					if(r.ident ==roomIdent){
//						console.log('correct room... check. result: '+UC.Rooms.rooms.objectAt(i2).hasUnread);
						if(UC.Rooms.rooms.objectAt(i2).hasUnread){
							console.log('hasUnread');
							return true;
						}
//						console.log('does not have unread');
						return false;
					}
		});
		return false;
//		var result = false;
//		console.log('checking if '+roomIdent+' has unread messages..');
//		
//		$.each(UC.Messages.messages, function(i, m){
//			console.log('checking messages..');
//			var tempInt = $.inArray(roomIdent, m['uwap-acl-read']);
//			if(tempInt>-1){
//				console.log(roomIdent+' has messages');
//				if(roomInt && UC.Rooms.rooms.objectAt(roomInt).lastVisit && m.timestamp>UC.Rooms.rooms.objectAt(roomInt).lastVisit){
//					console.log(roomIdent +' hasUnread!');
//					result = true;
//					console.log('behind return');
//				}
//			}
//			
//		});
//		console.log('returning result: '+result);
//		return result;
	},
	getLastVisits: function() {
		UWAP.store.queryList({type: 'roomVisit'}, UC.visitsGotten, function(err){
//			console.log(err);
		});
	},
	visitsGotten: function(d){
//		console.log(d);
		$.each(d, function(i, v){
			if(v.room){
				$.each(UC.Rooms.rooms, function(i2, r){
					if(r.ident ==v.room){
//						console.log('updated visit gotten for room '+v.room);
						r.lastVisit = v.timestamp;
					}
				});
				
			}
		});
	},
	initScheduler: function(){
		scheduler.locale.labels.timeline_tab = "Timeline";
		scheduler.locale.labels.section_custom="Section";
		scheduler.config.details_on_create=true;
		scheduler.config.details_on_dblclick=true;
		scheduler.config.xml_date="%Y-%m-%d %H:%i";
		
		
		//===============
		//Configuration
		//===============	
		
		elements = [ // original hierarhical array to display
//			{key:10, label:"My calendar", open: true, children: [
//			{key:11, label: UC.User.name}	]},
			{key:20, label: "V&aelig;rmelding", open: false, children: [
			{key:21, label: "<button class='btn btn-inverse' id='weatherbutton' onclick=\"navigator.geolocation.getCurrentPosition(function(d){console.log(\'found location: \'+d.coords.latitude); UWAP.data.get(\'http://api.met.no/weatherapi/locationforecastlts/1.1/?lat=\'+d.coords.latitude+\';lon=\'+d.coords.longitude, {xml:\'1\'}, UC.weatherCallback, UC.weatherFail);}, function(err){console.log(\'error in finding location: \'+err)} );\">Hent v&aelig;rdata fra met.no</button>"} ]},
			{key:30, label: "Calendars", open:false, children: []}
			
			];
		UC.pubElements = elements;
		
		
		scheduler.createTimelineView({
			section_autoheight: false,
			name:	"timeline",
			x_unit:	"minute",
			x_date:	"%H:%i",
			x_step:	30,
			x_size: 24,
			x_start: 16,
			x_length:	48,
			y_unit: elements,
			y_property:	"section_id",
			render: "tree",
			folder_dy:20,
			dy:60
		});
		
		
		

		//===============
		//Data loading
		//===============
		scheduler.config.lightbox.sections=[	
			{name:"description", height:130, map_to:"text", type:"textarea" , focus:true},
			{name:"custom", height:23, type:"timeline", options:null , map_to:"section_id" }, //type should be the same as name of the tab
			{name:"time", height:72, type:"time", map_to:"auto"}
		];
		
		scheduler.init('scheduler_here',new Date(),"timeline");
		
//		scheduler.attachEvent("onEventSave", function(event_id,event_object){
//			var tempEvent = {};
//			tempEvent.end = moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss");
//			tempEvent.start = moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss");
//			tempEvent.id = event_object.id;
//			tempEvent.text = event_object.text;	event_object.start_date = moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss");
//			console.log(tempEvent);
//			UC.saveEvent(tempEvent);
//			return true;
//		});
////		scheduler.attachEvent("onEventDeleted", function(event_id){
//			console.log(event_id);
//			UWAP.store.remove({ "event.id": event_id}, function(){ console.log('event removed from db');},
//					function(err){console.log(err);});
//		});
		  scheduler.attachEvent("onBeforeEventDelete", function(event_id,event_object){
              //any custom logic here
//			  console.log(event_object);
//			  console.log({"event.end":moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss"), "event.start": moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss"), "event.text": event_object.text });
			  UWAP.store.remove({"event.end":moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss"), "event.start": moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss")}, //, "event.text": event_object.text },
					  function(){console.log('event removed');}, function(err){console.log(err);});
			  return true;
		  });
//		  scheduler.attachEvent("onEventChanged", function(event_id,event_object){
//              //any custom logic here
//			  UWAP.store.remove({"event.end":moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss"), "event.start": moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss")}, //, "event.text": event_object.text },
//					  function(){console.log('event removed...add new');
//			  			}, function(err){console.log(err);});
//			  var tempEvent = {};
//			  tempEvent.end = moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss");
//				tempEvent.start = moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss");
//				tempEvent.id = event_object.id;
//				tempEvent.text = event_object.text;	event_object.start_date = moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss");
//				console.log(tempEvent);
//				UC.saveEvent(tempEvent);
//				return true;
//		  });
		  scheduler.attachEvent("onBeforeEventChanged", function(event_object, native_event, is_new){
		       //any custom logic here
//			  console.log(is_new);
//			  console.log(native_event);
			  
			  if(is_new){
				  
			  }
			  else{
				  UWAP.store.remove({"event.end":moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss"), "event.start": moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss")}, //, "event.text": event_object.text },
						  function(){console.log('event removed');}, function(err){console.log(err);});
				  
			  }
			  var tempEvent = {};
				tempEvent.end = moment(event_object.end_date.toString()).format("YYYY-MM-DD HH:mm:ss");
				tempEvent.start = moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss");
				tempEvent.id = event_object.id;
				tempEvent.text = event_object.text;	event_object.start_date = moment(event_object.start_date.toString()).format("YYYY-MM-DD HH:mm:ss");
				console.log(tempEvent);
				UC.saveEvent(tempEvent);
		       return true;
		  });
		
		UC.updateScheduler();
		
	},
	updateScheduler: function(){
		scheduler.createTimelineView({
			section_autoheight: false,
			name:	"timeline",
			x_unit:	"minute",
			x_date:	"%H:%i",
			x_step:	60,
			x_size: 12,
			x_start: 8,
			x_length:	24,
			y_unit: UC.pubElements,
			y_property:	"section_id",
			render: "tree",
			folder_dy:20,
			dy:60
		});
		
		
		

		//===============
		//Data loading
		//===============
//		scheduler.config.lightbox.sections=[	
//			{name:"description", height:130, map_to:"text", type:"textarea" , focus:true},
//			{name:"custom", height:23, type:"timeline", options:null , map_to:"section_id" }, //type should be the same as name of the tab
//			{name:"time", height:72, type:"time", map_to:"auto"}
//		];
		
//		scheduler.init('scheduler_here',new Date(),"timeline");
//		console.log('scheduler inited');
		$('.dhx_scell_level10').bind('click', function(d){console.log('change:'); console.log(d);});
	},
	toggleScheduler: function(toggle) {
//		console.log(toggle);
		if(UC.ShowingSchedule){
			$('button#scheduleToggler').button('toggle');
			UC.ShowingSchedule = false;
			$('div#chatoutput').css('height', '600px');
			$('div#scheduler_here').css('height', '100%');
			
		}
		else{
			$('button#scheduleToggler').button('toggle');
			UC.ShowingSchedule = true;
			$('div#chatoutput').css('height', '300px');
			$('div#scheduler_here').css('height', '300px');
			scheduler.closeAllSections();
		}
	},
	insertCalendar: function(cal){
		
	},
	insertEvent: function(event, calId){
		scheduler.addEvent({
			start_date: event.start_date,
			end_date:event.end_date,
			test: event.text,
			section_id: calId
		});
	},
	weatherCallback: function(d) {
		var attr;
		var symbolNo;
		var tempInt = 0;
		_.each(d.product.time, function(pt){
//			console.log(pt);
//			console.log('attributes:');
			attr = pt["@attributes"];
			tempInt++;
			if(pt.location.symbol  && pt.location.symbolProbability){//}["@attributes"].value<2){
				tempInt =0;
//				console.log('pt.location.symbol exists with pt.location.symbolProbability["@attributes"].value: '+pt.location.symbolProbability['@attributes'].value);
				symbolNo = pt.location.symbol["@attributes"].number;
				var fromMoment = moment(attr.from).format("YYYY-MM-DD HH:mm");
				var toMoment = moment(attr.to).format("YYYY-MM-DD HH:mm");
				
				if(moment(attr.to).diff(moment(attr.from), 'minutes') > 200 && moment(attr.to).diff(moment(attr.from), 'minutes') < 400){
//					console.log(moment(fromMoment) + ' - '+ moment(toMoment));
//					console.log(fromMoment +' - ' +toMoment+' is mins apart: '+moment(attr.from).diff(moment(attr.to), 'minutes'));
//					console.log(UC.pubElements);
					scheduler.attachEvent("onEventLoading", function(e){
						console.log('attacheventWeather');
						e.section_id = 21;
						scheduler.addEvent(e);
					});
					scheduler.parse([{ start_date: fromMoment , end_date: toMoment , text: '<image height="16" width="16" src="http://api.met.no/weatherapi/weathericon/1.0/?symbol='+symbolNo+';content_type=image/png"></image>', section_id: 21}],'json');//'<iframe src="http://api.met.no/weatherapi/weathericon/1.0/?symbol='+symbolNo+';content_type=image/png"></iframe>' }]);
				}//makeTimeLine();
			}
		});
	},
	weatherFail: function(err) {
		console.log(err);
	},
	getStoredCalendars: function(){
		//p is participant
		var pastUpdate =UC.Participants.lastCalUpdate;
		var newUpdate = moment().format("YYYY-MM-DD HH:mm:ss");
		UC.Participants.lastCalUpdate = newUpdate;
//		console.log(UC.Participants.lastCalUpdate+' '+pastUpdate);
		UWAP.store.queryList({ type: "cal", "timestamp": { $gt : pastUpdate} }, 
			function(d){
//				console.log(d);
//				UC.Participants.calendars.push(d);
//				UC.populateCalendars();
				$.each(d, function(i, c){
//					UC.Participants.calendars = 
					
					c.event.text = c.event.text+'<br />('+c['uwap-userid']+')';
					UC.Participants.calendars.push(c);
					if($.inArray(c['uwap-userid'], UC.Participants.sections) == -1){
						UC.Participants.sections.push(c['uwap-userid']);
						
					}
					
//					console.log(c);
				});
//				console.log(UC.Participants.sections);
//				console.log(d);
//			UC.Participants.participants
				UC.populateCalendars();
		}, function(err){
//			console.log(err);
		});
	},
	saveEvent: function(event){
//		console.log(event);
		eventobj = {
			"type": "cal",
			"timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
			"event": event,
			"nick" : UC.User.name
				
		};
		var tempArray = new Array();
		if(UC.CurrentRoom.ident == 'all'){
			tempArray.push('!public');
		}
		else{
			tempArray.push(UC.CurrentRoom.ident);
		}
		eventobj['uwap-acl-read'] = tempArray;
//		console.log(eventobj);
		UWAP.store.save(eventobj, function(){console.log('saved');}, function(err){console.log(err);});
		
	},
	deleteAllEvents: function() {
		UWAP.store.remove({ "type": "cal"}, function() {}, function(err){console.log(err);});
	},
	populateCalendars: function() {
//		console.log('schedule-populating');
		scheduler.clearAll();
		UC.pubElements = [ // original hierarhical array to display
//		       			{key:10, label:"My calendar", open: true, children: [
//		       			{key:11, label: UC.User.name}	]},
		       			{key:20, label: "V&aelig;rmelding", open: false, children: [
		       			{key:21, label: "<button class='btn btn-inverse' id='weatherbutton' onclick=\"navigator.geolocation.getCurrentPosition(function(d){console.log(\'found location: \'+d.coords.latitude); UWAP.data.get(\'http://api.met.no/weatherapi/locationforecastlts/1.1/?lat=\'+d.coords.latitude+\';lon=\'+d.coords.longitude, {xml:\'1\'}, UC.weatherCallback, UC.weatherFail);}, function(err){console.log(\'error in finding location: \'+err)} );\">Hent v&aelig;rdata fra met.no</button>"} ]},
		       			{key:30, label: "Calendars", open:false, children: []}
		       			
		       			];
		UC.updateScheduler();
//		UC.initScheduler();
		$.each(UC.Participants.calendars, function(i, c){
//			console.log(c);
				var cend;
				var cstart;
//				console.log(UC.CurrentRoom.ident +' vs '+c['uwap-acl-read']);
				var tempInt = $.inArray(UC.CurrentRoom.ident, c['uwap-acl-read']);
//				console.log(tempInt);
				if(tempInt>-1 || UC.CurrentRoom.ident == 'all'){
//					console.log(c);
					c.event.section_id = UC.checkSectionID(c['uwap-userid']);
//					console.log(c);
					cend = moment(c.event.end, "YYYY-MM-DD HH:mm:ss");
					cstart = moment(c.event.start, "YYYY-MM-DD HH:mm:ss");
					c.event.end_date = new Date(cend.year(), cend.month(), cend.date(), cend.hours(), cend.minutes(), cend.seconds());
					c.event.start_date = new Date(cstart.year(), cstart.month(), cstart.date(), cstart.hours(), cstart.minutes(), cstart.seconds());
//					console.log(cend.year());
//					console.log(c.event.end_date);
					scheduler.addEvent(c.event);
				}
				
		});
	},
	checkSectionID: function(what){
//		console.log(what +' vs '+ UC.User.ident);
		if(what==UC.User.ident){
//			console.log('usercalendar');
			return 11;
		}
		else{
//			console.log('other calendar: '+what);
			var tempInt = $.inArray(what, UC.Participants.sections);
//			console.log(tempInt);
			var tempBool = false;
//			console.log(UC.pubElements[1]);
			$.each(UC.pubElements[1].children, function(i,el){
//				console.log(el);
				if(el.key == 31+tempInt){
//					console.log(true);
					tempBool = true;
				}
			});
			if(!tempBool){
				
				UC.pubElements[1].children.push({ key: 31+tempInt, label: what});
				var whatArray = what.split('@');
//				console.log(whatArray[0]+' and '+ whatArray[1]);
				if(whatArray[1]=='uninett.no'){
//					console.log('getting uninett calendar');
					UWAP.data.get('https://calendar.uninett.no/ics/uninett-'+whatArray[0]+'.ics', null,
							function(d){
//								console.log('calgotten');
								scheduler.attachEvent("onEventLoading", function(e){
//									console.log('attachevent');
									e.section_id = 31+tempInt;
									e.text = e.text+'<br />'+what;
//									console.log(e);
									scheduler.addEvent(e);
								});
								scheduler.parse(d, 'ical');
					}, function(err){console.log(err);});
				}
			}
//			console.log(tempInt);
			return 31+tempInt;
		}
	}
	
});
//UC.store = DS.Store.create();