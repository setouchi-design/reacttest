import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const ErrorText = () => (
  <p className="App-error-text">Geolocation IS NOT available</p>
);

const App = () => {
  const [isAvailable, setAvailable] = useState(false);
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ latitude: null, longitude: null });
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  const isFirstRef = useRef(true);

  useEffect(() => {
    isFirstRef.current = false;
    if ('geolocation' in navigator) {
      setAvailable(true);
    }
  }, []);

  useEffect(() => {
    if (isAvailable) {
      getCurrentPosition();
    }
  }, [isAvailable]);

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setPosition({ latitude, longitude });
      showMap(latitude, longitude);
    });
  };

  const onMarkerDragEnd = (event) => {
    const newPosition = event.target.getLatLng();
    setMarkerPosition({ latitude: newPosition.lat, longitude: newPosition.lng }); // ピンの新しい位置情報をステートに更新
    const currentZoom = mapRef.current.getZoom(); // 現在のズームレベルを取得
    console.log('Current Zoom Level:', currentZoom); // 現在のズームレベルをログに出力
    mapRef.current.setView([newPosition.lat, newPosition.lng], currentZoom); // ドラッグ後のズームレベルを維持
  };
  

    
  
  const showMap = (latitude, longitude) => {
    if (!mapRef.current) {
      const newMap = L.map('map').setView([latitude, longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(newMap);
      mapRef.current = newMap;
      setMap(newMap);
      const newMarker = L.marker([latitude, longitude], { draggable: true }).addTo(newMap);
      newMarker.on('dragend', onMarkerDragEnd); // マーカーのドラッグイベントを追加
      setMarker(newMarker);
      setMarkerPosition({ latitude, longitude }); // 初期位置情報を設定
    } else {
      mapRef.current.setView([latitude, longitude], 13);
    }
  };
  



  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const uploadPhoto = async (photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('latitude', markerPosition.latitude); // ピンの位置情報を使用する
      formData.append('longitude', markerPosition.longitude); // ピンの位置情報を使用する
      await axios.post('http://127.0.0.1:5173/upload_photo', formData).then(function(res){alert(res)}); 
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    uploadPhoto(file);
  };

  if (isFirstRef.current) return <div className="App">Loading...</div>;

  return (
    <div className="App">
      <p>Geolocation API Sample</p>
      {!isAvailable && <ErrorText />}
      {isAvailable && (
        <div>
          <button onClick={getCurrentPosition}>Get Current Position</button>
          <button onClick={handleFileUpload}>Upload Photo</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div id="map" style={{ width: '800px', height: '600px', margin: 'auto', display: 'block' }}>
          {markerPosition.latitude !== null && markerPosition.longitude !== null && (
            <div className="marker-position-info">
              <p>Marker Position:</p>
              <p>Latitude: {markerPosition.latitude}</p>
              <p>Longitude: {markerPosition.longitude}</p>
            </div>
          )}
          </div>
          <div>
            {position.latitude !== null && position.longitude !== null && (
              <div>
                <p></p>
                <p>Latitude: {markerPosition.longitude}</p>
                <p>Longitude: {markerPosition.longitude}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;