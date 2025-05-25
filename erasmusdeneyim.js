// Beğeni işlemleri
async function likeExperience(experienceId) {
    if (!currentUser) {
        showToast('Beğenmek için giriş yapmalısınız', 'warning');
        return;
    }

    try {
        const experienceRef = doc(db, 'experiences', experienceId);
        const experienceDoc = await getDoc(experienceRef);
        
        if (!experienceDoc.exists()) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = experienceDoc.data();
        const likes = experience.likes || [];
        const hasLiked = likes.includes(currentUser.uid);

        if (hasLiked) {
            // Beğeniyi kaldır
            await updateDoc(experienceRef, {
                likes: arrayRemove(currentUser.uid)
            });
            showToast('Beğeni kaldırıldı', 'info');
        } else {
            // Beğeni ekle
            await updateDoc(experienceRef, {
                likes: arrayUnion(currentUser.uid)
            });
            showToast('Deneyim beğenildi', 'success');
        }

        // UI'ı güncelle
        updateLikeUI(experienceId, !hasLiked);
    } catch (error) {
        console.error('Beğeni hatası:', error);
        showToast('Beğeni işlemi başarısız oldu', 'error');
    }
}

// Beğeni UI'ını güncelle
function updateLikeUI(experienceId, isLiked) {
    const likeButton = document.querySelector(`[data-experience-id="${experienceId}"] .like-button`);
    if (likeButton) {
        const icon = likeButton.querySelector('i');
        const count = likeButton.querySelector('.like-count');
        
        if (isLiked) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#E0245E';
            count.textContent = parseInt(count.textContent) + 1;
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
            count.textContent = parseInt(count.textContent) - 1;
        }
    }
}

// Deneyim paylaşma
async function shareExperience(experienceId) {
    try {
        const experienceRef = doc(db, 'experiences', experienceId);
        const experienceDoc = await getDoc(experienceRef);
        
        if (!experienceDoc.exists()) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = experienceDoc.data();
        const shareUrl = `${window.location.origin}/deneyim/${experienceId}`;
        
        if (navigator.share) {
            await navigator.share({
                title: experience.title,
                text: `${experience.username}'in Erasmus deneyimi: ${experience.title}`,
                url: shareUrl
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            showToast('Deneyim linki kopyalandı!', 'success');
        }
    } catch (error) {
        console.error('Paylaşım hatası:', error);
        showToast('Paylaşım başarısız oldu', 'error');
    }
}

// Deneyim kaydetme
async function saveExperience(experienceId) {
    if (!currentUser) {
        showToast('Kaydetmek için giriş yapmalısınız', 'warning');
        return;
    }

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('Kullanıcı bulunamadı');
        }

        const user = userDoc.data();
        const savedExperiences = user.savedExperiences || [];
        const isSaved = savedExperiences.includes(experienceId);

        if (isSaved) {
            // Kaydı kaldır
            await updateDoc(userRef, {
                savedExperiences: arrayRemove(experienceId)
            });
            showToast('Deneyim kaydedilenlerden kaldırıldı', 'info');
        } else {
            // Kaydet
            await updateDoc(userRef, {
                savedExperiences: arrayUnion(experienceId)
            });
            showToast('Deneyim kaydedildi', 'success');
        }

        // UI'ı güncelle
        updateSaveUI(experienceId, !isSaved);
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showToast('Kaydetme işlemi başarısız oldu', 'error');
    }
}

// Kaydetme UI'ını güncelle
function updateSaveUI(experienceId, isSaved) {
    const saveButton = document.querySelector(`[data-experience-id="${experienceId}"] .save-button`);
    if (saveButton) {
        const icon = saveButton.querySelector('i');
        
        if (isSaved) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#17BF63';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
        }
    }
}

// Emoji ekleme
function addEmoji() {
    const textarea = document.getElementById('commentText');
    const emoji = '😊'; // Örnek emoji
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    textarea.value = newText;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
}

// Fotoğraf ekleme
function addPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const storageRef = ref(storage, `comments/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                
                const textarea = document.getElementById('commentText');
                const imageMarkdown = `![Fotoğraf](${url})`;
                textarea.value += '\n' + imageMarkdown;
            } catch (error) {
                console.error('Fotoğraf yükleme hatası:', error);
                showToast('Fotoğraf yüklenemedi', 'error');
            }
        }
    };
    input.click();
} 