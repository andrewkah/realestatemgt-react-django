import { AuthContext } from '@/context/AuthContext';
import { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const PropertyEntryGate = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { isAuthenticated, user } = useContext(AuthContext);

    useEffect(() => {
        // Not logged in
        if (!isAuthenticated) {
            navigate("/capture-lead/" + params.propertyType, { replace: true });
            return;
        }

        // Logged in but not an admin
        if (user?.profile?.role !== params.propertyType) {
            console.log(user?.profile?.role, params.propertyType);
            navigate("/capture-lead/" + params.propertyType, { replace: true });
            return;
        }
        
        // Allowed
        navigate("/dashboard/"+params.propertyType, { replace: true });
    }, [isAuthenticated, user, navigate, params.propertyType]);
  return (
    <div className='text-primary flex justify-center items-center'>Checking access...</div>
  )
}

export default PropertyEntryGate