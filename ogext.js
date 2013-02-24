Info('ITP OGame Super Fleet Dispatcher Extension [LOADED]');

/// GLOBALS ///
// dict - loaded from ogextdict.js
SFD_SENDING_MODES = new Array('VOLLEY_MODE', 'MANUAL_MODE');
var sendingFleet=null;
var sendingVolley=null;
///////////////
Storage.prototype.setObject = function(key, value) { this.setItem(key, JSON.stringify(value)); };
Storage.prototype.getObject = function(key) { return JSON.parse(this.getItem(key)); };
//////////////////////////////////////////////////////////////////////////////////////////////////////
var moduleDomId='TEST OGame Basic Fleet Dispatcher Extension';
IsModuleLoaded(moduleDomId,true);
//////////////////////////////////////////////////////////////////////////////////////////////////////

if(document.location.href.indexOf('page=fleet1')!=-1){
	sessionStorage.fleetData='{"fleetForms":[],"dict":{}}';
	InjectSFDView();
	InjectBFDView();
	CatchSubmitOnFleetView(1,'shipsChosen','continue');
}

if(document.location.href.indexOf('page=fleet2')!=-1){
	CatchSubmitOnFleetView(2,'details','continue');
}

if(document.location.href.indexOf('page=fleet3')!=-1){
	sessionStorage.saveFleet=false;
	Fleet3ViewInjection();
	CatchSubmitOnFleetView(3,'sendForm','start');
}

if(document.location.href.indexOf('page=movement')!=-1){
	if(sessionStorage.saveFleet==='true') AddFleetData();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function AddFleetData(){
	var fd=JSON.parse(sessionStorage.fleetData);
	//Info('sessionStorage.fleetData>',sessionStorage.fleetData);
	if(!localStorage.ogeBFD)localStorage.ogeBFD='{"fleets":[],"dict":{}}';
	var bfd=JSON.parse(localStorage.ogeBFD);
	if(bfd.fleets.length==0){
		bfd.dict=JSON.parse(JSON.stringify(fd.dict)); //copy object
	}
	var name=((fd.fleetName!='null')&&(fd.fleetName!=''))?fd.fleetName:fd.missionName;
	bfd.fleets.push({"name":name,"from":fd.fromCoord.replace(/ {1}/,'<br>'),"to":fd.destCoord.replace(/ {1}/,'<br>'),"missionName":fd.missionName,"forms":JSON.stringify(fd.fleetForms)});
	
	localStorage.ogeBFD=JSON.stringify(bfd);
	sessionStorage.saveFleet=false;  //tez zadziala :)
	//Info('AddFleetData:localStorage.ogeBFD>',localStorage.ogeBFD);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function CatchSubmitOnFleetView(view,formName,buttonId){
	if(!document.getElementById('buttonz'))return false;
	var js=''
		+'var e=new Array(),f=document.forms["'+formName+'"],fe=f.elements,fd;'
		+'for(var i=0;i<fe.length;i++){'
		+'e.push({"name":fe[i].name,"value":fe[i].value.replace(/[.]/g,"")});'
		+'};'
		+'fd=JSON.parse(sessionStorage.fleetData);'
		+'fd.fleetForms['+view+']={"action":f.action,"form":e};'
		+((view==3)?'fd.destCoord=document.getElementById("fleetStatusBar").childNodes[1].childNodes[3].childNodes[1].nodeValue;'
			+'fd.bs=document.getElementById("ogeBDFSaveButton").getAttribute("bs");'
			+'fd.fleetName=document.getElementById("ogeBDFSaveButton").getAttribute("BDFName");'
			+'fd.dict.sendFleet=document.getElementById("start").childNodes[1].innerHTML;'
			+'fd.missionName=document.getElementById("missionNameWrapper").childNodes[1].innerHTML;'
			+'sessionStorage.saveFleet=fd.bs;':'')
		+((view==2)?'fd.fromCoord="["+document.getElementById("start").childNodes[5].childNodes[1].innerHTML+"] "+document.getElementById("start").childNodes[1].innerHTML;'
			+'fd.dict.from=document.getElementById("mission").childNodes[1].childNodes[0].childNodes[1].innerHTML;'
			+'fd.dict.to=document.getElementById("mission").childNodes[1].childNodes[0].childNodes[5].innerHTML;'
			+'fd.fleetForms[0]={"action":(f.action.slice(0,-1)+"1&cp="+document.getElementsByName("ogame-planet-id")[0].getAttribute("content")),"form":[]};':'')
		+'sessionStorage.fleetData=JSON.stringify(fd);'
		
	var b=document.getElementById(buttonId);
	if(view!=3){
		b.setAttribute('onclick',js+b.getAttribute('onclick'));
	}else{
		b.setAttribute('onclicknew',js+b.getAttribute('onclick'));
		b.setAttribute('onclickold',b.getAttribute('onclick'));
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Fleet3ViewInjection(){
	var extDiv=document.createElement("div");
	extDiv.innerHTML='<a id="ogeBDFSaveButton" class="ogeBDFSaveButton" bs="false" onclick="var b=!(event.srcElement.getAttribute(\'bs\')===\'true\');event.srcElement.setAttribute(\'bs\',b);if(b){this.style.backgroundPosition=\'0px 0px\';event.srcElement.setAttribute(\'BDFName\',prompt(\'Enter fleet name\',event.srcElement.getAttribute(\'BDFName\')));}else{this.style.backgroundPosition=\'0px -38px\'}" style="background:url('+chrome.extension.getURL('ressources/save.gif')+');background-position-y: -38px"></a>';
	var tmp=document.getElementById("start");
	tmp.parentNode.insertBefore(extDiv.childNodes[0],tmp.nextSibling.nextSibling);
	document.getElementById("ogeBDFSaveButton").addEventListener('click',function(e){var s=sessionStorage.saveFleet=e.srcElement.getAttribute('bs');var b=document.getElementById('start');if(s==='true'){b.setAttribute('onclick',b.getAttribute('onclicknew'))}else{b.setAttribute('onclick',b.getAttribute('onclickold'));}}, false)
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ParseFleetData(fleet){
	//Info('ParseFleetData>',fleet.forms);
	var tip=fleet.missionName+'|',form,data;
	var parsedFF=JSON.parse(fleet.forms);
	var fv,br=false;
	fleet.sendFleetData=new Array();
	
	for(var v=0;v<4;v++){
		form=parsedFF[v].form;
		data='';
	for(var i=0;i<form.length;i++){
		//Info('form3[i].name>',form3[i].name,'<>',form3[i].value,'<');
		if(form[i].name!='') data+=form[i].name+'='+form[i].value+'&';
		
		if(v==3){ //generate fleetTips
			
		fv="<span style='float:right'>"+addCommas(form[i].value)+"</span><br>";
		if(form[i].name.match(/^am/)){
			//Info(form[i].name.replace(/^am/,'button'));
			tip+=document.getElementById(form[i].name.replace(/^am/,'button')).childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].innerHTML;
			tip+=fv;
		}
		if(form[i].name.match(/^metal/)&&form[i].value!=0){
			if(!br){br=true;tip+="<br>"};
			tip+=dict.GetWord('metal')+': '+fv;
		}
		if(form[i].name.match(/^crystal/)&&form[i].value!=0){
			if(!br){br=true;tip+="<br>"};			
			tip+=dict.GetWord('crystal')+': '+fv;
		}
		if(form[i].name.match(/^deuterium/)&&form[i].value!=0){
			if(!br){br=true;tip+="<br>"};
			tip+=dict.GetWord('deuterium')+': '+fv;
		}
		}//v==3
	}//inner for
		data=data.slice(0,-1);
		fleet.sendFleetData.push({"url":parsedFF[v].action,"data":data});
		//Info('send '+v+'> ',parsedFF[v].action);
		//Info("data: ",data)
	}
	fleet.shipsTips=tip;
	delete fleet.forms;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function InjectBFDView(){
	if(!localStorage.ogeBFD||!document.getElementById('buttonz'))return false;
	var fleetsStr=document.getElementById('slots').childNodes[1].childNodes[1].innerHTML.replace(/:/,'');
	var bfd=JSON.parse(localStorage.ogeBFD);
	if(bfd.fleets.length==0){if(document.getElementById("ogeBFDBox"))document.getElementById("ogeBFDBox").innerHTML='';return false;};
	var stripe=true,stripeStr=' rowStripe';

	var tableHTML=''
		+ '<table class="ogeTable" cellspacing="0" cellpadding="0">'
		+ '<tr class="ogeBFDTableItem ogeTableHeader">'
		+ '<td class="ogeColFleet">'+fleetsStr+'</td>'
		+ '<td class="ogeColFT">'+bfd.dict.from+'</td>'
		+ '<td class="ogeColFT">'+bfd.dict.to+'</td>'
		+ '<td class="ogeColAction">'+''+'</td>'
		+ '</tr>';
	
	for(var i=0;i<bfd.fleets.length;i++){
		if(!bfd.fleets[i].shipsTips){
			try{
				ParseFleetData(bfd.fleets[i]);
			}catch(e){
				Info('ParseFleetData Error Fixed');
				bfd.fleets.splice(i,1);
				localStorage.ogeBFD=JSON.stringify(bfd);				
				continue;
			};
			localStorage.ogeBFD=JSON.stringify(bfd);
		}
		
		tableHTML+=''
		+ '<tr class="ogeBFDTableItem'+(stripe?stripeStr:'')+'">'
		+ '<td title="'+bfd.fleets[i].shipsTips+'" class="ogeColFleet tooltipHTML">'+bfd.fleets[i].name+'</td>'
		+ '<td class="ogeColFT">'+bfd.fleets[i].from+'</td>'
		+ '<td class="ogeColFT">'+bfd.fleets[i].to+'</td>'
		+ '<td class="ogeColAction">'
			+'<a id="ogeBFDTrash'+i+'"><img style="margin-left:10px;cursor:pointer" src="'+chrome.extension.getURL('ressources/trash.gif')+'"></a>'
			+'<a id="ogeBFDSend'+i+'" title="'+bfd.dict.sendFleet+'" class="tooltipRight"><img style="margin-left:10px;cursor:pointer" src="'+chrome.extension.getURL('ressources/sendFleet.gif')+'"></a>'
		+'</td>'
		+ '</tr>';
		
		stripe=!stripe;
	};
		tableHTML+='</table>';
		tableHTML+='<span id="ogeExe" onclick="initIndex()"></span>';

	var innerHTML=''
		+ '<div style="text-align:center;background:url('+chrome.extension.getURL('ressources/newsboxheader.gif')+') no-repeat;height:30px;">'
		+ '<span class="ogeBoxTitle">'+''+'</span>'
		+ '</div>'
		+ '<div id="ogeFleetBox" style="padding:10px;background: url('+chrome.extension.getURL('ressources/frame_body.gif')+') repeat-y;">'+tableHTML+'</div>'
		+ '<div style="background: url('+chrome.extension.getURL('ressources/frame_footer.gif')+') no-repeat;height:30px;"></div>';
		
	var extEl=document.createElement("div");
		extEl.id="ogeBFDBox";
		extEl.setAttribute("class","ogeContentBox");
		extEl.innerHTML=innerHTML;

	var dest=document.getElementById("ogeBFDBox");
	if(!dest){
		document.getElementById("inhalt").appendChild(extEl);
	}else{
		document.getElementById("ogeBFDBox").innerHTML=extEl.innerHTML;
	}

	for(var i=0;i<bfd.fleets.length;i++){
		document.getElementById('ogeBFDTrash'+i).onclick=DelFleetClicked;
		document.getElementById('ogeBFDSend'+i).onclick=SendFleetClicked;
	}
	
	document.getElementById("ogeExe").onclick(); //initCluetip - znajdz nowy init
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function InjectSFDView(){
	if(!localStorage.ogeBFD||!document.getElementById('buttonz'))return false;
	var fleetsStr=document.getElementById('slots').childNodes[1].childNodes[1].innerHTML.replace(/:/,'');
	var bfd=JSON.parse(localStorage.ogeBFD);
	if(bfd.fleets.length==0){if(document.getElementById("mySFDBox"))document.getElementById("mySFDBox").innerHTML='';return false;};
	var stripe=true,stripeStr=' rowStripe';

	var HTMLForm = ""
		+ '<form>'
		+ '<input type="radio" name="sendingMode" value="' + SFD_SENDING_MODES.indexOf('VOLLEY_MODE') + '" checked>'
		+ 'Send the <input type="number" id="volleyNumber">th volley of <input type="number" id="fleetsCountVolleyMode"> fleets <br/>'
		+ '<input type="radio" name="sendingMode" value="' + SFD_SENDING_MODES.indexOf('MANUAL_MODE') + '">'
		+ 'Send the <input type="number" id="firstFleetNumber">th fleet and the <input type="number" id="fleetsCountAutoMode"> nexts <br/>'
		+ '<input type="checkbox" id="shouldStandadizeFleets"> Standardize fleets: <br/>'
		+ '<input type="number" id="GTNumber"> Great transportors <br/>'
		+ '<a id="SFDSendButton" style="cursor:pointer">Send Fleets</a>' //TODO: bind this link
		+ '</form>'

	/*var tableHTML='';
		tableHTML+='<span id="ogeExe" onclick="initIndex()"></span>';*/

	var innerHTML=''
		+ '<div style="text-align:center;background:url('+chrome.extension.getURL('ressources/newsboxheader.gif')+') no-repeat;height:30px;">'
		+ '<span class="ogeBoxTitle">'+''+'</span>'
		+ '</div>'
		+ '<div id="mySFDBoxIn" style="padding:10px;background: url('+chrome.extension.getURL('ressources/frame_body.gif')+') repeat-y;">'+HTMLForm+'</div>'
		+ '<div style="background: url('+chrome.extension.getURL('ressources/frame_footer.gif')+') no-repeat;height:30px;"></div>';
		
	var extEl=document.createElement("div");
		extEl.id="mySFDBox";
		extEl.setAttribute("class","ogeContentBox");
		extEl.innerHTML=innerHTML;

	var dest=document.getElementById("mySFDBox");
	if(!dest){
		document.getElementById("inhalt").appendChild(extEl);
	}else{
		document.getElementById("mySPDBox").innerHTML=extEl.innerHTML;
	}

	// Bind the sendForm button to the correct handler
	document.getElementById('SFDSendButton').onclick=sendVolleyClicked;
	

	//TODO: WTF is that shit? 
	//document.getElementById("ogeExe").onclick(); //initCluetip - znajdz nowy init
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function InjectCurrentlyDiapachedFleetsView(){
	if(!localStorage.ogeBFD||!document.getElementById('buttonz'))return false;
	var fleetsStr=document.getElementById('slots').childNodes[1].childNodes[1].innerHTML.replace(/:/,'');
	var bfd=JSON.parse(localStorage.ogeBFD);
	if(bfd.fleets.length==0){if(document.getElementById("ogeBFDBox"))document.getElementById("ogeBFDBox").innerHTML='';return false;};
	var stripe=true,stripeStr=' rowStripe';

	var tableHTML=document.getElementById("mySFDBoxIn").innerHTML;
		tableHTML += '<table class="ogeTable" cellspacing="0" cellpadding="0">'
		+ '<tr class="ogeBFDTableItem ogeTableHeader">'
		+ '<td class="ogeColFleet">'+fleetsStr+'</td>'
		+ '<td class="ogeColFT">'+bfd.dict.from+'</td>'
		+ '<td class="ogeColFT">'+bfd.dict.to+'</td>'
		+ '<td class="ogeColAction">'+''+'</td>'
		+ '</tr>';
	
	for(var i = 0 ; i < sendingVolley.length ; i++){
		tableHTML+=''
		+ '<tr class="ogeBFDTableItem'+(stripe?stripeStr:'')+'">'
		+ '<td title="'+sendingVolley[i].shipsTips+'" class="ogeColFleet tooltipHTML">'+sendingVolley[i].name+'</td>'
		+ '<td class="ogeColFT">'+sendingVolley[i].from+'</td>'
		+ '<td class="ogeColFT">'+sendingVolley[i].to+'</td>'
		+ '<td class="ogeColAction">'
			//TODO: binf the right trash
			+'<a id="mySFDTrash'+i+'"><img style="margin-left:10px;cursor:pointer" src="'+chrome.extension.getURL('ressources/trash.gif')+'"></a>'
			+'<img id="mySFDSent'+i+'" style="margin-left:10px;cursor:pointer" src="'+chrome.extension.getURL('ressources/loading.gif')+'">'
		+'</td>'
		+ '</tr>';
		
		stripe=!stripe;
	};
	tableHTML+='</table>';

	document.getElementById("mySFDBoxIn").innerHTML = tableHTML;

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendVolleyClicked(sender) {
	var radios = document.getElementsByName('sendingMode');
	var firstFleetIndex;
	var fleetsCount;

	if (radios[SFD_SENDING_MODES.indexOf('VOLLEY_MODE')].checked) {
		console.log('volley mode');

		fleetsCount = document.getElementById('fleetsCountVolleyMode').value;
		firstFleetIndex = (document.getElementById('volleyNumber').value - 1) * fleetsCount;

		if (firstFleetIndex < 0 || fleetsCount < 1) {
			alert('the volley number and the fleets number should be above 0');
			return;
		}
	} else if (radios[SFD_SENDING_MODES.indexOf('MANUAL_MODE')].checked) {
		console.log('manual mode');

		firstFleetIndex = document.getElementById('firstFleetNumber').value - 1;
		fleetsCount = document.getElementById('fleetsCountAutoMode').value;

		if ((firstFleetNumber > 0) && (fleetsCount > 0)) {
			alert('the first fleet index and the fleets number should be above 0');
			return;
		}
	}

	sendingVolley = JSON.parse(localStorage.ogeBFD).fleets.slice(firstFleetIndex, parseInt(firstFleetIndex, 10) + parseInt(fleetsCount, 10));

	//TODO: create views and link them to sendingVolley elements
	InjectCurrentlyDiapachedFleetsView();
	for (var i = 0 ; i < sendingVolley.length ; i++ ) {
		console.log(document.getElementById('mySFDSent'+i));
		sendingVolley[i].img=document.getElementById('mySFDSent'+i);
	}

	sendNextFleetFromVolley();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendNextFleetFromVolley() {
	if (sendingVolley != null && sendingVolley.length > 0) {
		sendingFleet = sendingVolley[0];
		sendingVolley.splice(0, 1);

		sendingFleet.step = 1;
		sendingFleet.selectedPlanet=document.getElementsByName('ogame-planet-id')[0].getAttribute('content');
		PostXMLHttpRequest(sendingFleet.sendFleetData[0].url,sendingFleet.sendFleetData[0].data,SendFleet);

		console.log(sendingFleet);	
		console.log(sendingVolley);
	} else {
		sendingVolley = null;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function SFD_SendFleet(response){
	var txt=SmartCut(response,'<body id="','"');
	switch(txt)
	{
	case 'fleet1':
		if(sendingFleet.step==1){
			sendingFleet.step++;
			PostXMLHttpRequest(sendingFleet.sendFleetData[1].url,sendingFleet.sendFleetData[1].data,SFD_SendFleet);
		}else{console.log('failed a fleet sending 1')}
	break;
	case 'fleet2':
		if(sendingFleet.step==2){
			sendingFleet.step++;
			PostXMLHttpRequest(sendingFleet.sendFleetData[2].url,sendingFleet.sendFleetData[2].data,SFD_SendFleet);
		}else{console.log('failed a fleet sending 2')}
	break;
	case 'fleet3':
		if(sendingFleet.step==3){
			var token='&token='+SmartCut(response,["token'","='"],"'");
			//Info('Token >',token,'<');
			
			sendingFleet.step++;
			//PostXMLHttpRequest(sendingFleet.sendFleetData[3].url,sendingFleet.sendFleetData[3].data,SendFleet);
			// token due OGame version update
			PostXMLHttpRequest(sendingFleet.sendFleetData[3].url,sendingFleet.sendFleetData[3].data+token,SFD_SendFleet);
			
		}else{console.log('failed a fleet sending 3')}
	break;
	case 'movement':
		if(sendingFleet.step==4){
			console.log('sent successfully a fleet');
			sendNextFleetFromVolley();
		}else{console.log('failed a fleet sending 4');}
	break;
	default:
		console.log('failed a fleet sending default');
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function DelFleetClicked(sender){
	if(sendingFleet==null){	
		var fleetId=sender.srcElement.parentNode.id.replace(/^[^\d]+/,'')*1;

		var bfd=JSON.parse(localStorage.ogeBFD);
		bfd.fleets.splice(fleetId,1);
		localStorage.ogeBFD=JSON.stringify(bfd);
		InjectBFDView(); //refresh view
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function SendFleetClicked(sender){
	if(sendingFleet==null){
		sendingFleet=JSON.parse(localStorage.ogeBFD).fleets[sender.srcElement.parentNode.id.replace(/^[^\d]+/,'')*1];
		sendingFleet.step=1;
		sender.srcElement.src=chrome.extension.getURL('ressources/loading.gif');
		sendingFleet.img=sender.srcElement;
		/*
		var img=sendingFleet.img;		
		sendingFleet.imgOnClick=img.onclick;
		sendingFleet.imgStyleCursor=img.style.cursor;
		sendingFleet.imgTitle=img.title;
		img.onclick=null;
		img.src=chrome.extension.getURL('ressources/loading.gif');
		img.style.cursor = '';
		img.title = '';
		*/
		sendingFleet.selectedPlanet=document.getElementsByName('ogame-planet-id')[0].getAttribute('content');
		PostXMLHttpRequest(sendingFleet.sendFleetData[0].url,sendingFleet.sendFleetData[0].data,SendFleet);
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendFleet(response){
	var txt=SmartCut(response,'<body id="','"');
	switch(txt)
	{
	case 'fleet1':
		if(sendingFleet.step==1){
			sendingFleet.step++;
			PostXMLHttpRequest(sendingFleet.sendFleetData[1].url,sendingFleet.sendFleetData[1].data,SendFleet);
		}else{SendFleetFailed()}
	break;
	case 'fleet2':
		if(sendingFleet.step==2){
			sendingFleet.step++;
			PostXMLHttpRequest(sendingFleet.sendFleetData[2].url,sendingFleet.sendFleetData[2].data,SendFleet);
		}else{SendFleetFailed()}
	break;
	case 'fleet3':
		if(sendingFleet.step==3){
			var token='&token='+SmartCut(response,["token'","='"],"'");
			//Info('Token >',token,'<');
			
			sendingFleet.step++;
			//PostXMLHttpRequest(sendingFleet.sendFleetData[3].url,sendingFleet.sendFleetData[3].data,SendFleet);
			// token due OGame version update
			PostXMLHttpRequest(sendingFleet.sendFleetData[3].url,sendingFleet.sendFleetData[3].data+token,SendFleet);
			
		}else{SendFleetFailed()}
	break;
	case 'movement':
		if(sendingFleet.step==4){
			SendFleetSuccess();
		}else{SendFleetFailed()}
	break;
	default:
		SendFleetFailed()
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendFleetSuccess(){
	sendingFleet.img.src=chrome.extension.getURL('ressources/sendFleetGreen.gif');
	PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet1&cp="+sendingFleet.selectedPlanet,'',function(){});
	sendingFleet=null;	

	sendNextFleetFromVolley();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendFleetFailed(){
	sendingFleet.img.src=chrome.extension.getURL('ressources/sendFleetRed.gif');
	/*sendingFleet.img.onclick=sendingFleet.imgOnClick;
	sendingFleet.img.style.cursor=sendingFleet.imgStyleCursor;
	sendingFleet.img.title=sendingFleet.imgTitle;
	*/
	PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet1&cp="+sendingFleet.selectedPlanet,'',function(){});	
	sendingFleet=null;
	//Info('SendRecyclersFailed');	

	sendNextFleetFromVolley();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Info(text){
	var txt="";
	for( var i = 0; i < arguments.length; i++ ) txt+=arguments[i];
	console.log(txt);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function SmartCut(source,prefix,suffix){
	if(typeof(prefix)=='object'){
		var pi=0;
		for(var i=0;(i<prefix.length)&&(pi!=-1);i++){
			pi=source.indexOf(prefix[i],pi);
		}
		if(pi!=-1){
			var copyFrom=pi+prefix[prefix.length-1].length;
			var si=source.indexOf(suffix,copyFrom);
			var r=source.substring(copyFrom,si);
			return r;
		}else return false;
	}else{
		var pi=source.indexOf(prefix);
		if(pi!=-1){
			var si=source.indexOf(suffix,pi+prefix.length);
			var r=source.substring(pi+prefix.length,si);
			return r;
		}else return false;
	};
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function IsModuleLoaded(_moduleDomId,_add){
	var modules=document.head.getElementsByClassName("oge-loaded-module"), result=false;
	for(var i=0;i<modules.length;i++){
		if(modules[i].getAttribute("content")==_moduleDomId) {result=true;break}
	}
	if(!result && _add){
		var flag=document.createElement("meta");
		flag.setAttribute("class","oge-loaded-module");
		flag.setAttribute("content",_moduleDomId);
		document.head.appendChild(flag);
	}
	return result;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getXmlHttp() {
   if (window.XMLHttpRequest) {
      xmlhttp=new XMLHttpRequest();
   } else if (window.ActiveXObject) {
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
   }
   if (xmlhttp == null) {
      alert("Your browser does not support XMLHTTP.");
   }
   return xmlhttp;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function PostXMLHttpRequest(_url,_data,_callback){
	xmlhttp = getXmlHttp();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4) {
			_callback(xmlhttp.responseText);
		}//
	}
	xmlhttp.open("POST", _url, true);
	xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlhttp.send(_data);
	return xmlhttp;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DocumentLocationFullPathname(){
	return document.location.protocol+'//'+document.location.host+document.location.pathname;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
