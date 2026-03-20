import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const next = i18n.language === 'he' ? 'fr' : 'he';
        i18n.changeLanguage(next);
        document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = next;
    };

    return (
        <Button variant="outline" size="sm" onClick={toggleLanguage}>
            {i18n.language === 'he' ? 'FR' : 'עב'}
        </Button>
    );
}
