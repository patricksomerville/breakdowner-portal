// Story Analysis Platform JavaScript

class StoryAnalyzer {
    constructor() {
        this.stories = JSON.parse(localStorage.getItem('analyzedStories')) || [];
        this.initializeApp();
    }

    initializeApp() {
        // Initialize based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch(currentPage) {
            case 'upload.html':
                this.initializeUploadPage();
                break;
            case 'dashboard.html':
                this.initializeDashboard();
                break;
            default:
                this.initializeHomePage();
                break;
        }
    }

    initializeHomePage() {
        // Add any home page specific initialization
        console.log('Home page initialized');
    }

    initializeUploadPage() {
        const form = document.getElementById('storyUploadForm');
        const fileUpload = document.getElementById('fileUpload');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleStorySubmission(e));
        }
        
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Setup drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const dropZone = document.querySelector('.file-drop-zone');
        if (!dropZone) return;

        dropZone.addEventListener('click', () => {
            document.getElementById('fileUpload').click();
        });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('storyContent').value = content;
        };
        reader.readAsText(file);
    }

    async handleStorySubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const storyData = {
            title: formData.get('title'),
            author: formData.get('author'),
            genre: formData.get('genre'),
            content: formData.get('content'),
            uploadDate: new Date().toISOString(),
            id: Date.now().toString()
        };

        // Validate content length
        if (storyData.content.length < 100) {
            alert('Please provide at least 100 words for accurate analysis.');
            return;
        }

        this.showAnalysisProgress();
        
        try {
            const analysis = await this.analyzeStory(storyData.content);
            storyData.analysis = analysis;
            
            this.stories.push(storyData);
            this.saveStories();
            
            this.hideAnalysisProgress();
            alert('Story analyzed successfully! View results in the dashboard.');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Please try again.');
            this.hideAnalysisProgress();
        }
    }

    async analyzeStory(content) {
        // Simulate API call with mock analysis
        await this.sleep(2000); // Simulate processing time
        
        const words = content.split(' ').length;
        const sentences = content.split(/[.!?]+/).length;
        const paragraphs = content.split('\n\n').length;
        
        // Mock sentiment analysis
        const sentimentWords = {
            positive: ['happy', 'joy', 'love', 'wonderful', 'amazing', 'great', 'beautiful', 'fantastic'],
            negative: ['sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'disgusting']
        };
        
        const contentLower = content.toLowerCase();
        const positiveCount = sentimentWords.positive.reduce((count, word) => 
            count + (contentLower.match(new RegExp(word, 'g')) || []).length, 0);
        const negativeCount = sentimentWords.negative.reduce((count, word) => 
            count + (contentLower.match(new RegExp(word, 'g')) || []).length, 0);
        
        const sentimentScore = positiveCount - negativeCount;
        let sentiment = 'neutral';
        if (sentimentScore > 2) sentiment = 'positive';
        else if (sentimentScore < -2) sentiment = 'negative';
        
        // Mock character extraction
        const characters = this.extractCharacters(content);
        
        // Mock theme detection
        const themes = this.detectThemes(content);
        
        return {
            wordCount: words,
            sentenceCount: sentences,
            paragraphCount: paragraphs,
            sentiment: sentiment,
            sentimentScore: sentimentScore,
            characters: characters,
            themes: themes,
            readingTime: Math.ceil(words / 200), // Assume 200 WPM
            complexity: words > 1000 ? 'high' : words > 500 ? 'medium' : 'low'
        };
    }

    extractCharacters(content) {
        // Simple character extraction based on capitalized words mentioned multiple times
        const words = content.match(/\b[A-Z][a-z]+\b/g) || [];
        const wordCount = {};
        
        words.forEach(word => {
            if (word.length > 2 && !['The', 'And', 'But', 'For', 'His', 'Her', 'She', 'Him'].includes(word)) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
        
        return Object.entries(wordCount)
            .filter(([word, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, mentions]) => ({ name, mentions }));
    }

    detectThemes(content) {
        const themeKeywords = {
            'Love & Romance': ['love', 'heart', 'romance', 'kiss', 'marriage', 'relationship'],
            'Adventure': ['journey', 'quest', 'adventure', 'travel', 'explore', 'discover'],
            'Conflict': ['war', 'battle', 'fight', 'conflict', 'struggle', 'enemy'],
            'Family': ['family', 'mother', 'father', 'parent', 'child', 'sibling'],
            'Nature': ['tree', 'forest', 'mountain', 'ocean', 'sky', 'nature'],
            'Mystery': ['mystery', 'secret', 'hidden', 'unknown', 'investigate', 'clue']
        };
        
        const contentLower = content.toLowerCase();
        const detectedThemes = [];
        
        Object.entries(themeKeywords).forEach(([theme, keywords]) => {
            const matches = keywords.reduce((count, keyword) => 
                count + (contentLower.match(new RegExp(keyword, 'g')) || []).length, 0);
            
            if (matches > 0) {
                detectedThemes.push({ theme, strength: matches });
            }
        });
        
        return detectedThemes.sort((a, b) => b.strength - a.strength).slice(0, 3);
    }

    showAnalysisProgress() {
        const form = document.getElementById('storyUploadForm');
        const preview = document.getElementById('analysisPreview');
        const btn = document.getElementById('analyzeBtn');
        
        if (form) form.style.display = 'none';
        if (preview) preview.style.display = 'block';
        if (btn) {
            btn.disabled = true;
            btn.querySelector('.btn-text').textContent = 'Analyzing...';
            btn.querySelector('.loading-spinner').style.display = 'inline-block';
        }
    }

    hideAnalysisProgress() {
        const form = document.getElementById('storyUploadForm');
        const preview = document.getElementById('analysisPreview');
        const btn = document.getElementById('analyzeBtn');
        
        if (form) form.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (btn) {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Analyze Story';
            btn.querySelector('.loading-spinner').style.display = 'none';
        }
    }

    initializeDashboard() {
        if (this.stories.length === 0) {
            this.showEmptyState();
        } else {
            this.showDashboardContent();
            this.updateStats();
            this.renderRecentStories();
            this.createCharts();
        }
    }

    showEmptyState() {
        const noData = document.getElementById('noData');
        const dashboardGrid = document.getElementById('dashboardGrid');
        
        if (noData) noData.style.display = 'block';
        if (dashboardGrid) dashboardGrid.style.display = 'none';
    }

    showDashboardContent() {
        const noData = document.getElementById('noData');
        const dashboardGrid = document.getElementById('dashboardGrid');
        
        if (noData) noData.style.display = 'none';
        if (dashboardGrid) dashboardGrid.style.display = 'block';
    }

    updateStats() {
        const totalWords = this.stories.reduce((sum, story) => sum + story.analysis.wordCount, 0);
        const avgSentiment = this.stories.reduce((sum, story) => {
            const score = story.analysis.sentimentScore || 0;
            return sum + score;
        }, 0) / this.stories.length;
        const avgCharacters = this.stories.reduce((sum, story) => sum + story.analysis.characters.length, 0) / this.stories.length;

        document.getElementById('totalStories').textContent = this.stories.length;
        document.getElementById('totalWords').textContent = totalWords.toLocaleString();
        document.getElementById('avgSentiment').textContent = avgSentiment.toFixed(1);
        document.getElementById('avgCharacters').textContent = Math.round(avgCharacters);
    }

    renderRecentStories() {
        const container = document.getElementById('recentStories');
        if (!container) return;

        const recentStories = this.stories.slice(-5).reverse();
        
        container.innerHTML = recentStories.map((story, index) => `
            <div class="story-item" data-story-id="${story.id}" onclick="analyzer.showStoryDetails('${story.id}')">
                <div class="story-title">${story.title}</div>
                <div class="story-meta">by ${story.author} • ${story.analysis.wordCount} words • ${this.formatDate(story.uploadDate)}</div>
            </div>
        `).join('');
    }

    showStoryDetails(storyId) {
        const story = this.stories.find(s => s.id === storyId);
        if (!story) return;

        // Update active story
        document.querySelectorAll('.story-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-story-id="${storyId}"]`).classList.add('active');

        const container = document.getElementById('storyDetails');
        if (!container) return;

        container.innerHTML = `
            <div class="story-detail-header">
                <h4>${story.title}</h4>
                <p>by ${story.author} • ${story.genre} • ${this.formatDate(story.uploadDate)}</p>
            </div>
            
            <div class="analysis-summary">
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <strong>Word Count:</strong> ${story.analysis.wordCount}
                    </div>
                    <div class="analysis-item">
                        <strong>Sentences:</strong> ${story.analysis.sentenceCount}
                    </div>
                    <div class="analysis-item">
                        <strong>Reading Time:</strong> ${story.analysis.readingTime} minutes
                    </div>
                    <div class="analysis-item">
                        <strong>Sentiment:</strong> <span class="sentiment-${story.analysis.sentiment}">${story.analysis.sentiment}</span>
                    </div>
                    <div class="analysis-item">
                        <strong>Complexity:</strong> ${story.analysis.complexity}
                    </div>
                </div>
                
                <div class="characters-section">
                    <h5>Main Characters</h5>
                    <div class="characters-list">
                        ${story.analysis.characters.map(char => `
                            <span class="character-tag">${char.name} (${char.mentions} mentions)</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="themes-section">
                    <h5>Detected Themes</h5>
                    <div class="themes-list">
                        ${story.analysis.themes.map(theme => `
                            <span class="theme-tag">${theme.theme}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createCharts() {
        this.createSentimentChart();
        this.createGenreChart();
    }

    createSentimentChart() {
        const ctx = document.getElementById('sentimentChart');
        if (!ctx) return;

        const sentimentData = { positive: 0, neutral: 0, negative: 0 };
        this.stories.forEach(story => {
            sentimentData[story.analysis.sentiment]++;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                    backgroundColor: ['#10B981', '#6B7280', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createGenreChart() {
        const ctx = document.getElementById('genreChart');
        if (!ctx) return;

        const genreData = {};
        this.stories.forEach(story => {
            const genre = story.genre || 'Unknown';
            genreData[genre] = (genreData[genre] || 0) + 1;
        });

        const labels = Object.keys(genreData);
        const data = Object.values(genreData);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stories by Genre',
                    data: data,
                    backgroundColor: '#667eea',
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    saveStories() {
        localStorage.setItem('analyzedStories', JSON.stringify(this.stories));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for event handlers
function handleFileUpload(event) {
    if (window.analyzer) {
        window.analyzer.handleFileUpload(event);
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('fileUpload').files = files;
        handleFileUpload({ target: { files } });
    }
    
    event.target.classList.remove('dragover');
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('dragover');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyzer = new StoryAnalyzer();
});