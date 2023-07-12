require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const errorHandler = require('errorhandler');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const uaParser = require('ua-parser-js');
const Prismic = require('@prismicio/client');
const PrismicH = require('@prismicio/helpers');

const app = express();
const port = 3000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(errorHandler());

app.use(express.static(path.join(__dirname, 'dist')));

const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch,
  });
};

const HandleLinkResolver = (doc) => {
  if (doc.type === 'project') {
    return `/projects/${doc.uid}`;
  }

  if (doc.type === 'about') {
    return '/about';
  }

  return '/';
};

app.use((req, res, next) => {
  const ua = uaParser(req.headers['user-agent']);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isTablet = ua.device.type === 'tablet';
  res.locals.isPhone = ua.device.type === 'mobile';

  res.locals.PrismicH = PrismicH;
  res.locals.Link = HandleLinkResolver;

  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const handleRequest = async (api) => {
  const home = await api.getSingle('home');

  return { home };
};

app.get('/', async (req, res) => {
  const api = initApi(req);

  const defaults = await handleRequest(api);

  res.render('pages/home', { ...defaults });
});

app.get('/about', async (req, res) => {
  const api = initApi(req);

  const defaults = await handleRequest(api);

  const about = await api.getSingle('about');

  res.render('pages/about', { ...defaults, about });
});

app.get('/projects/:id', async (req, res) => {
  const api = initApi(req);

  const defaults = await handleRequest(api);

  const project = await api.getByUID('project', req.params.id);

  console.log(project.data.description[0].spans);

  res.render('pages/project', { ...defaults, project });
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
