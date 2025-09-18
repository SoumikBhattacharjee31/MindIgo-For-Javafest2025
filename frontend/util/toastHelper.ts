import { Bounce, toast, ToastOptions } from 'react-toastify';

// Define the common options in one place
const toastOptions: ToastOptions = {
  position: 'bottom-center',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
  transition: Bounce,
};

// Reuse the options object for each toast type
const successToast = (text: string): void => {
  toast.success(text, toastOptions);
};

const errorToast = (text: string): void => {
  toast.error(text, toastOptions);
};

const warningToast = (text: string): void => {
  toast.warn(text, toastOptions);
};

const infoToast = (text: string): void => {
  toast.info(text, toastOptions);
};

export { successToast, errorToast, warningToast, infoToast };