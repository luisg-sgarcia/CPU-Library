const rowsPerPage = 10;
let currentPage = 1;
let filteredProcessors = processors;

function renderTablePage(page) {
  const tbody = document.querySelector("#cpu-table tbody");
  tbody.innerHTML = "";
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
    `;
    tbody.appendChild(tr);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredProcessors.length / rowsPerPage);
  if (totalPages <= 1) return;

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
  filteredProcessors = processors.filter(proc =>
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

document.addEventListener("DOMContentLoaded", () => {
  renderTablePage(currentPage);
});
