const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'flkdsjflkdfalsk',
    maxChecks: 5,
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'orkdfdkujrioe',
    maxChecks: 5,
};

const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// environment to export
module.exports = environmentToExport;
