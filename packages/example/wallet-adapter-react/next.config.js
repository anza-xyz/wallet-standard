/* eslint-disable @typescript-eslint/no-var-requires */
const plugins = require('next-compose-plugins');
const antdLess = require('next-plugin-antd-less');

module.exports = function (phase, ...args) {
    return plugins(
        [
            [
                antdLess,
                {
                    modifyVars: {
                        '@background': '#303030',
                        '@primary-color': '#512da8',
                    },
                },
            ],
        ],
        {
            reactStrictMode: true,
        }
    )(phase, ...args);
};
