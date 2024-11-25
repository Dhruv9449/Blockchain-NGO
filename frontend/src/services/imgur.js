const IMGUR_CLIENT_ID = "c197c1c5909fa3a";

export const uploadToImgur = async (file) => {
  // Convert file to base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Get the base64 string by removing the data URL prefix
      const base64String = reader.result.replace(/^data:.+;base64,/, "");
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });

  const formData = new FormData();
  formData.append("image", base64);
  formData.append("type", "base64"); // Specify that we're sending base64
  formData.append("title", "NGO Upload");
  formData.append("description", "Uploaded via NGO Dashboard");

  try {
    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.data?.error || "Failed to upload image");
    }

    return data.data.link;
  } catch (error) {
    console.error("Error uploading to Imgur:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};
