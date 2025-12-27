
// LinkUp Social Media Platform - JavaScript
class LinkUpApp {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.posts = [];
        this.currentUser = {
            id: 1,
            name: 'Arjun Sharma',
            username: '@arjunsharma',
            avatar: 'https://source.unsplash.com/300x300/?india,cricketer,portrait&sig=241',
            following: 1200,
            followers: 5800,
            posts: 234
        };
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadSampleData();
        this.renderPosts();
        this.updateUserProfile();
        this.setupImageFallbacks();
        this.setup3DEnvironment();
        this.enableTiltEffects();
    }

    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Navigation
        document.getElementById('homeBtn').addEventListener('click', () => this.setActiveNav('home'));
        document.getElementById('exploreBtn').addEventListener('click', () => this.setActiveNav('explore'));
        document.getElementById('notificationsBtn').addEventListener('click', () => this.setActiveNav('notifications'));
        document.getElementById('messagesBtn').addEventListener('click', () => this.setActiveNav('messages'));
        document.getElementById('profileBtn').addEventListener('click', () => this.setActiveNav('profile'));

        // Post creation
        document.getElementById('publishBtn').addEventListener('click', () => this.createPost());
        document.getElementById('addImageBtn').addEventListener('click', () => this.addImageToPost());
        document.getElementById('addEmojiBtn').addEventListener('click', () => this.addEmojiToPost());
        document.getElementById('addLocationBtn').addEventListener('click', () => this.addLocationToPost());

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') this.closeModal();
        });

        // Follow buttons
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFollow(e.target));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setActiveNav(navItem) {
        // Toggle active state on nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(navItem + 'Btn');
        if (activeBtn) activeBtn.classList.add('active');

        // Map nav item to view id
        const viewMap = {
            home: 'homeView',
            explore: 'exploreView',
            notifications: 'notificationsView',
            messages: 'messagesView',
            profile: 'profileView'
        };

        // Hide all views, then show selected
        document.querySelectorAll('.view-section').forEach(section => {
            section.style.display = 'none';
        });
        const targetId = viewMap[navItem];
        const target = document.getElementById(targetId);
        if (target) target.style.display = '';

        // Optional: when returning Home, render posts
        if (navItem === 'home') {
            this.renderPosts();
        }
        // Re-bind 3D after view change
        this.setup3DEnvironment();
        this.enableTiltEffects();
        // Scroll to top for a better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Post Management
    createPost() {
        const postText = document.getElementById('postText').value.trim();
        if (!postText) return;

        const newPost = {
            id: Date.now(),
            user: this.currentUser,
            content: postText,
            image: null,
            timestamp: new Date(),
            likes: 0,
            retweets: 0,
            comments: 0,
            liked: false,
            retweeted: false
        };

        this.posts.unshift(newPost);
        this.renderPosts();
        document.getElementById('postText').value = '';
        
        // Show success animation
        this.showNotification('Post published successfully!', 'success');
    }

    addImageToPost() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // In a real app, you'd upload to a server
                    this.showNotification('Image added to post!', 'info');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    addEmojiToPost() {
        const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🚀', '💡'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const textarea = document.getElementById('postText');
        textarea.value += randomEmoji;
        textarea.focus();
    }

    addLocationToPost() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.showNotification('Location added to post!', 'info');
            });
        } else {
            this.showNotification('Location services not available', 'warning');
        }
    }

    // Post Interactions
    handlePostAction(action, postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        switch (action) {
            case 'like':
                post.liked = !post.liked;
                post.likes += post.liked ? 1 : -1;
                break;
            case 'retweet':
                post.retweeted = !post.retweeted;
                post.retweets += post.retweeted ? 1 : -1;
                break;
            case 'comment':
                post.comments += 1;
                this.showNotification('Comment added!', 'info');
                break;
            case 'share':
                this.sharePost(post);
                break;
        }
        this.renderPosts();
    }

    sharePost(post) {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post on LinkUp',
                text: post.content,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`${post.content} - Shared from LinkUp`);
            this.showNotification('Post link copied to clipboard!', 'success');
        }
    }

    // Follow System
    handleFollow(button) {
        const isFollowing = button.textContent === 'Following';
        button.textContent = isFollowing ? 'Follow' : 'Following';
        button.style.backgroundColor = isFollowing ? 'var(--accent-color)' : 'var(--success-color)';
        
        this.showNotification(
            isFollowing ? 'Unfollowed user' : 'Now following user', 
            'info'
        );
    }

    // Search Functionality
    handleSearch(query) {
        if (query.length < 2) return;
        
        const filteredPosts = this.posts.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.user.name.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderPosts(filteredPosts);
    }

    // Modal Management
    openModal(imageSrc) {
        document.getElementById('modalImage').src = imageSrc;
        document.getElementById('imageModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('imageModal').style.display = 'none';
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;
                case 'n':
                    e.preventDefault();
                    document.getElementById('postText').focus();
                    break;
            }
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Sample Data
    loadSampleData() {
        this.posts = [
            {
                id: 1,
                user: {
                    name: 'Priya Patel',
                    username: '@priyapatel',
                    avatar: 'https://source.unsplash.com/300x300/?indian,cricketer,portrait&sig=242'
                },
                content: 'Just finished building an amazing React component! The new hooks API is incredible. 🚀 #ReactJS #WebDev #TechIndia',
                image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=300&fit=crop',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 42,
                retweets: 8,
                comments: 12,
                liked: false,
                retweeted: false
            },
            {
                id: 2,
                user: {
                    name: 'Rajesh Kumar',
                    username: '@rajeshkumar',
                    avatar: 'https://source.unsplash.com/300x300/?india,cricket,player&sig=243'
                },
                content: 'Beautiful sunset from my office window in Bangalore today. Sometimes you need to step back and appreciate the simple things. 🌅 #Bangalore #Sunset',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                likes: 28,
                retweets: 5,
                comments: 7,
                liked: true,
                retweeted: false
            },
            {
                id: 3,
                user: {
                    name: 'Kavya Singh',
                    username: '@kavyasingh',
                    avatar: 'https://source.unsplash.com/300x300/?india,cricket,portrait&sig=244'
                },
                content: 'Chai and code - the perfect combination for a productive morning! ☕️ What\'s your favorite coding beverage? #Chai #Coding #India',
                image: null,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                likes: 35,
                retweets: 12,
                comments: 18,
                liked: false,
                retweeted: true
            },
            {
                id: 4,
                user: {
                    name: 'Vikram Singh',
                    username: '@vikramsingh',
                    avatar: 'https://source.unsplash.com/300x300/?cricket,india,batsman&sig=245'
                },
                content: 'Just launched my fintech startup! 🎉 After months of hard work, we\'re finally live. Thank you to everyone who supported us along the way! #StartupIndia #Fintech',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=300&fit=crop',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                likes: 89,
                retweets: 23,
                comments: 31,
                liked: false,
                retweeted: false
            },
            {
                id: 5,
                user: {
                    name: 'Deepika Sharma',
                    username: '@deepikasharma',
                    avatar: 'https://source.unsplash.com/300x300/?indian,cricket,team&sig=246'
                },
                content: 'Weekend vibes in Goa! 🏖️ Sometimes you need to disconnect to reconnect. How do you like to spend your weekends? #Goa #Weekend #Relax',
                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
                likes: 67,
                retweets: 15,
                comments: 24,
                liked: true,
                retweeted: false
            }
        ];
    }

    // Rendering
    renderPosts(postsToRender = this.posts) {
        const feed = document.getElementById('postsFeed');
        feed.innerHTML = '';

        if (postsToRender.length === 0) {
            feed.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No posts found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        postsToRender.forEach(post => {
            const postElement = this.createPostElement(post);
            feed.appendChild(postElement);
        });

        // Ensure images in freshly rendered posts have fallbacks
        this.setupImageFallbacks();
        // Re-bind 3D on new cards
        this.enableTiltEffects();
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.user.name}</h4>
                    <p>${post.user.username}</p>
                </div>
                <span class="post-time">${this.formatTime(post.timestamp)}</span>
            </div>
            <div class="post-content">
                <p class="post-text">${this.formatPostContent(post.content)}</p>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" onclick="app.openModal('${post.image}')">` : ''}
            </div>
            <div class="post-actions-bar">
                <button class="post-action ${post.liked ? 'liked' : ''}" onclick="app.handlePostAction('like', ${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes}</span>
                </button>
                <button class="post-action ${post.retweeted ? 'retweeted' : ''}" onclick="app.handlePostAction('retweet', ${post.id})">
                    <i class="fas fa-retweet"></i>
                    <span>${post.retweets}</span>
                </button>
                <button class="post-action" onclick="app.handlePostAction('comment', ${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments}</span>
                </button>
                <button class="post-action" onclick="app.handlePostAction('share', ${post.id})">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        `;
        return postDiv;
    }

    // Attach global image fallbacks so broken external URLs get replaced
    setupImageFallbacks() {
        const fallbackFor = (img) => {
            if (img.dataset.fallbackApplied === 'true') return;
            img.addEventListener('error', () => {
                if (img.dataset.fallbackApplied === 'true') return;
                img.dataset.fallbackApplied = 'true';
                const size = Math.max(img.naturalWidth || 0, img.clientWidth || 0, 100);
                const rounded = size <= 60 ? 60 : size <= 100 ? 100 : 150;
                img.src = `https://i.pravatar.cc/${rounded}?u=cricket-${Math.floor(Math.random()*100000)}`;
            }, { passive: true });
        };

        document.querySelectorAll('img').forEach(fallbackFor);
    }

    // Lightweight 3D tilt effect for cards and buttons
    enableTiltEffects() {
        const tiltSelector = [
            '.post-card', '.create-post', '.suggestion-item', '.news-item',
            '.featured-user', '.popular-post', '.event-item', '.nav-btn'
        ].join(',');

        const elements = document.querySelectorAll(tiltSelector);
        const maxTiltDeg = 10;
        const inertia = 0.12; // lower = snappier, higher = smoother

        elements.forEach(el => {
            let targetRX = 0, targetRY = 0;
            let currentRX = 0, currentRY = 0;
            let rafId = null;

            const animate = () => {
                currentRX += (targetRX - currentRX) * inertia;
                currentRY += (targetRY - currentRY) * inertia;
                el.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(10px)`;
                if (Math.abs(currentRX - targetRX) > 0.01 || Math.abs(currentRY - targetRY) > 0.01) {
                    rafId = requestAnimationFrame(animate);
                } else {
                    rafId = null;
                }
            };

            const applyTilt = (e) => {
                const rect = el.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const relY = (e.clientY - rect.top) / rect.height;
                targetRX = (0.5 - relY) * maxTiltDeg;
                targetRY = (relX - 0.5) * maxTiltDeg;
                if (!rafId) rafId = requestAnimationFrame(animate);
            };

            const resetTilt = () => {
                targetRX = 0;
                targetRY = 0;
                if (!rafId) rafId = requestAnimationFrame(animate);
            };

            el.onmousemove = null;
            el.onmouseleave = null;
            el.onmouseenter = null;

            el.addEventListener('mousemove', applyTilt);
            el.addEventListener('mouseleave', resetTilt);
            el.addEventListener('mouseenter', applyTilt);
        });
    }

    // Scene-wide perspective powered by JS only
    setup3DEnvironment() {
        const main = document.querySelector('.main-content');
        if (!main) return;
        main.style.perspective = '1200px';
        main.style.perspectiveOrigin = '50% 20%';
        document.querySelectorAll('.post-card, .create-post, .sidebar, .right-sidebar, .suggestion-item, .news-item, .featured-user, .popular-post, .event-item, .nav-btn')
            .forEach(el => {
                el.style.transformStyle = 'preserve-3d';
                el.style.willChange = 'transform';
            });
        // Modal pop managed in open/close
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'translateZ(0) scale(0.98)';
            modalContent.style.transition = 'transform 250ms ease';
        }
    }

    formatPostContent(content) {
        // Convert hashtags and mentions to clickable links
        return content
            .replace(/#(\w+)/g, '<span style="color: var(--accent-color);">#$1</span>')
            .replace(/@(\w+)/g, '<span style="color: var(--accent-color);">@$1</span>');
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return timestamp.toLocaleDateString();
    }

    updateUserProfile() {
        // Update profile stats in sidebar
        const stats = document.querySelectorAll('.stat-number');
        if (stats.length >= 3) {
            stats[0].textContent = this.formatNumber(this.currentUser.following);
            stats[1].textContent = this.formatNumber(this.currentUser.followers);
            stats[2].textContent = this.formatNumber(this.currentUser.posts);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LinkUpApp();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        border-left: 4px solid var(--accent-color);
    }
    
    .notification-success {
        border-left-color: var(--success-color);
    }
    
    .notification-warning {
        border-left-color: var(--warning-color);
    }
    
    .notification-danger {
        border-left-color: var(--danger-color);
    }
`;
document.head.appendChild(style);
