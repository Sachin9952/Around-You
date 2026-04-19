import React from 'react';
import ServiceCard from '../components/ServiceCard';

const mockServices = [
  {
    _id: "1",
    providerName: "Amazon Home Services",
    avatar: "https://ui-avatars.com/api/?name=Amazon+Home&background=random",
    status: "5 days ago",
    title: "Senior AC Repair Specialist",
    tags: ["Part-time", "Senior level"],
    price: "₹1,200/hr",
    location: "New Delhi, DL"
  },
  {
    _id: "2",
    providerName: "Google Fixes",
    avatar: "https://ui-avatars.com/api/?name=Google+Fixes&background=random",
    status: "30 days ago",
    title: "Expert Plumber",
    tags: ["Full-time", "Flexible schedule"],
    price: "₹1,500 - ₹2,200",
    location: "Mountain View, CA"
  },
  {
    _id: "3",
    providerName: "Dribbble Cleaners",
    avatar: "https://ui-avatars.com/api/?name=Dribbble+Cleaners&background=random",
    status: "18 days ago",
    title: "Premium Home Deep Cleaning",
    tags: ["Contract", "Remote setup"],
    price: "₹850/hr",
    location: "San Francisco, CA"
  },
  {
    _id: "4",
    providerName: "Meta Electricals",
    avatar: "https://ui-avatars.com/api/?name=Meta+Electricals&background=random",
    status: "3 months ago",
    title: "Master Electrician",
    tags: ["Full-time", "In-office"],
    price: "₹2,000 - ₹2,500",
    location: "New York, NY"
  },
  {
    _id: "5",
    providerName: "Airbnb Handyman",
    avatar: "https://ui-avatars.com/api/?name=Airbnb+Handyman&background=random",
    status: "1 day ago",
    title: "Junior Furniture Assembly",
    tags: ["Contract", "Mobile"],
    price: "₹1,000/hr",
    location: "San Francisco, CA"
  },
  {
    _id: "6",
    providerName: "Apple Repairs",
    avatar: "https://ui-avatars.com/api/?name=Apple+Repairs&background=random",
    status: "6 days ago",
    title: "Appliance Repair Tech",
    tags: ["Full-time", "Flexible schedule"],
    price: "₹850 - ₹1,200",
    location: "Cupertino, CA"
  }
];

const CardsDemo = () => {
  return (
    <div className="bg-[#F8F9FA] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Listings</h1>
          <p className="text-gray-500">Premium job-board style cards for our service marketplace.</p>
        </div>

        {/* Grid Layout Requirement: desktop: 3 cards, tablet: 2 cards, mobile: 1 card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mockServices.map((service) => (
             <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardsDemo;
