import axios from "axios";

export const createAiSensyContact = async ({ name, mobile_number }) => {
  try {
    const response = await axios.post(
      `https://apis.aisensy.com/project-apis/v1/project/${process.env.AISENSY_PROJECT_ID}/contact`,
      {
        name,
        mobile_number,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-AiSensy-Project-API-Pwd": process.env.AISENSY_API_KEY,
        },
      }
    );
    // console.log("AiSensy Contact Created:", response.data);
    return response.data;
  } catch (error) {
    console.error("AiSensy Contact Error:", error?.response?.data || error.message);
    throw error;
  }
};