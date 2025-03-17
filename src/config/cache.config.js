export default {
ttl: 86400, // 24 hours in seconds
checkPeriod: 1800, // 30 minutes in seconds
enabled: process.env.ENABLE_CACHE !== 'false'
};