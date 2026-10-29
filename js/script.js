// 1. Menu do celular
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector("#menu-principal");

if (botaoMenu && menu) {
  botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", aberto);
  });
}

// 2. Newsletter (demonstração)
const formulario = document.querySelector(".newsletter form");
const mensagem = document.querySelector("#mensagem-newsletter");

if (formulario && mensagem) {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensagem.textContent = "Obrigado! (Demonstração: seu e-mail não foi salvo.)";
    formulario.reset();
  });
}

// 3. Carrinho (demonstração)
const CHAVE_CARRINHO = "lumie-carrinho";

function lerCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  } catch (erro) {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function atualizarContador() {
  const total = lerCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
  document.querySelectorAll(".carrinho").forEach((link) => {
    link.textContent = `Carrinho (${total})`;
  });
}

document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-id]");
  if (!botao) return;

  const carrinho = lerCarrinho();
  const id = botao.dataset.id;
  const existente = carrinho.find((item) => item.id === id);

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      id: id,
      nome: botao.dataset.nome,
      preco: Number(botao.dataset.preco),
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarContador();
});

atualizarContador();

// 4. Página do carrinho
const listaCarrinho = document.querySelector("#carrinho-itens");

if (listaCarrinho) {
  const mensagemVazio = document.querySelector("#carrinho-vazio");
  const resumo = document.querySelector("#carrinho-resumo");
  const totalTexto = document.querySelector("#carrinho-total");

  const formatarPreco = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function criarBotao(texto, acao, produto, rotulo) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.dataset.acao = acao;
    botao.dataset.produto = produto;
    botao.setAttribute("aria-label", rotulo);
    return botao;
  }

  function desenharCarrinho() {
    const carrinho = lerCarrinho();
    listaCarrinho.replaceChildren();

    mensagemVazio.hidden = carrinho.length > 0;
    resumo.hidden = carrinho.length === 0;

    let total = 0;

    carrinho.forEach((item) => {
      total += item.preco * item.quantidade;

      const linha = document.createElement("li");
      linha.className = "item-carrinho";

      const nome = document.createElement("span");
      nome.className = "item-nome";
      nome.textContent = item.nome;

      const quantidade = document.createElement("span");
      quantidade.className = "item-quantidade";
      quantidade.append(
        criarBotao("−", "menos", item.id, `Diminuir quantidade de ${item.nome}`),
        document.createTextNode(` ${item.quantidade} `),
        criarBotao("+", "mais", item.id, `Aumentar quantidade de ${item.nome}`)
      );

      const subtotal = document.createElement("span");
      subtotal.className = "item-subtotal";
      subtotal.textContent = formatarPreco(item.preco * item.quantidade);

      const remover = criarBotao("Remover", "remover", item.id, `Remover ${item.nome} do carrinho`);

      linha.append(nome, quantidade, subtotal, remover);
      listaCarrinho.append(linha);
    });

    totalTexto.textContent = formatarPreco(total);
  }

  listaCarrinho.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const id = botao.dataset.produto;
    const acao = botao.dataset.acao;
    let carrinho = lerCarrinho();
    const item = carrinho.find((produto) => produto.id === id);
    if (!item) return;

    if (acao === "mais") {
      item.quantidade += 1;
    } else if (acao === "menos") {
      item.quantidade -= 1;
    } else if (acao === "remover") {
      item.quantidade = 0;
    }

    carrinho = carrinho.filter((produto) => produto.quantidade > 0);

    salvarCarrinho(carrinho);
    desenharCarrinho();
    atualizarContador();
  });

  desenharCarrinho();
}

// 5. Página de produto
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const detalhe = document.querySelector("#produto-detalhe");

if (detalhe) {
  const parametros = new URLSearchParams(window.location.search);
  const produto = PRODUTOS.find((p) => p.id === parametros.get("id"));

  if (!produto) {
    document.querySelector("#produto-nao-encontrado").hidden = false;
  } else {
    const campoTons = document.querySelector("#produto-tons");
    const listaTons = document.querySelector("#tons-lista");
    const tomEscolhido = document.querySelector("#tom-escolhido");
    const aviso = document.querySelector("#produto-aviso");
    let tomAtual = produto.tons[0] || null;

    document.title = `${produto.nome} | Lumiê`;
    document.querySelector("#produto-nome").textContent = produto.nome;
    document.querySelector("#produto-descricao").textContent = produto.descricao;
    document.querySelector("#produto-preco").textContent = formatarMoeda(produto.preco);

    const imagem = document.createElement("img");
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    imagem.width = 800;
    imagem.height = 800;
    document.querySelector("#produto-midia").append(imagem);

    if (produto.tons.length === 0) {
      campoTons.hidden = true;
    } else {
      tomEscolhido.textContent = tomAtual.nome;

      produto.tons.forEach((tom, indice) => {
        const rotulo = document.createElement("label");
        rotulo.className = "tom";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "tom";
        radio.value = tom.id;
        radio.checked = indice === 0;

        const cor = document.createElement("span");
        cor.className = "cor";
        cor.style.backgroundColor = tom.cor;

        const nomeTom = document.createElement("span");
        nomeTom.className = "oculto";
        nomeTom.textContent = tom.nome;

        rotulo.append(radio, cor, nomeTom);
        listaTons.append(rotulo);
      });

      listaTons.addEventListener("change", (evento) => {
        tomAtual = produto.tons.find((tom) => tom.id === evento.target.value);
        tomEscolhido.textContent = tomAtual.nome;
        aviso.textContent = "";
      });
    }

    document.querySelector("#adicionar").addEventListener("click", () => {
      const carrinho = lerCarrinho();
      const id = tomAtual ? `${produto.id}-${tomAtual.id}` : produto.id;
      const nome = tomAtual ? `${produto.nome} (${tomAtual.nome})` : produto.nome;
      const existente = carrinho.find((item) => item.id === id);

      if (existente) {
        existente.quantidade += 1;
      } else {
        carrinho.push({ id: id, nome: nome, preco: produto.preco, quantidade: 1 });
      }

      salvarCarrinho(carrinho);
      atualizarContador();
      aviso.textContent = `${nome} adicionado ao carrinho.`;
    });

    detalhe.hidden = false;
  }
}

// 6. Loja gerada a partir dos produtos
const listaProdutos = document.querySelector("#lista-produtos");

if (listaProdutos) {
  PRODUTOS.forEach((produto) => {
    const endereco = `produto.html?id=${produto.id}`;

    const cartao = document.createElement("article");
    cartao.className = "produto";

    const imagem = document.createElement("img");
    imagem.src = produto.imagem;
    imagem.alt = produto.alt || produto.nome;
    imagem.width = 600;
    imagem.height = 600;

    const titulo = document.createElement("h2");
    const linkTitulo = document.createElement("a");
    linkTitulo.href = endereco;
    linkTitulo.textContent = produto.nome;
    titulo.append(linkTitulo);

    const descricao = document.createElement("p");
    descricao.textContent = produto.descricao;

    const preco = document.createElement("p");
    preco.className = "preco";
    preco.textContent = formatarMoeda(produto.preco);

    let acao;
    if (produto.tons.length > 0) {
      acao = document.createElement("a");
      acao.className = "botao";
      acao.href = endereco;
      acao.textContent = "Escolher tom";
    } else {
      acao = document.createElement("button");
      acao.className = "botao";
      acao.type = "button";
      acao.textContent = "Adicionar ao carrinho";
      acao.dataset.id = produto.id;
      acao.dataset.nome = produto.nome;
      acao.dataset.preco = produto.preco;
    }

    cartao.append(imagem, titulo, descricao, preco, acao);
    listaProdutos.append(cartao);
  });
}
// 7. Formulário de contato (demonstração)
const formularioContato = document.querySelector("#form-contato");

if (formularioContato) {
  const avisoContato = document.querySelector("#contato-aviso");

  formularioContato.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = formularioContato.elements["nome"].value.trim();
    avisoContato.textContent = `Obrigado, ${nome}! (Demonstração: sua mensagem não foi enviada.)`;
    formularioContato.reset();
  });
}