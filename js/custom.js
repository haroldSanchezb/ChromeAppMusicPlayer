var playpause = $('#playpause'),
	artistdetails = $('.navbar-brand'),
	left = $("#left"),
	playlist = $('#playlist'),
	openfiles = $('#choosefiles'),
	right = $("#right"),
	repeat = $("#repeat"),
	suffle = $("#suffle"),
	progress = $('.progress-bar'),
	song,
	songs = [],
	totalsongs= 0,
	currenti=0,
	repeats = false,
	suffles = false;
playpause.click(function() {
	if (song.paused) {
		song.play();
		playpause.addClass('playing');
	}else{
		song.pause();
		playpause.removeClass('playing');
	}
});
$("#tabla").niceScroll({cursorcolor:"#ccc",cursorwidth: 10,autohidemode:false});
function createPlayList(i){
	//console.log('entro por aca para ponerlo visible')
	var element = $.create('tr',{id: 'song'+i,'class': 'click reproducir'},[]);
	playlist.append(element);
	var id = '#song'+i;	
	element = $.create('td',{},[songs[i].meta.title]);
	$(id).append(element);
	element = $.create('td',{},[songs[i].meta.artist]);
	$(id).append(element);
	element = $.create('td',{},[songs[i].meta.album]);
	$(id).append(element);
	element = $.create('td',{},[songs[i].meta.year]);
	$(id).append(element);
}
function randomico(slength){
	return Math.floor((Math.random()*slength)+1)
}
function getMetaData(i) {
	//console.log('buscando los metadata '+i)
	//console.log(songs[i])
	if (songs[i].meta == undefined) {
		//console.log('no existen los metadata')
		var metad = songs[i].slice(songs[i].size-128);
		var metareader = new FileReader();
		metareader.onload = function(e) {
			//console.log('entre por aca')
			var metadata = e.target.result;
			//console.log(metadata)
			if (metadata.search('TAG') == 0) {
				//console.log('tiene tag')
				metadata = metadata.substr(3, metadata.length-3);
				songs[i].meta = {};
				songs[i].meta.title = metadata.substr(0,30);
				songs[i].meta.artist = metadata.substr(30,30);
				songs[i].meta.album = metadata.substr(60,30);
				songs[i].meta.year = metadata.substr(90,4);
				createPlayList(i);
			}else{
				//console.log('no tiene tag')
				//console.log(songs[i].name)
				var toRemove = '.mp3';
				songs[i].meta = {};
				songs[i].meta.title = songs[i].name.replace(toRemove,'');
				songs[i].meta.artist = ''
				songs[i].meta.album = ''
				songs[i].meta.year = ''
				createPlayList(i);
				
			}
		}
		metareader.readAsBinaryString(metad);
	}else{
		//console.log('tiene metadata')
	}
}
function playnext(i){
	if(suffles){
		i = randomico((songs.length-1))
	}else{
		i++;
		if(repeats){
			if(i == songs.length){
				i = 0
			}	
		}
	}
	if(i < songs.length){
		playMusic(i);
	}	
}
function playback(i){
	//console.log('ya paso a back')
	i--;
	//console.log(i)
	if(i >=0){
		playMusic(i);
	}
}
function playerinit(songdata, songtype,i) {
    $('audio').remove();
    song = [];
    song = new Audio(songdata);
    song.addEventListener('timeupdate',function (){
        current = parseInt(song.currentTime, 10);
        // console.log(current)
        perc = current/song.duration * 100;
        // console.log(perc)
        progress.attr('aria-valuenow',Math.round(perc)).css('width',Math.round(perc)+'%')
        if(song.currentTime == song.duration){
        	playpause.removeClass('playing');
        	progress.attr('aria-valuenow','0').css('width','0%')
        	playnext(i);
        }
        // seek.attr('value',song.currentTime);
        // seek.attr('max', song.duration);
    });
	if (!playpause.hasClass('playing')) {
    	playpause.addClass('playing');
    }
	song.play();
    song.volume = 1;
}
function closenotification(){
	chrome.notifications.clear('song',function(){})
}
function nowPlaying(i) {
	var optionsn = {
		type: "basic",
		title: "Estas Eeproduciendo...",
		message: songs[i].name.replace('.mp3','')+'',
		iconUrl: '/img/128.png'
	}
	setTimeout(closenotification,3000)
	chrome.notifications.create('song',optionsn,function(){});
	artistdetails.html('');
	artistdetails.append('<p><strong>'+songs[i].name.replace('.mp3','')+'</strong>');
}
function playMusic(i){
	if(song != undefined){
		song.pause();
		song.currentTime= 0;
		playpause.removeClass('playing');
	}
	currenti = i;
	var reader = new FileReader();
	reader.onload = function(e) {
		playerinit(e.target.result, songs[i].type,i);
	}
	reader.readAsDataURL(songs[i]);
	nowPlaying(i);
}
function fileChanged(files) {
	//console.log(files);
	for (var i = 0; i< files.length; i++) {
		if (files[i].type == 'audio/mp3') {
			songs.push(files[i]);
			// console.log('estoy por aca contador='+i)
			// console.log('total canciones='+totalsongs)
			var numero = i+totalsongs
			//console.log(songs[numero])
			getMetaData(numero)
		}
	}
	if(totalsongs == 0){
		//console.log('aqui empieza a reproducir')
		playMusic(0)
		totalsongs = songs.length;
		//console.log('total canciones reproduciendo='+totalsongs);
	}else {
		//console.log('total canciones nueva='+totalsongs)
		//console.log(songs.length)
		totalsongs = songs.length;
		//console.log('total canciones nueva con el agregado='+totalsongs)
		//console.log('por aqui le sumo las canciones agregadas')
	}
}
right.click(function(){
	//console.log('adelante')
	playnext(currenti)
});
left.click(function(){
	//console.log('atras')
	playback(currenti)
});
repeat.click(function(){
	if(!repeats){
		repeats = true;
		$(this).addClass('selected')
	}else{
		$(this).removeClass('selected')
		repeats = false;
	}
})
suffle.click(function(){
	if(!suffles){
		suffles = true;
		$(this).addClass('selected')
	}else{
		$(this).removeClass('selected')
		suffles = false;
	}
	
})
$('body').on('click', '.reproducir', function () {
     playMusic($(this).attr('id').replace('song',''));
});
openfiles.on('change',function(e) {
    var files = e.target.files;
    fileChanged(files);
});