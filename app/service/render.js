const rowsPerPage = 10;
let currentPage = 1;
let allProcessors = [];
let filteredProcessors = [];

function fetchProcessorsAndRender() {
    $.ajax({
        url: 'http://localhost:3000/processadores',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            allProcessors = data.map(proc => ({
                ...proc,
                id: String(proc.id)
            }));
            filteredProcessors = allProcessors;
            currentPage = 1;
            renderTablePage(currentPage);
        },
        error: function(xhr, status, error) {
            console.error("Erro ao carregar processadores do servidor:", error);
            M.toast({ html: "Erro ao carregar processadores. Verifique o servidor.", classes: "red darken-2" });
            const tbody = document.querySelector("#cpu-table tbody");
            tbody.innerHTML = `<tr><td colspan="7" class="center-align red-text">Não foi possível carregar os processadores. Verifique se o JSON Server está rodando.</td></tr>`;
            renderPagination();
        }
    });
}

function renderTablePage(page) {
  const tbody = document.querySelector("#cpu-table tbody");
  tbody.innerHTML = "";

  if (filteredProcessors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="center-align">Nenhum processador encontrado.</td></tr>`;
    renderPagination();
    return;
  }

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageProcessors = filteredProcessors.slice(start, end);

  pageProcessors.forEach(proc => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${proc.modelo}</td>
      <td>${proc.marca}</td>
      <td>${proc.frequencia}</td>
      <td>${proc.nucleos}</td>
      <td>${proc.threads}</td>
      <td>${proc.socket}</td>
      <td>
        <a class="btn-small waves-effect waves-light blue darken-1 edit-btn" data-id="${String(proc.id)}"><i class="material-icons">edit</i></a>
        <a class="btn-small waves-effect waves-light red darken-1 delete-btn" data-id="${String(proc.id)}"><i class="material-icons">delete</i></a>
        <a class="btn-small waves-effect waves-light teal darken-1 detail-btn" data-id="${String(proc.id)}"><i class="material-icons">info</i></a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);

  addProcessorActionListeners();

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredProcessors.length / rowsPerPage);
  if (totalPages <= 1 && filteredProcessors.length === 0) return;

  const prevLi = document.createElement("li");
  prevLi.className = currentPage === 1 ? "disabled" : "waves-effect";
  prevLi.innerHTML = `<a href="#!"><i class="material-icons">chevron_left</i></a>`;
  prevLi.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePage(currentPage);
    }
  });
  pagination.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = (i === currentPage) ? "active teal" : "waves-effect";
    li.innerHTML = `<a href="#!">${i}</a>`;
    li.addEventListener("click", () => {
      currentPage = i;
      renderTablePage(currentPage);
    });
    pagination.appendChild(li);
  }

  const nextLi = document.createElement("li");
  nextLi.className = currentPage === totalPages ? "disabled" : "waves-effect";
  nextLi.innerHTML = `<a href="#!"><i class="material-icons">chevron_right</i></a>`;
  nextLi.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTablePage(currentPage);
    }
  });
  pagination.appendChild(nextLi);
}

document.getElementById("search").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  filteredProcessors = allProcessors.filter(proc =>
    String(proc.modelo || '').toLowerCase().includes(filter) ||
    String(proc.marca || '').toLowerCase().includes(filter) ||
    String(proc.frequencia || '').toLowerCase().includes(filter) ||
    String(proc.nucleos || '').includes(filter) ||
    String(proc.threads || '').includes(filter) ||
    String(proc.socket || '').toLowerCase().includes(filter)
  );
  currentPage = 1;
  renderTablePage(currentPage);
});

window.fetchProcessorsAndRender = fetchProcessorsAndRender;

function addProcessorActionListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', handleDeleteClick);
    });
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.removeEventListener('click', handleEditClick);
    });
    document.querySelectorAll('.detail-btn').forEach(button => {
        button.removeEventListener('click', handleDetailClick);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteClick);
    });
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditClick);
    });
    document.querySelectorAll('.detail-btn').forEach(button => {
        button.addEventListener('click', handleDetailClick);
    });

    document.getElementById('confirmDeleteBtn').removeEventListener('click', confirmDeleteProcessor);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteProcessor);
}

function handleDeleteClick(event) {
    const processorId = $(event.currentTarget).data('id');
    const processorName = $(event.currentTarget).closest('tr').find('td:first-child').text();

    $('#deleteProcessorId').val(processorId);
    $('#deleteProcessorName').text(processorName);

    const modalInstance = M.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (modalInstance) {
        modalInstance.open();
    } else {
        console.error("Materialize Modal instance not found for delete confirmation.");
        M.toast({html: 'Erro ao abrir modal de confirmação de exclusão.', classes: 'red darken-2'});
    }
}

function handleEditClick(event) {
    const processorId = $(event.currentTarget).data('id');
    const processor = allProcessors.find(proc => String(proc.id) === String(processorId));

    if (processor) {
        $('#edit_processor_id').val(String(processor.id));
        $('#edit_modelo').val(processor.modelo);
        // Chamar loadSelectOptions para 'marca' e definir o valor
        loadSelectOptions('edit_marca', 'marcas', processor.marca);
        $('#edit_frequencia').val(processor.frequencia);
        $('#edit_nucleos').val(processor.nucleos);
        $('#edit_threads').val(processor.threads);
        // Chamar loadSelectOptions para 'socket' e definir o valor
        loadSelectOptions('edit_socket', 'sockets', processor.socket);
        $('#edit_cacheL3').val(processor.cacheL3 || '');
        $('#edit_tdp').val(processor.tdp || '');
        $('#edit_litografia_nm').val(processor.litografia_nm || '');
        // Chamar loadSelectOptions para 'ram_tipo' e definir o valor
        loadSelectOptions('edit_ram_tipo', 'ram_tipos', processor.ram_tipo);
        $('#edit_ram_velocidade_max').val(processor.ram_velocidade_max || '');
        $('#edit_ram_capacidade_max').val(processor.ram_capacidade_max || '');
        $('#edit_graficos_integrados').val(processor.graficos_integrados || '');
        $('#edit_data_lancamento').val(processor.data_lancamento || '');
        $('#edit_pcie_versao').val(processor.pcie_versao || '');
        $('#edit_pcie_pistas').val(processor.pcie_pistas || '');
        $('#edit_tecnologias').val(processor.tecnologias ? processor.tecnologias.join(', ') : '');

        M.updateTextFields();
        // A chamada $('select').formSelect(); dentro de loadSelectOptions já lida com a inicialização.
        // Não é necessário chamar aqui novamente a menos que haja outros selects não gerenciados por loadSelectOptions.

        const modalInstance = M.Modal.getInstance(document.getElementById('editProcessorModal'));
        if (modalInstance) {
            modalInstance.open();
        } else {
            console.error("Materialize Modal instance not found for edit.");
            M.toast({html: 'Erro ao abrir modal de edição.', classes: 'red darken-2'});
        }
    } else {
        M.toast({ html: 'Processador não encontrado para edição.', classes: 'red darken-2' });
    }
}

function handleDetailClick(event) {
    const processorId = $(event.currentTarget).data('id');
    window.location.href = `/app/pages/detalhes-processador/detalhes-processador.html?id=${processorId}`;
}


document.getElementById('saveEditBtn').addEventListener('click', function(e) {
    e.preventDefault();

    const processorId = $('#edit_processor_id').val();
    const modelo = $('#edit_modelo').val().trim();
    const marca = $('#edit_marca').val().trim();
    const frequencia = $('#edit_frequencia').val().trim();
    const nucleosInput = $('#edit_nucleos').val().trim();
    const threadsInput = $('#edit_threads').val().trim();
    const socket = $('#edit_socket').val().trim();

    const cacheL3 = $('#edit_cacheL3').val().trim();
    const tdp = $('#edit_tdp').val().trim();
    const litografia_nm = $('#edit_litografia_nm').val().trim();
    const ram_tipo = $('#edit_ram_tipo').val().trim();
    const ram_velocidade_max = $('#edit_ram_velocidade_max').val().trim();
    const ram_capacidade_max = $('#edit_ram_capacidade_max').val().trim();
    const graficos_integrados = $('#edit_graficos_integrados').val().trim();
    const data_lancamento = $('#edit_data_lancamento').val().trim();
    const pcie_versao = $('#edit_pcie_versao').val().trim();
    const pcie_pistas = $('#edit_pcie_pistas').val().trim();
    const tecnologiasInput = $('#edit_tecnologias').val().trim();

    if (!modelo || !marca || !frequencia || !nucleosInput || !threadsInput || !socket ||
        !cacheL3 || !tdp || !litografia_nm || !ram_tipo || !ram_velocidade_max ||
        !ram_capacidade_max || !graficos_integrados || !data_lancamento ||
        !pcie_versao || !pcie_pistas || !tecnologiasInput)
    {
        M.toast({ html: "Por favor, preencha todos os campos obrigatórios do formulário de edição!", classes: "red darken-2" });
        return;
    }

    const nucleos = parseInt(nucleosInput, 10);
    const threads = parseInt(threadsInput, 10);

    if (isNaN(nucleos) || nucleos < 1 || isNaN(threads) || threads < 1) {
      M.toast({ html: "Núcleos e Threads devem ser números válidos maiores que zero na edição!", classes: "red darken-2" });
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

    const originalProcessor = allProcessors.find(proc => String(proc.id) === String(processorId));

    if (!originalProcessor) {
        M.toast({ html: "Erro: Processador original não encontrado para atualização.", classes: "red darken-2" });
        return;
    }

    const updatedProcessor = {
        ...originalProcessor,
        id: String(processorId),
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

    Object.keys(updatedProcessor).forEach(key => {
        if (updatedProcessor[key] === undefined) {
            delete updatedProcessor[key];
        }
    });

    updateProcessor(updatedProcessor);

    const modalInstance = M.Modal.getInstance(document.getElementById('editProcessorModal'));
    if (modalInstance) {
        modalInstance.close();
    }
});


function confirmDeleteProcessor() {
    const processorId = $('#deleteProcessorId').val();
    deleteProcessor(processorId);

    const modalInstance = M.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (modalInstance) {
        modalInstance.close();
    }
}

function deleteProcessor(id) {
    $.ajax({
        url: `http://localhost:3000/processadores/${id}`,
        method: 'DELETE',
        success: function() {
            M.toast({ html: 'Processador excluído com sucesso!', classes: 'green darken-2' });
            fetchProcessorsAndRender();
        },
        error: function(xhr, status, error) {
            console.error("Erro ao excluir processador:", error);
            M.toast({ html: 'Erro ao excluir. Tente novamente.', classes: "red darken-2" });
        }
    });
}

function updateProcessor(processor) {
    $.ajax({
        url: `http://localhost:3000/processadores/${processor.id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(processor),
        success: function(response) {
            M.toast({ html: 'Processador atualizado com sucesso!', classes: 'green darken-2' });
            fetchProcessorsAndRender();
        },
        error: function(xhr, status, error) {
            console.error("Erro ao atualizar processador:", error);
            M.toast({ html: 'Erro ao atualizar. Tente novamente.', classes: 'red darken-2' });
        }
    });
}