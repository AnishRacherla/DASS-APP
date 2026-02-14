#!/bin/bash

# Complete startup script for React Native app

echo "🚀 Starting Literacy Game Mobile App"
echo ""

# Step 1: Start Backend
echo "📡 Starting Backend Server..."
cd /home/raviteja/Documents/dass_game/backend

if ! pgrep -f "node server.js" > /dev/null; then
    gnome-terminal -- bash -c "cd /home/raviteja/Documents/dass_game/backend && node server.js; exec bash" 2>/dev/null || \
    xterm -e "cd /home/raviteja/Documents/dass_game/backend && node server.js; exec bash" 2>/dev/null || \
    nohup node server.js > /tmp/backend.log 2>&1 &

    echo "✅ Backend started on port 5000"
    sleep 2
else
    echo "✅ Backend already running"
fi

# Step 2: Start Mobile App
echo ""
echo "📱 Starting React Native with Expo SDK 54..."
echo ""
echo "Next steps:"
echo "1. Open 'Expo Go' app on your phone"
echo "2. Scan the QR code below"
echo "3. App will load automatically!"
echo ""
echo "Backend: http://10.2.143.103:5000"
echo ""

cd /home/raviteja/Documents/dass_game/mobile
npx expo start