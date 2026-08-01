# Search

Same decision as the Django doc: search is not a separate resource.
All filtering, sorting, and pagination is query params on
`GET /api/listings/` — see `../listings/listings.service.js`
(`queryListings`) and `../listings/listings.routes.js`.

Example: `/api/listings?category=tools&minPrice=100&ordering=-pricePerDay&page=2`

No dedicated files needed here; this folder exists only to mirror the
`features/search` mapping from the frontend guide.
