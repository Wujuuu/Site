document.addEventListener("DOMContentLoaded", function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerMenu && navLinks) { 
        hamburgerMenu.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });
    }

    const videoForm = document.getElementById('video-form');
    const videoInput = document.getElementById('video');
    const titleInput = document.getElementById('title');
    const passwordInput = document.getElementById('password');
    const statusMessage = document.getElementById('status-message');
    const videosList = document.getElementById('videos-list');

    if (videoForm) {
        videoForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const isAdmin = checkAdminPassword(passwordInput.value);

            if (isAdmin) {
                if (videoInput.files.length > 0) {
                    const videoFile = videoInput.files[0];
                    const validFormats = ['video/mp4', 'video/webm', 'video/ogg'];

                    if (validFormats.includes(videoFile.type)) {
                        const formData = new FormData();
                        formData.append('video', videoFile);
                        formData.append('title', titleInput.value);

                        fetch('/api/videos', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            const videoItem = createVideoItem(data.path, titleInput.value, data.id);
                            if (videosList) {
                                videosList.appendChild(videoItem);
                            }

                            statusMessage.textContent = 'Vídeo enviado com sucesso!';
                            statusMessage.style.color = 'green';
                        })
                        .catch(error => {
                            console.error('Erro ao enviar o vídeo:', error);
                            displayErrorMessage('Erro ao enviar o vídeo. Por favor, tente novamente.');
                        });
                    } else {
                        displayErrorMessage('Formato de vídeo inválido. Por favor, selecione um formato válido.');
                    }
                } else {
                    displayErrorMessage('Por favor, selecione um vídeo.');
                }
            } else {
                displayErrorMessage('Senha de administrador incorreta.');
            }
        });
    }

    function checkAdminPassword(password) {
        const adminPassword = '123'; 
        return password === adminPassword;
    }

    function displayErrorMessage(message) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.style.color = 'red';
        }
    }

    function createVideoItem(videoPath, title, videoId) {
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');

        const video = document.createElement('video');
        video.src = videoPath;
        video.controls = true;

        const videoInfo = document.createElement('div');
        videoInfo.classList.add('video-info');
        const videoTitle = document.createElement('h3');
        videoTitle.textContent = title;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.textContent = 'Excluir';
        deleteButton.addEventListener('click', function() {
            videoItem.remove();
            deleteVideoFromServer(videoId);
        });

        videoInfo.appendChild(videoTitle);

        videoItem.appendChild(video);
        videoItem.appendChild(videoInfo);
        videoItem.appendChild(deleteButton);

        return videoItem;
    }

    function deleteVideoFromServer(videoId) {
        fetch(`/api/videos/${videoId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir o vídeo do servidor');
            }
            console.log('Vídeo excluído do servidor:', videoId);
        })
        .catch(error => console.error('Erro ao excluir o vídeo do servidor:', error));
    }

    loadVideos();

    function loadVideos() {
        if (videosList) {
            fetch('/api/videos')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao carregar a lista de vídeos');
                    }
                    return response.json();
                })
                .then(videos => {
                    videos.forEach(video => {
                        const videoItem = createVideoItem(video.path, video.title, video.id);
                        videosList.appendChild(videoItem);
                    });
                })
                .catch(error => console.error(error));
        }
    }
});
