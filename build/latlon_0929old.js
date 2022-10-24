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
	// clickイベントを取得するListenerを追加
	google.maps.event.addListener(map, 'click', clickEventFunc);

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
	// 中心のMARKER表示
	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		icon: markerImg,
		title: "campas"
	});

	//−−−−−−−−−−−マーカー追加・polyline追加系−−−−−−−−−−−−−
	// clickした時の挙動
	function clickEventFunc(event) {
		//情報ウィンドウの表示内容
		data.push({
			content: 'ウェイポイント'+(num+1).toString()
		});
		data_click.push(new google.maps.InfoWindow({
			content: 'ウェイポイント'+(num+1).toString()
		}));
		//alert(event.latLng.toString());
		// ウェイポイントの表示
		waypoint.push(new google.maps.Marker({
			position: (event.latLng),
			map: map,
			icon: "https://maps.google.com/mapfiles/ms/micons/pink-dot.png",
			clickable: true,
			draggable: true,
			title: "ウェイポイント"+(num+1),
			//label: (num+1).toString(),
			//optimized: true,  //たくさんある時
		}));
		// ウェイポイントの緯度経度を格納
		waypoint_latlng.push({
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		});
		// 情報ウィンドウ表示
		markerInfo(waypoint[num], data[num].content);
		// 追加したウェイポイントの緯度経度を表示
		popup_msg("ウェイポイント"+(num+1)+":("+event.latLng.lat()+","+event.latLng.lng()+")", 1500);

		// ウェイポイントが2個以上の時polylineを表示
		if (num>0){
			// polylineの両端の緯度経度を設定
			flightPlanCoordinates = [
				new google.maps.LatLng(waypoint_latlng[num-1].lat, waypoint_latlng[num-1].lng),
				new google.maps.LatLng(waypoint_latlng[num].lat, waypoint_latlng[num].lng),
			];
			console.log(waypoint_latlng[num].lat, waypoint_latlng[num].lng);

			// polylineの設定
			flightPath.push(new google.maps.Polyline({
				path: flightPlanCoordinates,  //ポリラインの配列
				strokeColor: '#FFFF00',       //色（#RRGGBB形式）
				strokeOpacity: 1.0,           //透明度 0.0～1.0（デフォルト）
				strokeWeight: 3,              //太さ（単位ピクセル）
			}));
			// polylineの表示
			flightPath[num-1].setMap(map);
		}
		markerEvent(num);

		num+=1;
	}

	//−−−−−−−----−−−−マーカーイベント系−−−−−----−−−−−−−−
	// 情報ウィンドウ表示関数-元から
	function markerInfo(marker, name) {
		new google.maps.InfoWindow({
			content: name
		}).open(marker.getMap(), marker);
	}
	// 情報ウィンドウ表示関数-マーカークリック時
	function markerEvent(i) {
		waypoint[i].addListener('click', function() {
			data_click[i].open(map, waypoint[i]);
		});
		google.maps.event.addListener(waypoint[i], 'dragend', function(event) {
			// マーカーをドラッグした先の緯度経度を表示
			popup_msg("ウェイポイント"+(i+1)+":("+waypoint_latlng[i].lat+","+waypoint_latlng[i].lng+")->("+event.latLng.lat()+","+event.latLng.lng()+")", 1500);
			waypoint_latlng[i] = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng(),
			};
			// polylineの移動-左
			if(i>0 && flightPath.length>0){
				flightPlanCoordinates = [
					new google.maps.LatLng(waypoint_latlng[i-1].lat, waypoint_latlng[i-1].lng),
					new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
				];
				flightPath[i-1].setPath(flightPlanCoordinates);
			}
			// polylineの移動-右
			if(i!=flightPath.length){
				flightPlanCoordinates = [
					new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
					new google.maps.LatLng(waypoint_latlng[i+1].lat, waypoint_latlng[i+1].lng),
				];
				flightPath[i].setPath(flightPlanCoordinates);
			}
		});
	}

	//−−−−−−−------−−−−ボタン系−−−−−−−−−−−−−------
	// ゴール地点確定ボタン
	//let timerID;
	document.getElementById("publish-button").onclick = function() {
		document.getElementById("p_button").innerHTML = "走行経路を送信しました";
		//this.classList.toggle("blue");
		popup_msg("Publish successed!\nウェイポイント数:"+waypoint_latlng.length, 2000);
		//alert(waypoint_latlng);
		timerID = setTimeout(function(){
			document.getElementById("p_button").innerHTML = "走行経路確定";
		},3000);
	};
	// リセットボタン
	document.getElementById("reset-button").onclick = function() {
		document.getElementById("r_button").innerHTML = "線を全て消去しました";
		deleteMakers();
		popup_msg("リセット", 1500);
		timerID = setTimeout(function(){
			document.getElementById("r_button").innerHTML = "線を全て消去";
		},3000);
	};
	// リセットボタン-関数
	function deleteMakers(idx=null) {
		if(idx == null){
			//生成済マーカーを順次すべて削除する
			for (var i = 0; i < waypoint.length; i++) {
				waypoint[i].setMap(null);
				if (i!=waypoint.length-1){
					flightPath[i].setMap(null);
				}
			}
			waypoint = [];		//参照を開放
			flightPath = [];	//参照を開放
		}else{
			//生成済マーカーからID指定されたマーカーを削除
			for (var i = 0; i < waypoint.length; i++) {
				if(idx.indexOf(i) >= 0){
					waypoint[i].setMap(null);
				}
			}
		}
		waypoint_latlng = [];
		data = [];
		data_click = [];
		num = 0;
	}

	// Popup-関数 ポップアップするメッセージと時間を指定
	function popup_msg(msg, second) {
		var popup = document.getElementById('popup');
		popup.innerHTML = msg;
		popup.style.visibility = 'visible';
		// disappear after a few seconds.
		setTimeout(function() {
			popup.innerHTML = "";
			popup.style.visibility = 'hidden';
		}, second);
	}

	//−−−−−−−−−−−地図上にロボットを表示する−−−−−−−−−−−−−
	// 自己位置にロボットの画像を表示
	var overlay = new google.maps.GroundOverlay(
		//画像のパス
		"image/robot_icon.png",
		//画像のそれぞれの座標
		//座標で指定するので画像のアスペクト比がずれやすい
		{ north: 35.7076675,
			south: 35.7074365,
			west: 139.6590796,
			east: 139.6590029,},
			//その他のオプション
			{ clickable:true,
				map: map,
				opacity: 1,
			}
		);

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

	//drawingManagerで描画した図形全消去
	var selectedShape;

	function clearSelection() {
        if (selectedShape) {
          selectedShape.setEditable(false);
          selectedShape = null;
        }
      }

	function setSelection(shape) {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);
      }

    function deleteSelectedShape() {
        if (selectedShape) {
          selectedShape.setMap(null);
        }
      }

	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
		if (e.type != google.maps.drawing.OverlayType.MARKER) {
		// Switch back to non-drawing mode after drawing a shape.
		drawingManager.setDrawingMode(null);

		// Add an event listener that selects the newly-drawn shape when the user
		// mouses down on it.
		var newShape = e.overlay;
		newShape.type = e.type;
		google.maps.event.addListener(newShape, 'click', function() {
		  setSelection(newShape);
		});
		setSelection(newShape);
	  }
	});

	google.maps.event.addListener(document.getElementById("reset-button"), 'click', deleteSelectedShape);

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
		polyline.getPath().forEach( function ( LatLng ) {
			console.log( LatLng.lat() ) ;
			console.log( LatLng.lng() ) ;
		} ) ;
	  });
	  
	}

