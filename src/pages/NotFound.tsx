import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t, direction } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

   return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={direction}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('error.notFound')}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('misc.back')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
