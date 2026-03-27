const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per customer per service
reviewSchema.index({ customer: 1, service: 1 }, { unique: true });

// ---- Static method: Recalculate average rating for a service ----
reviewSchema.statics.calcAverageRating = async function (serviceId) {
  const result = await this.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Service = mongoose.model('Service');

  if (result.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Recalculate after save and remove
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.service);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.service);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
