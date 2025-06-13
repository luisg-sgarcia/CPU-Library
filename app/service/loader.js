async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Falha ao carregar " + path);
    el.innerHTML = await response.text();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header", "/app/components/header.html");
  await loadComponent("footer", "/app/components/footer.html");

  if (typeof renderTablePage === "function") {
    renderTablePage(1);
  }
});
