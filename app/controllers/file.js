const fs = require('fs').promises;

const filePath = './image.png'

const createfilepayload = async (query, vars) => {

    const map = {"image":"variables.file"};

    let data = "";
    let boundary = "xxxxxxxxxxxxxxx";
    const datafile = await fs.readFile(filePath);
    // construct query part
    data += "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"query\"; \r\n";
    data += "Content-Type:application/json\r\n\r\n";
    data += "\r\n" + query + "\r\n";
    
    // construct variables part
    data += "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"variables\"; \r\n";
    data += "Content-Type:application/json \r\n\r\n";
    data += "\r\n" + JSON.stringify(vars)  + "\r\n";

    // construct map part
    data += "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"map\"; \r\n";
    data += "Content-Type:application/json\r\n\r\n";
    data += "\r\n" + JSON.stringify(map)+ "\r\n";

    // construct file part - the name needs to be the same as passed in the map part of the request. So if your map is {"image":"variables.file"}, the name should be image.
    data += "--" + boundary + "\r\n";
    data += "Content-Disposition: form-data; name=\"image\"; filename=\"" + filePath + "\"\r\n";
    data += "Content-Type:application/octet-stream\r\n\r\n";
    let payload = Buffer.concat([
            Buffer.from(data, "utf8"),
            new Buffer.from(datafile, 'binary'),
            Buffer.from("\r\n--" + boundary + "--\r\n", "utf8"),
    ]);
    return { payload, boundary };
}

module.exports = createfilepayload;