const Listing = require('../../models/Listing');
const ApiError = require('../../utils/ApiError');

// Doubles as the "search" layer: the Django doc keeps search as a thin
// query layer over Listing rather than a separate resource — this
// service is that layer, built out with query params instead of
// django-filter + OrderingFilter + PageNumberPagination.
async function queryListings(query) {
  const {
    category,
    city,
    minPrice,
    maxPrice,
    q,
    ordering = '-createdAt',
    page = 1,
    limit = 20,
    status = 'published',
  } = query;

  const filter = { status };
  if (category) filter.category = category;
  if (city) filter['location.city'] = new RegExp(`^${city}$`, 'i');
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }
  if (q) filter.$text = { $search: q };

  const sortField = ordering.replace(/^-/, '');
  const sortDir = ordering.startsWith('-') ? -1 : 1;
  const allowedSort = ['createdAt', 'pricePerDay', 'ratingAvg'];
  const sort = { [allowedSort.includes(sortField) ? sortField : 'createdAt']: sortDir };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Listing.find(filter).sort(sort).skip(skip).limit(Number(limit)).populate('owner', 'name avatarUrl'),
    Listing.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
}

async function getOwnedListingOr404(id, ownerId) {
  const listing = await Listing.findById(id);
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.owner.toString() !== ownerId.toString()) {
    throw ApiError.forbidden('You do not own this listing');
  }
  return listing;
}

module.exports = { queryListings, getOwnedListingOr404 };
