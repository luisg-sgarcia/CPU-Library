document.getElementById("cpu-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const modelo = $("#modelo").val().trim();
  const marca = $("#marca").val().trim();
  const frequencia = $("#frequencia").val().trim();
  const nucleosInput = $("#nucleos").val().trim();
  const threadsInput = $("#threads").val().trim();
  const socket = $("#socket").val().trim();

  if (!modelo || !marca || !frequencia || !nucleosInput || !threadsInput || !socket) {
    M.toast({ html: "Por favor, preencha todos os campos!", classes: "red darken-2" });
    return;
  }

  const nucleos = parseInt(nucleosInput, 10);
  const threads = parseInt(threadsInput, 10);

  if (isNaN(nucleos) || nucleos < 1 || isNaN(threads) || threads < 1) {
    M.toast({ html: "Núcleos e Threads devem ser números válidos maiores que zero!", classes: "red darken-2" });
    return;
  }

  // 1. Verificar se o processador já existe no servidor antes de cadastrar
  $.ajax({
    url: 'http://localhost:3000/processadores?modelo=' + encodeURIComponent(modelo),
    method: 'GET',
    success: function(data) {
      if (data.length > 0) {
        M.toast({ html: "Este modelo já está cadastrado!", classes: "orange darken-2" });
      } else {
        // 2. Se não existir, obter todos os processadores para determinar o próximo ID
        $.ajax({
          url: 'http://localhost:3000/processadores',
          method: 'GET',
          success: function(allProcessors) {
            let nextIdNum = 0; // Usar um número para o cálculo
            if (allProcessors.length > 0) {
              // Encontra o maior ID existente. PODE SER UMA STRING, entao convertemos para numero temporariamente
              // E se o ID for UUID? A lógica de maxId vai falhar.
              // Para IDs string, precisamos de uma abordagem diferente para "próximo ID".
              // A forma mais segura é deixar o JSON Server gerar o ID automaticamente.
              // Se o JSON Server está gerando UUIDs, mas os seus são 1, 2, 3...
              // O MELHOR É REINICIAR O db.json apenas com 1, 2, 3 NUMÉRICOS, E FORÇAR O JQUERY SERVER A ACEITAR.

              // PARE AQUI! Vamos reavaliar. A abordagem de forçar string no JS para bater com o db.json se o db.json
              // tem strings "1", "2" é mais fácil, mas a de IDs numéricos é mais robusta no longo prazo.
              // O JSON Server **sempre** deveria aceitar o ID que você envia no POST.

              // Se ele está gerando UUIDs apesar de você enviar um ID, isso é um problema.
              // Vou propor uma solução que tenta resolver isso de forma mais agressiva.

              // NOVO CÁLCULO DE ID: Tentar extrair o maior número dos IDs, mesmo que sejam strings.
              let maxId = 0;
              allProcessors.forEach(proc => {
                const idAsInt = parseInt(proc.id, 10); // Tenta converter para int
                if (!isNaN(idAsInt) && idAsInt > maxId) {
                  maxId = idAsInt;
                }
              });
              nextIdNum = maxId + 1;
            } else {
              nextIdNum = 1; // Se não houver processadores, começa com 1
            }

            // CONVERTER PARA STRING para que o formato seja consistente com "id": "1"
            const nextIdString = String(nextIdNum);

            const novoProcessador = {
              id: nextIdString, // <<<<<<< ID AGORA É STRING
              modelo,
              marca,
              frequencia,
              nucleos,
              threads,
              socket
            };

            // 3. Enviar o novo processador com o ID definido para o servidor (POST)
            $.ajax({
              url: 'http://localhost:3000/processadores',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(novoProcessador),
              success: function(response) {
                M.toast({ html: "Processador cadastrado com sucesso!", classes: "green darken-2" });
                $("#cpu-form")[0].reset();
                // Opcional: Recarregar a lista na página index.html se for o caso
                // Ou, se estiver na index.html, chamar fetchProcessorsAndRender();
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