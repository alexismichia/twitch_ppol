const form = document.getElementById('userForm');
const userInfoContainer = document.getElementById('userInfoContainer');
const changeUserBtn = document.getElementById('changeUserBtn');
changeUserBtn.textContent = 'Cambiar usuario';
changeUserBtn.style.display = 'none';
userInfoContainer.appendChild(changeUserBtn);
let accessToken = '';
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const username = formData.get('username');

  getAccessToken("gbeot7mv95yuln3ahop230l81nb4qc", "pgvu5qfdwinp0wq2zd7c6j2l6tbeyc", username)
    .then((userInfo) => {
      
      
      showUserInfo(userInfo);
      form.style.display = 'none';
      changeUserBtn.style.display = 'block';

      if (!userInfo.stream_info) {
        getLatestVideos(username, userInfo.access_token, "gbeot7mv95yuln3ahop230l81nb4qc")
          .then((videos) => {
            showLatestVideos(videos);
          })
          .catch((error) => {
            console.error('Error fetching user videos:', error);
          });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

  
changeUserBtn.addEventListener('click', () => {
    userInfoContainer.innerHTML = '';
    form.style.display = 'block';
    changeUserBtn.style.display = 'none';
  });

  function getAccessToken(clientId, clientSecret, username) {
    return new Promise((resolve, reject) => {
      const tokenUrl = 'https://id.twitch.tv/oauth2/token';
      const grantType = 'client_credentials';
  
      const requestBody = `client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`;
  
      const xhr = new XMLHttpRequest();
      xhr.open('POST', tokenUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            accessToken = data.access_token;
            
            // Llamada para obtener la información del usuario
            getUserInfo(username, accessToken, clientId)
              .then((userInfo) => {
                // Si se obtiene el usuario correctamente, se obtiene la información del stream
                getUserInfoStream(userInfo.data[0].login, accessToken, clientId)
                  .then((streamInfo) => {
                    // Agregar la información del stream a la información del usuario
                    userInfo.stream_info = streamInfo.data.length > 0 ? streamInfo.data[0] : null;
                    resolve(userInfo);
                  })
                  .catch((error) => {
                    reject(new Error('Failed to get user stream info'));
                  });
              })
              .catch((error) => {
                userInfoContainer.style.height = '100px';
                userInfoContainer.innerHTML = '<div class="userNotFound">USUARIO INEXISTENTE</div>';
              });
          } else {
            reject(new Error('Failed to get access token'));
          }
        }
      };
  
      xhr.onerror = function () {
        reject(new Error('Failed to make the request'));
      };
  
      xhr.send(requestBody);
    });
  }
  

function getUserInfo(username, accessToken, clientId) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.twitch.tv/helix/users?login=${username}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Client-ID', clientId);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          reject(new Error('Failed to get user info'));
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error('Failed to make the request'));
    };

    xhr.send();
  });
}

function getUserInfoStream(username, accessToken, clientId) {
    return new Promise((resolve, reject) => {
      const apiUrl = `https://api.twitch.tv/helix/streams?user_login=${username}`;
  
      const xhr = new XMLHttpRequest();
      xhr.open('GET', apiUrl, true);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('Client-ID', clientId);
  
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } else {
            reject(new Error('Failed to get user stream info'));
          }
        }
      };
  
      xhr.onerror = function () {
        reject(new Error('Failed to make the request'));
      };
  
      xhr.send();
    });
  }
 
  function getLatestVideos(userId) {
    return new Promise((resolve, reject) => {
      const apiUrl = `https://api.twitch.tv/helix/videos?user_id=${userId}&first=2`;
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', apiUrl, true);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('Client-ID', "gbeot7mv95yuln3ahop230l81nb4qc");
  
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } else {
            reject(new Error('Failed to get user videos'));
          }
        }
      };
  
      xhr.onerror = function () {
        reject(new Error('Failed to make the request'));
      };
  
      xhr.send();
    });
  }
  
  function getThumbnailUrl(thumbnailUrl, width, height) {
    // Reemplazar las secuencias de escape por los tamaños reales
    return thumbnailUrl.replace("%{width}", width).replace("%{height}", height);
  }
  
  
  
  
  // En la función showUserInfo
  function showUserInfo(userInfo) {
   
    const userData = userInfo.data[0];
    
    const { id, login, profile_image_url, description } = userData;
    const { stream_info } = userInfo;
  
    const userInfoHTML = `
      <div id="userInfo">
        <div id="userinformacion"> <a href="https://www.twitch.tv/${login}" target="_blank"><img src="${profile_image_url}" alt="Foto de perfil"/></a>
        <div id="prueba"><p class="user" ><img class="icon" src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" alt="Usuario"><strong>:</strong><strong> ${login}</strong> ${
      stream_info ? '<img class="iconlive" src="https://cdn-icons-png.flaticon.com/512/5822/5822037.png" alt="En vivo" />' : ''
    }</p>
        <p class="descripcion" ><img class="icon" src="https://cdn-icons-png.flaticon.com/512/3528/3528062.png" alt="Descripcion"/><strong>:${description}</strong></p></div></div>
        ${
          stream_info
            ? `
            <p> <strong> ${stream_info.title}</strong> </p>
          <div id="streamersinfo"><p class="Game"> <strong>${stream_info.game_name}</strong></p>
         
          <p class="Viewers"><img class="icon" src="https://cdn-icons-png.flaticon.com/512/4449/4449637.png" alt="Viewers"><strong>:</strong> <strong>${stream_info.viewer_count}</strong></p>
          </div>
          
          <div id="twitchPlayerDiv"></div>
          `
            : ''
        }
      </div>
    `;
  
    userInfoContainer.innerHTML = userInfoHTML;
  
    if (stream_info) {
      const playerDivId = 'twitchPlayerDiv'; // ID del div donde se cargará el reproductor
      const playerOptions = {
        width: 350,
        height: 170,
        channel: login,
      };
  
      const player = new Twitch.Player(playerDivId, playerOptions);
    } else {
      getLatestVideos(id)
    .then((videosData) => {
      // Manejar la respuesta con los videos obtenidos

      if (videosData.data.length === 0) {
        // Si no hay videos, mostrar un mensaje indicando que no hay videos disponibles
        userInfoContainer.style.height = '180px';
        userInfoContainer.insertAdjacentHTML(
          
          'beforeend',
          '<div id="nohayvideos">NO HAY VIDEOS DISPONIBLES NI ESTA EN STREAM</div>'
        );
      } else {
        // Si hay videos, mostrar los videos obtenidos
        const videosHTML = videosData.data
          .map((video) => {
            // Obtener la URL de la miniatura correspondiente a cada video
            const thumbnailWidth = 300;
            const thumbnailHeight = 280;
            const thumbnailUrl = getThumbnailUrl(video.thumbnail_url, thumbnailWidth, thumbnailHeight);

            return `
              <div class="video">
                <h3>${video.title}</h3>
                <a href="${video.url}" target="_blank">
                  <img class="thumbnail" src="${thumbnailUrl}" alt="miniatura"/>
                </a>
                <p><img class="icon" src="https://cdn-icons-png.flaticon.com/512/4449/4449637.png" alt="Usuario"><strong>:</strong> ${video.view_count}</p>
              </div>
            `;
          })
          .join('');

        userInfoContainer.insertAdjacentHTML(
          'beforeend',
          `<div id="userVideos">${videosHTML}</div>`
        );
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      userInfoContainer.insertAdjacentHTML(
        'beforeend',
        '<div id="userVideos">NO HAY VIDEOS DISPONIBLES</div>'
      );
    });

    }
  }
  