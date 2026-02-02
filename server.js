const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir archivos estáticos de la carpeta 'public'
app.use(express.static('public'));

const usuariosConectados = {};

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);

    socket.on('nuevo_usuario', (nombre) => {
        usuariosConectados[socket.id] = nombre;
        io.emit('mensaje_sistema', `👋 ${nombre} ha entrado al chat.`);
        io.emit('actualizar_lista', Object.values(usuariosConectados));
    });

    socket.on('mensaje_chat', (msg) => {
        const nombre = usuariosConectados[socket.id] || "Anónimo";
        io.emit('mensaje_chat', { usuario: nombre, texto: msg });
    });

    socket.on('disconnect', () => {
        const nombre = usuariosConectados[socket.id];
        delete usuariosConectados[socket.id];
        if (nombre) {
            io.emit('mensaje_sistema', `🏃 ${nombre} ha salido del chat.`);
            io.emit('actualizar_lista', Object.values(usuariosConectados));
        }
    });
});

// IMPORTANTE: Usar el puerto que asigne la nube (process.env.PORT) o el 3000 si es local
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});