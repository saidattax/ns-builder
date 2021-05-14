const fetch = require("node-fetch").default;

fetch("http://localhost:5035/websites/ns_vnCfsMJHVjAGH3X82764/pages?path=/")
    .then((r) => r.json())
    .then((d) => {
        console.log(d);
    });
