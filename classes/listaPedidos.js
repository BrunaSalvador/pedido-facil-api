class listaPedidos {
    constructor(produtos, endereco, detalheCliente) {
      this.id = Pedidos.nextId++;
      this.produtos = produtos;
      this.endereco = endereco;
      this.detalheCliente = detalheCliente;
    }
  }
  listaPedidos.nextId = 1;
  
  module.exports = listaPedidos;