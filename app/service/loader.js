async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Falha ao carregar ${path} (${response.status} ${response.statusText})`);
    el.innerHTML = await response.text();
  } catch (err) {
    console.error(`Erro ao carregar componente ${id} de ${path}:`, err);
    el.innerHTML = `<p class="red-text center-align">Erro ao carregar ${id}.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header", "/app/components/header.html");
  await loadComponent("footer", "/app/components/footer.html");

  // Inicializa componentes do Materialize (para garantir que tudo funcione, ex: dropdowns, modais)
  M.AutoInit();

  // Lógica para marcar o link de navegação ativo
  const currentPathname = window.location.pathname;
  const navLinks = document.querySelectorAll('#nav-mobile a');

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref) {
      // Normaliza o href e o pathname para comparação
      const normalizedLinkHref = linkHref.startsWith('/') ? linkHref.substring(1) : linkHref;
      const normalizedCurrentPathname = currentPathname.startsWith('/') ? currentPathname.substring(1) : currentPathname;

      // Remove o fragmento (#catalogo) para comparação precisa dos caminhos base
      const linkPathWithoutHash = normalizedLinkHref.split('#')[0];
      const currentPathWithoutHash = normalizedCurrentPathname.split('#')[0];

      // Caso especial para a página Home que pode ser '/' ou '/index.html'
      const isHomePage = (currentPathWithoutHash === '' || currentPathWithoutHash === 'index.html');
      const isHomeLink = (linkPathWithoutHash === '' || linkPathWithoutHash === 'index.html');

      if (isHomePage && isHomeLink) {
        link.closest('li').classList.add('active');
      } else if (!isHomePage && currentPathWithoutHash.includes(linkPathWithoutHash) && linkPathWithoutHash !== '') {
          // Para outras páginas, verifica se o link está contido no caminho atual
          // Ex: "pages/cadastro-processadores/cadastro-processadores.html" inclui "pages/cadastro-processadores/cadastro-processadores.html"
          link.closest('li').classList.add('active');
      } else {
          link.closest('li').classList.remove('active');
      }
    }
  });

  // Na página principal (index.html), busca os processadores do servidor e os renderiza
  if (currentPathname === '/' || currentPathname.includes('/index.html')) {
    // Chama a função global definida em render.js para buscar e renderizar
    if (typeof window.fetchProcessorsAndRender === "function") {
      window.fetchProcessorsAndRender();
    }
  }
});