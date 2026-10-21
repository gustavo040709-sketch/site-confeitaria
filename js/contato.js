const formEndereco = document.getElementById("form-endereco")
const campoCep = document.getElementById("cep")
const mensagemCep = document.getElementById("mensagem-cep")
const mensagemFormulario = document.getElementById("mensagem-formulario")
const camposPreenchidosPeloCep = {
    logradouro: document.getElementById("logradouro"),
    bairro: document.getElementById("bairro"),
    cidade: document.getElementById("cidade"),
    uf: document.getElementById("uf"),
    estado: document.getElementById("estado")
}

let cepConsultado = ""
let consultaAtual

function limparEndereco() {
    Object.values(camposPreenchidosPeloCep).forEach((campo) => {
        campo.value = ""
    })
}

campoCep.addEventListener("input", () => {
    const numerosCep = campoCep.value.replace(/\D/g, "").slice(0, 8)
    campoCep.value = numerosCep.length > 5
        ? `${numerosCep.slice(0, 5)}-${numerosCep.slice(5)}`
        : numerosCep
    mensagemFormulario.textContent = ""

    if (numerosCep.length !== 8) {
        cepConsultado = ""
        limparEndereco()
        mensagemCep.textContent = ""
        consultaAtual?.abort()
        return
    }

    if (numerosCep === cepConsultado) {
        return
    }

    cepConsultado = numerosCep
    consultaAtual?.abort()
    consultaAtual = new AbortController()
    limparEndereco()
    mensagemCep.textContent = "Buscando endereço..."

    fetch(`https://viacep.com.br/ws/${numerosCep}/json/`, {
        signal: consultaAtual.signal
    })
        .then((resposta) => {
            if (!resposta.ok) {
                throw new Error("Não foi possível consultar o CEP.")
            }

            return resposta.json()
        })
        .then((dados) => {
            if (dados.erro) {
                cepConsultado = ""
                mensagemCep.textContent = "CEP não encontrado. Confira o número informado."
                return
            }

            camposPreenchidosPeloCep.logradouro.value = dados.logradouro || ""
            camposPreenchidosPeloCep.bairro.value = dados.bairro || ""
            camposPreenchidosPeloCep.cidade.value = dados.localidade || ""
            camposPreenchidosPeloCep.uf.value = dados.uf || ""
            camposPreenchidosPeloCep.estado.value = dados.estado || ""
            mensagemCep.textContent = "Endereço encontrado. Informe o número do imóvel."
        })
        .catch((erro) => {
            if (erro.name === "AbortError") {
                return
            }

            cepConsultado = ""
            mensagemCep.textContent = "Não foi possível buscar o CEP. Verifique sua conexão e tente novamente."
        })
})

formEndereco.addEventListener("submit", (evento) => {
    evento.preventDefault()
    mensagemFormulario.textContent = "Endereço pronto para continuar com o pedido."
})
