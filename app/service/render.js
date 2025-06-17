const rowsPerPage = 10;
let currentPage = 1;
let allProcessors = [];
let filteredProcessors = [];

// Função para carregar processadores do JSON Server e renderizar a tabela
function fetchProcessorsAndRender() {
    $.ajax({
        url: 'http://localhost:3000/processadores', // Seu endpoint de API do JSON Server
        method: 'GET',
        success: function(data) {
            allProcessors = data;
            filteredProcessors = allProcessors;
            currentPage = 1;
            renderTablePage(currentPage);
        },
        error: function(xhr, status, error) {
            console.error("Erro ao carregar processadores do servidor:", error);
            M.toast({ html: "Erro ao carregar processadores. Verifique o servidor.", classes: "red darken-2" });
            const tbody = document.querySelector("#cpu-table tbody");
            tbody.innerHTML = `<tr><td colspan="7" class="center-align red-text">Não foi possível carregar os processadores. Verifique se o JSON Server está rodando.</td></tr>`; // Colspan ajustado
            renderPagination();
        }
    });
}

function renderTablePage(page) {
  const tbody = document.querySelector("#cpu-table tbody");
  tbody.innerHTML = "";

  if (filteredProcessors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="center-align">Nenhum processador encontrado.</td></tr>`; // Colspan ajustado
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
        <a class="btn-small waves-effect waves-light blue darken-1 edit-btn" data-id="${proc.id}"><i class="material-icons">edit</i></a>
        <a class="btn-small waves-effect waves-light red darken-1 delete-btn" data-id="${proc.id}"><i class="material-icons">delete</i></a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Inicializa o modal após a renderização da tabela
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);

  // Adiciona os event listeners para os botões após eles serem criados
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
    proc.modelo.toLowerCase().includes(filter) ||
    proc.marca.toLowerCase().includes(filter) ||
    proc.frequencia.toLowerCase().includes(filter) ||
    proc.nucleos.toString().includes(filter) ||
    proc.threads.toString().includes(filter) ||
    proc.socket.toLowerCase().includes(filter)
  );
  currentPage = 1;
  renderTablePage(currentPage);
});

// Exponha a função globalmente para que loader.js possa chamá-la
window.fetchProcessorsAndRender = fetchProcessorsAndRender;

// --- Lógica de Edição e Exclusão ---

function addProcessorActionListeners() {
    // Event listener para botões de Excluir
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', handleDeleteClick); // Evita múltiplos listeners
        button.addEventListener('click', handleDeleteClick);
    });

    // Event listener para botões de Editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.removeEventListener('click', handleEditClick); // Evita múltiplos listeners
        button.addEventListener('click', handleEditClick);
    });
}

function handleDeleteClick(event) {
    const processorId = $(event.currentTarget).data('id'); // Pega o ID do atributo data-id
    if (confirm('Tem certeza que deseja excluir este processador?')) {
        deleteProcessor(processorId);
    }
}

function handleEditClick(event) {
    const processorId = $(event.currentTarget).data('id');
    const processor = allProcessors.find(proc => proc.id == processorId); // Encontra o processador pelo ID

    if (processor) {
        // Preenche o modal com os dados do processador
        $('#edit_processor_id').val(processor.id);
        $('#edit_modelo').val(processor.modelo);
        $('#edit_marca').val(processor.marca);
        $('#edit_frequencia').val(processor.frequencia);
        $('#edit_nucleos').val(processor.nucleos);
        $('#edit_threads').val(processor.threads);
        $('#edit_socket').val(processor.socket);

        // Atualiza os labels dos campos Materialize para que o texto não sobreponha o valor
        M.updateTextFields();

        // Abre o modal de edição
        const modalInstance = M.Modal.getInstance(document.getElementById('editProcessorModal'));
        modalInstance.open();
    } else {
        M.toast({ html: 'Processador não encontrado para edição.', classes: 'red darken-2' });
    }
}

// Event listener para o botão "Salvar" dentro do modal de edição
document.getElementById('saveEditBtn').addEventListener('click', function(e) {
    e.preventDefault(); // Evita o comportamento padrão do botão

    const processorId = $('#edit_processor_id').val();
    const modelo = $('#edit_modelo').val().trim();
    const marca = $('#edit_marca').val().trim();
    const frequencia = $('#edit_frequencia').val().trim();
    const nucleosInput = $('#edit_nucleos').val().trim();
    const threadsInput = $('#edit_threads').val().trim();
    const socket = $('#edit_socket').val().trim();

    if (!modelo || !marca || !frequencia || !nucleosInput || !threadsInput || !socket) {
        M.toast({ html: "Por favor, preencha todos os campos do formulário de edição!", classes: "red darken-2" });
        return;
    }

    const nucleos = parseInt(nucleosInput, 10);
    const threads = parseInt(threadsInput, 10);

    if (isNaN(nucleos) || nucleos < 1 || isNaN(threads) || threads < 1) {
      M.toast({ html: "Núcleos e Threads devem ser números válidos maiores que zero na edição!", classes: "red darken-2" });
      return;
    }

    const updatedProcessor = {
        id: parseInt(processorId, 10), // O ID precisa ser mantido e enviado
        modelo,
        marca,
        frequencia,
        nucleos,
        threads,
        socket
    };

    updateProcessor(updatedProcessor);

    // Fecha o modal após tentar salvar
    const modalInstance = M.Modal.getInstance(document.getElementById('editProcessorModal'));
    modalInstance.close();
});


// Função para excluir um processador
function deleteProcessor(id) {
    $.ajax({
        url: `http://localhost:3000/processadores/${id}`, // Endpoint DELETE com o ID
        method: 'DELETE',
        success: function() {
            M.toast({ html: 'Processador excluído com sucesso!', classes: 'green darken-2' });
            fetchProcessorsAndRender(); // Recarrega a tabela após a exclusão
        },
        error: function(xhr, status, error) {
            console.error("Erro ao excluir processador:", error);
            M.toast({ html: 'Erro ao excluir. Tente novamente.', classes: 'red darken-2' });
        }
    });
}

// Função para atualizar um processador
function updateProcessor(processor) {
    $.ajax({
        url: `http://localhost:3000/processadores/${processor.id}`, // Endpoint PUT com o ID
        method: 'PUT', // Método PUT para atualização completa do recurso
        contentType: 'application/json',
        data: JSON.stringify(processor),
        success: function(response) {
            M.toast({ html: 'Processador atualizado com sucesso!', classes: 'green darken-2' });
            fetchProcessorsAndRender(); // Recarrega a tabela após a atualização
        },
        error: function(xhr, status, error) {
            console.error("Erro ao atualizar processador:", error);
            M.toast({ html: 'Erro ao atualizar. Tente novamente.', classes: 'red darken-2' });
        }
    });
}