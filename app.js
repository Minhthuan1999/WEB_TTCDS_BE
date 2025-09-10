const express = require("express");
const path = require("path")


const cors = require("cors");

const cookieParser = require('cookie-parser')

const jwtMiddleware = require('./middleware/auth');

const multer = require('multer')

const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

//socket library
const http = require('http').Server(app);


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

//Route import
const user = require("./routes/UserRoute");
const service = require("./routes/ServiceRoute")
const news = require("./routes/NewsRoute")
const portal = require("./routes/PortalRoute")
const contact = require("./routes/ContactRoute")
const attach = require("./routes/AttachmentRoute")
const media = require("./routes/MediaRoute")
const outline = require("./routes/OutlineRoute")
const training = require("./routes/TrainingRoute")
const sys = require("./routes/AppRoute")
const documentRoutes = require('./routes/DocumentRoute');
const categories = require('./routes/CategoriesRoute');
const targetRoute = require("./routes/TargetRoute");
const headerRoute = require("./routes/HeaderRoute");
const FooterRoute = require("./routes/FooterRoute");
const PublicationRoute = require('./routes/PublicationRoute');
const DepartmentRoute = require('./routes/DepartmentRoute');
const Staff = require('./routes/StaffRoute');
const Statistics = require('./routes/StatisticsRoute');
const StatisticsCategory = require('./routes/StatisticsCategoryRoute');
// API
app.use("/api/app", sys);

app.use("/api/user", user);

app.use("/api/service", service);

app.use("/api/news", news);

app.use("/api/portal", portal);

app.use("/api/contact", contact);

app.use("/api/attached", attach);

app.use("/api/gallery", media);

app.use("/api/outline", outline);

app.use("/api/training", training);

app.use('/api/document', documentRoutes);

app.use('/api/categories',categories );

app.use("/api/targets", targetRoute);

app.use("/api/headers", headerRoute);

app.use("/api/footers", FooterRoute);

app.use('/api/publication', PublicationRoute);

app.use('/api/department', DepartmentRoute);

app.use('/api/staff', Staff);

app.use('/api/statistics', Statistics);

app.use('/api/statistics', StatisticsCategory);
//API - Image store
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = http;
