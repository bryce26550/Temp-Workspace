function socket(io) {
io.on("connection", (socket) => {
    socket.on("user_connected", (username) => {
        socket.username = username; // Store username on socket
        socket.join("general"); // Automatically join the "general" room
        console.log(`${username} has connected and joined general`);
        updateRoomList(socket);
    });

    socket.on("join_room", (data) => {
        const { user, room } = data;
        socket.join(room);
        console.log(`${user} joined room: ${room}`);
        updateRoomList(socket);
    });

    socket.on("leave_room", (data) => {
        const { user, room } = data;
        socket.leave(room);
        console.log(`${user} left room: ${room}`);
        updateRoomList(socket);
    });

    socket.on("message", (data) => {
        console.log("Message received on server:", data);
        io.to(data.room).emit("message", data);
    });

    socket.on('get_room_users', (data) => {
        const room = data.room;
        const clients = io.sockets.adapter.rooms.get(room);
        const users = [];
        if (clients) {
            clients.forEach(clientId => {
                const clientSocket = io.sockets.sockets.get(clientId);
                if (clientSocket) {
                    users.push(clientSocket.username);
                }
            });
        }
        socket.emit('room_users', { room, users });
    });

    socket.on("user_disconnected", (username) => {
        console.log(`${username} has disconnected`);
    });

    function updateRoomList(socket) {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        socket.emit("roomsList", rooms);
    }
});
}

module.exports = { socket };