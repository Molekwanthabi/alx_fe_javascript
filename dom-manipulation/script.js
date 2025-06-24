/ Initialize quotes and categories arrays
        let quotes = [];
        let categories = new Set(); // Using a Set to store unique categories

        const QUOTES_API_URL = 'https://jsonplaceholder.typicode.com/todos'; // Using Todos for simulation

        // Function to display a notification
        function showNotification(message, duration = 3000) {
            const notification = document.getElementById('notification');
            notification.innerText = message;
            notification.style.display = 'block'; // Show the notification
            setTimeout(() => {
                notification.style.display = 'none'; // Hide the notification after the duration
            }, duration);
        }

        // Function to load quotes and last selected category from local storage
        function loadData() {
            const storedQuotes = localStorage.getItem('quotes');
            if (storedQuotes) {
                quotes = JSON.parse(storedQuotes);
            }

            const storedCategory = localStorage.getItem('lastCategory');
            if (storedCategory) {
                document.getElementById('categoryFilter').value = storedCategory;
            }
            populateCategories();
            filterQuotes();
        }

        // Function to save quotes to local storage
        function saveQuotes() {
            localStorage.setItem('quotes', JSON.stringify(quotes));
            populateCategories();
        }


        // Function to fetch quotes from the server
        async function fetchQuotesFromServer() {
            try {
                const response = await fetch(QUOTES_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const serverQuotes = await response.json();

                //For the sake of simulation, use the existing IDs.  In production make sure the ID does not already exist,
                //then make sure to add to the quotes array.
                const serverQuotesForSimulation = serverQuotes.map(q => ({
                    text: q.title, // Map title to text to match our quote object
                    category: q.completed ? "Completed" : "Incomplete" // Map boolean completed property to a 'category' to work with existing code
                }));
                return serverQuotesForSimulation;

            } catch (error) {
                console.error('Failed to fetch quotes from server:', error);
                showNotification('Failed to sync with server.', 5000); // Longer duration
                return null;
            }
        }

        // Function to sync quotes with the server (server data takes precedence)
        async function syncQuotes() {
            const serverQuotes = await fetchQuotesFromServer();
            if (serverQuotes) {
                // Simple conflict resolution: Server's data takes precedence
                quotes = serverQuotes;
                saveQuotes(); // Save to local storage
                filterQuotes();
                showNotification('Quotes synced from server.');
            }
        }


        // Function to populate the category dropdown dynamically
        function populateCategories() {
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset options
            categories.clear();

            quotes.forEach(quote => {
                categories.add(quote.category);
            });

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }

        // Function to filter quotes based on the selected category
        function filterQuotes() {
            const selectedCategory = document.getElementById('categoryFilter').value;
            localStorage.setItem('lastCategory', selectedCategory);

            let filteredQuotes = [];
            if (selectedCategory === 'all') {
                filteredQuotes = quotes;
            } else {
                filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
            }

            const quoteDisplay = document.getElementById("quoteDisplay");
            if(filteredQuotes.length === 0){
                quoteDisplay.innerText = "No quotes available for this category. Add some!";
                return;
            }

            let quoteText = '';
            let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            quoteText = filteredQuotes[randomIndex].text + " - " + filteredQuotes[randomIndex].category;

            quoteDisplay.innerText = quoteText;
        }

        // Function to add a new quote to the quotes array
        function addQuote() {
            const newQuoteText = document.getElementById("newQuoteText").value;
            const newQuoteCategory = document.getElementById("newQuoteCategory").value;

            if (newQuoteText && newQuoteCategory) {
                quotes.push({ text: newQuoteText, category: newQuoteCategory });
                saveQuotes();
                document.getElementById("newQuoteText").value = "";
                document.getElementById("newQuoteCategory").value = "";
                filterQuotes(); // Refresh quotes after adding
            } else {
                alert("Please enter both quote text and category.");
            }
        }

        // Function to export quotes to a JSON file
        function exportQuotesToJson() {
            const jsonString = JSON.stringify(quotes, null, 2);
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

         // Function to import quotes from a JSON file
        function importQuotesFromJson(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedQuotes = JSON.parse(e.target.result);
                        if (Array.isArray(importedQuotes)) {
                            quotes = [...quotes, ...importedQuotes];
                            saveQuotes();
                            filterQuotes();
                            alert('Quotes imported successfully!');
                        } else {
                            alert('Invalid JSON file: Must contain an array of quotes.');
                        }
                    } catch (error) {
                        alert('Error parsing JSON file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        }

        // Load data and populate categories on page load
        loadData();

        // Set up periodic syncing (every 30 seconds)
        setInterval(syncQuotes, 30000);

         // Attach event listeners
        document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
        document.getElementById("exportQuotesBtn").addEventListener("click", exportQuotesToJson);
        document.getElementById("importFile").addEventListener("change", importQuotesFromJson);
        document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
        document.getElementById("syncQuotesBtn").addEventListener("click", syncQuotes);