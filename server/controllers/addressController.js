const Address = require('../models/Address');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a saved address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res, next) => {
  try {
    const {
      label,
      fullAddress,
      area,
      houseFlatBuilding,
      floorLandmark,
      instructions,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    // Validate fields
    if (!label || !fullAddress || !area || !houseFlatBuilding || latitude === undefined || longitude === undefined) {
      return next(new ErrorResponse('Please provide all required fields including coordinates', 400));
    }

    // If this address is set as default, clear other default addresses first
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user.id,
      label,
      fullAddress,
      area,
      houseFlatBuilding,
      floorLandmark: floorLandmark || '',
      instructions: instructions || '',
      latitude,
      longitude,
      isDefault: !!isDefault,
    });

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's saved addresses
// @route   GET /api/addresses/my
// @access  Private
exports.getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a saved address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorResponse('Address not found', 404));
    }

    // Make sure user owns the address
    if (address.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this address', 403));
    }

    const {
      label,
      fullAddress,
      area,
      houseFlatBuilding,
      floorLandmark,
      instructions,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    // If this address is set as default, clear other default addresses first
    if (isDefault && !address.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(
      req.params.id,
      {
        label: label || address.label,
        fullAddress: fullAddress || address.fullAddress,
        area: area || address.area,
        houseFlatBuilding: houseFlatBuilding || address.houseFlatBuilding,
        floorLandmark: floorLandmark !== undefined ? floorLandmark : address.floorLandmark,
        instructions: instructions !== undefined ? instructions : address.instructions,
        latitude: latitude !== undefined ? latitude : address.latitude,
        longitude: longitude !== undefined ? longitude : address.longitude,
        isDefault: isDefault !== undefined ? !!isDefault : address.isDefault,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a saved address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorResponse('Address not found', 404));
    }

    // Make sure user owns the address
    if (address.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this address', 403));
    }

    await Address.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set default saved address
// @route   PATCH /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorResponse('Address not found', 404));
    }

    // Make sure user owns the address
    if (address.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to modify this address', 403));
    }

    // Clear all other defaults
    await Address.updateMany({ user: req.user.id }, { isDefault: false });

    // Set this one as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (err) {
    next(err);
  }
};
