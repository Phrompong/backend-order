import path from "path";

var https = require("https");
var fs = require("fs");
var express = require("express");

// const https_options = {
//   cert: fs.readFileSync(path.join(__dirname, "/csrFile.crt")),
//   key: fs.readFileSync(path.join(__dirname, "/privateFile.key")),
//   //ca: fs.readFileSync(path.join(__dirname, "/all.crt")),
// };

var app = express();
var port = process.env.PORT || 443;
var server = https.createServer(
  {
    cert: fs.readFileSync(
      path.join(__dirname, "/etc/httpd/ssl/134_209_108_248.crt")
    ),
    key: fs.readFileSync(path.join(__dirname, "/etc/httpd/ssl/private.key")),
    ca: fs.readFileSync(
      path.join(__dirname, "etc/httpd/ssl/CARootCertificate-ca.crt")
    ),
  },
  app
);

server.listen(3000, () => console.log("server running"));

export default app;
