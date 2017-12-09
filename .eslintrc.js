module.exports = {
    "extends": "airbnb",
    "rules": {
            "jsx-a11y/anchor-is-valid": [ "error", {
                    "components": [ "Link" ],
                    "specialLink": [ "hrefLeft", "hrefRight", "to" ],
                    "aspects": [ "noHref", "invalidHref", "preferButton" ],
                    "arrow-body-style": ["error", "as-needed"]
                }],
              "comma-dangle": [0],
              "arrow-parens": [2, "as-needed", {
                "requireForBlockBody": false
              }],
              "no-console": [0]
    }
}