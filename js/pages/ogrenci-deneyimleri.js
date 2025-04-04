document.addEventListener('DOMContentLoaded', () => {
    loadExperiences();
    setupEventListeners();
});

let currentExperienceId = null;

function setupEventListeners() {
    document.getElementById('searchExperience').addEventListener('input', filterExperiences);
    document.getElementById('filterUniversity').addEventListener('change', filterExperiences);
    document.getElementById('commentForm').addEventListener('submit', handleCommentSubmit);
    document.getElementById('saveExperience').addEventListener('click', handleSaveExperience);
}

async function loadExperiences() {
    try {
        const response = await fetch('/api/experiences');
        const experiences = await response.json();
        
        // Populate universities filter
        const universities = [...new Set(experiences.map(exp => exp.university))];
        const filterSelect = document.getElementById('filterUniversity');
        universities.forEach(uni => {
            const option = document.createElement('option');
            option.value = uni;
            option.textContent = uni;
            filterSelect.appendChild(option);
        });

        // Display experiences
        displayExperiences(experiences);
    } catch (error) {
        console.error('Error loading experiences:', error);
        showError('Deneyimler yüklenirken bir hata oluştu.');
    }
}

function displayExperiences(experiences) {
    const container = document.getElementById('experiencesContainer');
    container.innerHTML = '';

    experiences.forEach(exp => {
        const card = createExperienceCard(exp);
        container.appendChild(card);
    });
}

function createExperienceCard(experience) {
    const card = document.createElement('div');
    card.className = 'experience-card position-relative';
    card.setAttribute('data-experience-id', experience.id);
    
    if (experience.isSaved) {
        const savedBadge = document.createElement('div');
        savedBadge.className = 'saved-badge';
        savedBadge.innerHTML = '<i class="fas fa-bookmark me-1"></i>Kaydedildi';
        card.appendChild(savedBadge);
    }

    card.innerHTML += `
        <div class="experience-header">
            <div class="d-flex align-items-center">
                <img src="${experience.userImage}" alt="Profil" class="rounded-circle me-3" width="48" height="48">
                <div>
                    <h6 class="mb-1">${experience.userName}</h6>
                    <small class="text-muted">${experience.university} - ${experience.country}</small>
                </div>
            </div>
        </div>
        <div class="experience-body">
            <p class="text-justify">${truncateText(experience.content, 200)}</p>
            ${experience.photos.length > 0 ? `
                <div class="experience-photos">
                    ${experience.photos.slice(0, 2).map(photo => `
                        <img src="${photo}" alt="Deneyim" class="experience-photo">
                    `).join('')}
                    ${experience.photos.length > 2 ? `
                        <div class="more-photos">+${experience.photos.length - 2} daha fazla</div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        <div class="experience-footer">
            <div class="d-flex justify-content-between align-items-center">
                <span class="comment-count">
                    <i class="far fa-comment"></i>${experience.commentCount} yorum
                </span>
                <button class="btn btn-primary" onclick="openExperienceModal('${experience.id}')">
                    Detayları Gör
                </button>
            </div>
        </div>
    `;

    return card;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

async function openExperienceModal(experienceId) {
    currentExperienceId = experienceId;
    
    try {
        const [experienceResponse, commentsResponse] = await Promise.all([
            fetch(`/api/experiences/${experienceId}`),
            fetch(`/api/experiences/${experienceId}/comments`)
        ]);

        const experience = await experienceResponse.json();
        const comments = await commentsResponse.json();

        // Populate modal with experience details
        document.getElementById('modalUserImage').src = experience.userImage;
        document.getElementById('modalUserName').textContent = experience.userName;
        document.getElementById('modalUniversity').textContent = experience.university;
        document.getElementById('modalCountry').textContent = experience.country;
        document.getElementById('modalSemester').textContent = experience.semester;
        document.getElementById('modalContent').textContent = experience.content;

        // Update save button state
        const saveButton = document.getElementById('saveExperience');
        saveButton.classList.toggle('saved', experience.isSaved);
        saveButton.innerHTML = experience.isSaved ? 
            '<i class="fas fa-bookmark me-1"></i>Kaydedildi' :
            '<i class="far fa-bookmark me-1"></i>Kaydet';

        // Display photos
        const photosContainer = document.getElementById('modalPhotos');
        photosContainer.innerHTML = experience.photos.map(photo => `
            <img src="${photo}" alt="Deneyim" class="experience-photo">
        `).join('');

        // Display comments
        displayComments(comments);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('experienceModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading experience details:', error);
        showError('Deneyim detayları yüklenirken bir hata oluştu.');
    }
}

function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.userName}</span>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function handleCommentSubmit(event) {
    event.preventDefault();
    
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        alert('Lütfen bir yorum yazın.');
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Gönderiliyor...';

    try {
        const response = await fetch(`/api/experiences/${currentExperienceId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: commentText })
        });

        if (!response.ok) {
            throw new Error('Yorum gönderilemedi');
        }

        // Refresh comments
        const commentsResponse = await fetch(`/api/experiences/${currentExperienceId}/comments`);
        const comments = await commentsResponse.json();
        displayComments(comments);

        // Clear comment form
        document.getElementById('commentText').value = '';
        
        // Update comment count in the experience card
        const experienceCard = document.querySelector(`[data-experience-id="${currentExperienceId}"]`);
        if (experienceCard) {
            const commentCountElement = experienceCard.querySelector('.comment-count');
            const currentCount = parseInt(commentCountElement.textContent.match(/\d+/)[0]);
            commentCountElement.innerHTML = `<i class="far fa-comment"></i>${currentCount + 1} yorum`;
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Yorum Yap';
    }
}

async function handleSaveExperience() {
    const saveButton = document.getElementById('saveExperience');
    const isSaved = saveButton.classList.contains('saved');

    try {
        const response = await fetch(`/api/experiences/${currentExperienceId}/save`, {
            method: isSaved ? 'DELETE' : 'POST'
        });

        if (!response.ok) throw new Error('Save operation failed');

        // Toggle saved state
        saveButton.classList.toggle('saved');
        saveButton.innerHTML = saveButton.classList.contains('saved') ?
            '<i class="fas fa-bookmark me-1"></i>Kaydedildi' :
            '<i class="far fa-bookmark me-1"></i>Kaydet';

        // Refresh experiences list to update saved badge
        loadExperiences();
    } catch (error) {
        console.error('Error saving experience:', error);
        showError(isSaved ? 'Deneyim kaydı kaldırılırken bir hata oluştu.' : 'Deneyim kaydedilirken bir hata oluştu.');
    }
}

function filterExperiences() {
    const searchText = document.getElementById('searchExperience').value.toLowerCase();
    const selectedUniversity = document.getElementById('filterUniversity').value;

    const experienceCards = document.querySelectorAll('.experience-card');
    experienceCards.forEach(card => {
        const university = card.querySelector('small.text-muted').textContent.split(' - ')[0];
        const content = card.querySelector('.experience-body p').textContent.toLowerCase();
        const userName = card.querySelector('.experience-header h6').textContent.toLowerCase();

        const matchesSearch = content.includes(searchText) || userName.includes(searchText);
        const matchesUniversity = selectedUniversity === 'all' || university === selectedUniversity;

        card.style.display = matchesSearch && matchesUniversity ? 'block' : 'none';
    });
}

function showError(message) {
    // You can implement your preferred error notification method here
    alert(message);
}
