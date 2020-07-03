const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const server = http.createServer( (req, res) => {
  if (req.method === 'POST') {
    collectRequestData(req, parsedData => {
      console.log(parsedData);
      addToDB("DB.txt", parsedData);
    });
  }
  let filePath = path.join(__dirname, 'serverFiles', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  let contentType = '';

  switch (ext) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    default:
      contentType = 'text/html';
  }

  if (!ext) {
    filePath += '.html';
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'serverFiles', 'err.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error.');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          });
          res.end(data);
        }
      })
    } else {
      res.writeHead(200, {
        'Content-Type': contentType
      })
      res.end(content);
    }
  })
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server has been started on port: ${PORT}!`)
});

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

function addToDB(nameDB, data) {
  if (fs.existsSync(nameDB)) {
    fs.appendFile(nameDB, `id: ${data.id}\tname: ${data.name}\n`, 'ascii', function(error){
      if(error) throw error;
    });
  } else {
    fs.writeFile(nameDB, `id: ${data.id}\tname: ${data.name}\n`, 'ascii', function(error){
      if(error) throw error;
    });
  }
}
