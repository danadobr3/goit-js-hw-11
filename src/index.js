import NewsApiSearch from './js/api-search';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

let hits = [];
initLightbox();

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let isShown = 0;
const newsApiSearch = new NewsApiSearch();
let currentPage = 1;

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};

const observer = new IntersectionObserver(onLoadMore, options);

function onSearch(event) {
  event.preventDefault();

  refs.gallery.innerHTML = '';
  newsApiSearch.query = event.currentTarget.elements.searchQuery.value.trim();
  newsApiSearch.resetPage();
  currentPage = 1;

  if (newsApiSearch.query === '') {
    Notify.failure(`Please, fill the main field`);
    return;
  }

  isShown = 0;
  fetchGallery();
  onRenderGallery(hits);
}

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const result = await newsApiSearch.fetchGallery(currentPage);
  const { totalHits, hits: newHits } = result;

  if (newHits.length === 0) {
    Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
    refs.loadMoreBtn.classList.add('is-hidden');
    return result;
  }

  hits = [...hits, ...newHits];
  isShown += newHits.length;

  if (isShown < totalHits) {
    Notify.success(`Hooray! We found ${totalHits} images !!!`);
    refs.loadMoreBtn.classList.remove('is-hidden');
  }

  if (isShown >= totalHits) {
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  currentPage++;
  return result;
}

function onLoadMore(entries) {
  const target = entries[0];
  if (target.isIntersecting) {
    fetchGallery().then(result => {
      const { height: cardHeight } = document.querySelector(".gallery").lastElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
      });
      initLightbox();
    });
  }
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
  lightbox.refresh();
}

function initLightbox() {
  lightbox.refresh();
}

observer.observe(refs.loadMoreBtn);