var mongoose = require("mongoose");
// שמירת התמונה כבאפיר משמעותה שמירת התמונה כנתונים בינאריים ישירות במסד הנתונים למקום לשמור אותה כקובץ במערכת הקבצים או בשרת חיצוני
// בדרך זו אנו מאחסנים את כל המידע הבינארי של התמונה בתוך שדה של המסמך במונגו
// כאשר התמונה מועלת למערכת, יא נשמרת בזיכרון באמצעות ספריית מולטיר לאחר מכן המידע של התמונה שהוא בעצם רצף של ביטים אפסים ואחדים מומר למבנה בינארי שנקרא באפיר מבנה זה מאוחסן ישירות במונגו
var productSchema = mongoose.Schema({
  expirationDate: Date,
  status: String,
  name: String,
  sku: String, // stock keeping unit - makat we will use it as an id of the product
  price: Number,
  amount: {
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});
var Product = mongoose.model("Product", productSchema);
module.exports = Product;
