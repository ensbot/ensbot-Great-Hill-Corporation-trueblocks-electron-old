const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 8090;
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  

app.get('/export', (req, res) => {
    
	let filename;
	switch(req.query.address) {
		case "0x5adf43dd006c6c36506e2b2dfa352e60002d22dc":
			filename = "giveth-json.json";
			break;
		case "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359":
			filename = "testexport.json";
			break;
		default:
			return res.send({"status": "error"});
			break;
}
	
    let readStream = fs.createReadStream(`./data/${filename}`);

    readStream.on('close', () => {
        res.end()
    })

    readStream.pipe(res)
})

app.listen(port, () => {
    console.log('We are live on ' + port);
});
