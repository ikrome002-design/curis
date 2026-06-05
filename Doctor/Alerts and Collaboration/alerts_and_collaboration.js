/**
 * ========================================
 * CURIS ALERTS & COLLABORATION - JAVASCRIPT
 * Complete Functionality Implementation
 * ========================================
 */

// Global State Management
const AppState = {
    notifications: [],
    comments: [],
    discussions: [],
    currentUser: {
        id: 'dr-001',
        name: 'Dr. Sarah Wanjiru',
        role: 'Internal Medicine',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-48.png'
    },
    unreadCount: 12,
    activeTab: 'comments',
    darkMode: false,
    filters: {
        notifications: 'all',
        discussions: 'active'
    },
    wsConnection: null,
    notificationQueue: []
};

// ========================================
// 1. INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    initializeEventListeners();
    initializeDarkMode();
    initializeWebSocket();
    loadInitialData();
    startRealTimeUpdates();
});

function initializeApp() {
    console.log('Curis Alerts & Collaboration System Initialized');

    // Set initial states
    updateUnreadBadge();
    loadUserPreferences();
    initializeTabSystem();
    initializeNotificationSystem();
}

// ========================================
// 2. EVENT LISTENERS
// ========================================
function initializeEventListeners() {
    // User Profile Dropdown
    const userProfile = document.getElementById('userProfile');
    const profileDropdown = document.getElementById('profileDropdown');

    if (userProfile) {
        userProfile.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!userProfile?.contains(e.target) && !profileDropdown?.contains(e.target)) {
            userProfile?.classList.remove('active');
        }
    });

    // Quick Action Buttons
    document.getElementById('newDiscussionBtn')?.addEventListener('click', openNewDiscussionModal);
    document.getElementById('appointmentNotesBtn')?.addEventListener('click', openAppointmentNotesModal);
    document.getElementById('doctorDiscussionsBtn')?.addEventListener('click', () => switchToTab('discussions'));

    // Notification Controls
    document.getElementById('notificationFilter')?.addEventListener('change', handleNotificationFilter);
    document.getElementById('markAllReadBtn')?.addEventListener('click', markAllNotificationsRead);
    document.getElementById('preferencesBtn')?.addEventListener('click', openPreferencesModal);

    // Tab System
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            switchToTab(tabName);
        });
    });

    // Comment System
    document.getElementById('addCommentBtn')?.addEventListener('click', openCommentModal);
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', handleReplyClick);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditComment);
    });

    // Appointment Notes
    document.querySelectorAll('.save-note-btn').forEach(btn => {
        btn.addEventListener('click', saveAppointmentNote);
    });

    // Discussion Threads
    document.getElementById('createThreadBtn')?.addEventListener('click', openCreateThreadModal);
    document.querySelectorAll('.view-thread-btn').forEach(btn => {
        btn.addEventListener('click', viewDiscussionThread);
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', filterDiscussions);
    });

    // Notification Item Actions
    document.querySelectorAll('.mark-read').forEach(btn => {
        btn.addEventListener('click', markNotificationRead);
    });
    document.querySelectorAll('.view-lab-btn').forEach(btn => {
        btn.addEventListener('click', openLabViewer);
    });

    // Quick Actions
    document.querySelectorAll('.view-lab-results').forEach(btn => {
        btn.addEventListener('click', openLabViewer);
    });
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);

    // Modal Controls
    setupModalControls();

    // Dark Mode Toggle
    document.getElementById('darkModeBtn')?.addEventListener('click', toggleDarkMode);
}

// ========================================
// 3. TAB SYSTEM
// ========================================
function initializeTabSystem() {
    const savedTab = localStorage.getItem('curis_active_tab') || 'comments';
    switchToTab(savedTab);
}

function switchToTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Save state
    AppState.activeTab = tabName;
    localStorage.setItem('curis_active_tab', tabName);

    // Load tab-specific data if needed
    loadTabData(tabName);
}

function loadTabData(tabName) {
    switch (tabName) {
        case 'comments':
            loadComments();
            break;
        case 'appointments':
            loadAppointmentNotes();
            break;
        case 'discussions':
            loadDiscussionThreads();
            break;
        case 'audit':
            loadAuditTrail();
            break;
    }
}

// ========================================
// 4. NOTIFICATION SYSTEM
// ========================================
function initializeNotificationSystem() {
    loadNotifications();
    setupNotificationObserver();
}

function loadNotifications() {
    // Simulate loading notifications
    const notifications = [
        {
            id: 'notif-1',
            type: 'assignment',
            title: 'New Appointment Assignment',
            text: 'James Mwangi has been assigned to you by Receptionist Jane Njoki',
            time: '10:30 AM Today',
            assignedBy: 'Jane Njoki',
            unread: true,
            urgent: true
        },
        {
            id: 'notif-2',
            type: 'consultation',
            title: 'Consultation Starting in 15 Minutes',
            text: 'Video consultation with Mary Wambui - Initial Consultation',
            time: '11:15 AM',
            unread: true,
            urgent: true,
            countdown: 15
        },
        {
            id: 'notif-3',
            type: 'lab-results',
            title: 'Lab Results Available',
            text: 'Blood work results for Peter Ochieng have been uploaded',
            time: '2 hours ago',
            documentType: 'CBC, Lipid Panel',
            unread: true
        }
    ];

    AppState.notifications = notifications;
    renderNotifications();
}

function renderNotifications() {
    const feed = document.getElementById('notificationsFeed');
    if (!feed) return;

    const filtered = filterNotifications(AppState.notifications);

    if (filtered.length === 0) {
        feed.innerHTML = '<div class="empty-state">No notifications to display</div>';
        return;
    }

    // Keep existing structure but update data attributes
    feed.querySelectorAll('.notification-item').forEach((item, index) => {
        if (filtered[index]) {
            item.dataset.id = filtered[index].id;
            item.dataset.type = filtered[index].type;
        }
    });
}

function filterNotifications(notifications) {
    const filter = AppState.filters.notifications;

    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => n.unread);

    return notifications.filter(n => n.type === filter);
}

function handleNotificationFilter(e) {
    AppState.filters.notifications = e.target.value;
    renderNotifications();
}

function markNotificationRead(e) {
    e.stopPropagation();
    const notifItem = e.target.closest('.notification-item');
    if (notifItem) {
        notifItem.classList.remove('unread');
        notifItem.classList.remove('time-sensitive');
        updateUnreadCount(-1);

        // Remove mark as read button
        e.target.remove();
    }
}

function markAllNotificationsRead() {
    const confirmModal = confirm('Mark all notifications as read?');
    if (confirmModal) {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
            item.classList.remove('time-sensitive');
        });

        AppState.unreadCount = 0;
        updateUnreadBadge();

        // Remove all mark as read buttons
        document.querySelectorAll('.mark-read').forEach(btn => btn.remove());

        showToast('All notifications marked as read', 'success');
    }
}

function updateUnreadCount(change) {
    AppState.unreadCount = Math.max(0, AppState.unreadCount + change);
    updateUnreadBadge();
}

function updateUnreadBadge() {
    const badge = document.querySelector('.unread-badge');
    if (badge) {
        badge.textContent = AppState.unreadCount;
        badge.style.display = AppState.unreadCount > 0 ? 'inline-block' : 'none';
    }
}

// ========================================
// 5. COMMENT SYSTEM
// ========================================
function loadComments() {
    // Comments are already in HTML, but we can enhance them
    enhanceCommentInteractions();
}

function enhanceCommentInteractions() {
    // Add hover effects and interactions
    document.querySelectorAll('.comment-item').forEach(comment => {
        comment.addEventListener('mouseenter', function () {
            this.style.transform = 'translateX(2px)';
        });
        comment.addEventListener('mouseleave', function () {
            this.style.transform = 'translateX(0)';
        });
    });
}

function handleReplyClick(e) {
    const commentItem = e.target.closest('.comment-item');
    const replyEditor = createReplyEditor();

    // Insert reply editor after comment actions
    const actions = commentItem.querySelector('.comment-actions');
    actions.insertAdjacentElement('afterend', replyEditor);
}

function createReplyEditor() {
    const editor = document.createElement('div');
    editor.className = 'reply-editor';
    editor.innerHTML = `
        <textarea class="reply-input" placeholder="Write your reply..."></textarea>
        <div class="reply-actions">
            <button class="btn btn-secondary cancel-reply">Cancel</button>
            <button class="btn btn-primary post-reply">Post Reply</button>
        </div>
    `;

    // Add event listeners
    editor.querySelector('.cancel-reply').addEventListener('click', function () {
        editor.remove();
    });

    editor.querySelector('.post-reply').addEventListener('click', function () {
        const text = editor.querySelector('.reply-input').value;
        if (text.trim()) {
            postReply(text, editor);
        }
    });

    return editor;
}

function postReply(text, editorElement) {
    const commentItem = editorElement.closest('.comment-item');
    const repliesContainer = commentItem.querySelector('.comment-replies') || createRepliesContainer(commentItem);

    const reply = createReplyElement(text);
    repliesContainer.appendChild(reply);

    editorElement.remove();
    showToast('Reply posted successfully', 'success');
}

function createRepliesContainer(commentItem) {
    const container = document.createElement('div');
    container.className = 'comment-replies';
    commentItem.appendChild(container);
    return container;
}

function createReplyElement(text) {
    const reply = document.createElement('div');
    reply.className = 'comment-item reply';
    reply.innerHTML = `
        <div class="comment-author">
            <img src="${AppState.currentUser.avatar}" alt="${AppState.currentUser.name}" class="author-avatar">
            <div class="author-info">
                <span class="author-name">${AppState.currentUser.name}</span>
                <span class="author-role">${AppState.currentUser.role}</span>
            </div>
            <span class="comment-time">Just now</span>
        </div>
        <div class="comment-content">
            <p>${escapeHtml(text)}</p>
        </div>
    `;
    return reply;
}

function handleEditComment(e) {
    const commentItem = e.target.closest('.comment-item');
    const contentDiv = commentItem.querySelector('.comment-content p');
    const originalText = contentDiv.textContent;

    const editor = document.createElement('textarea');
    editor.className = 'edit-comment-input';
    editor.value = originalText;

    contentDiv.replaceWith(editor);

    // Add save/cancel buttons
    const actions = document.createElement('div');
    actions.className = 'edit-actions';
    actions.innerHTML = `
        <button class="btn btn-secondary cancel-edit">Cancel</button>
        <button class="btn btn-primary save-edit">Save</button>
    `;

    editor.insertAdjacentElement('afterend', actions);

    actions.querySelector('.cancel-edit').addEventListener('click', function () {
        const p = document.createElement('p');
        p.textContent = originalText;
        editor.replaceWith(p);
        actions.remove();
    });

    actions.querySelector('.save-edit').addEventListener('click', function () {
        const p = document.createElement('p');
        p.innerHTML = escapeHtml(editor.value);
        editor.replaceWith(p);
        actions.remove();
        showToast('Comment updated', 'success');
    });
}

// ========================================
// 6. APPOINTMENT NOTES
// ========================================
function loadAppointmentNotes() {
    // Appointment notes are in HTML, enhance interactions
    document.querySelectorAll('.live-note-input').forEach(input => {
        input.addEventListener('input', function () {
            // Auto-save draft after delay
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                saveDraft('appointment-note', this.value);
            }, 1000);
        });
    });
}

function saveAppointmentNote(e) {
    const noteItem = e.target.closest('.appointment-note-item');
    const noteInput = noteItem.querySelector('.live-note-input');

    if (!noteInput || !noteInput.value.trim()) {
        showToast('Please enter a note', 'warning');
        return;
    }

    const noteData = {
        patient: noteItem.querySelector('.appointment-patient').textContent.trim(),
        time: noteItem.querySelector('.appointment-time').textContent.trim(),
        type: 'during',
        content: noteInput.value,
        timestamp: new Date().toISOString()
    };

    // Simulate saving
    setTimeout(() => {
        noteInput.value = '';
        showToast('Note saved successfully', 'success');

        // Add note to display
        const noteSection = noteItem.querySelector('.note-section');
        const savedNote = document.createElement('div');
        savedNote.className = 'saved-note';
        savedNote.innerHTML = `
            <p class="note-content">${escapeHtml(noteData.content)}</p>
            <span class="note-author">Added by ${AppState.currentUser.name} - Just now</span>
        `;
        noteSection.appendChild(savedNote);
    }, 500);
}

// ========================================
// 7. DISCUSSION THREADS
// ========================================
function loadDiscussionThreads() {
    // Load and enhance discussion threads
    enhanceThreadInteractions();
}

function enhanceThreadInteractions() {
    document.querySelectorAll('.thread-item').forEach(thread => {
        thread.addEventListener('click', function (e) {
            if (!e.target.closest('button')) {
                viewDiscussionThread.call(this, e);
            }
        });
    });
}

function filterDiscussions(e) {
    const filterBtn = e.target.closest('.filter-btn');
    if (!filterBtn) return;

    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');

    const filter = filterBtn.textContent.trim().toLowerCase();
    AppState.filters.discussions = filter;

    // Filter threads (in real app, would filter from data)
    showToast(`Showing ${filter} threads`, 'info');
}

function viewDiscussionThread(e) {
    const threadItem = e.target.closest('.thread-item');
    const threadTitle = threadItem.querySelector('.thread-title').textContent.trim();

    // In real app, would navigate to thread view
    console.log('Viewing thread:', threadTitle);

    // Remove unread indicator
    const unreadIndicator = threadItem.querySelector('.unread-indicator');
    if (unreadIndicator) {
        unreadIndicator.remove();
    }
}

// ========================================
// 8. AUDIT TRAIL
// ========================================
function loadAuditTrail() {
    // Load audit trail data
    document.querySelectorAll('.go-to-mention-btn').forEach(btn => {
        btn.addEventListener('click', navigateToMention);
    });
}

function navigateToMention(e) {
    const mentionEntry = e.target.closest('.mention-entry');
    const context = mentionEntry.querySelector('.mention-context').textContent;

    // In real app, would navigate to the mention location
    showToast(`Navigating to: ${context}`, 'info');
}

// ========================================
// 9. MODAL MANAGEMENT
// ========================================
function setupModalControls() {
    // New Discussion Modal
    const newDiscussionModal = document.getElementById('newDiscussionModal');
    document.getElementById('closeNewDiscussion')?.addEventListener('click', () => closeModal(newDiscussionModal));
    document.getElementById('postDiscussionBtn')?.addEventListener('click', postNewDiscussion);
    document.getElementById('saveDraftBtn')?.addEventListener('click', saveDiscussionDraft);

    // Appointment Notes Modal
    const appointmentNotesModal = document.getElementById('appointmentNotesModal');
    document.getElementById('closeAppointmentNotes')?.addEventListener('click', () => closeModal(appointmentNotesModal));
    document.getElementById('saveAppointmentNote')?.addEventListener('click', saveModalAppointmentNote);
    document.getElementById('cancelAppointmentNote')?.addEventListener('click', () => closeModal(appointmentNotesModal));

    // Preferences Modal
    const preferencesModal = document.getElementById('preferencesModal');
    document.getElementById('closePreferences')?.addEventListener('click', () => closeModal(preferencesModal));
    document.getElementById('savePreferences')?.addEventListener('click', savePreferences);
    document.getElementById('cancelPreferences')?.addEventListener('click', () => closeModal(preferencesModal));

    // Lab Viewer Modal
    const labViewerModal = document.getElementById('labViewerModal');
    document.getElementById('closeLabViewer')?.addEventListener('click', () => closeModal(labViewerModal));
    document.getElementById('closeLabViewerBtn')?.addEventListener('click', () => closeModal(labViewerModal));
    document.getElementById('downloadLab')?.addEventListener('click', downloadLabResults);
    document.getElementById('printLab')?.addEventListener('click', printLabResults);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openNewDiscussionModal() {
    const modal = document.getElementById('newDiscussionModal');
    openModal(modal);

    // Initialize rich text editor
    initializeRichTextEditor();
}

function openAppointmentNotesModal() {
    const modal = document.getElementById('appointmentNotesModal');
    openModal(modal);
}

function openPreferencesModal() {
    const modal = document.getElementById('preferencesModal');
    openModal(modal);

    // Load current preferences
    loadCurrentPreferences();
}

function openLabViewer() {
    const modal = document.getElementById('labViewerModal');
    openModal(modal);

    // In real app, would load PDF viewer
    console.log('Loading lab results viewer');
}

function openCreateThreadModal() {
    openNewDiscussionModal();

    // Set to private thread mode
    document.getElementById('discussionCategory').value = 'clinical';
}

function openCommentModal() {
    openNewDiscussionModal();

    // Set to comment mode
    const title = document.getElementById('discussionTitle');
    if (title) {
        title.value = 'Patient Discussion';
    }
}

// ========================================
// 10. MODAL ACTIONS
// ========================================
function postNewDiscussion() {
    const form = document.getElementById('newDiscussionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const discussionData = {
        title: document.getElementById('discussionTitle').value,
        priority: document.getElementById('discussionPriority').value,
        category: document.getElementById('discussionCategory').value,
        context: document.getElementById('attachContext').value,
        content: document.getElementById('discussionContent').value,
        timestamp: new Date().toISOString()
    };

    // Simulate posting
    setTimeout(() => {
        closeModal(document.getElementById('newDiscussionModal'));
        showToast('Discussion posted successfully', 'success');

        // Reset form
        form.reset();

        // Add to discussions if on that tab
        if (AppState.activeTab === 'discussions') {
            addNewDiscussionToList(discussionData);
        }
    }, 500);
}

function saveDiscussionDraft() {
    const discussionData = {
        title: document.getElementById('discussionTitle').value,
        content: document.getElementById('discussionContent').value
    };

    saveDraft('discussion', discussionData);
    showToast('Draft saved', 'success');
}

function saveModalAppointmentNote() {
    const noteContent = document.getElementById('appointmentNoteContent').value;
    const noteType = document.querySelector('input[name="noteType"]:checked').value;
    const appointment = document.getElementById('appointmentSelect').value;

    if (!noteContent.trim()) {
        showToast('Please enter a note', 'warning');
        return;
    }

    const noteData = {
        appointment,
        type: noteType,
        content: noteContent,
        timestamp: new Date().toISOString()
    };

    // Simulate saving
    setTimeout(() => {
        closeModal(document.getElementById('appointmentNotesModal'));
        showToast('Note saved successfully', 'success');

        // Reset form
        document.getElementById('appointmentNoteContent').value = '';
    }, 500);
}

function savePreferences() {
    const preferences = {
        emailNotifications: document.querySelector('input[type="checkbox"][checked]')?.checked,
        inAppNotifications: true,
        smsAlerts: false,
        assignedPatientsOnly: true,
        teamMentions: true,
        workingHours: {
            start: '08:00',
            end: '18:00',
            muteOutside: false,
            emergencyOverride: true
        }
    };

    localStorage.setItem('curis_preferences', JSON.stringify(preferences));
    AppState.preferences = preferences;

    closeModal(document.getElementById('preferencesModal'));
    showToast('Preferences saved', 'success');
}

function loadCurrentPreferences() {
    const saved = localStorage.getItem('curis_preferences');
    if (saved) {
        const preferences = JSON.parse(saved);
        // Apply to UI (simplified for demo)
        console.log('Loading preferences:', preferences);
    }
}

function downloadLabResults() {
    // Simulate download
    showToast('Downloading lab results...', 'info');
    setTimeout(() => {
        showToast('Download complete', 'success');
    }, 1500);
}

function printLabResults() {
    window.print();
}

// ========================================
// 11. RICH TEXT EDITOR
// ========================================
function initializeRichTextEditor() {
    const editorBtns = document.querySelectorAll('.editor-btn');
    const editorContent = document.getElementById('discussionContent');

    editorBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            if (this.classList.contains('mention-btn')) {
                insertMention(editorContent);
            } else if (this.querySelector('.fa-bold')) {
                document.execCommand('bold', false, null);
            } else if (this.querySelector('.fa-italic')) {
                document.execCommand('italic', false, null);
            } else if (this.querySelector('.fa-list')) {
                document.execCommand('insertUnorderedList', false, null);
            } else if (this.querySelector('.fa-link')) {
                const url = prompt('Enter URL:');
                if (url) document.execCommand('createLink', false, url);
            } else if (this.querySelector('.fa-paperclip')) {
                // Simulate file attachment
                showToast('File attachment dialog would open', 'info');
            }
        });
    });
}

function insertMention(editorContent) {
    const mention = prompt('Enter username to mention (e.g., Dr. Johnson):');
    if (mention) {
        const currentValue = editorContent.value;
        const cursorPos = editorContent.selectionStart;
        const newValue = currentValue.slice(0, cursorPos) + `@${mention} ` + currentValue.slice(cursorPos);
        editorContent.value = newValue;
        editorContent.focus();
    }
}

// ========================================
// 12. REAL-TIME FEATURES
// ========================================
function initializeWebSocket() {
    // Simulate WebSocket connection
    console.log('Initializing WebSocket connection...');

    // In production, would use: AppState.wsConnection = new WebSocket('wss://...');
    simulateWebSocketConnection();
}

function simulateWebSocketConnection() {
    // Simulate receiving real-time notifications
    setInterval(() => {
        if (Math.random() > 0.8) {
            const newNotification = generateRandomNotification();
            addNotificationToQueue(newNotification);
        }
    }, 30000); // Check every 30 seconds
}

function generateRandomNotification() {
    const types = ['assignment', 'lab-results', 'mention', 'discussion'];
    const type = types[Math.floor(Math.random() * types.length)];

    return {
        id: `notif-${Date.now()}`,
        type: type,
        title: `New ${type} notification`,
        text: 'This is a simulated real-time notification',
        time: 'Just now',
        unread: true
    };
}

function addNotificationToQueue(notification) {
    AppState.notificationQueue.push(notification);

    // Show notification badge
    updateUnreadCount(1);

    // Show toast
    showToast(`New notification: ${notification.title}`, 'info');
}

function startRealTimeUpdates() {
    // Process notification queue
    setInterval(() => {
        if (AppState.notificationQueue.length > 0) {
            const notification = AppState.notificationQueue.shift();
            addNotificationToFeed(notification);
        }
    }, 5000);

    // Update time stamps
    setInterval(updateTimeStamps, 60000); // Every minute
}

function addNotificationToFeed(notification) {
    const feed = document.getElementById('notificationsFeed');
    if (!feed) return;

    const notifElement = createNotificationElement(notification);
    feed.insertBefore(notifElement, feed.firstChild);

    // Animate entry
    notifElement.style.animation = 'slideInLeft 0.3s ease';
}

function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item unread ${notification.urgent ? 'time-sensitive' : ''}`;
    div.dataset.id = notification.id;

    // Simplified notification HTML
    div.innerHTML = `
        <div class="notification-icon ${notification.type}">
            <i class="fas fa-bell"></i>
        </div>
        <div class="notification-content">
            <h4 class="notification-title">${escapeHtml(notification.title)}</h4>
            <p class="notification-text">${escapeHtml(notification.text)}</p>
            <p class="notification-meta">
                <span class="time">${notification.time}</span>
            </p>
            <div class="notification-actions">
                <button class="action-btn primary">View</button>
                <button class="action-btn secondary mark-read">Mark as Read</button>
            </div>
        </div>
    `;

    // Add event listeners
    div.querySelector('.mark-read')?.addEventListener('click', markNotificationRead);

    return div;
}

function updateTimeStamps() {
    document.querySelectorAll('.comment-time, .mention-time, .activity-time').forEach(element => {
        // Update relative timestamps
        const time = element.textContent;
        if (time.includes('minute')) {
            const minutes = parseInt(time) + 1;
            element.textContent = `${minutes} minutes ago`;
        }
    });
}

// ========================================
// 13. DARK MODE
// ========================================
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('curis_theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        AppState.darkMode = true;
        updateDarkModeIcon();
    }
}

function toggleDarkMode() {
    AppState.darkMode = !AppState.darkMode;

    if (AppState.darkMode) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('curis_theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('curis_theme', 'light');
    }

    updateDarkModeIcon();
    showToast(`Dark mode ${AppState.darkMode ? 'enabled' : 'disabled'}`, 'info');
}

function updateDarkModeIcon() {
    const btn = document.getElementById('darkModeBtn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = AppState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// ========================================
// 14. DATA MANAGEMENT
// ========================================
function loadInitialData() {
    loadUserPreferences();
    loadSavedDrafts();
}

function loadUserPreferences() {
    const saved = localStorage.getItem('curis_preferences');
    if (saved) {
        AppState.preferences = JSON.parse(saved);
    }
}

function loadSavedDrafts() {
    const drafts = localStorage.getItem('curis_drafts');
    if (drafts) {
        AppState.drafts = JSON.parse(drafts);

        // Show indicator if drafts exist
        if (Object.keys(AppState.drafts).length > 0) {
            console.log('Drafts available:', AppState.drafts);
        }
    }
}

function saveDraft(type, data) {
    if (!AppState.drafts) AppState.drafts = {};

    AppState.drafts[type] = {
        data: data,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('curis_drafts', JSON.stringify(AppState.drafts));
}

function exportData() {
    const exportData = {
        notifications: AppState.notifications,
        comments: AppState.comments,
        discussions: AppState.discussions,
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curis-export-${Date.now()}.json`;
    a.click();

    showToast('Data exported successfully', 'success');
}

// ========================================
// 15. UTILITY FUNCTIONS
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-green)' : type === 'warning' ? 'var(--warning-yellow)' : type === 'error' ? 'var(--danger-red)' : 'var(--info-blue)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after delay
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// 16. KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + K: Quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('notificationFilter')?.focus();
    }

    // Ctrl/Cmd + N: New discussion
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openNewDiscussionModal();
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal);
        });
    }
});

// ========================================
// 17. PERFORMANCE OPTIMIZATION
// ========================================
// Lazy load images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        }
    });
});

// Observe all images with data-src
document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// ========================================
// 18. ERROR HANDLING
// ========================================
window.addEventListener('error', function (e) {
    console.error('Global error:', e);

    // Log to server in production
    if (e.filename && e.filename.includes('alerts_and_collaboration.js')) {
        showToast('An error occurred. Please refresh the page.', 'error');
    }
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e);
});

// ========================================
// 19. ADDITIONAL HELPER FUNCTIONS
// ========================================
function addNewDiscussionToList(discussionData) {
    const threadsContainer = document.querySelector('.discussion-threads');
    if (!threadsContainer) return;

    const threadElement = document.createElement('div');
    threadElement.className = 'thread-item active';
    threadElement.innerHTML = `
        <div class="thread-header">
            <h4 class="thread-title">
                <i class="fas fa-lock"></i>
                ${escapeHtml(discussionData.title)}
            </h4>
            <span class="thread-category ${discussionData.category}">${discussionData.category}</span>
        </div>
        <div class="thread-meta">
            <span class="thread-starter">Started by ${AppState.currentUser.name}</span>
            <span class="thread-participants"><i class="fas fa-users"></i> 1 participant</span>
            <span class="thread-activity">Just created</span>
        </div>
        <div class="thread-preview">
            <p>${escapeHtml(discussionData.content.substring(0, 100))}...</p>
        </div>
        <div class="thread-actions">
            <button class="view-thread-btn">View Thread</button>
        </div>
    `;

    threadsContainer.insertBefore(threadElement, threadsContainer.firstChild);
}

function setupNotificationObserver() {
    // Observe changes to notification feed for real-time updates
    const feed = document.getElementById('notificationsFeed');
    if (!feed) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                updateUnreadBadge();
            }
        });
    });

    observer.observe(feed, { childList: true });
}

// ========================================
// 20. CLEANUP
// ========================================
window.addEventListener('beforeunload', function () {
    // Save any unsaved data
    if (AppState.wsConnection) {
        AppState.wsConnection.close();
    }

    // Save current state
    sessionStorage.setItem('curis_session_state', JSON.stringify({
        activeTab: AppState.activeTab,
        filters: AppState.filters
    }));
});

// Console log for verification
console.log('Curis Alerts & Collaboration JavaScript loaded successfully');
console.log('Version: 1.0.0');
console.log('Dark mode support: Enabled');
console.log('Real-time updates: Active');
console.log('WebSocket simulation: Running');