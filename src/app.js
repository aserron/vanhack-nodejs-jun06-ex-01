const { createService } = require("./quote-service.js");
// import {createService} from ("./quote-service.js");
const app = createService();

// app.listen(3000);
// const app = express();

// your beautiful code...

// if (process.env.NODE_ENV === 'production') {
//     app.listen(3000)
// }
const createViteNodeApp = app
module.exports = app;
