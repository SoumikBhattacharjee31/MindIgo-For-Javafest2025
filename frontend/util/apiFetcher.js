import axios from 'axios'

const apiPOST = async (url,reqBody, errorMessage)=>{

    try{
        const response = await axios.post('http://localhost:8080/api/'+url,reqBody,{ withCredentials: true });
    }
    catch (error) {
        console.error('There was an error:', error);
    }
}

export {apiPOST};