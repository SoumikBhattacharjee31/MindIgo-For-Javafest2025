import { ChangeEvent, useState } from "react";

interface ProfilePicInputFieldProps {
  setProfilePic: (profilePic: File | undefined) => void;
}

const validImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/tiff",
  "image/heif",
  "image/webp",
];

const ProfilePicInputField: React.FC<ProfilePicInputFieldProps> = ({
  setProfilePic,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setErrorMessage("Photos should be less than 4 MB.");
        e.target.value = ""; // Clear the input value
        setSelectedImage(undefined);
        setProfilePic(undefined);
      } else if (!validImageTypes.includes(file.type)) {
        setErrorMessage(
          "Photos should be JPG, PNG, GIF, TIFF, HEIF or WebP files."
        );
        e.target.value = ""; // Clear the input value
        setSelectedImage(undefined);
        setProfilePic(undefined);
      } else {
        // Further validate file content
        const reader = new FileReader();
        reader.onloadend = () => {
          const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(
            0,
            4
          );
          let header = "";
          for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
          }

          const validHeaders = [
            "ffd8ffe0", // jpg
            "ffd8ffe1", // jpg
            "ffd8ffe2", // jpg
            "ffd8ffe3", // jpg
            "ffd8ffe8", // jpg
            "89504e47", // png
            "47494638", // gif
            "49492a00", // tiff
            "4d4d002a", // tiff
            "00018a77", // heif
            "52494646", // webp
          ];

          if (validHeaders.includes(header)) {
            setSelectedImage(file);
            setProfilePic(file);
            setErrorMessage("");
          } else {
            setErrorMessage("The file content does not match its extension.");
            e.target.value = ""; // Clear the input value
            setSelectedImage(undefined);
            setProfilePic(undefined);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  return (
    <div className="mx-auto p-4 align-top flex justify-between">
      <div className="profile-picture-upload p-4 space-y-4">
        <label
          htmlFor="profile-picture-input"
          className="block text-sm font-medium text-gray-700"
        >
          Choose a Profile Picture
        </label>
        <input
          type="file"
          id="profile-picture-input"
          accept=".jpg,.jpeg,.png,.gif,.tiff,.heif,.webp"
          onChange={handleImageChange}
          className="hidden"
        />
        <label
          htmlFor="profile-picture-input"
          className="block w-full max-w-xs cursor-pointer"
        >
          <span className="block py-2 px-3 text-center bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Select a file
          </span>
        </label>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </div>
      <div className="form-control max-h-xl max-w-xl">
        <div className="avatar">
          <div className="w-32 rounded-full">
            <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : "noimage.png"
              }
              alt="Selected"
              className="rounded-full shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePicInputField;
