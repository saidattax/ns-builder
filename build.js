require("dotenv").config();
// get website.json
const fetch = require("node-fetch").default;

function setupWebsiteJSON() {
    return new Promise((resolve, reject) => {
        if (!process.env.SITE_ID) {
            reject("Error, no site ID found");
        }

        fetch(
            process.env.NS_BASE_API_URL +
                process.env.NS_BUILD_EP +
                "/" +
                process.env.NS_SITE_ID
        )
            .then((res) => {
                res.json()
                    .then((json) => {
                        if (json.s) {
                            resolve(json.payload);
                        } else {
                            reject("API Error");
                        }
                    })
                    .catch((err) => reject(err));
            })
            .catch((err) => reject(err));
    });
}

function execute(command) {
    const exec = require("child_process").exec;
    return exec(command, function (error, stdout, stderr) {
        if (error) {
            throw error;
        }
        console.log(stdout);
    });
}

setupWebsiteJSON()
    .then((websiteJson) => {
        console.log("GOT websiteJson", websiteJson);
        const fs = require("fs");
        fs.writeFile(
            "./website.json",
            JSON.stringify(websiteJson),
            function (err) {
                if (err) {
                    console.error("[nsbuild]", err);
                    return;
                }
                console.log("[nsbuild] The JSON was saved!");

                execute("yarn build");
            }
        );
    })
    .catch((err) => {
        console.error("[nsbuild]", err);
        process.exit(1);
    });

// --------------------

/* function setupWebsiteJSONOld() {
    return new Promise((s, e) => {
        const https = require("http");

        let id;

        process.argv.forEach(function (val, index, array) {
            // console.log(index + ": " + val);
            if (typeof val === "string" && val.includes("SITE-")) {
                id = val;
            }
        });

        if (id) {
            const options = {
                hostname: process.env.MY_HOST,
                port: process.env.MY_PORT,
                path: process.env.BUILD_PATH + id,
                method: "GET",
            };

            let output = "";

            const req = https.request(options, (res) => {
                console.log(`statusCode: ${res.statusCode}`);

                res.on("data", (chunk) => {
                    output += chunk;
                });

                res.on("end", () => {
                    s(output);
                });
            });

            req.on("error", (error) => {
                e(error);
            });

            req.end();
        } else {
            e("No website id found!");
        }
    });
} */
