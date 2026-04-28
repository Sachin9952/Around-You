const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');
const { calculateDistanceKm } = require('../utils/distance');

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res, next) => {
  try {
    // Attach provider ID from logged-in user
    req.body.provider = req.user.id;

    // Check if provider is approved
    if (!req.user.isApproved) {
      return next(
        new ErrorResponse('Your provider account is pending approval', 403)
      );
    }

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all services (with filtering & search)
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const { category, location, search, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const query = { isActive: true, isArchived: { $ne: true }, providerDeleted: { $ne: true } };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location (case-insensitive partial match)
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Text search on title/description
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const services = await Service.find(query)
      .populate('provider', 'name email phone avatar isActive')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    const formattedServices = services.map(s => {
      const obj = s.toObject();
      obj.isBookable = Boolean(
        obj.isActive && 
        !obj.isArchived && 
        !obj.providerDeleted &&
        obj.provider && 
        obj.provider.isActive !== false
      );
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formattedServices.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: formattedServices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby services (with Haversine distance & filtering)
// @route   GET /api/services/nearby
// @access  Public
exports.getNearbyServices = async (req, res, next) => {
  try {
    const { lat, lng, city, pincode, search, category, sort } = req.query;

    const query = { isActive: true, isArchived: { $ne: true }, providerDeleted: { $ne: true } };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    // Fetch prospective active services with lean() for performance
    const services = await Service.find(query)
      .populate('provider', 'name email phone avatar isActive')
      .lean();

    // Filter bookable services and calculate distances efficiently
    const validServices = services.reduce((acc, service) => {
      const isProviderActive = service.provider && service.provider.isActive !== false;
      const isBookable = service.isActive && !service.isArchived && !service.providerDeleted && isProviderActive;

      if (!isBookable) return acc;

      const updatedService = { ...service, isBookable };

      // Distance calculation if querying by lat/lng
      if (lat && lng) {
        const { location } = service;
        if (location && typeof location === 'object' && location.lat && location.lng) {
          const distance = calculateDistanceKm(
            Number(lat), 
            Number(lng), 
            Number(location.lat), 
            Number(location.lng)
          );
          if (distance !== null) {
            updatedService.distanceKm = distance;
            acc.push(updatedService);
          }
        }
      } 
      // Fallback search by string match if no lat/lng provided (manual search)
      else if (city || pincode) {
        const { location } = service;
        if (typeof location === 'string') {
          const locLow = location.toLowerCase();
          if ((city && locLow.includes(city.toLowerCase())) || (pincode && locLow.includes(pincode))) {
            acc.push(updatedService);
          }
        } else if (typeof location === 'object') {
          const cLow = (location.city || '').toLowerCase();
          const pLow = (location.pincode || '').toLowerCase();
          if ((city && cLow.includes(city.toLowerCase())) || (pincode && pLow === pincode)) {
            acc.push(updatedService);
          }
        }
      } else {
        // If no location parameters passed, return everything (base behavior)
        acc.push(updatedService);
      }
      return acc;
    }, []);

    // Perform array-based sorting 
    if (sort === 'nearest' && lat && lng) {
      validServices.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'cheapest') {
      validServices.sort((a, b) => a.price - b.price);
    } else if (sort === 'top-rated') {
      validServices.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    res.status(200).json({
      success: true,
      count: validServices.length,
      data: validServices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      'provider',
      'name email phone avatar isActive'
    );

    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    const serviceObj = service.toObject();
    serviceObj.isBookable = Boolean(
      serviceObj.isActive &&
      !serviceObj.isArchived &&
      !serviceObj.providerDeleted &&
      serviceObj.provider &&
      serviceObj.provider.isActive !== false
    );

    res.status(200).json({
      success: true,
      data: serviceObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider — owner only)
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    // Check ownership
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this service', 403));
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider — owner or Admin)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    // Check ownership or admin
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this service', 403));
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get services by logged-in provider
// @route   GET /api/services/my
// @access  Private (Provider)
exports.getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};
