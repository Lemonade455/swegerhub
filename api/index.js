const express = require('express');
const path = require('path');
const manifest = require('../manifest.json');

const app = express();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// TMDB Genre Maps för Svensk Krim/Thriller
const MOVIE_GENRES = {
  'Kriminal': 80,
  'Thriller': 53,
  'Mysterium': 9648,
  'Action': 28,
  'Komedi': 35,
  'Drama': 18,
  'Skräck': 27,
  'Sci-Fi': 878
};

const TV_GENRES = {
  'Kriminal': 80,
  'Thriller': 9648,
  'Mysterium': 9648,
  'Action': 10759,
  'Komedi': 35,
  'Drama': 18,
  'Skräck': 9648,
  'Sci-Fi': 10765
};

const CRIME_GENRE_IDS = '80,53,9648';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Statiska filer & konfigurationssida
app.use(express.static(path.join(__dirname, '../public')));

app.get('/configure', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/configure.html'));
});

app.get('/', (req, res) => {
  res.redirect('/configure');
});

// Manifest endpoint
app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

// Catalog endpoint
app.get('/catalog/:type/:id/:extra?.json', async (req, res) => {
  const { type, id, extra } = req.params;

  let genre = null;
  if (extra) {
    const params = new URLSearchParams(extra);
    genre = params.get('genre');
  }

  try {
    const isMovie = type === 'movie';
    const endpoint = isMovie ? '/discover/movie' : '/discover/tv';
    const genreMap = isMovie ? MOVIE_GENRES : TV_GENRES;

    let url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=1`;

    if (id === 'swedish_crime' || id === 'swedish_crime_series') {
      url += `&with_original_language=sv`;
      if (genre && genre !== 'Alla' && genreMap[genre]) {
        url += `&with_genres=${genreMap[genre]}`;
      } else {
        url += `&with_genres=${CRIME_GENRE_IDS}`;
      }
    } else if (id === 'sweger_movies' || id === 'sweger_series') {
      url += `&with_original_language=sv|de`;
      if (genre && genreMap[genre]) {
        url += `&with_genres=${genreMap[genre]}`;
      }
    } else {
      return res.json({ metas: [] });
    }

    const tmdbRes = await fetch(url);
    const tmdbData = await tmdbRes.json();

    if (!tmdbData.results) return res.json({ metas: [] });

    const metas = await Promise.all(
      tmdbData.results.slice(0, 20).map(async (item) => {
        const extUrl = `${TMDB_BASE_URL}/${isMovie ? 'movie' : 'tv'}/${item.id}/external_ids?api_key=${TMDB_API_KEY}`;
        const extRes = await fetch(extUrl);
        const extData = await extRes.json();

        if (!extData.imdb_id) return null;

        return {
          id: extData.imdb_id,
          type: type,
          name: isMovie ? item.title : item.name,
          poster: item.poster_path ? `https://image.tmdb.org/t500${item.poster_path}` : null,
          background: item.backdrop_path ? `https://image.tmdb.org/t1280${item.backdrop_path}` : null,
          description: item.overview,
          releaseInfo: (isMovie ? item.release_date : item.first_air_date)?.substring(0, 4)
        };
      })
    );

    res.json({ metas: metas.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.json({ metas: [] });
  }
});

// Stream endpoint med finjusterat filter
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;

  try {
    const response = await fetch(`https://torrentio.strem.fun/stream/${type}/${id}.json`);
    const data = await response.json();

    if (!data.streams) return res.json({ streams: [] });

    const filtered = data.streams.filter(stream => {
      const text = `${stream.title || ''} ${stream.name || ''}`.toLowerCase();
      
      const isSwedish = text.includes('swesub') || text.includes('swedish') || text.includes('swe audio');
      const isGerman = text.includes('german') || text.includes('.ger.') || text.includes('ger-');

      return isSwedish || isGerman;
    });

    res.json({ streams: filtered });
  } catch (err) {
    console.error(err);
    res.json({ streams: [] });
  }
});

module.exports = app;
