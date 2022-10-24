function initMap() {
	//−−−−−−−------−−−−初期値−−−−−−−−−−−−−------
	var num = 0;                        // MARKERのindex
	var latlng = new google.maps.LatLng( 35.7066736, 139.6592009 );// 中心の緯度, 経度, 明治大学
	var data = new Array();             // 情報ウィンドウ-元から
	var data_click = new Array();       // 情報ウィンドウ-クリック
	var waypoint = new Array();         // ウェイポイント
	var waypoint_latlng = new Array();  // ウェイポイントの緯度経度
	var flightPath = new Array();       // polyline
	var flightPlanCoordinates = [];     // polylineの緯度経度 Arrayにするかも
	var polyline;

	var polyline_latlng = new Array();  // ウェイポイントの緯度経度

	//−−−−−−−------−−−−マップ生成&中心表示−−−−−−−−−−−−−------
	//mapのoptions
	var opts = {
		zoom: 20,        // ズームの調整
		center: latlng,  // 上で設定した中心
		mapTypeId: google.maps.MapTypeId.HYBRID,
		tilt: 0,         // 傾き
		disableDefaultUI: false,
		mapTypeControl: false,
		zoomControl: true,
		scaleControl: true,
		streetViewControl: false,
		scrollwheel: true,
		clickableIcons: false,
	}
	// mapの初期化
	var map = new google.maps.Map(document.getElementById('map'), opts);

	//−−−−−−−------−−−−位置情報取得&許可−−−−−−−−−−−−−------
	//ユーザーの現在の位置情報を取得
	navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
	/***** ユーザーの現在の位置情報を取得 *****/
	function successCallback(position) {
		var gl_text = new Array();
		gl_text.push(position.coords.latitude);          // 緯度
		gl_text.push(position.coords.longitude);         // 経度
		gl_text.push(position.coords.altitude);          // 高度
		gl_text.push(position.coords.accuracy);          // 緯度経度の誤差
		gl_text.push(position.coords.altitudeAccuracy);  // 高度の誤差
		gl_text.push(position.coords.heading);           // 方角
		//gl_text += position.coords.speed; // 速度
		//document.getElementById("show_result").innerHTML = gl_text;
		// 現在地を中心に移動
		map.panTo(new google.maps.LatLng(gl_text[0], gl_text[1]));
	}

	/***** 位置情報が取得できない場合 *****/
	function errorCallback(error) {
		var err_msg = "";
		switch(error.code)
		{ case 1:
			err_msg = "位置情報の利用が許可されていません";
			break;
			case 2:
			err_msg = "デバイスの位置が判定できません";
			break;
			case 3:
			err_msg = "タイムアウトしました";
			break;
		}
		//本番用→　document.getElementById("show_result").innerHTML = err_msg;
		//document.getElementById("show_result").innerHTML = error.message;
	}

	// 中心のMARKERイメージを作成
	markerImg = {
		//url: "penguin.png",  // アイコン画像のパス
		url: 'https://moriokalab-assets.s3.ap-northeast-1.amazonaws.com/0.hfp3lqme6x8.png', //ここを追加
		size: new google.maps.Size(200, 200),     // アイコン画像の表示させたい範囲（サイズ）
		//origin: new google.maps.Point(0, 0),      // アイコン画像の表示させたい範囲の基準点（左上）
		//anchor: new google.maps.Point(25, 60),    // アイコン画像内のアンカー点の位置
		//scaleSize: new google.maps.Size(30, 50)   // アイコン画像の実際の表示サイズ
	}

	// DrawingManagerを生成
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.PAN,
		drawingControl: true,                            
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_CENTER, 
			drawingModes: ['polyline']
		},
		//マーカーのプション
		markerOptions: {
			icon: {
				url: '../common/img/ms/pin_02.png',
				scaledSize: new google.maps.Size(40, 40)
			}
		},
		//ポリラインのオプション
		polylineOptions: {
			strokeColor: '#ff0000',
			strokeWeight: 5,
			clickable: false,
			editable: true,
			zIndex: 1
		}
	});
	// Mapに割り当て
	drawingManager.setMap(map);

	var _myPolygon;
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		if (event.type == 'polyline') {
			if(_myPolygon!=null){
				_myPolygon.setMap(null);
				polyline_latlng = [];
				sessionStorage.clear();
			}
			event.overlay.getPath().forEach( function ( LatLng ) {
				//console.log( LatLng.lat() ) ;
				//console.log( LatLng.lng() ) ;
				polyline_latlng.push({
					lat: LatLng.lat(),
					lng: LatLng.lng(),
				});
			} ) ;
			//console.log( polyline_latlng[0].lat, polyline_latlng[0].lng) ;
			for (var i = 0; i < polyline_latlng.length; i++) {
				console.log( polyline_latlng[i].lat, polyline_latlng[i].lng) ;
				sessionStorage.setItem(i,polyline_latlng[i].lat+","+polyline_latlng[i].lng);
			}
			_myPolygon = event.overlay;
		}
	  });

	/** 
	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
		polyline_latlng[0].lat = 0.0;

		//console.log( polyline_latlng[0].lat, polyline_latlng[0].lng) ;
		for (var i = 0; i < polyline_latlng.length; i++) {
			console.log( polyline_latlng[i].lat, polyline_latlng[i].lng) ;
		}
	  });
	**/
	
	document.getElementById("reset-button").onclick = function() {
		if(_myPolygon!=null){
			_myPolygon.setMap(null);
		}
		polyline_latlng = [];
		sessionStorage.clear();
	}
	  
	}
