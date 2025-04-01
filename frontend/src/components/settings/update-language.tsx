import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import Cookies from 'js-cookie';

export function UpdateLanguage() {
  const navigate = useNavigate();
  const { user, updateUser, updateLanguage } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    
    if (!lang || (lang !== 'en' && lang !== 'fr')) {
      navigate('/');
      return;
    }

    // Update the cookie for non-authenticated users
    Cookies.set('preferred_lang', lang);

    // Update the user's language preference if they're logged in
    if (user) {
      updateLanguage(lang as 'en' | 'fr');
    }

    // Redirect back to home
    navigate('/');
  }, [user, navigate, updateLanguage]);

  return null; // This component doesn't render anything
}
