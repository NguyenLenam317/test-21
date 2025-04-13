import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Dashboard from '@/components/dashboard/Dashboard';
import Survey from '@/components/survey/Survey';

const Home = () => {
  const { user, hasSurveyCompleted, setHasSurveyCompleted } = useUser();
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    // Show survey if user hasn't completed it yet
    if (user && !hasSurveyCompleted) {
      setShowSurvey(true);
    }
  }, [user, hasSurveyCompleted]);

  const handleSurveyComplete = () => {
    setShowSurvey(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {showSurvey && (
          <Survey onComplete={handleSurveyComplete} />
        )}
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
