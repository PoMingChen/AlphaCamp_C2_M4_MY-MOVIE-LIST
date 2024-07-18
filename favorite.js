const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
console.log(INDEX_URL)

//注意這裡我們使用 const，const 代表我們希望 movies 的內容維持不變，其他人閱讀到 const movies 時，也會意識到 movies 不應該被重新賦值。
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')



//額外要求有 data 變數，而不要 `function renderMovieList(){movies...}`，這樣這個函數就只能永遠跟 movies 綁在一起
function renderMovieList(data){
  let rawHTML = ''

  // processing
  data.forEach(item => {
    //title, image
    //Use `+=` rather than `=`
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card"> 
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster" />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id = "${item.id}">X</button>
          </div>
        </div>
      </div>
    </div>`
    
  });

  dataPanel.innerHTML = rawHTML
}

//Show API 的 URL 是 https://webdev.alphacamp.io/api/movies/:id，因此想串這支 API 拿資料的話，就必須要有電影的 id 。問題：如何知道被點擊的電影 id ?
//若不善用 dataset 的概念，你可能還要想辦法存取出電影的 id，才又存取進去，程式碼會變很冗長
//善用 data-* 的屬性，`data-id="${item.id}`，在你上面的 template literal 有先加入進去了
function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response)=>{
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    //注意照片的部分是要 `modalImage.innerHTML`，不是 `modalImage.innerText`
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class= "img-fluid">`
  })
}

function removeFromFavorite(id) {
  if (!movies || !movies.length) return

  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if(movieIndex === -1) return

  //刪除該筆電影
  movies.splice(movieIndex,1)

  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}

//事件監聽，點擊 More 的時候，Medal 要跳出電影對應的資訊
dataPanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')){
    console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    //若使用者點擊了移除按鈕，就會呼叫 removeFromFavoritee() 將其移除
    removeFromFavorite(Number(event.target.dataset.id)) 
  }
})

renderMovieList(movies)



