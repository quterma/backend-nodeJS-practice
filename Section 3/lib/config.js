/*
 * Create and export configuration variables
 *
 */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
	httpPort: 3000,
	httpsPort: 3001,
	envName: "staging",
	hashingSecret: "thisIsASecret",
};

// Production environment
environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	envName: "production",
	hashingSecret: "thisIsASecret",
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = process.env.NODE_ENV ? process.env.NODE_ENV : "";

// Check thet the current env is one of the env above, if not, default to staging
const environmentToExport = environments[currentEnvironment] ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
