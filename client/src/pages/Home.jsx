import { Link } from 'react-router-dom';
import { HiSearch, HiArrowRight, HiShieldCheck, HiClock, HiStar } from 'react-icons/hi';
import {
  HiWrenchScrewdriver, HiBolt, HiSparkles, HiPaintBrush,
  HiCube, HiCog6Tooth, HiAcademicCap
} from 'react-icons/hi2';

const categories = [
  { name: 'Plumber', slug: 'plumber', icon: HiWrenchScrewdriver, color: 'from-blue-500 to-cyan-500' },
  { name: 'Electrician', slug: 'electrician', icon: HiBolt, color: 'from-yellow-500 to-orange-500' },
  { name: 'Cleaner', slug: 'cleaner', icon: HiSparkles, color: 'from-emerald-500 to-teal-500' },
  { name: 'Painter', slug: 'painter', icon: HiPaintBrush, color: 'from-purple-500 to-pink-500' },
  { name: 'Carpenter', slug: 'carpenter', icon: HiCube, color: 'from-amber-600 to-yellow-600' },
  { name: 'Mechanic', slug: 'mechanic', icon: HiCog6Tooth, color: 'from-red-500 to-rose-500' },
  { name: 'Tutor', slug: 'tutor', icon: HiAcademicCap, color: 'from-indigo-500 to-violet-500' },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-900 to-dark-900"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
              <HiShieldCheck className="w-4 h-4" />
              Trusted by thousands of customers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Find Local Services
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Around You
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-dark-100 max-w-2xl mx-auto mb-10">
              Connect with verified plumbers, electricians, cleaners, and more.
              Book trusted professionals in your area with just a few clicks.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto px-8 sm:px-4">
              <Link
                to="/services"
                className="flex items-center gap-3 glass px-5 py-4 cursor-pointer
                  hover:border-primary-500/30 transition-all duration-300 group"
              >
                <HiSearch className="w-5 h-5 text-dark-200 group-hover:text-primary-400 transition-colors" />
                {/* <span className="text-dark-200 flex-1 text-left">Search for a service or category...</span> */}
                <span className="text-dark-200 flex-1 text-left">
                  <span className="block sm:hidden">Search for a service</span>
                  <span className="hidden sm:block">Search for a service or category...</span>
                </span>
                <span className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1">
                  Search <HiArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Browse by Category</h2>
          <p className="text-dark-200">Choose from our wide range of local services</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <Link
              key={cat.slug}
              to={`/services?category=${cat.slug}`}
              className="card-glow text-center group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${cat.color}
                flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <cat.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-dark-200">Get started in 3 simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: HiSearch,
              title: 'Search',
              desc: 'Browse our extensive list of verified local service providers by category or location.',
            },
            {
              step: '02',
              icon: HiClock,
              title: 'Book',
              desc: 'Choose your preferred time slot and book the service in seconds.',
            },
            {
              step: '03',
              icon: HiStar,
              title: 'Review',
              desc: 'After the service is completed, leave a rating and review to help others.',
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className="relative card text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 rounded-full text-xs font-bold">
                Step {item.step}
              </div>
              <div className="w-16 h-16 mx-auto mt-4 mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <item.icon className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-dark-100">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-primary-900/10"></div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Are You a Service Provider?
            </h2>
            <p className="text-dark-100 mb-8 max-w-xl mx-auto">
              Join thousands of professionals on Around-You. Grow your business, manage bookings, and connect with customers in your area.
            </p>
            <Link
              to="/register"
              className="btn-primary text-base inline-flex items-center gap-2"
            >
              Register as Provider <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-dark-200 text-sm">
            © {new Date().getFullYear()} Around-You. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
