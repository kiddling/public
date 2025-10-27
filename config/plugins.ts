export default ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 1000000,
      },
    },
  },
  // TODO: Configure Aliyun/Tencent OSS provider for production
});
