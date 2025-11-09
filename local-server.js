// Small helper to run the Express app locally with stage selection
const app = require('./handler').app;
const port = process.env.PORT || 3000;
const stage = process.env.SLS_STAGE || process.env.NODE_ENV || 'dev';

app.listen(port, () => {
  console.log(`workshop-auth listening on http://localhost:${port} (stage=${stage})`);
});
