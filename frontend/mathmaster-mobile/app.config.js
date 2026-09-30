const localApiUrl = 'http://192.168.0.148:8000';

module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE || 'development';
  const apiUrl = process.env.API_URL || (profile === 'development' ? localApiUrl : '');

  if (!apiUrl) {
    throw new Error(`API_URL is required for the ${profile} build profile`);
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl: apiUrl.replace(/\/$/, ''),
      useMockData: false,
    },
  };
};