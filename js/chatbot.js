class Chatbot {
    constructor() {
        this.API_KEY = 'AIzaSyCQZvCwI8OyJfuro7fyiM44i366yJu4vDQ';
        this.createChatInterface();
        this.conversationHistory = [];
    }

    createChatInterface() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-icon" id="chatIcon">
                <span>👨‍🎓</span>
            </div>
            <div class="chat-box" id="chatBox">
                <div class="chat-header">
                    <h3>Book-Keeper</h3>
                    <div class="header-actions">
                        <button id="clearChat" class="clear-chat" title="Clear conversation">🗑️</button>
                        <button class="close-chat" id="closeChat">×</button>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot">
                       <p> Hello! I'm your Book-Keeper,How can I assist you today?<p>
                    </div>
                </div>
                <div class="chat-input-wrapper">
                    <form class="chat-input-form" id="chatForm">
                        <input type="text" id="chatInput" placeholder="Ask me anything..." autocomplete="off">
                        <button type="submit" id="sendButton">
                            <span>Send</span>
                        </button>
                    </form>
                    <div class="typing-indicator" id="typingIndicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(chatContainer);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const chatIcon = document.getElementById('chatIcon');
        const chatBox = document.getElementById('chatBox');
        const closeChat = document.getElementById('closeChat');
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const clearChat = document.getElementById('clearChat');
        const typingIndicator = document.getElementById('typingIndicator');

        chatIcon.addEventListener('click', () => {
            chatBox.classList.toggle('show');
            chatIcon.classList.toggle('hidden');
            chatInput.focus();
        });

        closeChat.addEventListener('click', () => {
            chatBox.classList.remove('show');
            chatIcon.classList.remove('hidden');
        });

        clearChat.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the conversation?')) {
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.innerHTML = `
                    <div class="message bot">
                        <p>Conversation cleared. How can I help you?</p>
                    </div>
                `;
                this.conversationHistory = [];
            }
        });

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            
            if (message) {
                chatInput.disabled = true;
                sendButton.disabled = true;

                this.addMessage(message, 'user');
                chatInput.value = '';
                
                this.conversationHistory.push({
                    role: 'user',
                    content: message
                });

                typingIndicator.style.display = 'flex';

                try {
                    const response = await this.generateResponse(message);
                    
                    this.addMessage(response, 'bot');
                    this.conversationHistory.push({
                        role: 'assistant',
                        content: response
                    });
                } catch (error) {
                    console.error('Error:', error);
                    this.addMessage("I apologize, but I encountered an error. Please try again.", 'bot');
                }

                typingIndicator.style.display = 'none';
                chatInput.disabled = false;
                sendButton.disabled = false;
                chatInput.focus();
            }
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    async generateResponse(message) {
        const bookLogResponse = this.getBookLogResponse(message);
        if (bookLogResponse) {
            return bookLogResponse;
        }

        const prompt = {
            contents: [{
                parts: [{
                    text: `You are a helpful AI assistant. Previous conversation:\n${this.conversationHistory.map(msg => 
                        `${msg.role}: ${msg.content}`).join('\n')}\n\nUser: ${message}\n\nAssistant:`
                }]
            }]
        };

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prompt)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            console.error('Error:', error);
            return this.getFallbackResponse(message);
        }
    }

    isBookLogQuestion(message) {
        const bookLogKeywords = {
            add: ['add', 'create', 'new', 'insert'],
            edit: ['edit', 'update', 'modify', 'change'],
            delete: ['delete', 'remove', 'clear'],
            filter: ['filter', 'search', 'find', 'sort'],
            genre: ['genre', 'category', 'type'],
            rating: ['rating', 'rate', 'star', 'score'],
            general: ['book', 'author', 'title', 'how to', 'help']
        };

        const msg = message.toLowerCase();
        return Object.values(bookLogKeywords).some(categoryKeywords =>
            categoryKeywords.some(keyword => msg.includes(keyword))
        );
    }

    getBookLogResponse(message) {
        if (!this.isBookLogQuestion(message)) {
            return null;
        }

        const msg = message.toLowerCase();
        const responses = [
            {
                triggers: ['add', 'create', 'new', 'insert'],
                response: `To add a new book:
1. Look for the form at the top of the page
2. Fill in the book's title
3. Enter the author's name
4. Select a genre from the dropdown
5. Choose a rating (1-5 stars)
6. Click the 'Add Book' button to save`
            },
            {
                triggers: ['edit', 'update', 'modify', 'change'],
                response: `To edit an existing book:
1. Find the book you want to edit in the list
2. Click the pencil icon (✎) on the book's card
3. The book's details will appear in the form above
4. Make your changes
5. Click 'Update Book' to save the changes`
            },
            {
                triggers: ['delete', 'remove', 'clear'],
                response: `To delete a book:
1. Locate the book you want to remove
2. Click the × icon on the book's card
3. Confirm the deletion when prompted
Note: This action cannot be undone!`
            },
            {
                triggers: ['filter', 'search', 'find', 'sort'],
                response: `To filter or find books:
1. Look for the dropdown menu above the book list
2. Click to see all available genres
3. Select a genre to filter the books
4. Choose 'All Genres' to see everything again`
            },
            {
                triggers: ['genre', 'category', 'type'],
                response: `BookLog supports various genres including:
• Fiction
• Non-Fiction
• Mystery
• Science Fiction
• Fantasy
• Romance
• Other
Use the filter dropdown to view books by genre.`
            },
            {
                triggers: ['rating', 'rate', 'star', 'score'],
                response: `The rating system works like this:
• Books can be rated from 1 to 5 stars
• Click on the stars to select your rating
• ★★★★★ = Excellent
• ★★★★☆ = Very Good
• ★★★☆☆ = Good
• ★★☆☆☆ = Fair
• ★☆☆☆☆ = Poor`
            }
        ];

        for (const category of responses) {
            if (category.triggers.some(trigger => msg.includes(trigger))) {
                return category.response;
            }
        }

        return `I can help you with the following BookLog features:
• Adding new books
• Editing existing books
• Deleting books
• Filtering by genre
• Rating books (1-5 stars)

What would you like to know more about?`;
    }

    getFallbackResponse(message) {
        return `I'm currently having trouble connecting to my knowledge base. 
        
I can help you with:
• Adding, editing, or deleting books
• Filtering books by genre
• Using the rating system
• Managing your book collection

Or you can try rephrasing your question.`;
    }

    addMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const linkedMessage = message.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        messageDiv.innerHTML = linkedMessage;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}