require("dotenv").config();

const config = {
  projectId: process.env.BIG_QUERY_PROJECT_ID,
  credentials: {
    client_email: process.env.BIG_QUERY_CLIENT_EMAIL,
    private_key: process.env.BIG_QUERY_PRIVATE_KEY
  }
};

export default config;
