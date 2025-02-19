document.querySelector(".fa-xmark").style.display = "none";
function toggleNav() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
  const hamburger = document.querySelector(".hamburger");
  const barsIcon = hamburger.querySelector(".fa-bars");
  const xmarkIcon = hamburger.querySelector(".fa-xmark");

  if (navLinks.classList.contains("active")) {
    barsIcon.style.display = "none";
    xmarkIcon.style.display = "block";
  } else {
    barsIcon.style.display = "block";
    xmarkIcon.style.display = "none";
  }
}


// search bar

async function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const response = await fetch(`/search?q=${query}`);
  const products = await response.json();

  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  if (products.length === 0) {
    resultsContainer.innerHTML = "<li>No results found</li>";
    return;
  }

  products.forEach((product) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a href="/products">${product.name}</a>`;
    resultsContainer.appendChild(listItem);
  });
}

document.getElementById("searchInput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});
