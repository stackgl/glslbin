var useAmazon = !!(
     process.env.AWS_SECRET_KEY
  && process.env.AWS_ACCESS_KEY
)

module.exports = useAmazon
  ? require('./storage-s3')()
  : require('./storage-local')()
