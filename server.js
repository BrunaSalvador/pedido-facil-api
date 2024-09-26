// Importa o módulo 'express' para criar o servidor
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

const listaProdutos = [];
let listaPedidos = [];
let nextProdutosId = 1;
let nextPedidosId = 1;

// Rota para criar um novo produto
app.post('/produtos', (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;

  if (!nome || !descricao || preco == null || estoque == null) {
    return res.status(400).json({ message: 'Faltando campos obrigatórios' });
  }

  // Cria um novo produto e adiciona à lista
  const produto = { id: nextProdutosId++, nome, descricao, preco, estoque };
  listaProdutos.push(produto);

  // Retorna o produto criado com o status 201 (criado)
  res.status(201).json(produto);
});

// Rota para obter um produto por ID
app.get('/produtos/:id', (req, res) => {
  const produtoId = listaProdutos.find(p => p.id === parseInt(req.params.id));

  // Se o produto não for encontrado, retorna status 404 (não encontrado)
  if (!produtoId) return res.status(404).json({ message: 'Produto não encontrado' });

  // Retorna o produto encontrado
  res.json(produtoId);
});

// Rota para listar produtos com paginação
app.get('/produtos', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const start = (page - 1) * limit;
  const end = page * limit;

  // Retorna a lista paginada de produtos
  res.json(listaProdutos.slice(start, end));
});

// Rota para atualizar um produto
app.put('/produtos/:id', (req, res) => {
  const produtoId = listaProdutos.find(p => p.id === parseInt(req.params.id));

  // Se o produto não for encontrado, retorna status 404 (não encontrado)
  if (!produtoId) return res.status(404).json({ message: 'Produto não encontrado' });

  // Atualiza as propriedades do produto conforme o que foi enviado na requisição
  const { nome, descricao, preco, estoque } = req.body;
  if (nome) produtoId.nome = nome;
  if (descricao) produtoId.descricao = descricao;
  if (preco != null) produtoId.preco = preco;
  if (estoque != null) produtoId.estoque = estoque;

  // Retorna o produto atualizado
  res.json(produtoId);
});

// Rota para deletar um produto
app.delete('/produtos/:id', (req, res) => {
  const produtosIndex = listaProdutos.findIndex(p => p.id === parseInt(req.params.id));

  // Se o produto não for encontrado, retorna status 404 (não encontrado)
  if (produtosIndex === -1) return res.status(404).json({ message: 'Produto não encontrado' });

  // Remove o produto da lista
  listaProdutos.splice(produtosIndex, 1);

  // Retorna status 204 (sem conteúdo) indicando que o produto foi removido com sucesso
  res.status(204).send();
});
//Pedidos

// Rota para criar um novo pedido
app.post('/pedidos', (req, res) => {
  const { produtos, endereco, detalheCliente } = req.body;

  // Verificar se todos os produtos do pedido existem na lista de produtos
  const produtosExistem = produtos.every(p =>
      listaProdutos.find(produto => produto.id === p.idProduto)
  );

  if (!produtosExistem) {
      return res.status(400).json({ message: 'Um ou mais produtos não existem!' });
  }

  // Adicionar a quantidade de cada produto ao pedido
  const novoPedido = {
      id: nextPedidosId++,
      produtos: produtos.map(p => ({
          idProduto: p.idProduto,
          quantidade: p.quantidade // Adicionando a quantidade aqui
      })),
      endereco,
      detalheCliente,
      status: 'Pendente'
  };

  listaPedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});

// Consulta de pedido por ID
app.get('/pedidos/:id', (req, res) => {
  const pedido = listaPedidos.find(p => p.id === parseInt(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado!' });

  // Desenvolver os detalhes dos produtos no pedido
  const produtosDetalhados = pedido.produtos.map(pedidoProduto => {
      const produto = listaProdutos.find(p => p.id === pedidoProduto.idProduto);
      return {
          pedidoProduto,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: pedidoProduto.quantidade // Incluindo quantidade na resposta
      };
  });

  res.json({ pedido, produtos: produtosDetalhados });
});

// Listagem de pedidos
app.get('/pedidos', (req, res) => {
  const { status } = req.query;
  const resultado = status ? listaPedidos.filter(p => p.status === status) : listaPedidos;
  res.json(resultado);
});

// Atualização de status de pedido
app.put('/pedidos/:id/status', (req, res) => {
  const pedido = listaPedidos.find(p => p.id === parseInt(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Status é obrigatório' });
  
  pedido.status = status;
  res.json(pedido);
});

// Exclusão de pedido
app.delete('/pedidos/:id', (req, res) => {
  const index = listaPedidos.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Pedido não encontrado' });
  if (listaPedidos[index].status !== 'Pendente') {
      return res.status(400).json({ message: 'Não é possível excluir pedidos processados' });
  }

  listaPedidos.splice(index, 1);
  res.status(200).json({ message: 'Pedido excluído' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});