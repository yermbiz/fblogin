module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "globals": {
      "require": true,
      "process": true,
      "__dirname": true,
      "global": true,
      "module": true,
      "FB": true,
      "$": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
