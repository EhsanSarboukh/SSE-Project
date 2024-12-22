import { useLocation } from 'react-router-dom';

const CustomerDetails = () => {

  const location = useLocation();
  const { foundProducts } = location.state || { foundProducts: [] };
  const { total } = location.state || { total:0};


 
  console.log("Found Products:", foundProducts);
  console.log("total price of the order:", total);


  return (
    <div>
      {/* Render customer details and products here */}
    </div>
  );
};

export default CustomerDetails;
