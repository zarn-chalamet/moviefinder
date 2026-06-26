import { AnimatePresence, motion } from 'framer-motion';
import useAppStore from './store/appStore';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import MoviePosterStrip from './components/MoviePosterStrip';
import ChatPage from './components/ChatPage';
import TrendingPage from './components/TrendingPage';
import WatchlistPage from './components/WatchlistPage';
import AboutPage from './components/AboutPage';
import MovieDetailPage from './components/MovieDetailPage';
import Footer from './components/Footer';
import CTABanner from './components/CTABanner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <MoviePosterStrip />
      <CTABanner />
    </>
  );
}

function PageRenderer() {
  const { currentPage } = useAppStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'chat' && <ChatPage />}
        {currentPage === 'trending' && <TrendingPage />}
        {currentPage === 'watchlist' && <WatchlistPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'movie-detail' && <MovieDetailPage />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { currentPage } = useAppStore();
  const showFooter = currentPage !== 'chat';

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <main>
        <PageRenderer />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
