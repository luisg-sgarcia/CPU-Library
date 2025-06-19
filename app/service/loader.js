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

  M.AutoInit(); 

  const sidenavElems = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sidenavElems);


  const currentPathname = window.location.pathname;
  const navLinks = document.querySelectorAll('#nav-mobile a, .sidenav a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref) {
      const normalizedLinkHref = linkHref.startsWith('/') ? linkHref.substring(1) : linkHref;
      const normalizedCurrentPathname = currentPathname.startsWith('/') ? currentPathname.substring(1) : currentPathname;

      const linkPathWithoutHash = normalizedLinkHref.split('#')[0];
      const currentPathWithoutHash = normalizedCurrentPathname.split('#')[0];

      const isHomePage = (currentPathWithoutHash === '' || currentPathWithoutHash === 'index.html');
      const isHomeLink = (linkPathWithoutHash === '' || linkPathWithoutHash === 'index.html');

      if (isHomePage && isHomeLink) {
        link.closest('li').classList.add('active');
      } else if (!isHomePage && currentPathWithoutHash.includes(linkPathWithoutHash) && linkPathWithoutHash !== '') {
          link.closest('li').classList.add('active');
      } else {
          link.closest('li').classList.remove('active');
      }
    }
  });

  if (currentPathname === '/' || currentPathname.includes('/index.html')) {
    if (typeof window.fetchProcessorsAndRender === "function") {
      window.fetchProcessorsAndRender();
    }
  }
});