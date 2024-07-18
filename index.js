const STATE = {
  list: 'list',
  card: 'card'
} 

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

//注意這裡我們使用 const，const 代表我們希望 movies 的內容維持不變，其他人閱讀到 const movies 時，也會意識到 movies 不應該被重新賦值。
let filteredMovies = []
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const iconContainer = document.querySelector('.icon-container')
const paginator = document.querySelector('#paginator')

const view = {

  MovieCards(item){
    return `<div class="col-sm-3">
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
              <button class="btn btn-info btn-add-favorite" data-id = "${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  },

  MovieList(item){
    return `<div>
              <div class="list-group-item d-flex justify-content-between align-items-center">${item.title}
                <div>
                  <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                    data-id="${item.id}">More</button>
                  <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
              </div>
            </div>`
  },

  renderMovieCard(data){
    let rawHTML = ''
    data.forEach(item => {rawHTML += this.MovieCards(item)});
    dataPanel.innerHTML = rawHTML
  },

  renderMovieList(data){
    let rawHTML = ''
    data.forEach(item => {rawHTML += this.MovieList(item)}); 
    dataPanel.innerHTML = rawHTML
  },

  getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies 

    const startIndex = (page - 1) * MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) 
  },

  renderPaginator(amount){
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //無條件進位
    let rawHTML = ''
    for (let page = 0; page < numberOfPages; page ++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page + 1}">${page + 1}</a></li>`
    }
    paginator.innerHTML = rawHTML
  },

  showMovieModal(id){
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
}

const model = {

  fetchMovies() {
    return axios.get(INDEX_URL)
      .then(response => {
        movies.push(...response.data.results);
        // console.log(movies);
      })      
      .catch((err) => console.log(err));
  },
  
  addToFavorite(id) {
    // localStorage.clear();
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find((movie) => movie.id === id) //find 裡面是放條件函式

    if (list.some((movie) => movie.id === id)) {
      return alert('此電影已經在收藏清單中！')
    }

    list.push(movie)
    // console.log(list)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
}

const controller = {
  currentState: STATE.card,
  movieAmount: filteredMovies.length ? filteredMovies : movies,
  currentPage: 1,

  dispatchMovieAction(Mode){
      this.currentState = Mode
      this.movieAmount = filteredMovies.length ? filteredMovies : movies
      switch (this.currentState) {
        case STATE.list:
            view.renderPaginator(amount = this.movieAmount.length)
            view.renderMovieList(data = view.getMoviesByPage(this.currentPage))
          break
        case STATE.card:
            view.renderPaginator(amount = this.movieAmount.length)
            view.renderMovieCard(data = view.getMoviesByPage(this.currentPage))
          break
    }
  },

  onPaginatorClicked(event){
    this.currentPage = Number(event.target.dataset.page)

    if (event.target.tagName !== 'A') {
      return
    } else if (controller.currentState === 'list') {
      view.renderMovieList(view.getMoviesByPage(this.currentPage))
    } else if (controller.currentState === 'card') {
      view.renderMovieCard(view.getMoviesByPage(this.currentPage))
    }
  },

  onPanelClicked(event){
    movieId = Number(event.target.dataset.id)

    if (event.target.matches('.btn-show-movie')){
      view.showMovieModal(movieId)
    } else if (event.target.matches('.btn-add-favorite')) {
      model.addToFavorite(movieId) 
    }
  },

  onSearchFormSubmitted(event){
    event.preventDefault() //取消預設事件
    const keyword = searchInput.value.trim().toLowerCase()

    if (!keyword.length){
      return alert('Please enter a valid string')
    }

    filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

    if (filteredMovies.length === 0){
      return alert('Cannot find the movies with keyword: ' +  keyword)
    }

    if (controller.currentState === 'list') {
      view.renderPaginator(filteredMovies.length) //重製分頁器
      view.renderMovieList(view.getMoviesByPage(1))  //預設顯示第 1 頁的搜尋結果
    } else if (controller.currentState === 'card') {
      view.renderPaginator(filteredMovies.length) //重製分頁器
      view.renderMovieCard(view.getMoviesByPage(1))  //預設顯示第 1 頁的搜尋結果
    }
  }
}

model.fetchMovies().then(() => {
  // Render initial view based on currentState
  controller.dispatchMovieAction(controller.currentState);

  // Event listener on iconContainer
  iconContainer.addEventListener('click', function(event) {
    if (event.target.matches('.fa.fa-bars')) {
      controller.dispatchMovieAction(STATE.list);
      // console.log(controller.currentState)
    } else if (event.target.matches('.fa.fa-th')) {
      controller.dispatchMovieAction(STATE.card);
      // console.log(controller.currentState)
    }
  });
});

paginator.addEventListener('click', function (event){
  controller.onPaginatorClicked(event);
})

//事件監聽，點擊 More 的時候，Medal 要跳出電影對應的資訊
dataPanel.addEventListener('click', function (event){
  controller.onPanelClicked(event);
})

searchForm.addEventListener('submit', function (event){
  controller.onSearchFormSubmitted(event);
})


