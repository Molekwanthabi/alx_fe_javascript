// script.js

let quotes = [];
let categories = new Set(); // Use a Set to store unique categories

const quoteDisplay = document.getElementById('quoteDisplay');
const quoteTextElement = document.getElementById('quoteText');
const quoteCategoryElement = document.getElementById('quoteCategory');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
const exportQuotesButton = document.getElementById('exportQuotes');
const importFile = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const notificationElement = document.getElementById('notification'); // Get notification element

const SYNC_INTERVAL = 5000; // 5 seconds - Adjust as needed

// Function to show notifications
function showNotification(message) {
    notificationElement.textContent = message;
    notificationElement.style.display = 'block';

    // Hide notification after 3 seconds
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 3000);
}



// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Function to save the last selected category to local storage
function saveLastSelectedCategory(category) {
    localStorage.setItem('lastSelectedCategory', category);
}

// Function to load the last selected category from local storage
function loadLastSelectedCategory() {
    return localStorage.getItem('lastSelectedCategory') || 'all'; // Default to 'all' if nothing is stored
}


function showRandomQuote(filteredQuotes = quotes) {
    if (filteredQuotes.length === 0) {
        quoteTextElement.textContent = "No quotes available in this category.";
        quoteCategoryElement.textContent = "";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteTextElement.textContent = quote.text;
    quoteCategoryElement.textContent = `- ${quote.category}`;
}


function addQuote() {
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();

    if (text !== "" && category !== "") {
        quotes.push({ text: text, category: category });
        categories.add(category); // Add new category to the Set
        saveQuotes();
        populateCategories(); // Update the category filter dropdown
        newQuoteTextInput.value = "";
        newQuoteCategoryInput.value = "";
        filterQuotes(); // Apply the filter after adding the quote
        syncData(); // Sync data after adding a quote
    } else {
        alert("Please enter both quote and category.");
    }
}


function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            try {
                const importedQuotes = JSON.parse(event.target.result);
                if (Array.isArray(importedQuotes)) {
                    quotes.push(...importedQuotes);
                    importedQuotes.forEach(quote => categories.add(quote.category));  // Add new categories
                    saveQuotes();
                    populateCategories();
                    filterQuotes(); //Apply filter after import
                     syncData(); //Sync data after importing
                    alert('Quotes imported successfully!');

                } else {
                    alert("Invalid JSON format: Expected an array of quotes.");
                }
            } catch (error) {
                alert("Error parsing JSON file: " + error.message);
            }
        };
        fileReader.onerror = function() {
            alert("Error reading file.");
        }
        fileReader.readAsText(file);
    }
}

function populateCategories() {
    // Clear existing options except for the default "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }

    //Repopulate the `categories` set based on the quotes array
    categories.clear();
    quotes.forEach(quote => categories.add(quote.category));

    // Add categories to the dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}



function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    saveLastSelectedCategory(selectedCategory); // Save the selected category

    let filteredQuotes = [];

    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    showRandomQuote(filteredQuotes); // Show random quote from filtered list
}


newQuoteButton.addEventListener('click', function() {
    filterQuotes();
    showRandomQuote();
});
exportQuotesButton.addEventListener('click', exportToJsonFile);


// Function to simulate fetching data from server
function fetchServerData() {
    // In a real app, this would be an API call:
    // fetch('/api/quotes')
    //   .then(response => response.json())
    //   .then(serverQuotes => {
    //     return serverQuotes;
    //   });

    //Simulate server data.  In a real application, this server data would be unique
    const serverQuotesJSON = localStorage.getItem('serverQuotes');
    let serverQuotes = [];

    if (serverQuotesJSON) {
        serverQuotes = JSON.parse(serverQuotesJSON);
    } else {
        serverQuotes = [
            { text: "Server Quote 1", category: "Server" },
            { text: "Server Quote 2", category: "Server" }
        ];

        localStorage.setItem("serverQuotes", JSON.stringify(serverQuotes));
    }

    return serverQuotes;


}

// Function to simulate saving data to the server
function saveServerData(data) {
    // In a real app, this would be an API call:
    // fetch('/api/quotes', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });

     localStorage.setItem('serverQuotes', JSON.stringify(data));

}


// Function to sync data with the server
function syncData() {
    const serverQuotes = fetchServerData();

    // Conflict resolution: Server data takes precedence
    if (serverQuotes && serverQuotes.length > quotes.length) {
        quotes = serverQuotes; // Override local data with server data
        saveQuotes();
        populateCategories();
        filterQuotes();
        showNotification('Quotes updated from server.');
    } else {
         saveServerData(quotes); //Push the current quotes to the "server"

    }

}



// Load quotes from local storage on initialization
loadQuotes();
//Populate categories after loading quotes
populateCategories();

// Load last selected category and set the dropdown
const lastSelectedCategory = loadLastSelectedCategory();
categoryFilter.value = lastSelectedCategory;
// Initial quote display with the filtered category
filterQuotes();

// Set up periodic data syncing
setInterval(syncData, SYNC_INTERVAL);
      
       
                       
