{
  "id": "org.swegerhub.addon",
  "version": "1.1.0",
  "name": "SweGerHub",
  "description": "Svenska och tyska filmer, serier samt svensk krim/thriller från TMDB",
  "resources": [
    "catalog",
    "stream"
  ],
  "types": [
    "movie",
    "series"
  ],
  "catalogs": [
    {
      "type": "movie",
      "id": "swedish_crime",
      "name": "Svensk Krim & Thriller (Film)",
      "genres": ["Alla", "Kriminal", "Thriller", "Mysterium"]
    },
    {
      "type": "series",
      "id": "swedish_crime_series",
      "name": "Svensk Krim & Deckare (Serier)",
      "genres": ["Alla", "Kriminal", "Thriller", "Mysterium"]
    },
    {
      "type": "movie",
      "id": "sweger_movies",
      "name": "SweGer Filmer",
      "genres": ["Action", "Komedi", "Drama", "Kriminal", "Skräck", "Thriller", "Sci-Fi"]
    },
    {
      "type": "series",
      "id": "sweger_series",
      "name": "SweGer Serier",
      "genres": ["Action", "Komedi", "Drama", "Kriminal", "Skräck", "Thriller", "Sci-Fi"]
    }
  ],
  "idPrefixes": [
    "tt"
  ]
}
