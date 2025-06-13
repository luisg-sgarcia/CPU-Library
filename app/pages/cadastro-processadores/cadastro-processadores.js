// Função para obter processadores do localStorage
function getStoredProcessors() {
  const stored = localStorage.getItem("processadores");
  return stored ? JSON.parse(stored) : [];
}

// Função para salvar processadores no localStorage
function saveProcessors(processors) {
  localStorage.setItem("processadores", JSON.stringify(processors));
}

document.getElementById("cpu-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const modelo = document.getElementById("modelo").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const frequencia = document.getElementById("frequencia").value.trim();
  const nucleos = document.getElementById("nucleos").value.trim();
  const threads = document.getElementById("threads").value.trim();
  const socket = document.getElementById("socket").value.trim();

  if (!modelo || !marca || !frequencia || !nucleos || !threads || !socket) {
    M.toast({ html: "Por favor, preencha todos os campos!", classes: "red darken-2" });
    return;
  }

  const processors = getStoredProcessors();

  const alreadyExists = processors.some(proc => proc.modelo.toLowerCase() === modelo.toLowerCase());

  if (alreadyExists) {
    M.toast({ html: "Este modelo já está cadastrado!", classes: "orange darken-2" });
    return;
  }

  const novoProcessador = {
    modelo,
    marca,
    frequencia,
    nucleos: parseInt(nucleos),
    threads: parseInt(threads),
    socket
  };

  processors.push(novoProcessador);
  saveProcessors(processors);

  M.toast({ html: "Processador cadastrado com sucesso!", classes: "green darken-2" });
  document.getElementById("cpu-form").reset();
});
