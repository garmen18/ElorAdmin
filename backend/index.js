const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// routers
const centrosRouter = require('./routes/centros');

const app = express();

// CONFIG
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

// Rutas
app.use('/centros', centrosRouter);

// Ruta raíz para comprobar servidor
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));


// CONEXIÓN A LA BASE DE DATOS + DIAGNÓSTICO
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'reto2bbdd'
});

db.connect((err) => {
    if (err) {
        console.error(' Error conectando a la base de datos:', err);
        return;
    }
    console.log(' Conexión exitosa a la base de datos reto2bbdd');

    db.query("SELECT @@datadir AS datadir, @@port AS port, DATABASE() AS db", (err, result) => {
        if (err) {
            console.error(" Error obteniendo diagnóstico:", err);
            return;
        }
        console.log("===============================================");
        console.log(" DIAGNÓSTICO DEL MYSQL QUE USA NODE");
        console.log(result[0]);
        console.log("===============================================");
    });

    db.query("SELECT COUNT(*) AS total FROM users", (err, result) => {
        if (err) {
            console.error(" Error contando usuarios:", err);
            return;
        }
        console.log(" Usuarios que ve Node:", result[0].total);
        console.log("===============================================");
    });
});

// LOGIN REAL
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Faltan datos' });
    }

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).send({ error: 'Error interno' });
        }

        if (results.length === 0) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        const user = results[0];

        res.send({
            id: user.id,
            email: user.email,
            username: user.username,
            password: user.password,
            nombre: user.nombre,
            apellidos: user.apellidos,
            dni: user.dni,
            direccion: user.direccion,
            telefono1: user.telefono1,
            telefono2: user.telefono2,
            tipo_id: user.tipo_id,
            argazkia_url: user.argazkia_url,
            created_at: user.created_at,
            updated_at: user.updated_at
            });
    });
});


// ENDPOINT DE ESTADÍSTICAS PARA GOD
app.get('/stats', (req, res) => {

    const qAlumnos = `SELECT COUNT(*) AS total FROM users WHERE tipo_id = 4`;
    const qProfesores = `SELECT COUNT(*) AS total FROM users WHERE tipo_id = 3`;
    const qReunionesHoy = `
        SELECT COUNT(*) AS total 
        FROM reuniones 
        WHERE DATE(fecha) = CURDATE()
    `;

    db.query(qAlumnos, (err, alumnosResult) => {
        if (err) return res.status(500).send({ error: 'Error obteniendo alumnos' });

        db.query(qProfesores, (err, profesoresResult) => {
            if (err) return res.status(500).send({ error: 'Error obteniendo profesores' });

            db.query(qReunionesHoy, (err, reunionesResult) => {
                if (err) return res.status(500).send({ error: 'Error obteniendo reuniones' });

                res.send({
                    alumnos: alumnosResult[0].total,
                    profesores: profesoresResult[0].total,
                    reunionesHoy: reunionesResult[0].total
                });
            });
        });
    });
});


// CRUD DE ADMINISTRADORES (tipo_id = 2)
app.get('/usuarios/admins', (req, res) => {
    const q = `
        SELECT id, nombre, email 
        FROM users 
        WHERE tipo_id = 2
    `;
    db.query(q, (err, results) => {
        if (err) return res.status(500).send({ error: 'Error obteniendo administradores' });
        res.send(results);
    });
});

app.post('/usuarios/admins', (req, res) => {
    const { nombre, email, password } = req.body;

    const q = `
        INSERT INTO users (nombre, email, password, username, tipo_id)
        VALUES (?, ?, ?, ?, 2)
    `;

    db.query(q, [nombre, email, password, email], (err, result) => {
        if (err) return res.status(500).send({ error: 'Error creando administrador' });
        res.send({ id: result.insertId });
    });
});

app.put('/usuarios/admins/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    const q = `
        UPDATE users
        SET nombre = ?, email = ?, password = ?
        WHERE id = ? AND tipo_id = 2
    `;

    db.query(q, [nombre, email, password, id], (err) => {
        if (err) return res.status(500).send({ error: 'Error actualizando administrador' });
        res.send({ ok: true });
    });
});

app.delete('/usuarios/admins/:id', (req, res) => {
    const { id } = req.params;

    const q = `
        DELETE FROM users
        WHERE id = ? AND tipo_id = 2
    `;

    db.query(q, [id], (err) => {
        if (err) return res.status(500).send({ error: 'Error borrando administrador' });
        res.send({ ok: true });
    });
});


// CRUD DE PROFESORES (tipo_id = 3)
app.get('/usuarios/profesores', (req, res) => {
    const q = `
        SELECT id, nombre, apellidos, email 
        FROM users 
        WHERE tipo_id = 3
    `;
    db.query(q, (err, results) => {
        if (err) return res.status(500).send({ error: 'Error obteniendo profesores' });
        res.send(results);
    });
});

app.get('/usuarios/profesores/:id', (req, res) => {
    const { id } = req.params;
    const q = `
        SELECT id, nombre, apellidos, email 
        FROM users 
        WHERE id = ? AND tipo_id = 3
    `;
    db.query(q, [id], (err, results) => {
        if (err) return res.status(500).send({ error: 'Error obteniendo profesor' });
        res.send(results[0]);
    });
});

app.post('/usuarios/profesores', (req, res) => {
    const { nombre, apellidos, email, password } = req.body;

    const q = `
        INSERT INTO users (nombre, apellidos, email, password, username, tipo_id)
        VALUES (?, ?, ?, ?, ?, 3)
    `;

    db.query(q, [nombre, apellidos, email, password, email], (err, result) => {
        if (err) return res.status(500).send({ error: 'Error creando profesor' });
        res.send({ id: result.insertId });
    });
});

app.put('/usuarios/profesores/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, email } = req.body;

    const q = `
        UPDATE users
        SET nombre = ?, apellidos = ?, email = ?
        WHERE id = ? AND tipo_id = 3
    `;

    db.query(q, [nombre, apellidos, email, id], (err) => {
        if (err) return res.status(500).send({ error: 'Error actualizando profesor' });
        res.send({ ok: true });
    });
});

app.delete('/usuarios/profesores/:id', (req, res) => {
    const { id } = req.params;

    const q = `
        DELETE FROM users
        WHERE id = ? AND tipo_id = 3
    `;

    db.query(q, [id], (err) => {
        if (err) return res.status(500).send({ error: 'Error borrando profesor' });
        res.send({ ok: true });
    });
});

app.get('/usuarios/buscar/:texto', (req, res) => {
  const { texto } = req.params;

  const q = `
    SELECT id, nombre, apellidos, email, tipo_id
    FROM users
    WHERE nombre LIKE ? 
       OR apellidos LIKE ?
       OR email LIKE ?
  `;

  const like = `%${texto}%`;

  db.query(q, [like, like, like], (err, results) => {
    if (err) return res.status(500).send({ error: 'Error en búsqueda' });
    res.send(results);
  });
});


// CRUD DE ALUMNOS (tipo_id = 4)
app.get('/usuarios/alumnos', (req, res) => {
    const q = `
        SELECT id, nombre, apellidos, email 
        FROM users 
        WHERE tipo_id = 4
    `;
    db.query(q, (err, results) => {
        if (err) return res.status(500).send({ error: 'Error obteniendo alumnos' });
        res.send(results);
    });
});

app.get('/usuarios/alumnos/:id', (req, res) => {
    const { id } = req.params;
    const q = `
        SELECT id, nombre, apellidos, email 
        FROM users 
        WHERE id = ? AND tipo_id = 4
    `;
    db.query(q, [id], (err, results) => {
        if (err) return res.status(500).send({ error: 'Error obteniendo alumno' });
        res.send(results[0]);
    });
});

app.post('/usuarios/alumnos', (req, res) => {
    const { nombre, apellidos, email, password } = req.body;

    const q = `
        INSERT INTO users (nombre, apellidos, email, password, username, tipo_id)
        VALUES (?, ?, ?, ?, ?, 4)
    `;

    db.query(q, [nombre, apellidos, email, password, email], (err, result) => {
        if (err) return res.status(500).send({ error: 'Error creando alumno' });
        res.send({ id: result.insertId });
    });
});

app.put('/usuarios/alumnos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, email } = req.body;

    const q = `
        UPDATE users
        SET nombre = ?, apellidos = ?, email = ?
        WHERE id = ? AND tipo_id = 4
    `;

    db.query(q, [nombre, apellidos, email, id], (err) => {
        if (err) return res.status(500).send({ error: 'Error actualizando alumno' });
        res.send({ ok: true });
    });
});

app.delete('/usuarios/alumnos/:id', (req, res) => {
    const { id } = req.params;

    const q = `
        DELETE FROM users
        WHERE id = ? AND tipo_id = 4
    `;

    db.query(q, [id], (err) => {
        if (err) return res.status(500).send({ error: 'Error borrando alumno' });
        res.send({ ok: true });
    });
});

// HORARIO DEL PROFESOR (VERSIÓN FINAL)
app.get('/horarios/profesor/:id', (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT 
      h.id,
      h.dia,
      h.hora,
      h.aula,
      h.observaciones,
      m.nombre AS modulo_nombre
    FROM horarios h
    JOIN modulos m ON h.modulo_id = m.id
    WHERE h.profe_id = ?
    ORDER BY 
      FIELD(h.dia, 'LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'),
      h.hora
  `;

  db.query(q, [id], (err, results) => {
    if (err) {
      console.error(' Error obteniendo horario del profesor:', err);
      return res.status(500).send({ error: 'Error obteniendo horario del profesor' });
    }
    res.send(results);
  });
});






// HORARIO DEL ALUMNO (VERSIÓN FINAL)
app.get('/horarios/alumno/:id', (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT 
      h.id,
      h.dia,
      h.hora,
      h.aula,
      h.observaciones,
      m.nombre AS modulo_nombre
    FROM matriculaciones mat
    JOIN modulos m ON m.ciclo_id = mat.ciclo_id AND m.curso = mat.curso
    JOIN horarios h ON h.modulo_id = m.id
    WHERE mat.alum_id = ?
    ORDER BY 
      FIELD(h.dia, 'LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'),
      h.hora
  `;

  db.query(q, [id], (err, results) => {
    if (err) {
      console.error(' Error obteniendo horario del alumno:', err);
      return res.status(500).send({ error: 'Error obteniendo horario del alumno' });
    }
    res.send(results);
  });
});

// CREAR REUNIÓN (solo profesores)
app.post('/reuniones', (req, res) => {
  const {
    profesor_id,
    alumno_id,
    fecha,
    hora,
    id_centro,
    titulo,
    asunto,
    aula,
    estado   
  } = req.body;

  // Validación mínima
  if (!profesor_id || !alumno_id || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Solo profesores (tipo_id = 3)
  const qTipo = `SELECT tipo_id FROM users WHERE id = ?`;

  db.query(qTipo, [profesor_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error validando profesor' });

    if (result.length === 0 || result[0].tipo_id !== 3) {
      return res.status(403).json({ error: 'Solo los profesores pueden crear reuniones' });
    }

    const fechaCompleta = `${fecha} ${hora}:00`;

    const estadoFinal = estado || 'pendiente'; 

    const qInsert = `
      INSERT INTO reuniones 
      (estado, estado_eus, profesor_id, alumno_id, id_centro, titulo, asunto, aula, fecha)
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      qInsert,
      [
        estadoFinal,          
        profesor_id,
        alumno_id,
        id_centro || '15112',
        titulo || null,
        asunto || null,
        aula || null,
        fechaCompleta
      ],
      (err, result) => {
        if (err) {
          console.error(' Error creando reunión:', err);
          return res.status(500).json({ error: 'Error creando reunión' });
        }

        res.json({ ok: true, id_reunion: result.insertId });
      }
    );
  });
});


// REUNIONES DEL PROFESOR
app.get('/reuniones/profesor/:id', (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT 
        r.id_reunion AS id,
        r.estado,
        r.estado_eus,
        r.fecha,
        r.aula,
        r.titulo AS titulo,
        r.asunto,
        r.alumno_id,
        u.nombre AS alumno_nombre,
        u.apellidos AS alumno_apellidos
        FROM reuniones r
        LEFT JOIN users u ON u.id = r.alumno_id
        WHERE r.profesor_id = ?
        ORDER BY r.fecha
  `;

  db.query(q, [id], (err, results) => {
    if (err) {
      console.error(' Error obteniendo reuniones del profesor:', err);
      return res.status(500).send({ error: 'Error obteniendo reuniones del profesor' });
    }
    res.send(results);
  });
});

// REUNIONES DEL ALUMNO
app.get('/reuniones/alumno/:id', (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT 
        r.id_reunion AS id,
        r.estado,
        r.estado_eus,
        r.fecha,
        r.aula,
        r.titulo AS titulo,
        r.asunto,
        r.profesor_id,
        u.nombre AS profesor_nombre,
        u.apellidos AS profesor_apellidos
        FROM reuniones r
        LEFT JOIN users u ON u.id = r.profesor_id
        WHERE r.alumno_id = ?
        ORDER BY r.fecha
  `;

  db.query(q, [id], (err, results) => {
    if (err) {
      console.error(' Error obteniendo reuniones del alumno:', err);
      return res.status(500).send({ error: 'Error obteniendo reuniones del alumno' });
    }
    res.send(results);
  });
});

// 404 (DEBE IR AL FINAL)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
