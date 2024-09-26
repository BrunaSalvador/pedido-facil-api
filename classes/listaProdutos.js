class listaProdutos {
    constructor(nome, descricao, preco, estoque) {
      this.id = Produto.nextId++;
      this.nome = nome;
      this.descricao = descricao;
      this.preco = preco;
      this.estoque = estoque;
    }
  }
  
  listaProdutos.nextId = 1;
  
  module.exports = listaProdutos;