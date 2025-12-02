const mqtt = require('mqtt');

// Connect to the same HiveMQ broker
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

console.log('🔌 Connecting to HiveMQ Public Broker...');

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ');
  
  // Subscribe to the same topics your ESP32 is publishing to
  client.subscribe('wokwi/rfid/tracking/data', (err) => {
    if (!err) console.log('📡 Subscribed to: wokwi/rfid/tracking/data');
  });
  
  client.subscribe('wokwi/rfid/tracking/status', (err) => {
    if (!err) console.log('📡 Subscribed to: wokwi/rfid/tracking/status');
  });
});

client.on('message', (topic, message) => {
  console.log('\n=== NEW MQTT MESSAGE ===');
  console.log(`📨 Topic: ${topic}`);
  console.log(`🕒 Time: ${new Date().toISOString()}`);
  
  try {
    const data = JSON.parse(message.toString());
    console.log('📊 Data:', JSON.stringify(data, null, 2));
    
    // Process different message types
    if (topic === 'wokwi/rfid/tracking/data') {
      handleRFIDDetection(data);
    } else if (topic === 'wokwi/rfid/tracking/status') {
      handleReaderStatus(data);
    }
  } catch (error) {
    console.log('❌ Invalid JSON:', message.toString());
  }
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});

function handleRFIDDetection(data) {
  console.log('🏷️  RFID Detection Received:');
  console.log(`   Room: ${data.roomCode}`);
  console.log(`   Reader: ${data.readerId}`);
  console.log(`   Equipment: ${data.equipmentTag}`);
  console.log(`   Timestamp: ${new Date(data.timestamp).toISOString()}`);
  
  // Here you can save to database, send to API, etc.
  saveToDatabase(data);
}

function handleReaderStatus(data) {
  console.log('📊 Reader Status:');
  console.log(`   Reader: ${data.readerId} is ${data.status}`);
  console.log(`   Room: ${data.roomCode}`);
}

function saveToDatabase(data) {
  // Example: Save to your database
  console.log('💾 Saving to database...');
  // Add your database logic here
}

console.log('🚀 MQTT Receiver Started...');
console.log('Waiting for RFID data from Wokwi...');