'use client'
import { useSelector, useDispatch } from 'react-redux';

const Profile = () =>{
    const user = useSelector((state: any) => state.userState.user);
    return (
        <div className='text-blue-400'>
            {user.name}
        </div>
    );
}
export default Profile;