const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer  = require('multer');
const path = require('path');
const app = express();

// Configuração do servidor
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir arquivos da pasta 'uploads'

app.use(express.json());

// Configuração do banco de dados SQLite3
const db = new sqlite3.Database('anime_world.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite3');
        // Cria a tabela videos se não existir
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            path TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela videos:', err.message);
            } else {
                console.log('Tabela videos criada com sucesso');
            }
        });
    }
});

// Configuração do multer para upload de vídeos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Rota para fazer upload de vídeos (apenas para administradores)
app.post('/api/videos', upload.single('video'), (req, res) => {
    const { title } = req.body;
    const videoPath = req.file.path;

    // Insere o vídeo no banco de dados
    const sql = 'INSERT INTO videos (title, path) VALUES (?, ?)';
    db.run(sql, [title, videoPath], function(err) {
        if (err) {
            console.error('Erro ao inserir vídeo no banco de dados:', err.message);
            res.status(500).send('Erro ao enviar o vídeo');
            return;
        }
        console.log('Vídeo enviado com sucesso:', this.lastID);
        res.json({ success: true });
    });
});

// Rota para listar todos os vídeos
app.get('/api/videos', (req, res) => {
    // Seleciona todos os vídeos do banco de dados
    const sql = 'SELECT * FROM videos';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao obter vídeos do banco de dados:', err.message);
            res.status(500).send('Erro ao obter vídeos');
            return;
        }
        res.json(rows);
    });
});



// Rota para excluir um vídeo específico
app.delete('/api/videos/:id', (req, res) => {
    const id = req.params.id;

    // Deleta o vídeo do banco de dados pelo ID
    const sql = 'DELETE FROM videos WHERE id = ?';
    db.run(sql, id, function(err) {
        if (err) {
            console.error('Erro ao excluir vídeo do banco de dados:', err.message);
            res.status(500).send('Erro ao excluir o vídeo');
            return;
        }
        console.log('Vídeo excluído com sucesso:', id);
        res.json({ success: true });
    });
});


// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
