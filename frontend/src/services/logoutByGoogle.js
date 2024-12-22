import {GoogleLogout} from 'react-google-login';
import {useNavigate} from 'react-router-dom';

const clientId = "112488383631-2isgjo1ohk5b1pev08n103gc63govtpe.apps.googleusercontent.com";

const LogoutByGoogle = ()=>{
    const navigate = useNavigate();

    const onSuccess = (res)=>{
        localStorage.removeItem('token');

        navigate('/');
        console.log("Log out successfull!");
    }

   return (
        <div>
                    <GoogleLogout 
                        clientId={clientId}
                        buttonText="Logout"
                        onLogoutSuccess={onSuccess}
                     
                    />
        </div>
   );
}
export default LogoutByGoogle;
