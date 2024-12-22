import React from 'react';
import Footer from './footer';
import Header from './header';

const About = () => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-100">
            <Header />
            
        <div class="2xl:container 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4">
            <div class="flex flex-col lg:flex-row justify-between gap-8">
                <div class="w-full lg:w-5/12 flex flex-col justify-center">
                    <h1 dir="rtl" class="text-3xl lg:text-3xl font-bold leading-9 text-gray-800 dark:text-black pb-4">אודות SSE - הפתרון הדיגיטלי שלך






</h1>
                    <p dir="rtl" class="font-normal text-base leading-6 text-gray-600 dark:text-black">SSE מתמחה בהפיכת החזון הדיגיטלי שלך למציאות, עם פתרונות פיתוח אתרים מקצה לקצה המותאמים אישית לצרכים הייחודיים של העסק שלך. אנו יוצרים אתרים ידידותיים למשתמש, מעוצבים בקפידה ובעלי ביצועים גבוהים, המותאמים להווה ולצמיחה העתידית שלך. בנוסף, אנו מספקים כלי אנליטיקה מתקדמים המאפשרים הבנה מעמיקה של התנהגות המשתמשים באתר, כדי לשפר מעורבות, להגדיל המרות ולעמוד ביעדים העסקיים שלך. שירותי SSE כוללים ליווי מלא – משלב העיצוב ועד ההשקה, כולל אחסון, תחזוקה ותמיכה לאחר השקה, כך שכל מה שאתה צריך לנוכחות דיגיטלית מצליחה נמצא במקום אחד.</p>
                </div>
                <div class="w-full lg:w-8/12">
                <img className="w-full h-full" src="/images/aboutSSE.jpg" alt="A group of People" />
                </div>
            </div>
    
            <div class="flex lg:flex-row flex-col justify-between gap-8 pt-12">
                <div class="w-full lg:w-5/12 flex flex-col justify-center">
                    <h1 class="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 dark:text-black pb-4">הסיפור שלנו</h1>
                    <p dir ="rtl" class="font-normal text-base leading-6 text-gray-600 dark:text-black">שלושה מהנדסי תוכנה, שלוש נקודות מבט, חזון אחד. ספואן חלבי מדאלית אל-כרמל, אחסאן סרבוח מבית ג'ן וסביל חמוד מירכא – כל אחד מאיתנו מביא איתו סיפור ייחודי, ידע מקצועי וחלום משותף. נפגשנו במהלך לימודי התואר הראשון בהנדסת תוכנה, ומאז הפכנו לצוות בלתי מנוצח. יחד, אנחנו משלבים יצירתיות, טכנולוגיה ותשוקה כדי לפתח פתרונות חכמים, חדשניים ומותאמים אישית, שמביאים עסקים לרמה הבאה בעולם הדיגיטלי. עבורנו, כל פרויקט הוא מסע חדש להגשמת מטרות הלקוחות שלנו, בדרך הכי יעילה ומדויקת.</p>
                </div>
                <div class="w-full lg:w-6/12 lg:pt-8 mx-auto">
    <div class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 shadow-lg rounded-md justify-center items-center">
        <div class="p-4 pb-6 flex justify-center flex-col items-center">
            <img class="md:block hidden" src="images/software-engineer.png" alt="Safwan featured Image" />
            <img class="md:hidden block" src="images/software-engineer.png" alt="Safwan featured Image" />
            <p class="font-medium text-xl leading-5 text-gray-800 dark:text-black mt-4">SE.Safwan Halabi</p>
        </div>
        <div class="p-4 pb-6 flex justify-center flex-col items-center">
            <img class="md:block hidden" src="images/software-engineer.png" alt="Ehsan featured Image" />
            <img class="md:hidden block" src="images/software-engineer.png" alt="Ehsan featured Image" />
            <p class="font-medium text-xl leading-5 text-gray-800 dark:text-black mt-4">SE.Ehsan Sarboukh</p>
        </div>
        <div class="p-4 pb-6 flex justify-center flex-col items-center">
            <img class="md:block hidden" src="images/programmer.png" alt="Sabeel featured Image" />
            <img class="md:hidden block" src="images/programmer.png" alt="Sabeel featured Image" />
            <p class="font-medium text-xl leading-5 text-gray-800 dark:text-black mt-4">SE.Sabeel Hamood</p>
        </div>
    </div>
</div>

            </div>
        </div>
    
            <Footer />
        </div>
    );
};

export default About;
