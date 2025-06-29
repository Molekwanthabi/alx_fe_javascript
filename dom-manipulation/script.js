let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categories = ["All", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(c =>
    `<option value="${c}">${c}</option>`
  ).join("");

  const savedFilter = localStorage.getItem("selectedCategory") || "All";
  categoryFilter.value = savedFilter;
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `
    "${randomQuote.text}"<br>
    <span class="quote-category">— ${randomQuote.category}</span>
  `;

  sessionStorage.setItem("lastQuote", quoteDisplay.textContent);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added!");
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
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

function syncWithServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(serverData => {
      const serverQuotes = serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));

      const combinedQuotes = [...quotes, ...serverQuotes.filter(sq =>
        !quotes.some(q => q.text === sq.text)
      )];

      if (combinedQuotes.length !== quotes.length) {
        quotes = combinedQuotes;
        saveQuotes();
        populateCategories();
        alert("Quotes synced from server!");
      }
    })
    .catch(err => console.error("Failed to sync with server.", err));
}

// Event listeners
newQuoteButton.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", filterQuotes);

// Initialize categories
populateCategories();

// Restore last shown quote
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  quoteDisplay.textContent = lastQuote;
}
function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(serverData => {
      return serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));
    });
}

function syncWithServer() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
      const combinedQuotes = [...quotes, ...serverQuotes.filter(sq =>
        !quotes.some(q => q.text === sq.text)
      )];

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

 
