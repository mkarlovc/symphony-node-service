var exports = module.exports = {};
var fs = require('fs');
exports.data = {};
exports.data.opec = JSON.parse(fs.readFileSync('../data/opec/OPEC-ORB1.json', 'utf8'));
exports.data.barrel_geo = JSON.parse(fs.readFileSync('../data/opec/Barrel.geo.json', 'utf8'));
exports.data.oil_news = JSON.parse(fs.readFileSync('../data/opec/Oil.news.json', 'utf8'));
exports.data.barrel_geo_tp = JSON.parse(fs.readFileSync('../data/opec/Barrel.geo.tp.json', 'utf8'));
exports.data.oil_news_tp = JSON.parse(fs.readFileSync('../data/opec/Oil.news.tp.json', 'utf8'));
exports.data.barrel_news_tp = JSON.parse(fs.readFileSync('../data/opec/Barrel.news.tp.json', 'utf8'));
exports.data.oil_soicial_tp = JSON.parse(fs.readFileSync('../data/opec/Oil.social.tp.json', 'utf8'));
exports.data.barrel_social_tp = JSON.parse(fs.readFileSync('../data/opec/Barrel.social.tp.json', 'utf8'));
exports.data.opec_geo_tp = JSON.parse(fs.readFileSync('../data/opec/OPEC.geo.tp.json', 'utf8'));
exports.data.bank_news_tp = JSON.parse(fs.readFileSync('../data/opec/Central bank.news.tp.json', 'utf8'));
exports.data.opec_social_tp = JSON.parse(fs.readFileSync('../data/opec/OPEC.social.tp.json', 'utf8'));
exports.data.bank_social_tp = JSON.parse(fs.readFileSync('../data/opec/Central bank.social.tp.json', 'utf8'));
exports.data.petroleum_geo_tp = JSON.parse(fs.readFileSync('../data/opec/Petroleum industry.geo.tp.json', 'utf8'));
exports.data.bank_social_tp = JSON.parse(fs.readFileSync('../data/opec/Central bank.social.tp.json', 'utf8'));
exports.data.industry_geo_tp = JSON.parse(fs.readFileSync('../data/opec/Petroleum industry.geo.tp.json', 'utf8'));
// social
exports.data.barrel_social = JSON.parse(fs.readFileSync('../data/opec/Barrel.social.json', 'utf8'));
exports.data.dollar_social = JSON.parse(fs.readFileSync('../data/opec/Dollar.social.json', 'utf8'));
exports.data.energy_social = JSON.parse(fs.readFileSync('../data/opec/Energy.social.json', 'utf8'));
exports.data.gasoline_social = JSON.parse(fs.readFileSync('../data/opec/Gasoline.social.json', 'utf8'));
exports.data.oil_social = JSON.parse(fs.readFileSync('../data/opec/Oil.social.json', 'utf8'));
// news
exports.data.barrel_news = JSON.parse(fs.readFileSync('../data/opec/Barrel.news.json', 'utf8'));
exports.data.dollar_news = JSON.parse(fs.readFileSync('../data/opec/Dollar.news.json', 'utf8'));
exports.data.energy_news = JSON.parse(fs.readFileSync('../data/opec/Energy.news.json', 'utf8'));
exports.data.gasoline_news = JSON.parse(fs.readFileSync('../data/opec/Gasoline.news.json', 'utf8'));
exports.data.oil_news = JSON.parse(fs.readFileSync('../data/opec/Oil.news.json', 'utf8'));



