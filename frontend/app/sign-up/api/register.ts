import axios from "axios";
import { useRouter } from "next/navigation";
import { successToast, errorToast, warningToast } from "@/util/toastHelper";

const register = async (formData: FormData) => {
  const router = useRouter();
  try {
    const response = await axios.post(
      "http://localhost:8080/api/v1/auth/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    console.log("Response:", response.data);
    if (response.status === 200) {
      console.log(response.data);
      if (response.data == "User saved") router.push("/password-reset-link");
      else warningToast(response.data);
    } else {
      errorToast("Bad Response");
      console.error("Non-200 response:", response.status);
    }
  } catch (error) {
    errorToast("Some Error Occured");
    console.error("There was an error:", error);
  }
  console.table(formData);
};

export { register };
