const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const sequelize = require('./config/bd');

const Filme = require('./models/filme.model');
const Diretor = require('./models/diretor.model');
const Artista = require('./models/artista.model');
const FichaTecnica = require('./models/fichaTecnica.model');

const methodOverride = require('method-override');

require('./models/relacionamentosModels');

const app = express();


// ======================================================
// CONFIGURAÇÕES
// ======================================================

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ======================================================
// HANDLEBARS
// ======================================================

app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',

    helpers: {
      eq: function (v1, v2) {
        return v1 == v2;
      }
    }
  })
);

app.set('view engine', 'handlebars');


// ======================================================
// HOME
// ======================================================

app.get('/', (req, res) => {
  res.render('home', {
    titulo: 'Página Inicial'
  });
});


// ======================================================
// FILMES
// ======================================================

// LISTAR FILMES
app.get('/filmes', async (req, res) => {
  const filmes = await Filme.findAll({
    raw: true
  });

  res.render('filme/filmes', {
    filmes
  });
});


// FORMULÁRIO DE CADASTRO DE FILME
app.get('/filmes/cadastrar', async (req, res) => {
  const diretores = await Diretor.findAll({
    raw: true
  });

  const artistas = await Artista.findAll({
    raw: true
  });

  res.render('filme/cadastrarFilme', {
    diretores,
    artistas
  });
});


// CADASTRAR FILME
app.post('/filmes', async (req, res) => {
  const nome = req.body.nome;
  const ano = req.body.ano;
  const diretorId = req.body.diretorId;
  const artistas = req.body.artistas;

  const filme = await Filme.create({
    nome: nome,
    ano: ano,
    diretorId: diretorId
  });

  if (artistas && artistas.length > 0) {
    await filme.setArtistas(artistas);
  }

  res.redirect('/filmes');
});


// FORMULÁRIO DE EDIÇÃO DE FILME
app.get('/filmes/:id/editar', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id, {
    raw: true
  });

  const diretores = await Diretor.findAll({
    raw: true
  });

  const artistas = await Artista.findAll({
    raw: true
  });

  res.render('filme/editarFilme', {
    filme,
    diretores,
    artistas
  });
});


// EDITAR FILME
app.put('/filmes/:id', async (req, res) => {
  const id = req.params.id;

  const nome = req.body.nome;
  const ano = req.body.ano;
  const diretorId = req.body.diretorId;
  const artistas = req.body.artistas;

  const filme = await Filme.findByPk(id);

  filme.nome = nome;
  filme.ano = ano;
  filme.diretorId = diretorId;

  await filme.save();

  if (artistas && artistas.length > 0) {
    await filme.setArtistas(artistas);
  }

  res.redirect('/filmes');
});


// EXCLUIR FILME
app.delete('/filmes/:id', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id);

  await filme.destroy();

  res.redirect('/filmes');
});


// DETALHAR FILME
app.get('/filmes/:id', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id, {
    include: [
      {
        model: Diretor,
        as: 'diretor'
      },
      {
        model: Artista,
        as: 'artistas'
      },
      {
        model: FichaTecnica,
        as: 'fichaTecnica'
      }
    ]
  });

  res.render('filme/detalharFilme', {
    filme: filme.toJSON()
  });
});


// ======================================================
// DIRETORES
// ======================================================

// LISTAR DIRETORES
app.get('/diretores', async (req, res) => {
  const diretores = await Diretor.findAll({
    raw: true
  });

  res.render('diretor/diretores', {
    diretores
  });
});


// FORMULÁRIO DE CADASTRO DE DIRETOR
app.get('/diretores/cadastrar', (req, res) => {
  res.render('diretor/cadastrarDiretor');
});


// CADASTRAR DIRETOR
app.post('/diretores', async (req, res) => {
  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nacionalidade = req.body.nacionalidade;

  await Diretor.create({
    nome: nome,
    anoNascimento: anoNascimento,
    nacionalidade: nacionalidade
  });

  res.redirect('/diretores');
});


// FORMULÁRIO DE EDIÇÃO DE DIRETOR
app.get('/diretores/:id/editar', async (req, res) => {
  const id = req.params.id;

  const diretor = await Diretor.findByPk(id, {
    raw: true
  });

  res.render('diretor/editarDiretor', {
    diretor
  });
});


// EDITAR DIRETOR
app.put('/diretores/:id', async (req, res) => {
  const id = req.params.id;

  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nacionalidade = req.body.nacionalidade;

  const diretor = await Diretor.findByPk(id);

  diretor.nome = nome;
  diretor.anoNascimento = anoNascimento;
  diretor.nacionalidade = nacionalidade;

  await diretor.save();

  res.redirect('/diretores');
});


// EXCLUIR DIRETOR
app.delete('/diretores/:id', async (req, res) => {
  const id = req.params.id;

  const diretor = await Diretor.findByPk(id);

  await diretor.destroy();

  res.redirect('/diretores');
});


// DETALHAR DIRETOR
app.get('/diretores/:id', async (req, res) => {
  const id = req.params.id;

  const diretor = await Diretor.findByPk(id, {
    include: [
      {
        model: Filme,
        as: 'filmes'
      }
    ]
  });

  res.render('diretor/detalharDiretor', {
    diretor: diretor.toJSON()
  });
});


// ======================================================
// ARTISTAS
// ======================================================

// LISTAR ARTISTAS
app.get('/artistas', async (req, res) => {
  const artistas = await Artista.findAll({
    raw: true
  });

  res.render('artista/artistas', {
    artistas
  });
});


// FORMULÁRIO DE CADASTRO DE ARTISTA
app.get('/artistas/cadastrar', async (req, res) => {
  const filmes = await Filme.findAll({
    raw: true
  });

  res.render('artista/cadastrarArtista', {
    filmes
  });
});


// CADASTRAR ARTISTA
app.post('/artistas', async (req, res) => {
  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nomeArtistico = req.body.nomeArtistico;
  const emAtividade = req.body.emAtividade;
  const foto = req.body.foto;
  const filmes = req.body.filmes;

  const artista = await Artista.create({
    nome: nome,
    anoNascimento: anoNascimento,
    nomeArtistico: nomeArtistico,
    emAtividade: emAtividade,
    foto: foto
  });

  if (filmes && filmes.length > 0) {
    await artista.setFilmes(filmes);
  }

  res.redirect('/artistas');
});


// FORMULÁRIO DE EDIÇÃO DE ARTISTA
app.get('/artistas/:id/editar', async (req, res) => {
  const id = req.params.id;

  const artista = await Artista.findByPk(id, {
    raw: true
  });

  const filmes = await Filme.findAll({
    raw: true
  });

  res.render('artista/editarArtista', {
    artista,
    filmes
  });
});


// EDITAR ARTISTA
app.put('/artistas/:id', async (req, res) => {
  const id = req.params.id;

  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nomeArtistico = req.body.nomeArtistico;
  const emAtividade = req.body.emAtividade;
  const foto = req.body.foto;
  const filmes = req.body.filmes;

  const artista = await Artista.findByPk(id);

  artista.nome = nome;
  artista.anoNascimento = anoNascimento;
  artista.nomeArtistico = nomeArtistico;
  artista.emAtividade = emAtividade;
  artista.foto = foto;

  await artista.save();

  if (filmes && filmes.length > 0) {
    await artista.setFilmes(filmes);
  }

  res.redirect('/artistas');
});


// EXCLUIR ARTISTA
app.delete('/artistas/:id', async (req, res) => {
  const id = req.params.id;

  const artista = await Artista.findByPk(id);

  await artista.destroy();

  res.redirect('/artistas');
});


// DETALHAR ARTISTA
app.get('/artistas/:id', async (req, res) => {
  const id = req.params.id;

  const artista = await Artista.findByPk(id, {
    include: [
      {
        model: Filme,
        as: 'filmes'
      }
    ]
  });

  res.render('artista/detalharArtista', {
    artista: artista.toJSON()
  });
});


// ======================================================
// FICHA TÉCNICA
// ======================================================

// FORMULÁRIO DE CADASTRO DE FICHA TÉCNICA
app.get('/filmes/:id/ficha-tecnica/cadastrar', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id, {
    raw: true
  });

  res.render('filme/cadastrarFichaTecnica', {
    filme
  });
});


// CADASTRAR FICHA TÉCNICA
app.post('/filmes/:id/ficha-tecnica', async (req, res) => {
  const id = req.params.id;

  const duracaoMinutos = req.body.duracaoMinutos;
  const orcamento = req.body.orcamento;
  const bilheteria = req.body.bilheteria;

  const filme = await Filme.findByPk(id);

  await filme.createFichaTecnica({
    duracaoMinutos: duracaoMinutos,
    orcamento: orcamento,
    bilheteria: bilheteria
  });

  res.redirect(`/filmes/${id}`);
});


// ======================================================
// BANCO DE DADOS
// ======================================================

async function conectarBD() {
  try {
    await sequelize.sync();

    console.log(
      'Conexão com o banco de dados estabelecida com sucesso!'
    );
  } catch (erro) {
    console.error('Erro ao conectar:', erro);
  }
}

conectarBD();


// ======================================================
// SERVIDOR
// ======================================================

app.listen(3000, () => {
  console.log(
    'Servidor executando em http://localhost:3000'
  );
});