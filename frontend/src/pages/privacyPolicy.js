import React from 'react';
import Footer from './footer';
import Header from './header';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-100">
            <Header />
            {/* Center the text content */}
            <div className="flex-grow flex items-center justify-center">
                {/* Text Content */}
                <div className="text-center p-8 bg-white rounded-md shadow-lg max-w-4xl">
                    <h1 dir="rtl" className="text-gray-800 text-4xl font-extrabold mb-6">מדיניות פרטיות</h1>
                    <p dir="rtl" className="text-m text-gray-500 mt-4">
                        אנו, באתר [SSE], מכבדים את פרטיות המשתמשים שלנו ומחויבים להגן על המידע האישי שאתם משתפים עמנו. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, שומרים ומגנים על המידע שלכם. שימושכם באתר מהווה הסכמה למדיניות זו.
                    </p>

                    <div dir="rtl" className="text-right mt-8">
                        <h2 className="text-lg font-bold text-gray-700">1. איסוף מידע</h2>
                        <p className="text-gray-500">
                            אנו עשויים לאסוף מידע אישי שאתם מוסרים מרצונכם, כמו שם, כתובת אימייל ומספר טלפון. כמו כן, אנו עשויים לאסוף מידע טכני כגון כתובת IP, סוג הדפדפן ומידע על השימוש שלכם באתר.
                        </p>

                        <h2 className="text-lg font-bold text-gray-700 mt-6">2. שימוש במידע</h2>
                        <p className="text-gray-500">
                            המידע שנאסף משמש לצורכי שיפור חוויית המשתמש, שליחת עדכונים שיווקיים (בהסכמתכם בלבד), וניתוח ביצועי האתר לצורך שיפור השירותים שלנו.
                        </p>

                        <h2 className="text-lg font-bold text-gray-700 mt-6">3. שיתוף מידע עם צד שלישי</h2>
                        <p className="text-gray-500">
                            אנו לא נשתף את המידע האישי שלכם עם צד שלישי למעט במקרים הבאים: שיתוף עם ספקי שירות המסייעים לנו בתפעול האתר, ציות לחוק או בקשות מגורמי אכיפת החוק.
                        </p>

                        <h2 className="text-lg font-bold text-gray-700 mt-6">4. שמירת מידע</h2>
                        <p className="text-gray-500">
                            אנו שומרים את המידע שלכם רק כל עוד הוא נדרש לצורך המטרות שצוינו במדיניות זו או כנדרש על פי חוק. בתום תקופה זו המידע יימחק או יהפוך לאנונימי.
                        </p>

                        <h2 className="text-lg font-bold text-gray-700 mt-6">5. הגנה על המידע</h2>
                        <p className="text-gray-500">
                            אנו נוקטים באמצעים טכנולוגיים וארגוניים מתקדמים כדי להגן על המידע שלכם מפני גישה בלתי מורשית, אובדן או שימוש לרעה.
                        </p>

                        <h2 className="text-lg font-bold text-gray-700 mt-6">6. זכויות המשתמש</h2>
                        <p className="text-gray-500">
                            אתם זכאים לגשת למידע האישי שלכם, לעדכן אותו או לבקש את מחיקתו. בנוסף, אתם רשאים להתנגד לשימושים מסוימים במידע שלכם. לבקשות בנושא, אנא צרו עמנו קשר.
                        </p>

                        <h2 className="text-lg font-bold text-gray-700 mt-6">7. יצירת קשר</h2>
                        <p className="text-gray-500">
                            אם יש לכם שאלות או בקשות בנוגע למדיניות פרטיות זו, אתם מוזמנים לפנות אלינו בכתובת האימייל: <strong>sse.team3@gmail.com</strong>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
