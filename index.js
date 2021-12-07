import app from './app.js';

const port = process.env.PORT || 9973;

app.get('/', (req, res) => {
  res.send("I am going to become the King of the Pirates. If this means I will die on the journey, so be it!")
})

app.listen(port, () => {
  console.log("I am going to become the King of the Pirates. If this means I will die on the journey, so be it!")
  console.log(`Listing on port ${port}`)
});