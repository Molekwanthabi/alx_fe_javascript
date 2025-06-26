let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filteredQuotes = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastQuote", quoteDisplay.textContent);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Both fields are required.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(c =>
    `<option value="${c}">${c}</option>`
  ).join("");

  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", document.getElementById("categoryFilter").value);
  showRandomQuote();
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();

const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  document.getElementById("quoteDisplay").textContent = lastQuote;
}

function syncWithServer() {
  fetch("https://jsonplaceholder.typicode.com/posts") // Simulated API
    .then(response => response.json())
    .then(serverData => {
      // Simulate new quotes from server
      const serverQuotes = serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));

      // Merge without duplicates
      const combinedQuotes = [...quotes, ...serverQuotes.filter(sq =>
        !quotes.some(q => q.text === sq.text))];

      if (combinedQuotes.length !== quotes.length) {
        quotes = combinedQuotes;
        saveQuotes();
        populateCategories();
        alert("Quotes synced from server!");
      }
    })
    .catch(err => console.error("Failed to sync with server.", err));
}

// Periodic sync every 1 minute
setInterval(syncWithServer, 60000);
