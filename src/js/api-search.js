import axios from 'axios';

export default class NewsApiSearch {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
        this.PER_PAGE = 40;
    }
    
    async fetchGallery() {
        const axiosOptions = {
            method: 'get',
            url: 'https://pixabay.com/api/',
            params: {
                key: '40334297-f65b2b6f72a94a95e85950ad2',
                q: `${this.searchQuery}`,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: `${this.page}`,
                per_page: `${this.PER_PAGE}`,
            },
        };
     
        try {
            const response = await axios(axiosOptions);

            const data = response.data;

            return data;
        } catch (error) {
            console.error(error);
        }
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }

    resetEndOfHits() {
        this.endOfHits = false;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}