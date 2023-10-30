import NewsApiSearch from './js/api-search';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let isShown = 0;
const newsApiSearch = new NewsApiSearch();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};

const observer = new IntersectionObserver(onLoadMore, options);

async function onSearch(event) {
    event.preventDefault();
    
    refs.gallery.innerHTML = '';
    newsApiSearch.query = event.currentTarget.elements.searchQuery.value.trim();
    newsApiSearch.resetPage();

    if (newsApiSearch.query === '') {
        Notify.failure(`Please, fill the main field`);
        return;
    }

    isShown = 0;
    const result = await fetchGallery();
    onRenderGallery(result.hits);
}

async function fetchGallery() {
    refs.loadMoreBtn.classList.add('is-hidden');
    
    const result = await newsApiSearch.fetchGallery();
    const { hits, totalHits } = result;
    isShown += hits.length;
    
    if (!hits.length) {
        Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
        refs.loadMoreBtn.classList.add('is-hidden');
        return result;
    }
    
    onRenderGallery(hits);
    isShown += hits.length;

    if (isShown < totalHits) {
        Notify.success(`Hooray! We found ${totalHits} images !!!`);
        refs.loadMoreBtn.classList.remove('is-hidden');
    }

    if (isShown >= totalHits) {
        Notify.info("We're sorry, but you've reached the end of search results.");
    }
    return result;
}

function onLoadMore() {
  newsApiSearch.incrementPage();
  fetchGallery().then(result => {
    const { height: cardHeight } = document.querySelector(".gallery").lastElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
  });
}

function onRenderGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
    const updatedLightbox = new SimpleLightbox('.gallery a');
    updatedLightbox.refresh();
}
