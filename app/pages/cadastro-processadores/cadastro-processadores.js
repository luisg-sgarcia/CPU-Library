document.addEventListener("DOMContentLoaded", function() {
    M.AutoInit(); // Inicializa todos os componentes Materialize (incluindo selects)

    // NOVO: Carrega as opções para os selects ao carregar a página
    loadSelectOptions('marca', 'marcas');
    loadSelectOptions('socket', 'sockets');
    loadSelectOptions('ram_tipo', 'ram_tipos');
});


document.getElementById("cpu-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const modelo = $("#modelo").val().trim();
  const marca = $("#marca").val().trim(); // Agora pega do select
  const frequencia = $("#frequencia").val().trim();
  const nucleosInput = $("#nucleos").val().trim();
  const threadsInput = $("#threads").val().trim();
  const socket = $("#socket").val().trim(); // Agora pega do select

  const cacheL3 = $("#cacheL3").val().trim();
  const tdp = $("#tdp").val().trim();
  const litografia_nm = $("#litografia_nm").val().trim();
  const ram_tipo = $("#ram_tipo").val().trim(); // Agora pega do select
  const ram_velocidade_max = $("#ram_velocidade_max").val().trim();
  const ram_capacidade_max = $("#ram_capacidade_max").val().trim();
  const graficos_integrados = $("#graficos_integrados").val().trim();
  const data_lancamento = $("#data_lancamento").val().trim();
  const pcie_versao = $("#pcie_versao").val().trim();
  const pcie_pistas = $("#pcie_pistas").val().trim();
  const tecnologiasInput = $("#tecnologias").val().trim();

  // Validação para campos obrigatórios (inclui os selects)
  if (!modelo || !marca || !frequencia || !nucleosInput || !threadsInput || !socket ||
      !marca || marca === '' || // Valida se a marca foi selecionada
      !socket || socket === '' || // Valida se o socket foi selecionado
      !ram_tipo || ram_tipo === '' // Valida se o tipo de RAM foi selecionado
    ) {
    M.toast({ html: "Por favor, preencha todos os campos obrigatórios: Modelo, Marca, Frequência, Núcleos, Threads, Socket, RAM Tipo!", classes: "red darken-2" });
    return;
  }

  const nucleos = parseInt(nucleosInput, 10);
  const threads = parseInt(threadsInput, 10);

  if (isNaN(nucleos) || nucleos < 1 || isNaN(threads) || threads < 1) {
    M.toast({ html: "Núcleos e Threads devem ser números válidos maiores que zero!", classes: "red darken-2" });
    return;
  }

  const regexFrequencia = /^\d+(\.\d+)?\sGHz$/;
  if (frequencia && !regexFrequencia.test(frequencia)) {
    M.toast({ html: "Formato de Frequência inválido (ex: '3.5 GHz')!", classes: "red darken-2" });
    return;
  }

  const regexDataLancamento = /^[A-Za-z]+\s\d{4}$/;
  if (data_lancamento && !regexDataLancamento.test(data_lancamento)) {
      M.toast({ html: "Formato de Data de Lançamento inválido (ex: 'Janeiro 2023')!", classes: "red darken-2" });
      return;
  }

  const tecnologias = tecnologiasInput ? tecnologiasInput.split(',').map(tech => tech.trim()).filter(tech => tech !== '') : [];

  $.ajax({
    url: 'http://localhost:3000/processadores?modelo=' + encodeURIComponent(modelo),
    method: 'GET',
    success: function(data) {
      if (data.length > 0) {
        M.toast({ html: "Este modelo já está cadastrado!", classes: "orange darken-2" });
      } else {
        $.ajax({
          url: 'http://localhost:3000/processadores',
          method: 'GET',
          success: function(allProcessors) {
            let nextIdNum = 0;
            if (allProcessors.length > 0) {
              let maxId = 0;
              allProcessors.forEach(proc => {
                const idAsInt = parseInt(proc.id, 10);
                if (!isNaN(idAsInt) && idAsInt > maxId) {
                  maxId = idAsInt;
                }
              });
              nextIdNum = maxId + 1;
            } else {
              nextIdNum = 1;
            }

            const nextIdString = String(nextIdNum);

            const novoProcessador = {
              id: nextIdString,
              modelo,
              marca,
              frequencia,
              nucleos,
              threads,
              socket,
              cacheL3: cacheL3 || undefined,
              tdp: tdp || undefined,
              litografia_nm: litografia_nm || undefined,
              ram_tipo: ram_tipo || undefined,
              ram_velocidade_max: ram_velocidade_max || undefined,
              ram_capacidade_max: ram_capacidade_max || undefined,
              graficos_integrados: graficos_integrados || undefined,
              data_lancamento: data_lancamento || undefined,
              pcie_versao: pcie_versao || undefined,
              pcie_pistas: pcie_pistas || undefined,
              tecnologias: tecnologias.length > 0 ? tecnologias : undefined
            };

            Object.keys(novoProcessador).forEach(key => {
                if (novoProcessador[key] === undefined) {
                    delete novoProcessador[key];
                }
            });

            $.ajax({
              url: 'http://localhost:3000/processadores',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(novoProcessador),
              success: function(response) {
                M.toast({ html: "Processador cadastrado com sucesso!", classes: "green darken-2" });
                $("#cpu-form")[0].reset();
                // Opcional: Re-inicializar selects após reset, se necessário (materialize geralmente mantém o placeholder)
                $('select').formSelect();
              },
              error: function(xhr, status, error) {
                console.error("Erro ao cadastrar processador:", error);
                M.toast({ html: "Erro ao cadastrar. Tente novamente.", classes: "red darken-2" });
              }
            });
          },
          error: function(xhr, status, error) {
            console.error("Erro ao buscar processadores para determinar ID:", error);
            M.toast({ html: "Erro ao carregar dados para ID. Tente novamente.", classes: "red darken-2" });
          }
        });
      }
    },
    error: function(xhr, status, error) {
      console.error("Erro ao verificar processador existente:", error);
      M.toast({ html: "Erro ao verificar dados. Verifique a conexão com o servidor.", classes: "red darken-2" });
    }
  });
});